import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Navigation from './Navigation';
import { detectDeviceCapabilities, type DeviceCapabilityReport } from '../lib/capabilities';
import {
  computeMultiverseSeed,
  createSeededPrng,
  hashToUint32,
  selectResonanceTemperature,
} from '../lib/multiverse';
import { v4 as uuidv4 } from 'uuid';
import { saveSession, type VaultSession } from '../lib/db';
import type { ResonanceCapture } from './SynchronicityRitual';

const SynchronicityRitual = lazy(() => import('./SynchronicityRitual'));
const QuantumDialogue = lazy(() => import('./QuantumDialogue'));

type AppStage = 'probe' | 'ritual' | 'transition' | 'materializing' | 'error' | 'dialogue';
type ModelLoadProgress = { percent: number; file: string | null };

const MODEL_CONFIGS = {
  '1B-WebGPU': {
    modelId: 'onnx-community/Llama-3.2-1B-Instruct-ONNX',
    revision: '14007543b6dc92de88daf96a9aa85d2f95ace6ef',
    displayName: 'Built with Llama',
    useWebGPU: true,
    dtype: 'q4f16',
  },
  // Mid tier: SmolLM2-360M on WASM with int8. int8 is the WASM dtype for
  // this model — its int8 file (346MB) is smaller than its q4 file (369MB)
  // and higher quality. q4f16 is a WebGPU dtype and is not used here.
  // There is deliberately only one mid tier; ?m=360 selects this one.
  '360M-WASM': {
    modelId: 'onnx-community/SmolLM2-360M-Instruct-ONNX',
    revision: 'fe7c7db4c8921c9e3fa1c65cfd296fb3b1b1a8f9',
    displayName: 'SmolLM2 360M',
    useWebGPU: false,
    dtype: 'int8',
  },
  '135M-WASM': {
    modelId: 'onnx-community/SmolLM2-135M-Instruct-ONNX',
    revision: 'b8a5c0f183b78c55955a5364f610c36668b5e681',
    displayName: 'SmolLM2 135M',
    useWebGPU: false,
    dtype: 'int8',
  },
} satisfies Record<
  DeviceCapabilityReport['recommendedTier'],
  { modelId: string; revision: string; displayName: string; useWebGPU: boolean; dtype: string }
>;

export default function AppPage() {
  const [stage, setStage] = useState<AppStage>('probe');
  const [capabilities, setCapabilities] = useState<DeviceCapabilityReport | null>(null);
  const [modelStatus, setModelStatus] = useState<string>('Detecting capabilities...');
  const [selectedModelName, setSelectedModelName] = useState('');
  const [isModelReady, setIsModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [modelProgress, setModelProgress] = useState<ModelLoadProgress | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const currentTierRef = useRef<DeviceCapabilityReport['recommendedTier'] | null>(null);
  const isModelReadyRef = useRef(false);
  const pendingDialogueRef = useRef(false);
  const hasRequestedGreetingRef = useRef(false);

  // Silent fallback chain for model *load* failures: 1B -> 360M-WASM ->
  // 135M-WASM. A failed download, or a device that cannot hold the model,
  // must never surface as a visible error while a smaller tier is untried —
  // the user just sees the guide keep materializing. Only when the 135M
  // floor also fails do we show the error screen. (A cache miss is not a
  // failure at all: transformers.js simply re-downloads the model.)
  const fallbackTierFor = (
    failedTier: DeviceCapabilityReport['recommendedTier']
  ): DeviceCapabilityReport['recommendedTier'] | null => {
    if (failedTier === '1B-WebGPU') return '360M-WASM';
    if (failedTier === '360M-WASM') return '135M-WASM';
    return null;
  };

  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const initializeWorker = useCallback(
    (report: DeviceCapabilityReport, tierOverride?: DeviceCapabilityReport['recommendedTier']) => {
      // Terminate any previous worker first (a failed tier, or a re-init).
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      isModelReadyRef.current = false;

      const searchParams = new URLSearchParams(window.location.search);
      const modelOverride = searchParams.get('m');
      let modelTier = tierOverride ?? report.recommendedTier;
      if (!tierOverride) {
        if (modelOverride === '135') {
          modelTier = '135M-WASM';
        } else if (modelOverride === '360') {
          // ?m=360 means the WASM mid tier (SmolLM2-360M, int8).
          modelTier = '360M-WASM';
        } else if (modelOverride === '1b') {
          modelTier = '1B-WebGPU';
        } else if (searchParams.has('m')) {
          console.warn('Unsupported model override. Use ?m=135, ?m=360 or ?m=1b.');
        }
      }
      currentTierRef.current = modelTier;

      // Silently retry on the next smaller tier when this tier fails to
      // load; only the 135M floor failing shows the error screen.
      const failOver = (err: unknown) => {
        const failedTier = currentTierRef.current ?? modelTier;
        const nextTier = fallbackTierFor(failedTier);
        if (!nextTier) {
          const message =
            err instanceof Error ? err.message : String(err ?? 'Unable to initialize the Spirit Guide');
          setModelError(message);
          setModelStatus(`Error: ${message}`);
          setStage((currentStage) =>
            currentStage === 'probe' || currentStage === 'materializing' ? 'error' : currentStage
          );
          return;
        }
        setModelProgress(null);
        setModelStatus('Preparing a lighter guide…');
        initializeWorker(report, nextTier);
      };

      const { modelId, revision, displayName, useWebGPU, dtype } = MODEL_CONFIGS[modelTier];
      setSelectedModelName(displayName);

      let worker: Worker;
      try {
        worker = new Worker(new URL('../workers/llmWorker.ts', import.meta.url), {
          type: 'module',
        });
      } catch (err) {
        failOver(err);
        return;
      }
      workerRef.current = worker;

      workerRef.current.onmessage = (e) => {
      const { type, message, error, text, payload } = e.data;
      if (type === 'status') setModelStatus(message);
      if (type === 'progress') {
        const progress = payload as {
          status?: unknown;
          progress?: unknown;
          file?: unknown;
        };
        if (
          (progress.status === 'progress_total' || progress.status === 'progress') &&
          typeof progress.progress === 'number'
        ) {
          setModelProgress({
            percent: Math.min(100, Math.max(0, progress.progress)),
            file: typeof progress.file === 'string' ? progress.file.split('/').at(-1) ?? null : null,
          });
        }
      }
      if (type === 'ready') {
        isModelReadyRef.current = true;
        setIsModelReady(true);
        setModelProgress(null);
        setModelStatus('Local Spirit Guide ready.');
        setStage((currentStage) => {
          if (currentStage === 'materializing' && pendingDialogueRef.current) {
            window.setTimeout(() => setStage('dialogue'), 1800);
            return 'transition';
          }
          return currentStage;
        });
      }
      if (type === 'error') {
        // A load failure (model not ready yet) falls back silently to the
        // next smaller tier. A failure after the model is ready (e.g. a
        // generation error) is genuine and stays visible.
        if (!isModelReadyRef.current) {
          failOver(error);
          return;
        }
        setModelError(error);
        setModelStatus(`Error: ${error}`);
        setStage((currentStage) =>
          currentStage === 'probe' || currentStage === 'materializing' ? 'error' : currentStage
        );
      }
      if (type === 'token') {
        setStreamingText((prev) => prev + text);
      }
      if (type === 'complete') {
        setMessages((prev) => [...prev, { role: 'assistant', content: text }]);
        setStreamingText('');
        setIsGenerating(false);
      }
    };

    workerRef.current.postMessage({
      type: 'init',
      payload: { modelId, revision, useWebGPU, dtype },
    });
  }, []);

  useEffect(() => {
    detectDeviceCapabilities().then((report) => {
      setCapabilities(report);
      setModelStatus('Device analyzed. Select three symbols to begin...');
      setStage('ritual');
    });

    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, [initializeWorker]);

  useEffect(() => {
    if (stage === 'materializing' && capabilities && pendingDialogueRef.current) {
      initializeWorker(capabilities);
    }
  }, [stage, capabilities, initializeWorker]);

  const handleRitualComplete = async (
    symbols: [string, string, string],
    resonanceCapture: ResonanceCapture
  ) => {
    pendingDialogueRef.current = true;
    if (modelError) {
      setStage('error');
      return;
    }
    setStage(isModelReady ? 'transition' : 'materializing');
    setModelError(null);
    try {
      const seed32 = computeMultiverseSeed(
        symbols,
        resonanceCapture.phase,
        resonanceCapture.velocity,
        resonanceCapture.elapsedMs
      );
      const temperature = selectResonanceTemperature(
        resonanceCapture.phase,
        resonanceCapture.velocity
      );
      const primary = symbols[0];
      const res = await fetch(`/prompts/archetypes/${primary}.json`);
      if (!res.ok) {
        throw new Error('Primary archetype catalog unavailable');
      }
      const catalog = await res.json();
      if (!Array.isArray(catalog.prompts) || catalog.prompts.length === 0) {
        throw new Error('Primary archetype catalog contains no prompts');
      }

      const selectionPayload = `${symbols[1]}:${symbols[2]}|${seed32}`;
      const selectionSeed = hashToUint32(selectionPayload);
      const rng = createSeededPrng(selectionSeed);
      const promptIndex = rng.nextInt(catalog.prompts.length);
      const selectedPrompt = catalog.prompts[promptIndex];
      const coordinate = `${(seed32 % 1000).toString().padStart(3, '0')}.${Math.floor(
        (seed32 / 1000) % 100
      )
        .toString()
        .padStart(2, '0')}`;
      const signature = `Ψ-${coordinate} • ${symbols.map((symbol) => symbol[0].toUpperCase() + symbol.slice(1)).join(' / ')} #${promptIndex.toString().padStart(2, '0')}`;

      setSessionInfo({
        id: uuidv4(),
        signature,
        seed32,
        temperature,
        symbols,
        promptId: selectedPrompt.id,
        resonanceCapture,
        sysPrompt: selectedPrompt.systemPrompt,
      });

      if (!capabilities) {
        throw new Error('Device capabilities are not available');
      }

      if (isModelReady) {
        window.setTimeout(() => setStage('dialogue'), 1800);
      }
    } catch (error) {
      pendingDialogueRef.current = false;
      const message =
        error instanceof Error ? error.message : 'Unable to initialize the Spirit Guide';
      setModelError(message);
      setModelStatus(message);
      setStage('error');
    }
  };

  const handleSendMessage = (msg: string) => {
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setIsGenerating(true);
    setStreamingText('');

    const formattedMessages = [
      { role: 'system', content: sessionInfo.sysPrompt },
      ...messages,
      { role: 'user', content: msg },
    ];

    workerRef.current?.postMessage({
      type: 'generate',
      payload: {
        messages: formattedMessages,
        temperature: sessionInfo.temperature,
        topP: 0.9,
        seed32: sessionInfo.seed32,
      },
    });
  };

  const handleReset = () => {
    pendingDialogueRef.current = false;
    hasRequestedGreetingRef.current = false;
    setMessages([]);
    setSessionInfo(null);
    setStage('ritual');
  };

  const modelProgressIndicator = modelProgress && !isModelReady && (
    <div className="w-full max-w-sm space-y-2 text-left" aria-live="polite">
      <div className="flex justify-between gap-4 text-sm">
        <span>A first awakening: gathering the guide's essence</span>
        <span>{Math.round(modelProgress.percent)}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-white/20"
        role="progressbar"
        aria-label="Model download progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(modelProgress.percent)}
      >
        <div
          className="h-full rounded-full bg-cyan-300 transition-[width] duration-200"
          style={{ width: `${modelProgress.percent}%` }}
        />
      </div>
      <p className="text-xs text-white/70">
        Usually needed only on your first visit; your browser can keep the guide ready for next time.
      </p>
    </div>
  );

  useEffect(() => {
    if (stage !== 'dialogue' || !sessionInfo || hasRequestedGreetingRef.current) return;

    hasRequestedGreetingRef.current = true;
    setIsGenerating(true);
    setStreamingText('');
    workerRef.current?.postMessage({
      type: 'generate',
      payload: {
        messages: [
          { role: 'system', content: sessionInfo.sysPrompt },
          {
            role: 'user',
            content:
              'Offer a brief, warm opening reflection that welcomes the seeker to this dialogue. Do not ask more than one gentle opening question.',
          },
        ],
        temperature: sessionInfo.temperature,
        topP: 0.9,
        seed32: sessionInfo.seed32,
      },
    });
  }, [sessionInfo, stage]);

  useEffect(() => {
    if (stage === 'dialogue') {
      window.scrollTo(0, 0);
    }
  }, [stage]);

  // Save session when messages update
  useEffect(() => {
    if (sessionInfo && messages.length > 0) {
      const vs: VaultSession = {
        id: sessionInfo.id,
        timestamp: Date.now(),
        signature: sessionInfo.signature,
        seed32: sessionInfo.seed32,
        symbols: sessionInfo.symbols,
        promptId: sessionInfo.promptId,
        resonanceCapture: sessionInfo.resonanceCapture,
        messages: messages.map((message) => ({ ...message, timestamp: Date.now() })),
      };
      saveSession(vs).catch(console.error);
    }
  }, [messages, sessionInfo]);

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Navigation currentPath="/app" />
      <main className="app-portal flex flex-1 flex-col items-center justify-center overflow-hidden">
        <div className="app-stage">
          {stage === 'probe' && (
            <div
              className="app-portal__loading flex min-h-[70vh] flex-col items-center justify-center space-y-6 text-center"
            >
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <h2 className="text-2xl font-bold font-heading">Initializing Quantum Engine</h2>
              <p className="text-muted-foreground">{modelStatus}</p>
            </div>
          )}

          {stage === 'ritual' && (
            <div className="w-full">
              <Suspense
                fallback={
                  <div className="text-center p-10">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  </div>
                }
              >
                <SynchronicityRitual onComplete={handleRitualComplete} />
              </Suspense>
              {modelProgressIndicator}
            </div>
          )}

          {stage === 'transition' && (
            <div
              className="source-transition fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className="source-transition__sigil" />
              <h2 className="source-transition__message">Synchronizing with Source Mind...</h2>
            </div>
          )}

          {stage === 'materializing' && (
            <div
              className="source-transition source-transition--materializing fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className="source-transition__sigil" />
              <div className="source-transition__materializing">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-300" />
                <h2>Spirit Guide is still materializing...</h2>
                <p>{modelStatus}</p>
                {modelProgressIndicator}
              </div>
            </div>
          )}

          {stage === 'error' && (
            <div
              className="app-portal__error flex min-h-[70vh] max-w-lg flex-col items-center gap-4 text-center"
            >
              <h2 className="text-2xl font-bold font-heading">
                The local guide could not initialize
              </h2>
              <p className="text-muted-foreground">{modelError || modelStatus}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
              >
                Retry local initialization
              </button>
            </div>
          )}

          {stage === 'dialogue' && (
            <div className="app-portal__dialogue w-full">
              <Suspense
                fallback={
                  <div className="text-center p-10">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  </div>
                }
              >
                <QuantumDialogue
                  signature={sessionInfo?.signature || ''}
                  temperature={sessionInfo?.temperature ?? 0.88}
                  modelName={selectedModelName}
                  smoothScroll={selectedModelName !== MODEL_CONFIGS['135M-WASM'].displayName}
                  messages={messages}
                  isGenerating={isGenerating}
                  streamingText={streamingText}
                  onSendMessage={handleSendMessage}
                  onReset={handleReset}
                />
              </Suspense>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

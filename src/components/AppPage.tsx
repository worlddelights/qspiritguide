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
  '360M-WebGPU': {
    modelId: 'onnx-community/SmolLM2-360M-Instruct-ONNX',
    revision: 'fe7c7db4c8921c9e3fa1c65cfd296fb3b1b1a8f9',
    displayName: 'SmolLM2 360M',
    useWebGPU: true,
    dtype: 'q4f16',
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
  const pendingDialogueRef = useRef(false);
  const hasRequestedGreetingRef = useRef(false);

  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const initializeWorker = useCallback((report: DeviceCapabilityReport) => {
    if (workerRef.current) return;

    const searchParams = new URLSearchParams(window.location.search);
    const modelOverride = searchParams.get('m');
    let modelTier = report.recommendedTier;
    if (modelOverride === '135') {
      modelTier = '135M-WASM';
    } else if (modelOverride === '360') {
      modelTier = '360M-WebGPU';
    } else if (searchParams.has('m')) {
      console.warn('Unsupported model override. Use ?m=135 or ?m=360.');
    }

    const { modelId, revision, displayName, useWebGPU, dtype } =
      MODEL_CONFIGS[modelTier];
    setSelectedModelName(displayName);

    workerRef.current = new Worker(new URL('../workers/llmWorker.ts', import.meta.url), {
      type: 'module',
    });

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

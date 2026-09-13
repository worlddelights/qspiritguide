import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2 } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import { detectDeviceCapabilities, type DeviceCapabilityReport } from '../lib/capabilities';
import { computeMultiverseSeed, createSeededPrng, hashToUint32 } from '../lib/multiverse';
import { v4 as uuidv4 } from 'uuid';
import { saveSession, type VaultSession } from '../lib/db';

const SynchronicityRitual = lazy(() => import('./SynchronicityRitual'));
const QuantumDialogue = lazy(() => import('./QuantumDialogue'));

type AppStage = 'probe' | 'ritual' | 'transition' | 'materializing' | 'error' | 'dialogue';

export default function AppPage() {
  const [stage, setStage] = useState<AppStage>('probe');
  const [capabilities, setCapabilities] = useState<DeviceCapabilityReport | null>(null);
  const [modelStatus, setModelStatus] = useState<string>('Detecting capabilities...');
  const [isModelReady, setIsModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const pendingDialogueRef = useRef(false);

  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    // 1. Probe Device
    detectDeviceCapabilities().then((report) => {
      setCapabilities(report);
      setModelStatus(`Device analyzed. Routing to ${report.recommendedTier}...`);
      setStage('ritual');

      // 2. Initialize Worker
      // Instead of new Worker URL, we use import.meta.url for Vite
      workerRef.current = new Worker(new URL('../workers/llmWorker.ts', import.meta.url), { type: 'module' });

      workerRef.current.onmessage = (e) => {
        const { type, payload, message, error, text } = e.data;
        if (type === 'status') setModelStatus(message);
        if (type === 'ready') {
          setIsModelReady(true);
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
          setStage((currentStage) => currentStage === 'probe' || currentStage === 'materializing' ? 'error' : currentStage);
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

      const modelConfig = {
        '1B-WebGPU': { modelId: 'Llama-3.2-1B-Instruct', useWebGPU: true, dtype: 'q4f16' },
        '360M-WebGPU': { modelId: 'SmolLM2-360M-Instruct', useWebGPU: true, dtype: 'q4f16' },
        '135M-WASM': { modelId: 'SmolLM2-135M-Instruct', useWebGPU: false, dtype: 'int8' },
      }[report.recommendedTier];

      workerRef.current.postMessage({
        type: 'init',
        payload: modelConfig
      });
    });

    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  const handleRitualComplete = async (symbols: [string, string, string], pendulumState: any) => {
    pendingDialogueRef.current = true;
    if (modelError) {
      setStage('error');
      return;
    }
    setStage(isModelReady ? 'transition' : 'materializing');
    setModelError(null);
    try {
      const seed32 = computeMultiverseSeed(symbols, pendulumState.theta, pendulumState.omega, pendulumState.timeDeltaMs);
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
      const signature = `Ψ-${(seed32 % 1000).toString().padStart(3, '0')} • ${symbols.map(s => s.toUpperCase()).join(' / ')} #${promptIndex.toString().padStart(2, '0')}`;

      setSessionInfo({
        id: uuidv4(),
        signature,
        seed32,
        symbols,
        promptId: selectedPrompt.id,
        pendulumState,
        sysPrompt: selectedPrompt.systemPrompt
      });

      if (isModelReady) {
        window.setTimeout(() => setStage('dialogue'), 1800);
      }
    } catch (error) {
      pendingDialogueRef.current = false;
      const message = error instanceof Error ? error.message : 'Unable to initialize the Spirit Guide';
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
      { role: 'user', content: msg }
    ];

    workerRef.current?.postMessage({
      type: 'generate',
      payload: {
        messages: formattedMessages,
        temperature: 0.75,
        topP: 0.9,
        seed32: sessionInfo.seed32,
      }
    });
  };

  const handleReset = () => {
    pendingDialogueRef.current = false;
    setMessages([]);
    setSessionInfo(null);
    setStage('ritual');
  };

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
        pendulumState: sessionInfo.pendulumState,
        messages: messages
      };
      saveSession(vs).catch(console.error);
    }
  }, [messages, sessionInfo]);

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Navigation currentPath="/app" />
      <main className="flex-1 px-4 py-8 md:px-8 lg:px-16 flex flex-col items-center justify-center relative overflow-hidden">

        {/* Background ambient light */}
        <div className="bg-primary/5 absolute -top-40 -right-40 -z-10 h-96 w-96 rounded-full blur-[100px]" />
        <div className="bg-accent/5 absolute -bottom-40 -left-40 -z-10 h-96 w-96 rounded-full blur-[100px]" />

        <AnimatePresence mode="wait">
          {stage === 'probe' && (
            <motion.div
              key="probe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-6 text-center"
            >
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <h2 className="text-2xl font-bold font-heading">Initializing Quantum Engine</h2>
              <p className="text-muted-foreground">{modelStatus}</p>
            </motion.div>
          )}

          {stage === 'ritual' && (
            <motion.div
              key="ritual"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-6xl"
            >
              <Suspense fallback={<div className="text-center p-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>}>
                <SynchronicityRitual onComplete={handleRitualComplete} />
              </Suspense>
            </motion.div>
          )}

          {stage === 'transition' && (
            <motion.div
              key="transition"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-500 opacity-50 animate-pulse mix-blend-screen" />
              <h2 className="text-3xl md:text-5xl font-bold text-white z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] text-center px-4">
                Synchronizing with Source Mind...
              </h2>
            </motion.div>
          )}

          {stage === 'materializing' && (
            <motion.div
              key="materializing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-500 opacity-40 animate-pulse mix-blend-screen" />
              <div className="z-10 flex flex-col items-center gap-5 text-center px-4">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-300" />
                <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                  Spirit Guide is still materializing...
                </h2>
                <p className="text-white/70">Preparing the private local model.</p>
              </div>
            </motion.div>
          )}

          {stage === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex max-w-lg flex-col items-center gap-4 text-center"
            >
              <h2 className="text-2xl font-bold font-heading">The local guide could not initialize</h2>
              <p className="text-muted-foreground">{modelError || modelStatus}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
              >
                Retry local initialization
              </button>
            </motion.div>
          )}

          {stage === 'dialogue' && (
            <motion.div
              key="dialogue"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <Suspense fallback={<div className="text-center p-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>}>
                <QuantumDialogue
                  signature={sessionInfo?.signature || ''}
                  messages={messages}
                  isGenerating={isGenerating}
                  streamingText={streamingText}
                  onSendMessage={handleSendMessage}
                  onReset={handleReset}
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

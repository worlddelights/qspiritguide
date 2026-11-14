import { pipeline, env, TextStreamer } from '@huggingface/transformers';

env.allowLocalModels = false;
env.allowRemoteModels = true;

// WASM threads need SharedArrayBuffer, which needs cross-origin isolation
// (COOP + COEP headers). This site does not send those headers, so the
// page is not isolated and a threaded WASM init can half-break (notably on
// Safari). Pin to a single thread when not isolated; it is slower, but it
// loads reliably. When isolation is present, leave the default alone.
try {
  type OnnxBackend = { backends?: { onnx?: { wasm?: { numThreads?: number } } } };
  const backends = (env as unknown as OnnxBackend).backends;
  const isolated =
    typeof self !== 'undefined' &&
    (self as unknown as { crossOriginIsolated?: boolean }).crossOriginIsolated;
  if (!isolated && backends?.onnx?.wasm) {
    backends.onnx.wasm.numThreads = 1;
  }
} catch {
  // Never let backend tuning break worker startup.
}

let generator: any = null;
let currentModelId = '';

self.addEventListener('message', async (e) => {
  const { type, payload } = e.data;

  if (type === 'init') {
    try {
      const { modelId, revision, useWebGPU, dtype } = payload;
      currentModelId = modelId;

      if (!useWebGPU) {
        // WebKit 26 (iOS 26) + the ONNX Runtime build transformers.js loads
        // by default = tab killed mid-inference. transformers.js 4.3.1
        // loads ort-wasm-simd-threaded.asyncify.{mjs,wasm} from
        // onnxruntime-web, and that build's JS glue contains the JSEP
        // execution-provider code. On WebKit 26 the JSEP build leaks memory
        // (1GB+ and still growing after inference, CPU 400%+) until iOS
        // jetsam-kills the tab — microsoft/onnxruntime#26827 — which
        // matches the observed symptom exactly: model loads, a few tokens
        // arrive, then the tab resets or the browser crashes, with no JS
        // error ever delivered. The plain threaded build contains no JSEP
        // code at all (0 references, verified against the 1.31.0-dev dist)
        // and is the build transformers.js itself uses on Safari below 26,
        // so force it for every WASM session. WebGPU sessions are
        // untouched — they need the JSEP EP. Keep the version in sync with
        // the onnxruntime-web version @huggingface/transformers 4.3.1 loads
        // (its package.json pin; transformers' own `versions.web`).
        try {
          const ortVersion = '1.31.0-dev.20260914-8d85527a0';
          const base = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ortVersion}/dist/`;
          const onnx = (
            env as unknown as {
              backends?: { onnx?: { wasm?: { wasmPaths?: { mjs: string; wasm: string } } } };
            }
          ).backends?.onnx;
          if (onnx?.wasm) {
            onnx.wasm.wasmPaths = {
              mjs: `${base}ort-wasm-simd-threaded.mjs`,
              wasm: `${base}ort-wasm-simd-threaded.wasm`,
            };
          }
        } catch {
          // Fall back to transformers.js's default build choice.
        }
      }

      self.postMessage({ type: 'status', status: 'loading-runtime', message: 'Loading local inference runtime...' });
      self.postMessage({ type: 'status', message: `Loading model...` });
      self.postMessage({ type: 'status', status: 'loading-model', message: 'Hugging Face assisting in first-time Sprit Guide manifestation...' });

      generator = await pipeline('text-generation', modelId, {
        device: useWebGPU ? 'webgpu' : 'wasm',
        dtype,
        revision,
        progress_callback: (prog: any) => {
          self.postMessage({ type: 'progress', payload: prog });
        }
      });

      self.postMessage({ type: 'ready', status: 'ready', modelId: currentModelId });
    } catch (err: any) {
      self.postMessage({ type: 'error', status: 'error', error: err.message || String(err) });
    }
  }

  if (type === 'generate') {
    try {
      if (!generator) throw new Error("Generator not initialized");
      const { messages, temperature, topP, seed32 } = payload;

      const streamer = new TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        callback_function: (text: string) => {
          self.postMessage({ type: 'token', text });
        }
      });

      const out = await generator(messages, {
        max_new_tokens: 512,
        temperature: temperature || 0.75,
        top_p: topP || 0.9,
        repetition_penalty: 1.11,
        seed: seed32,
        do_sample: true,
        streamer: streamer,
      });

      const fullText = out[0].generated_text;
      // In chat mode, generated_text is often an array of messages or the full appended conversation.
      // If messages array was passed, `generated_text` is the updated messages array.
      let finalResponse = '';
      if (Array.isArray(fullText)) {
        finalResponse = fullText[fullText.length - 1].content;
      } else {
        finalResponse = fullText;
      }

      self.postMessage({ type: 'complete', text: finalResponse });
    } catch (err: any) {
      self.postMessage({ type: 'error', status: 'error', error: err.message || String(err) });
    }
  }
});

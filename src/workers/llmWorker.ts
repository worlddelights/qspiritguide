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

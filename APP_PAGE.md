# Alignment Portal (`/app`)

## Purpose

The Alignment Portal is qSpirit Guide's browser-native dialogue experience. A visitor selects three archetypes and seals a time-based resonance capture. Those choices select an archetypal system prompt and deterministically configure a locally running language model for that session.

The app is fully static: there are no application accounts, server-side APIs, analytics, or remote conversation storage. Model files are downloaded from Hugging Face Hub; inference, chat history, and preference storage occur in the browser.

## Implemented experience

1. On page load, [`AppPage.tsx`](src/components/AppPage.tsx) detects device capabilities and starts a dedicated local-model Web Worker.
2. While the model loads, [`SynchronicityRitual.tsx`](src/components/SynchronicityRitual.tsx) presents the forest ritual.
3. The visitor selects three distinct symbols in order: **Primary**, **Secondary**, and **Catalyst**.
4. After the third selection, the 2D Resonance Sigil begins its fixed 7.2-second cycle. Sealing it captures the current phase, velocity, and elapsed time.
5. The app fetches only the Primary archetype's catalog from [`public/prompts/archetypes/`](public/prompts/archetypes), derives a seed and prompt index from the full ritual, and waits for local-model readiness.
6. A 1.8-second transition opens [`QuantumDialogue.tsx`](src/components/QuantumDialogue.tsx), which requests a short local welcome and streams subsequent responses.
7. Conversations are saved to IndexedDB as messages arrive. The reset control begins a new ritual; it does not delete prior IndexedDB entries.

## Ritual and session construction

### Archetypes

The ritual offers nine image-backed archetypes: Forest, Anchor, Crystal, Hourglass, Compass, Tide, Fire, Key, and Mirror. Symbol cards remain keyboard-focusable, selection order is visible in labelled slots, and further selection is disabled once three symbols are chosen.

The Primary choice determines which JSON catalog is fetched. The Secondary and Catalyst choices contribute to the deterministic prompt selection seed.

### Resonance capture

`SIGIL_PERIOD_MS` is `7200`. At sealing time, the component calculates:

```text
phase = sin((elapsedMs / 7200) * 2pi)
velocity = cos((elapsedMs / 7200) * 2pi)
```

The capture depends on `performance.now()` rather than visual frame timing. It is stored with the session as `resonanceCapture`.

### Seed, prompt, and sampling temperature

[`multiverse.ts`](src/lib/multiverse.ts) produces a 32-bit FNV-1a seed from the ordered symbols plus resonance telemetry. A Mulberry32 PRNG uses the Secondary/Catalyst selections and seed to choose one prompt from the Primary catalog.

The resonance angle selects the temperature from `0.6`, `0.75`, or `0.9`. Generation uses `top_p: 0.9`, a maximum of 512 new tokens, and the derived seed.

The dialogue HUD displays a session signature, selected local model, and temperature.

## Local model lifecycle

[`capabilities.ts`](src/lib/capabilities.ts) selects one model tier:

| Tier | Runtime | Model |
| --- | --- | --- |
| `1B-WebGPU` | WebGPU | `onnx-community/Llama-3.2-1B-Instruct-ONNX` |
| `360M-WebGPU` | WebGPU | `onnx-community/SmolLM2-360M-Instruct-ONNX` |
| `135M-WASM` | WASM fallback | `onnx-community/SmolLM2-135M-Instruct-ONNX` |

[`llmWorker.ts`](src/workers/llmWorker.ts) loads the selected revision through `@huggingface/transformers`, reports download progress, and streams generated tokens to the UI.

If the ritual completes before model initialization, the app shows the Materializing state until the worker is ready. If initialization, prompt loading, or generation fails, the app shows an error with a full-page reload retry.

## Persistence and accessibility

- [`db.ts`](src/lib/db.ts) persists sessions in the `qspirit_vault` IndexedDB store, keyed by UUID and indexed by timestamp.
- Chat text-size preference is stored in `localStorage`.
- The ritual exposes status and progress updates through live regions.
- Decorative forest artwork is hidden from assistive technology.
- Motion is implemented with CSS; the stylesheet reduces it for `prefers-reduced-motion`.

## Asset and implementation constraints

- The ritual uses responsive forest clearing images and nine emblem images in [`public/images/forest/`](public/images/forest).
- Do not introduce Three.js, canvas animation, custom shaders, video backgrounds, or a physics engine. Keep GPU capacity available for WebGPU inference.
- Keep the visual sigil period and `SIGIL_PERIOD_MS` synchronized if either changes.
- Keep model revisions pinned in `AppPage.tsx`; changing a model requires validating the model, revision, backend, and dtype combination.

## Current limitations

- The app has no vault browser, export flow, or UI for deleting saved conversations.
- There is no context-window compaction; the full in-memory message history is sent for each generation.
- Error recovery is a page reload, not in-place retry or user-selectable tier fallback.
- IndexedDB writes retain the current session as messages arrive; reset only clears React state.

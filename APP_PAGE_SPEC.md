# App Page Specification & Interaction Architecture

> **Document Status**: Approved Baseline / Ready for Implementation  
> **Route**: `/app` (The Alignment Portal)  
> **Primary Objective**: Provide a zero-friction, 100% private, browser-native AI dialogue. A ritual of rapid subconscious symbol selection and an interactive 3D WebGL quantum pendulum mathematically seed a unique LLM behavior and archetypal prompt variant for personalized life/career guidance.

---

## 1. Core Philosophy & Architectural Foundations

The **Alignment Portal** (`/app`) is the core engine of **qSpirit Guide**. It transforms psychological reflection and life-direction exploration into a mathematically grounded, browser-local experience:

* **Implicit Multiverse Coordinates & Seed Generation**: Rather than manual choice trees or complex UI branch diagrams, every session maps to an exact point in the "multiverse" determined mathematically by the user's **3 selected archetype symbols** and the **kinetic stoppage coordinates of an interactive 3D quantum pendulum**. This generates a deterministic **32-bit LLM Sampling Seed** and an exact index into an archetypal prompt library.
* **On-Demand Archetypal Prompt Architecture**: 9 separate server-hosted JSON files (one for each archetype) contain dynamically growing catalogs of curated system prompts. Only the primary archetype JSON is fetched on-demand when a session starts; the secondary and catalyst selections contribute deterministic seed material.
* **100% In-Browser Privacy**: All inference runs locally in the user's browser via WebGPU/WASM (`@huggingface/transformers`). Zero prompts or conversation logs are sent to any cloud server.
* **Automatic Hardware Capability Routing**: The client environment is evaluated on page load to automatically choose between a 1B parameter model (for capable WebGPU devices), a 360M parameter model (for constrained WebGPU devices), and a 135M parameter model (for WASM fallback).
* **Local Storage Only**: State and conversation logs persist strictly in client-side `IndexedDB` / `localStorage`.

---

## 2. Platform Capability Detection & Automated Model Routing

The application automatically benchmarks and inspects the client platform during initial load without requiring manual user configuration.

### A. Capability Detection Matrix

```typescript
interface DeviceCapabilityReport {
  hasWebGPU: boolean;
  adapterInfo?: GPUAdapterInfo;
  maxStorageBufferSize: number; // bytes
  deviceMemoryGB: number;       // navigator.deviceMemory (approx)
  logicalCores: number;         // navigator.hardwareConcurrency
  isMobile: boolean;
  recommendedTier: '1B-WebGPU' | '360M-WebGPU' | '135M-WASM';
}
```

### B. Decision Logic & Fallback Ladder

1. **WebGPU Evaluation**:
   * Inspect `navigator.gpu`.
   * Call `navigator.gpu.requestAdapter({ powerPreference: "high-performance" })`.
   * Check `adapter.limits.maxStorageBufferBindingSize` and `adapter.limits.maxBufferSize`.
2. **Memory & Platform Thresholds**:
   * **Tier 1 (High Performance — 1B Model)**:
     * WebGPU available AND `maxStorageBufferBindingSize >= 1GB` (1,073,741,824 bytes).
     * `navigator.deviceMemory >= 4` (or desktop browser with verified discrete/integrated WebGPU limits).
    * Model target: `meta-llama/Llama-3.2-1B-Instruct` (Meta access terms apply; implementation must pin and verify a compatible ONNX/WebGPU conversion before deployment).
   * **Tier 2 (Standard / Mobile WebGPU — 360M Model)**:
     * WebGPU available, but constrained memory (`deviceMemory < 4` or mobile device).
     * Model target: `HuggingFaceTB/SmolLM2-360M-Instruct` (or a compatible ONNX/WebGPU conversion).
   * **Tier 3 (CPU / WASM Fallback — 135M Model)**:
     * WebGPU unavailable or context creation fails.
     * Model target: `HuggingFaceTB/SmolLM2-135M-Instruct` executed over ONNX Runtime Web WebAssembly with multi-threading (or a compatible ONNX conversion).

### C. Background Runtime Preload

The selected `@huggingface/transformers` runtime and the selected model must begin loading in a dedicated Web Worker immediately after capability detection and continue in the background while the user completes the archetype selection and pendulum ritual. The preload must not block rendering, symbol selection, pendulum animation, or pointer interaction.

The worker reports explicit lifecycle states to the UI: `idle`, `loading-runtime`, `loading-model`, `ready`, and `error`. The UI may show lightweight progress or a capability status indicator, but it must not expose raw model-loading logs or imply that the guide is ready before the worker reports `ready`. Model initialization, tokenizer loading, model-weight loading, and the selected execution backend are all part of the same readiness gate.

When the ritual is complete, the application checks the worker readiness state before entering dialogue. If the runtime and model are ready, the normal transition begins immediately. If they are still loading, the application enters the temporary **Spirit Guide Materializing** state described in Section 4.E and waits for the worker's `ready` message. If initialization fails, the UI must show a recoverable local error and offer retry or fallback routing where available; it must not enter the chat with an uninitialized pipeline.

---

## 3. End-to-End User Journey & State Machine

```mermaid
stateDiagram-v2
    [*] --> DeviceCapabilityProbe: User lands on /app
    
    state DeviceCapabilityProbe {
        WebGPU_Inspection --> TierSelection
        TierSelection --> BackgroundPreload: Load transformers.js runtime and selected model in Web Worker
    }

    DeviceCapabilityProbe --> Stage1_SynchronicityRitual: UI Ready

    state Stage1_SynchronicityRitual {
        SubconsciousSymbols: 1. Rapid 3-Symbol Pick (Subconscious Instinct)
        MeditativePendulum: 2. 3D WebGL Pendulum Meditation & Stoppage
        DualActivationCheck: 3. Verify (3 Symbols Selected + Pendulum Frozen)
        
        SubconsciousSymbols --> MeditativePendulum
        MeditativePendulum --> DualActivationCheck
    }

    DualActivationCheck --> RuntimeReadinessGate: Both Conditions Met

    RuntimeReadinessGate --> SourceMindTransition: Runtime and model ready
    RuntimeReadinessGate --> SpiritGuideMaterializing: Runtime or model still loading
    SpiritGuideMaterializing --> SourceMindTransition: Worker reports ready
    SpiritGuideMaterializing --> LocalInitializationError: Worker reports error

    state SourceMindTransition {
        PendulumDissolve: 3D Pendulum implodes into a singularity
        CosmicBloom: Radiant universal colorful glow & chromatic bloom
        PromptResolution: On-Demand Fetch & Index Archetype JSON
    }

    state SpiritGuideMaterializing {
      MaterializationLoop: Temporary looping animation while local model initializes
      ReadinessStatus: "Spirit Guide is still materializing..."
      BackgroundWait: Continue waiting for Web Worker ready signal
    }

    state LocalInitializationError {
      Recovery: Retry initialization or select an available fallback tier
    }

    SourceMindTransition --> Stage2_QuantumDialogue: "Source Connected"
    
    state Stage2_QuantumDialogue {
        LiveChatStreaming: 100% Local Inference & Token Streaming
        VaultAutoSave: Persist to IndexedDB
    }

    Stage2_QuantumDialogue --> Stage3_ExportOrReset: Session End
```

---

## 4. UI / UX Detailed Specifications: The Synchronicity Setup Ritual

The welcoming ritual on `/app` prepares the user mentally and sets the mathematical parameters for the local LLM.

### A. First-Time User Onboarding & Psychological Guidance

A warm, atmospheric instruction header guides the user through two contrasting psychological modes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ✦ THE SYNCHRONICITY RITUAL ✦                          │
│                                                                             │
│  Phase 1: Subconscious Reflex          Phase 2: Meditative Stillness        │
│  "Select 3 symbols swiftly without      "Breathe, center your thoughts, and │
│   overthinking. Trust your first        click the 3D Pendulum to freeze its │
│   instinct."                            momentum when ready."               │
│                                                                             │
│  [ Step 1: 0 / 3 Symbols Selected ] ── [ Step 2: Pendulum in Motion ]       │
│                                                                             │
│         * The Spirit Guide awakens once both actions are sealed *           │
└─────────────────────────────────────────────────────────────────────────────┘
```

* **Clear Activation Gate**: An explicit status meter highlights that **both** conditions (3 symbols selected + pendulum frozen) must be completed to awaken the guide.
* **Dynamic Visual Feedback**:
  * As symbols are clicked, glowing indicator crystals illuminate (`1/3`, `2/3`, `3/3`).
  * Once 3 symbols are locked, a subtle glowing beam or particle stream links the symbols to the central 3D Pendulum arena, drawing the user's attention to the meditation phase.

---

### B. 3D WebGL Quantum Pendulum (Interactive Seed Generator)

The center of the page features a custom 3D WebGL / Three.js canvas that serves as the centerpiece of the ritual.

#### 1. Visual & Spatial Elements (Three.js / WebGL)
* **Suspended Quantum Bob**: A faceted, refractive crystalline or metallic orb with subsurface scattering and dynamic reflections.
* **Energy Filament**: A fine, vibrating line of light (laser/filament) connecting the pivot point to the bob.
* **Harmonic Ground Dial**: Beneath the swing arc, a 3D circular dial displays glowing concentric frequency rings, rune markers, and polar coordinate divisions ($-\theta_{\text{max}}$ to $+\theta_{\text{max}}$).
* **Volumetric Stardust Field**: Ambient particles drift around the pendulum space, reacting to motion.

#### 2. Mystical Mouse Proximity Sensing (Interactive Field)
* **Proximity Detection**: The 3D scene tracks the normalized device coordinates (NDC) of the cursor.
* **Gravitational Aura**:
  * As the cursor approaches the 3D pendulum bounding sphere, a soft violet/amber chromatic aura expands around the bob.
  * The particle field exhibits subtle fluid turbulence, swirling gently toward the cursor like iron filings around a magnet.
* **Interactive Resistance**: Hovering directly over the swing arc creates a soft time-dilation / optical refraction ripple on the canvas, reinforcing the tactile sensation of interacting with a physical quantum field.

#### 3. Freezing Momentum (The Stoppage Interaction)
* The pendulum oscillates with smooth, non-linear harmonic motion:
  $$\theta(t) = \theta_0 \cos\left(\sqrt{\frac{g}{L}} t\right) e^{-\gamma t}$$
* When the user clicks the 3D pendulum or presses the **"Freeze Momentum"** trigger:
  1. The oscillation abruptly locks at the exact phase angle $\theta$, velocity $\omega$, and timestamp $\Delta t$.
  2. A sharp, luminous energy shockwave ripples outward along the ground dial.
  3. The captured coordinates display briefly in an ethereal HUD:  
     `Phase: +0.412 rad | Velocity: 0.884 | Resonance Locked`

---

### C. The 9 Archetype Symbols (Rapid Subconscious Selection)

A balanced 3x3 grid flanking or framing the central 3D stage. The user is instructed to pick 3 without deliberation:

1. 🌲 **The Ancient Forest** (`forest.json`) *(Grounding, organic patience, ecological perspective)*
2. ⚓ **The Iron Anchor** (`anchor.json`) *(Emotional stability, boundaries, unwavering resilience)*
3. 💎 **The Prismatic Crystal** (`crystal.json`) *(Clarity, multifaceted truth, intellectual refraction)*
4. ⏳ **The Obsidian Hourglass** (`hourglass.json`) *(Urgency calibration, temporal focus, cycles)*
5. 🧭 **The Star Compass** (`compass.json`) *(Directionality, purpose alignment, north star)*
6. 🌊 **The River Tide** (`tide.json`) *(Adaptability, release of resistance, flow state)*
7. 🔥 **The Hearth Fire** (`fire.json`) *(Creative passion, bold transformation, spark)*
8. 🗝️ **The Hidden Key** (`key.json`) *(Unlocking repressed desire, curiosity, breakthrough)*
9. 🪞 **The Silver Mirror** (`mirror.json`) *(Shadow reflection, radical self-honesty, acceptance)*

---

### D. The Transition Sequence: "Harmonic Convergence to Source Mind"

Once both actions are sealed (3 symbols + pendulum frozen) and the worker reports `ready`, an immersive 1.8-second transition animation begins:

```
[Freeze Point] ──► [Singularity Implosion] ──► [Cosmic Colorful Bloom] ──► [Quantum Dialogue Interface]
```

1. **Singularity Implosion (0.0s – 0.5s)**:
   * The 3 selected symbol cards glow intensely, emitting light trails that rush into the frozen 3D pendulum.
   * The 3D pendulum collapses inward into a single, intensely glowing point of light (singularity).
2. **Universal Colorful Bloom (0.5s – 1.3s)**:
   * The singularity detonates into a radiant, chromatic dispersion wave across the entire viewport (deep violet, rose gold, amber, and celestial cyan).
   * A subtle harmonic chime or low-frequency resonant soundwave accompanies the bloom.
   * Text reveal in center: *"Synchronizing with Source Mind..."*
3. **Interface Emergence (1.3s – 1.8s)**:
   * The color bloom softens into the ambient dark glassmorphic chat interface.
   * The top HUD displays the freshly computed Multiverse Signature (e.g. `Ψ-831.04 • Forest / Key / Mirror #02`).
   * The local LLM emits its initial welcoming reflection.

### E. Spirit Guide Materialization While Preloading

If the user completes the archetypes and pendulum before `@huggingface/transformers` and the selected model are ready, hold the user in a temporary transition state instead of showing an empty or partially initialized chat. The singularity/bloom treatment may continue as a seamless looping animation, with a calm status message such as *"Spirit Guide is still materializing..."* and an optional local progress indicator for runtime and model readiness.

The loop must be interruptible by the worker's `ready` or `error` message. On `ready`, finish the current visual cycle or crossfade directly into the normal Source Mind transition, resolve the primary archetype prompt, and open dialogue. On `error`, stop the loop and present a recoverable initialization error with retry and any supported fallback option. The user must retain the selected symbols and frozen pendulum telemetry throughout this wait, and the app must not re-run the ritual unless the user chooses to reset.

---

## 5. Mathematical Multiverse Coordinate, Seed & Prompt Engine

### A. Multiverse Vector & Randomizer Seed Calculation

The system computes a deterministic entropy vector and a 32-bit unsigned integer randomizer seed from the ritual telemetry:

$$\mathbf{M}_{\text{coord}} = f(\text{Symbols}_{1..3}, \theta, \omega, \Delta t)$$

```typescript
export interface MultiverseVector {
  // Qualitative triad in selection order: primary, secondary, catalyst
  symbols: [string, string, string];
  
  // 3D Pendulum kinetic telemetry
  phaseAngle: number;       // θ ∈ [-1.0, 1.0]
  velocity: number;         // ω ∈ [-1.0, 1.0]
  timeDeltaMs: number;      // Δt in ms
  
  // Computed randomizer & sampling outputs
  seed32: number;           // uint32 ∈ [0, 4294967295]
  temperature: number;      // e.g. 0.65 - 0.85
  topP: number;             // e.g. 0.85 - 0.95
  
  // Archetype indexing
  selectedPromptIndex: number; // Seeded index into the primary archetype's JSON catalog
  multiverseSignature: string; // e.g. "Ψ-831.04-FOREST-KEY-MIRROR#02"
}
```

#### Deterministic 32-Bit Seed Generation
```typescript
function computeMultiverseSeed(symbols: string[], theta: number, omega: number, dt: number): number {
  const payload = `${symbols.join(':')}|${theta.toFixed(6)}|${omega.toFixed(6)}|${dt}`;
  return hashToUint32(payload);
}
```
This `seed32` is directly passed to the local LLM generation pipeline (e.g. `transformers.js` sampler or PRNG) to fix the random sampling sequence to that exact multiverse coordinate.

---

### B. On-Demand Archetypal System Prompt Architecture

System prompts are organized into 9 modular JSON files located under `/prompts/archetypes/`:

```
public/prompts/archetypes/
├── forest.json
├── anchor.json
├── crystal.json
├── hourglass.json
├── compass.json
├── tide.json
├── fire.json
├── key.json
└── mirror.json
```

#### JSON File Schema (`archetype-schema.json`)
```json
{
  "archetype": "forest",
  "name": "The Ancient Forest",
  "coreEssence": "Root grounding, natural pace, patience, and ecological perspective",
  "prompts": [
    {
      "id": "forest-01",
      "harmonicTone": "contemplative-grounding",
      "quadrant": "inward-stillness",
      "systemPrompt": "You are qSpirit Guide operating through the archetype of The Ancient Forest. Your core presence is deeply grounded, unhurried, and reassuring. The seeker is exploring life and career crossroads. Remind them that growth occurs in deep subterranean roots before visible branches form..."
    },
    {
      "id": "forest-02",
      "harmonicTone": "strategic-ecological",
      "quadrant": "forward-growth",
      "systemPrompt": "You are qSpirit Guide under the Ancient Forest canopy. Help the seeker view their career ecosystem holistically—identifying which current commitments drain their soil and where natural sunlight calls them next..."
    }
  ]
}
```

---

### C. Archetype Roles and Prompt Selection Algorithm

The three archetype selections have fixed roles based on selection order:

1. `selectedSymbols[0]` is the **primary archetype**. Its JSON file is the only archetype catalog fetched for the session.
2. `selectedSymbols[1]` is the **secondary archetype**. Its stable archetype identifier contributes to prompt selection seed material.
3. `selectedSymbols[2]` is the **catalyst archetype**. Its stable archetype identifier also contributes to prompt selection seed material.

The secondary and catalyst selections do not independently select prompt files or prompt indexes. They influence which one of the primary catalog's prompts is chosen.

1. **Zero Eager Overhead**: No prompt files are loaded on page load.
2. **On-Demand Fetch**: Upon completing the ritual, the app fetches the primary archetype's JSON file:
  ```typescript
  const primaryArchetype = selectedSymbols[0];
  const response = await fetch(`/prompts/archetypes/${primaryArchetype}.json`);
  if (!response.ok) throw new Error('Primary archetype catalog unavailable');
  const data: ArchetypeCatalog = await response.json();
  ```
3. **Seeded Prompt Selection**:
  Let $N = \text{data.prompts.length}$. If $N = 0$, fail closed and show that the primary catalog is unavailable. Otherwise, derive a deterministic selection seed from the secondary and catalyst identifiers, while retaining the pendulum/session seed as additional session entropy:
  ```typescript
  const selectionPayload = `${selectedSymbols[1]}:${selectedSymbols[2]}|${seed32}`;
  const selectionSeed = hashToUint32(selectionPayload);
  const rng = createSeededPrng(selectionSeed);
  const selectedPromptIndex = rng.nextInt(data.prompts.length);
  const selectedPrompt = data.prompts[selectedPromptIndex];
  ```
  `createSeededPrng` must be a documented, deterministic 32-bit PRNG, and `nextInt(N)` must produce a uniform integer in `[0, N - 1]`. The same ordered selections, pendulum telemetry, model session seed, and catalog version must resolve to the same prompt index.
4. **Prompt Assembly**:
   The selected primary system prompt is sent to the Web Worker with the ordered archetype identifiers and multiverse signature as structured metadata. Do not claim to append secondary or catalyst traits unless those traits are available locally or included in the primary catalog. The raw system prompt is never exposed in the user-facing UI.

---

## 6. Stage 2: The Quantum Dialogue (Chat Interface)

### A. UI Layout & Elements
* **Top Bar / HUD**:
  * **Multiverse Signature Pill**: Displays the session's coordinate (e.g. `Ψ-831.04 • Forest / Key / Mirror #02`).
  * **Off-Grid Trust Indicator**: 🟢 `100% Off-Grid • WebGPU Active` (with hover metrics: generation speed in `tokens/s`, local memory consumption).
  * **Reset / New Journey Button**: Clears the session and returns to the Synchronicity Ritual.
* **Message Feed**:
  * Glassmorphic response cards with clear contrast and elegant typography.
  * Live token streaming with smooth easing and typing pulse.
* **Input Area**:
  * Ergonomic auto-expanding text input.
  * Quick-starter suggestions on first turn (*"I feel stuck between staying in my safe job and switching to design"*, *"I'm turning 35 and feel like I'm running out of time"*).

### B. Model Context Budget and Conversation Compaction

The selected model's context window must be treated as a runtime capability, not as an unlimited conversation buffer. Each model manifest must define or expose:

```typescript
interface ModelContextProfile {
  modelId: string;
  contextWindowTokens: number;
  reservedOutputTokens: number;
  minimumPromptTokens: number;
}
```

Before every generation, tokenize the system prompt, local conversation summary, recent messages, and current user message. Keep the total input below `contextWindowTokens - reservedOutputTokens`. The UI should show a clear loading or recovery state if tokenization or generation fails because the budget cannot be satisfied.

When the history exceeds the available budget, compact it locally in this order:

1. Preserve the system prompt, archetype metadata, multiverse signature, and the current user message.
2. Replace the oldest contiguous block of user and assistant messages with a concise model-generated summary containing decisions, open questions, user-stated preferences, and unresolved threads.
3. Retain the most recent messages verbatim, then retry tokenization before generation.
4. Persist the summary and the complete uncompressed transcript separately. Compaction must never delete transcript data or send it to a remote service.

The compaction prompt and summary format should be versioned, and the implementation should test prompt assembly at the context limit, after repeated compaction, and across all three model tiers. The full transcript remains available for Markdown export even when the active model context contains only a summary and recent turns.

---

## 7. Data Persistence & Export (Stage 3)

* **IndexedDB Store (`qspirit_vault`)**:
  * Schema:
    ```typescript
    interface VaultSession {
      id: string;                      // UUID
      timestamp: number;
      signature: string;               // Multiverse coordinate
      seed32: number;                  // Sampling seed
      symbols: [string, string, string];
      promptId: string;                // e.g. "forest-02"
      pendulumState: { theta: number; omega: number; timeDeltaMs: number };
      contextSummary?: string;         // Local rolling summary used for generation
      compactionVersion?: string;      // Version of the summary prompt and format
      messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>;
    }
    ```
* **Local Control**:
  * **Export to Markdown**: Generates a clean reflection journal file containing the Multiverse signature, active archetypes, seed, and full dialogue transcript.
  * **Zero Timeline Button**: Permanently deletes all IndexedDB records and clears session memory.

---

## 8. Technical Architecture & Worker Pipeline

```
[UI Layer: React 19 / Astro / Three.js]
      │
      ├── 1. Initial Load: Probes WebGPU / System Memory
      ├── 1a. In Parallel With Ritual: Loads `@huggingface/transformers` and the selected model in a Web Worker
      ├── 2. Ritual Phase:
      │       ├── Collects 3 Rapid Subconscious Symbols
      │       └── 3D WebGL Pendulum with Mouse Proximity Tracking (Freezes θ, ω, t)
      ├── 3. "Harmonic Convergence" Bloom Transition Animation
      ├── 4. Computes Multiverse Vector & Seed32
      ├── 5. On-Demand Fetch: GET /prompts/archetypes/{symbol}.json
      ├── 6. Indexes Prompt[k] via Multiverse Vector
      │
      ▼ PostMessage({ type: 'init' | 'generate', payload: { prompt, seed32, temp, topP } })
[Dedicated Web Worker: /workers/llmWorker.ts]
      │
      ├── Loads `@huggingface/transformers`
      ├── Sets deterministic PRNG / sampler seed: `seed32`
      ├── Runs text generation with chosen local model tier
      ├── Streams tokens via callback
      │
      ▼ Token stream back to UI
[IndexedDB Persistence Layer]
```

---

## 9. Explicitly Descoped Items (Future Phases)

* **Explicit Distress & Crisis Safety Guardrails**: Complex algorithmic detection of acute psychological distress / automated crisis intervention routing is **descoped** from this initial milestone and reserved for a dedicated future release.
* **Visual Multiverse Branch Trees / Graph UI**: Forking visualizations are **descoped**; all multiverse branching is purely implicit and governed mathematically by the ritual seed, pendulum state, and prompt selection.
* **Cloud Sync / Remote User Accounts**: Server-side user accounts and cross-device cloud synchronization are intentionally excluded to uphold the 100% private, local-first promise.

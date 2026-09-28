# App Page Redesign Summary

## Scope

`/app` (The Alignment Portal) was redesigned around the forest-convergence ritual in `APP_PAGE_SPEC.md`. The work focuses on the visual ritual and functional local-AI flow; export, vault deletion, and context compaction are intentionally deferred.

## Implemented Experience

- Full-bleed responsive forest atmosphere using:
  - `/images/forest/forest-clearing-desktop.webp`
  - `/images/forest/forest-clearing-mobile.webp`
  - Nine `/images/forest/emblem-*.webp` archetype images
- Ordered, accessible archetype selection: **Primary → Secondary → Catalyst**.
  - Selection slots, active-role prompts, sealed states, and a two-condition activation meter remain visible.
  - The 3×3 symbol field uses the new images and supports keyboard focus.
- Replaced the Three.js pendulum with a CSS/HTML **2D Resonance Sigil**.
  - The sigil activates after the third archetype.
  - Sealing deterministically derives `phase`, `velocity`, and `elapsedMs` from `performance.now()` and a fixed 7200 ms cycle.
  - The capture is announced in accessible text and seeds the multiverse session.
- Forest mist, sigil, constellation, canopy-bloom, and materialization motion are CSS-only and substantially reduced under `prefers-reduced-motion`.
- A 1.8-second Source Mind transition bridges the ritual to dialogue. If the local model is not ready, the materialization state waits for the worker instead.
- The dialogue is a dark forest-glass interface with a Multiverse Signature, local-model trust indicator, reset control, streaming response treatment, and starter prompts.
- On entering dialogue, the locally running model receives an internal request for a brief welcoming reflection before the first user turn.

## Preserved Local-AI Flow

- Capability detection and model tier routing remain in `src/lib/capabilities.ts`.
- `src/workers/llmWorker.ts` continues loading local models in a dedicated Worker and streams tokens back to the UI.
- Only the selected Primary archetype JSON catalog is fetched on session activation; Secondary and Catalyst influence the deterministic prompt index.
- Session seed generation remains deterministic in `src/lib/multiverse.ts`, now using resonance telemetry rather than pendulum values.
- Existing IndexedDB saving remains enabled, with `VaultSession.resonanceCapture` replacing `pendulumState`.

## Main Implementation Files

| File | Responsibility |
| --- | --- |
| `src/components/SynchronicityRitual.tsx` | Forest ritual, ordered selection, Resonance Sigil, capture calculation |
| `src/components/AppPage.tsx` | Worker lifecycle, readiness states, session construction, transition, greeting request |
| `src/components/QuantumDialogue.tsx` | Forest-glass dialogue HUD and message UI |
| `src/styles/global.css` | Ritual, sigil, transition, dialogue, responsive, and reduced-motion styles |
| `src/lib/multiverse.ts` | Resonance-aware deterministic seed contract |
| `src/lib/db.ts` | Resonance-aware persisted session shape |

## Removed

- `src/components/Pendulum3D.tsx`
- `@react-three/drei`, `@react-three/fiber`, `three`, and `@types/three`

## Asset and Troubleshooting Notes

- The approved first-load visual budget is **3 MB** to preserve supplied asset quality. The complete forest asset set is approximately 2.9 MB; responsive `<picture>` loading ensures only one clearing background is requested.
- The source ritual cycle is defined by `SIGIL_PERIOD_MS` in `SynchronicityRitual.tsx`. Keep the CSS marker duration aligned with this value if it changes.
- Model loading failures use the existing recoverable initialization screen. Prompt-catalog failures also surface there.
- The project’s `pnpm run lint` script currently cannot run because ESLint 10 requires a flat `eslint.config.*` file; this pre-existing tooling mismatch was not changed.

## Deferred

- Context-window budgeting and local conversation compaction
- Markdown session export
- Vault-wide deletion control

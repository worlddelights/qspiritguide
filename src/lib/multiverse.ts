export interface MultiverseVector {
  // Qualitative triad in selection order: primary, secondary, catalyst
  symbols: [string, string, string];

  // 2D Resonance Sigil telemetry
  phase: number; // p ∈ [-1.0, 1.0]
  velocity: number; // v ∈ [-1.0, 1.0]
  elapsedMs: number; // Δt in ms

  // Computed randomizer & sampling outputs
  seed32: number; // uint32 ∈ [0, 4294967295]
  temperature: number; // Selected from resonance-based levels between 0.8 and 1.2
  topP: number; // e.g. 0.85 - 0.95

  // Archetype indexing
  selectedPromptIndex: number; // Seeded index into the primary archetype's JSON catalog
  multiverseSignature: string; // e.g. "Ψ-831.04-FOREST-KEY-MIRROR#02"
}

/**
 * FNV-1a Hash to uint32
 */
export function hashToUint32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/**
 * Mulberry32 PRNG
 */
export function createSeededPrng(seed: number) {
  return {
    nextFloat: function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    nextInt: function (max: number) {
      return Math.floor(this.nextFloat() * max);
    },
  };
}

export function computeMultiverseSeed(
  symbols: string[],
  phase: number,
  velocity: number,
  elapsedMs: number
): number {
  const payload = `${symbols.join(':')}|${phase.toFixed(6)}|${velocity.toFixed(6)}|${elapsedMs}`;
  return hashToUint32(payload);
}

const RESONANCE_TEMPERATURE_LEVELS = [0.66, 0.77, 0.88] as const;

export function selectResonanceTemperature(phase: number, velocity: number): number {
  const angle = (Math.atan2(phase, velocity) + 2 * Math.PI) % (2 * Math.PI);
  const levelIndex = Math.floor((angle / (2 * Math.PI)) * RESONANCE_TEMPERATURE_LEVELS.length);

  return RESONANCE_TEMPERATURE_LEVELS[levelIndex];
}

import { useEffect, useRef, useState } from 'react';

const SYMBOLS = [
  { id: 'forest', name: 'The Ancient Forest', essence: 'Grounding and organic patience' },
  { id: 'anchor', name: 'The Iron Anchor', essence: 'Stability and resilient boundaries' },
  { id: 'crystal', name: 'The Prismatic Crystal', essence: 'Clarity and multifaceted truth' },
  { id: 'hourglass', name: 'The Obsidian Hourglass', essence: 'Temporal focus and cycles' },
  { id: 'compass', name: 'The Star Compass', essence: 'Direction and purpose alignment' },
  { id: 'tide', name: 'The River Tide', essence: 'Adaptability and release' },
  { id: 'fire', name: 'The Hearth Fire', essence: 'Passion and transformation' },
  { id: 'key', name: 'The Hidden Key', essence: 'Curiosity and breakthrough' },
  { id: 'mirror', name: 'The Silver Mirror', essence: 'Reflection and self-honesty' },
];

const ROLE_LABELS = ['Primary', 'Secondary', 'Catalyst'] as const;
const SIGIL_PERIOD_MS = 7200;

export interface ResonanceCapture {
  phase: number;
  velocity: number;
  elapsedMs: number;
}

interface RitualProps {
  onComplete: (symbols: [string, string, string], resonanceCapture: ResonanceCapture) => void;
}

export default function SynchronicityRitual({ onComplete }: RitualProps) {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [sigilStartedAt, setSigilStartedAt] = useState<number | null>(null);
  const [resonanceCapture, setResonanceCapture] = useState<ResonanceCapture | null>(null);
  const [isSealing, setIsSealing] = useState(false);
  const sealTimerRef = useRef<number | null>(null);
  const symbolsRef = useRef<HTMLDivElement>(null);
  const resonanceRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      if (sealTimerRef.current !== null) {
        window.clearTimeout(sealTimerRef.current);
      }
    },
    []
  );

  const selectSymbol = (id: string) => {
    if (selectedSymbols.includes(id) || selectedSymbols.length >= 3) return;
    setSelectedSymbols([...selectedSymbols, id]);
  };

  useEffect(() => {
    if (selectedSymbols.length === 3 && sigilStartedAt === null) {
      setSigilStartedAt(performance.now());
    }
  }, [selectedSymbols.length, sigilStartedAt]);

  useEffect(() => {
    if (selectedSymbols.length === 3 && window.matchMedia('(max-width: 48rem)').matches) {
      resonanceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedSymbols.length]);

  const activeRole = ROLE_LABELS[selectedSymbols.length] ?? null;
  const constellationComplete = selectedSymbols.length === 3;

  const getStagePrompt = () => {
    if (selectedSymbols.length === 0)
      return 'Choose a Primary symbol that reflects the pattern calling for attention.';
    if (selectedSymbols.length === 1)
      return 'Choose a second symbol that supports or challenges it.';
    if (selectedSymbols.length === 2)
      return 'Choose one final symbol: the catalyst that shifts the pattern.';
    if (!resonanceCapture)
      return 'Constellation complete — seal the resonance when the phase feels true.';
    return 'Resonance sealed — your guide is awakening.';
  };

  const getProgress = () => {
    if (selectedSymbols.length === 0) return 'Choose Primary (0 of 3)';
    if (selectedSymbols.length === 1) return 'Primary sealed — Choose Secondary (1 of 3)';
    if (selectedSymbols.length === 2)
      return 'Primary + Secondary sealed — Choose Catalyst (2 of 3)';
    return resonanceCapture
      ? 'Constellation and resonance sealed'
      : 'Constellation complete — Seal the resonance';
  };

  const sealResonance = () => {
    if (!constellationComplete || sigilStartedAt === null || resonanceCapture || isSealing) return;

    const elapsedMs = Math.round(performance.now() - sigilStartedAt);
    const radians = (elapsedMs / SIGIL_PERIOD_MS) * Math.PI * 2;
    const capture = {
      phase: Math.sin(radians),
      velocity: Math.cos(radians),
      elapsedMs,
    };

    setResonanceCapture(capture);
    setIsSealing(true);
    sealTimerRef.current = window.setTimeout(() => {
      onComplete(selectedSymbols as [string, string, string], capture);
    }, 550);
  };

  const handleResonanceControl = () => {
    if (!constellationComplete) {
      symbolsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    sealResonance();
  };

  const resetRitual = () => {
    setSelectedSymbols([]);
    setSigilStartedAt(null);
    setResonanceCapture(null);
    setIsSealing(false);
  };

  return (
    <section className="forest-ritual" aria-labelledby="ritual-title">
      <picture className="forest-ritual__background" aria-hidden="true">
        <source media="(max-width: 767px)" srcSet="/images/forest/forest-clearing-mobile.webp" />
        <img src="/images/forest/forest-clearing-desktop.webp" alt="" />
      </picture>
      <div className="forest-ritual__mist forest-ritual__mist--one" aria-hidden="true" />
      <div className="forest-ritual__mist forest-ritual__mist--two" aria-hidden="true" />
      <div className="forest-ritual__motes" aria-hidden="true">
        <span className="forest-ritual__mote forest-ritual__mote--one" />
        <span className="forest-ritual__mote forest-ritual__mote--two" />
        <span className="forest-ritual__mote forest-ritual__mote--three" />
        <span className="forest-ritual__mote forest-ritual__mote--four" />
        <span className="forest-ritual__mote forest-ritual__mote--five" />
        <span className="forest-ritual__mote forest-ritual__mote--six" />
        <span className="forest-ritual__mote forest-ritual__mote--seven" />
        <span className="forest-ritual__mote forest-ritual__mote--eight" />
        <span className="forest-ritual__mote forest-ritual__mote--nine" />
        <span className="forest-ritual__mote forest-ritual__mote--ten" />
        <span className="forest-ritual__mote forest-ritual__mote--eleven" />
        <span className="forest-ritual__mote forest-ritual__mote--twelve" />
      </div>
      <div className="forest-ritual__content">
        <header className="forest-ritual__header">
          <p className="forest-ritual__eyebrow">The Alignment Portal</p>
          <h2 id="ritual-title">The Synchronicity Ritual</h2>
          <div className="forest-ritual__phases">
            <p>
              <strong>Phase 1: Three-Part Constellation</strong> Choose a Primary, then a Secondary,
              then a Catalyst.
            </p>
            <p>
              <strong>Phase 2: Meditative Stillness</strong> Seal the moving resonance when ready.
            </p>
          </div>
        </header>

        <div className="forest-ritual__roles" aria-label="Archetype selection order">
          {ROLE_LABELS.map((role, index) => {
            const symbol = SYMBOLS.find(({ id }) => id === selectedSymbols[index]);
            const isActive = activeRole === role;
            return (
              <div
                key={role}
                className={`forest-ritual__role ${isActive ? 'is-active' : ''} ${symbol ? 'is-sealed' : ''}`}
              >
                <span>{role}</span>
                <strong>
                  {symbol?.name ?? (isActive ? `Choose ${role}` : 'Awaiting selection')}
                </strong>
              </div>
            );
          })}
        </div>

        <p className="forest-ritual__prompt" aria-live="polite">
          {getStagePrompt()}
        </p>
        <div className="forest-ritual__status" aria-live="polite">
          <span>{getProgress()}</span>
          <span>
            {resonanceCapture
              ? 'Resonance sealed'
              : constellationComplete
                ? 'Resonance awaiting seal'
                : 'Constellation forming'}
          </span>
        </div>

        <div className="forest-ritual__layout">
          <div
            ref={symbolsRef}
            className="forest-ritual__symbols"
            aria-label="Nine archetype symbols"
          >
            {SYMBOLS.map((symbol) => {
              const selectionIndex = selectedSymbols.indexOf(symbol.id);
              return (
                <button
                  key={symbol.id}
                  type="button"
                  onClick={() => selectSymbol(symbol.id)}
                  disabled={selectionIndex === -1 && selectedSymbols.length >= 3}
                  className={`archetype-card ${selectionIndex !== -1 ? 'is-selected' : ''}`}
                  aria-label={`${symbol.name}: ${symbol.essence}${selectionIndex !== -1 ? `, selected as ${ROLE_LABELS[selectionIndex]}` : ''}`}
                >
                  <img src={`/images/forest/emblem-${symbol.id}.webp`} alt="" />
                  <span className="archetype-card__name">{symbol.name}</span>
                  <span className="archetype-card__essence">{symbol.essence}</span>
                  {selectionIndex !== -1 && (
                    <span className="archetype-card__role">{ROLE_LABELS[selectionIndex]}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div
            ref={resonanceRef}
            className={`resonance-sigil ${constellationComplete ? 'is-ready' : ''} ${resonanceCapture ? 'is-sealed' : ''}`}
          >
            <div className="resonance-sigil__orbit resonance-sigil__orbit--outer" />
            <div className="resonance-sigil__orbit resonance-sigil__orbit--inner" />
            <span className="resonance-sigil__anchor resonance-sigil__anchor--one" />
            <span className="resonance-sigil__anchor resonance-sigil__anchor--two" />
            <span className="resonance-sigil__anchor resonance-sigil__anchor--three" />
            <button
              type="button"
              className="resonance-sigil__control"
              onClick={handleResonanceControl}
              disabled={resonanceCapture !== null}
              aria-disabled={!constellationComplete && resonanceCapture === null}
              aria-describedby="resonance-result"
            >
              <span className="resonance-sigil__marker" aria-hidden="true" />
              <span>
                {resonanceCapture
                  ? 'Resonance sealed'
                  : constellationComplete
                    ? 'Seal the resonance'
                    : 'Select symbols to awaken'}
              </span>
            </button>
          </div>
        </div>

        <p id="resonance-result" className="forest-ritual__capture" aria-live="polite">
          {resonanceCapture
            ? `Phase: ${resonanceCapture.phase >= 0 ? '+' : ''}${resonanceCapture.phase.toFixed(3)} | Velocity: ${resonanceCapture.velocity >= 0 ? '+' : ''}${resonanceCapture.velocity.toFixed(3)} | Resonance sealed`
            : 'Select all three archetypes to activate the Resonance Sigil.'}
        </p>

        {selectedSymbols.length > 0 && !isSealing && (
          <button type="button" onClick={resetRitual} className="forest-ritual__reset">
            Begin constellation again
          </button>
        )}
        {isSealing && (
          <div className="forest-ritual__awakening" role="status">
            The constellation is converging…
          </div>
        )}
      </div>
    </section>
  );
}

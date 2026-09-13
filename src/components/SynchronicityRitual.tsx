import { useState } from 'react';
import { motion } from 'framer-motion';
import Pendulum3D from './Pendulum3D';

const SYMBOLS = [
  { id: 'forest', name: 'The Ancient Forest', fallback: '🌲' },
  { id: 'anchor', name: 'The Iron Anchor', fallback: '⚓' },
  { id: 'crystal', name: 'The Prismatic Crystal', fallback: '💎' },
  { id: 'hourglass', name: 'The Obsidian Hourglass', fallback: '⏳' },
  { id: 'compass', name: 'The Star Compass', fallback: '🧭' },
  { id: 'tide', name: 'The River Tide', fallback: '🌊' },
  { id: 'fire', name: 'The Hearth Fire', fallback: '🔥' },
  { id: 'key', name: 'The Hidden Key', fallback: '🗝️' },
  { id: 'mirror', name: 'The Silver Mirror', fallback: '🪞' },
];

interface RitualProps {
  onComplete: (symbols: [string, string, string], pendulumState: any) => void;
}

export default function SynchronicityRitual({ onComplete }: RitualProps) {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [pendulumState, setPendulumState] = useState<any>(null);

  const toggleSymbol = (id: string) => {
    if (selectedSymbols.includes(id)) return; // Already selected, or allow toggle off?
    if (selectedSymbols.length >= 3) return; // Max 3
    setSelectedSymbols([...selectedSymbols, id]);
  };

  const isRitualComplete = selectedSymbols.length === 3 && pendulumState !== null;

  return (
    <div className="flex flex-col gap-12 w-full">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-heading font-bold">✦ THE SYNCHRONICITY RITUAL ✦</h2>
        <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 text-muted-foreground">
          <div className="flex-1 max-w-sm">
            <h3 className="font-bold text-foreground mb-2">Phase 1: Subconscious Reflex</h3>
            <p className="text-sm">Select 3 symbols swiftly without overthinking. Trust your first instinct.</p>
            <p className="mt-2 text-primary font-mono font-bold">[{selectedSymbols.length} / 3 Selected]</p>
          </div>
          <div className="flex-1 max-w-sm">
            <h3 className="font-bold text-foreground mb-2">Phase 2: Meditative Stillness</h3>
            <p className="text-sm">Breathe, center your thoughts, and click the 3D Pendulum to freeze its momentum when ready.</p>
            <p className="mt-2 text-primary font-mono font-bold">
              [{pendulumState ? 'Locked' : 'In Motion'}]
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-8 items-center">
        {/* Left symbols (first 4 or 5) */}
        <div className="grid grid-cols-2 gap-4">
          {SYMBOLS.slice(0, 4).map((s) => (
            <SymbolCard 
              key={s.id} 
              symbol={s} 
              isSelected={selectedSymbols.includes(s.id)} 
              onClick={() => toggleSymbol(s.id)}
              disabled={selectedSymbols.length >= 3 && !selectedSymbols.includes(s.id)}
            />
          ))}
        </div>

        {/* Center Pendulum */}
        <div className="w-full">
          <Pendulum3D 
            isFrozen={pendulumState !== null} 
            onFreeze={(state) => setPendulumState(state)} 
          />
        </div>

        {/* Right symbols */}
        <div className="grid grid-cols-2 gap-4">
          {SYMBOLS.slice(4).map((s) => (
            <SymbolCard 
              key={s.id} 
              symbol={s} 
              isSelected={selectedSymbols.includes(s.id)} 
              onClick={() => toggleSymbol(s.id)}
              disabled={selectedSymbols.length >= 3 && !selectedSymbols.includes(s.id)}
            />
          ))}
        </div>
      </div>

      {isRitualComplete && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            onClick={() => onComplete(selectedSymbols as [string, string, string], pendulumState)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all"
          >
            Awaken Guide
          </button>
        </motion.div>
      )}
    </div>
  );
}

function SymbolCard({ symbol, isSelected, onClick, disabled }: { symbol: any, isSelected: boolean, onClick: () => void, disabled: boolean }) {
  // Try to load image, if it fails or doesn't exist, fallback to emoji.
  // Actually, for simplicity we just render the img with an onError fallback.
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-4 transition-all duration-300 overflow-hidden group
        ${isSelected ? 'border-primary shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105' : 'border-border/50 hover:border-primary/50 opacity-70 hover:opacity-100'}
        ${disabled && !isSelected ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="absolute inset-0 bg-black/60 z-10 transition-opacity group-hover:bg-black/40" />
      
      {!imgFailed ? (
        <img 
          src={`/images/symbols/${symbol.id}.jpg`} 
          alt={symbol.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="text-4xl absolute z-0">{symbol.fallback}</div>
      )}
      
      <div className="relative z-20 mt-auto text-center font-bold text-white text-xs drop-shadow-md">
        {symbol.name}
      </div>
      
      {isSelected && (
        <div className="absolute top-2 right-2 z-20 text-primary drop-shadow-md">
          ✦
        </div>
      )}
    </button>
  );
}

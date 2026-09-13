import { useState, useRef, useEffect } from 'react';
import { Send, ShieldCheck, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuantumDialogueProps {
  signature: string;
  onReset: () => void;
  messages: Message[];
  onSendMessage: (msg: string) => void;
  isGenerating: boolean;
  streamingText: string;
}

export default function QuantumDialogue({
  signature,
  onReset,
  messages,
  onSendMessage,
  isGenerating,
  streamingText
}: QuantumDialogueProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-[700px] max-h-[80vh] w-full max-w-4xl mx-auto bg-card/80 backdrop-blur-md border border-border/50 rounded-3xl overflow-hidden shadow-2xl">
      {/* Top Bar / HUD */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/50">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 text-primary border border-primary/30 rounded-full px-3 py-1 text-xs font-mono font-bold">
            {signature}
          </div>
          <div className="text-green-400 flex items-center gap-1 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            100% Off-Grid
          </div>
        </div>
        <button 
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground transition-colors p-2"
          title="Reset Journey"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && !isGenerating && (
          <div className="text-center text-muted-foreground my-10 max-w-md mx-auto">
            <p className="mb-4">The guide has awakened. How can it help illuminate your path today?</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => onSendMessage("I feel stuck between staying in my safe job and switching to a new career.")} className="text-xs bg-secondary hover:bg-secondary/80 p-2 rounded-lg text-left">
                "I feel stuck between staying in my safe job and switching to a new career."
              </button>
              <button onClick={() => onSendMessage("I'm turning 35 and feel like I'm running out of time.")} className="text-xs bg-secondary hover:bg-secondary/80 p-2 rounded-lg text-left">
                "I'm turning 35 and feel like I'm running out of time."
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                : 'bg-secondary text-secondary-foreground rounded-tl-sm border border-border/50'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-5 py-3 bg-secondary text-secondary-foreground border border-border/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <p className="whitespace-pre-wrap leading-relaxed text-sm">
                {streamingText}
                <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse align-middle" />
              </p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50 bg-background/50">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Share your thoughts..."
            className="flex-1 max-h-32 min-h-12 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="bg-primary text-primary-foreground p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors h-12 w-12 flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

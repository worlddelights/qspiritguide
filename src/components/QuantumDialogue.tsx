import { useState, useRef, useEffect } from 'react';
import { Cpu, Send, RotateCcw, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type ChatFontSize = 'small' | 'medium' | 'large';
const FONT_SIZE_STORAGE_KEY = 'qspiritguide-chat-font-size';

const FONT_SIZE_OPTIONS: { value: ChatFontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Med' },
  { value: 'large', label: 'Large' },
];

const isChatFontSize = (value: string | null): value is ChatFontSize =>
  FONT_SIZE_OPTIONS.some((option) => option.value === value);

interface QuantumDialogueProps {
  signature: string;
  modelName: string;
  onReset: () => void;
  messages: Message[];
  onSendMessage: (msg: string) => void;
  isGenerating: boolean;
  streamingText: string;
}

export default function QuantumDialogue({
  signature,
  modelName,
  onReset,
  messages,
  onSendMessage,
  isGenerating,
  streamingText,
}: QuantumDialogueProps) {
  const [input, setInput] = useState('');
  const [fontSize, setFontSize] = useState<ChatFontSize>('medium');
  const [hasLoadedFontSize, setHasLoadedFontSize] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedFontSize = window.localStorage.getItem(FONT_SIZE_STORAGE_KEY);
      if (isChatFontSize(savedFontSize)) {
        setFontSize(savedFontSize);
      }
    } catch (error) {
      console.error('Unable to load saved chat text size:', error);
    } finally {
      setHasLoadedFontSize(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedFontSize) return;

    try {
      window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, fontSize);
    } catch (error) {
      console.error('Unable to save chat text size:', error);
    }
  }, [fontSize, hasLoadedFontSize]);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement) {
      messagesElement.scrollTo({
        top: messagesElement.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, streamingText]);

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <section
      className={`quantum-dialogue quantum-dialogue--font-${fontSize}`}
      aria-label="Quantum dialogue"
    >
      <div className="quantum-dialogue__hud">
        <div className="flex items-center gap-3">
          <div className="quantum-dialogue__signature">{signature}</div>
          <div className="quantum-dialogue__model" aria-label={`Model: ${modelName}`}>
            <Cpu className="h-4 w-4" />
            {modelName}
          </div>
        </div>
        <div className="quantum-dialogue__actions">
          <div className="quantum-dialogue__font-size" role="group" aria-label="Chat text size">
            <span className="quantum-dialogue__font-label">Text size</span>
            {FONT_SIZE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={fontSize === option.value ? 'is-active' : ''}
                onClick={() => setFontSize(option.value)}
                aria-pressed={fontSize === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onReset}
            className="quantum-dialogue__reset"
            title="Start a new journey"
            aria-label="Start a new journey"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div ref={messagesRef} className="quantum-dialogue__messages">
        {messages.length === 0 && !isGenerating && (
          <div className="quantum-dialogue__welcome">
            <Sparkles className="mx-auto mb-4 h-6 w-6 text-amber-200" />
            <p>
              The guide has awakened within your constellation. What would you like to bring into
              the clearing?
            </p>
            <div className="quantum-dialogue__suggestions">
              <button
                type="button"
                onClick={() =>
                  onSendMessage(
                    'I feel stuck between staying in my safe job and switching to a new career.'
                  )
                }
              >
                "I feel stuck between staying in my safe job and switching to a new career."
              </button>
              <button
                type="button"
                onClick={() =>
                  onSendMessage("I'm turning 35 and feel like I'm running out of time.")
                }
              >
                "I'm turning 35 and feel like I'm running out of time."
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`quantum-dialogue__message ${msg.role === 'user' ? 'quantum-dialogue__message--user' : 'quantum-dialogue__message--guide'}`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="quantum-dialogue__message quantum-dialogue__message--guide">
              <p className="whitespace-pre-wrap leading-relaxed">
                {streamingText}
                <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse align-middle" />
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="quantum-dialogue__input-area">
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
            className="quantum-dialogue__input"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="quantum-dialogue__send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isThinking: boolean;
  onSend: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, isThinking, onSend }) => {
  return (
    <div className="p-6 bg-white/5 border-t border-white/5">
      <div className="relative group">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Ask about medical aid, food banks, or community resources..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20 text-sm"
          aria-label="Chat input"
        />
        <button 
          onClick={onSend}
          disabled={isThinking || !input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-primary/20 text-primary disabled:opacity-30 transition-all"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <p className="text-[9px] text-center mt-4 opacity-30 uppercase tracking-[0.2em]">
        Sovereign Intelligence Layer • Privacy-Native Edge Node
      </p>
    </div>
  );
};

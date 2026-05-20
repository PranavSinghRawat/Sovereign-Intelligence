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
    <div className="p-6 bg-zinc-900/40 border-t border-zinc-800/80">
      <div className="relative flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Search food banks, medical clinics, or aid in Seattle, Chicago..."
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl px-4 py-4 pr-14 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all duration-200"
          aria-label="Secure chat input"
        />
        <button 
          onClick={onSend}
          disabled={isThinking || !input.trim()}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 disabled:opacity-20 transition-all duration-200 cursor-pointer focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none"
          aria-label="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-center mt-4 text-zinc-550 uppercase tracking-widest font-mono">
        Sovereign Intelligence Layer • Privacy-Native Edge Node
      </p>
    </div>
  );
};

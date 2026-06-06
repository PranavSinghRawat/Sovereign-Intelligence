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
    <div className="p-6 bg-zinc-950/20 border-t border-zinc-900/60 backdrop-blur-md">
      <div className="relative flex items-center gap-3 max-w-4xl mx-auto">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isThinking && input.trim()) {
              onSend();
            }
          }}
          placeholder="Search food banks, medical clinics, or local aid resources..."
          className="w-full bg-zinc-950/50 border border-zinc-900 focus:border-zinc-750/60 rounded-xl px-4 py-3.5 pr-14 text-sm text-zinc-150 placeholder:text-zinc-600 focus:outline-none focus:ring-0 transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] font-sans"
          aria-label="Secure chat input"
        />
        <button 
          onClick={onSend}
          disabled={isThinking || !input.trim()}
          className="absolute right-2.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-150 disabled:opacity-20 transition-all duration-200 cursor-pointer focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none"
          aria-label="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[10px] text-center mt-3 text-zinc-550 uppercase tracking-widest font-mono font-medium">
        Sentinel Intelligence Layer • Private Edge-Native Node
      </p>
    </div>
  );
};

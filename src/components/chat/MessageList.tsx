import React, { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import dynamic from "next/dynamic";

const DynamicMarkdownRenderer = dynamic(
  () => import("./MarkdownRenderer"),
  { ssr: false, loading: () => <span className="text-xs font-mono opacity-50 uppercase tracking-wider">Rendering...</span> }
);

interface MessageListProps {
  messages: ChatCompletionMessageParam[];
  isThinking: boolean;
  thinkingStep?: string | null;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isThinking, thinkingStep, scrollRef }) => {
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" role="log" aria-label="Chat messages">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
          <Bot className="w-10 h-10 text-zinc-400" />
          <p className="text-sm text-zinc-400 leading-relaxed max-w-[45ch]">
            Sovereign Edge Node ready. All prompts, database queries, and response generations are processed 100% locally.
          </p>
        </div>
      )}
      
      <AnimatePresence>
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[75%] p-4 rounded-2xl ${
              m.role === "user" 
                ? "bg-zinc-100 text-zinc-950 ml-12 rounded-tr-none" 
                : "bg-zinc-900/40 border border-zinc-800 mr-12 rounded-tl-none text-zinc-200"
            }`}>
              <div className="text-sm leading-relaxed prose prose-invert max-w-none prose-sm">
                {typeof m.content === "string" ? (
                   <DynamicMarkdownRenderer content={m.content} />
                ) : (
                  JSON.stringify(m.content)
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isThinking && (
        <div className="flex justify-start" aria-live="polite" aria-atomic="true">
          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl rounded-tl-none flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map(d => (
                  <motion.div 
                    key={d}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: d * 0.15 }}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                  />
                ))}
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Processing</span>
            </div>
            {thinkingStep && (
              <motion.span 
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                key={thinkingStep}
                className="text-xs font-mono text-zinc-350"
              >
                {thinkingStep}
              </motion.span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

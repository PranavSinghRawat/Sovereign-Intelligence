import React, { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import dynamic from "next/dynamic";

const DynamicMarkdownRenderer = dynamic(
  () => import("./MarkdownRenderer"),
  { ssr: false, loading: () => <span className="opacity-50 text-xs tracking-widest uppercase">Rendering...</span> }
);

interface MessageListProps {
  messages: ChatCompletionMessageParam[];
  isThinking: boolean;
  thinkingStep?: string | null;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isThinking, thinkingStep, scrollRef }) => {
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
          <Bot className="w-16 h-16 mb-4" />
          <p>Ready to assist. Everything stays on this device.</p>
        </div>
      )}
      
      <AnimatePresence>
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              m.role === "user" 
                ? "bg-primary text-white ml-12 rounded-tr-none" 
                : "glass mr-12 rounded-tl-none border-white/10"
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-invert max-w-none">
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
          <div className="glass p-4 rounded-2xl rounded-tl-none border-white/10 flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map(d => (
                  <motion.div 
                    key={d}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1, delay: d * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                  />
                ))}
              </div>
              <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Processing</span>
            </div>
            {thinkingStep && (
              <motion.span 
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                key={thinkingStep}
                className="text-xs font-mono text-primary"
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

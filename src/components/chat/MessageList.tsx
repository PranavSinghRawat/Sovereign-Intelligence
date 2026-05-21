import React, { RefObject, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, FileText, X } from "lucide-react";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import dynamic from "next/dynamic";
import { SearchResult } from "@/lib/runtime/RAGManager";

const DynamicMarkdownRenderer = dynamic(
  () => import("./MarkdownRenderer"),
  { ssr: false, loading: () => <span className="text-xs font-mono opacity-50 uppercase tracking-wider">Rendering...</span> }
);

export type ExtendedChatMessage = ChatCompletionMessageParam & {
  ragSources?: SearchResult[];
};

interface MessageListProps {
  messages: ExtendedChatMessage[];
  isThinking: boolean;
  thinkingStep?: string | null;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isThinking, thinkingStep, scrollRef }) => {
  const [activeSources, setActiveSources] = useState<SearchResult[] | null>(null);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth relative" role="log" aria-label="Chat messages">
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
            <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
              m.role === "user" 
                ? "bg-zinc-100 text-zinc-950 ml-12 rounded-tr-none font-sans font-medium" 
                : "bg-zinc-950/35 backdrop-blur-xl border border-zinc-900/60 mr-12 rounded-tl-none text-zinc-200"
            }`}>
              <div className="text-sm leading-relaxed prose prose-invert max-w-none prose-sm">
                {typeof m.content === "string" ? (
                   <DynamicMarkdownRenderer content={m.content} />
                ) : (
                  JSON.stringify(m.content)
                )}
              </div>

              {/* RAG Sources Badge */}
              {m.role === "assistant" && m.ragSources && m.ragSources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-zinc-900/60 flex items-center gap-2">
                  <button
                    onClick={() => setActiveSources(m.ragSources || null)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900/60 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-mono transition-all duration-200 cursor-pointer shadow-sm"
                    title="View local retrieval sources"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{m.ragSources.length} Local Sources Injected</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isThinking && (
        <div className="flex justify-start" aria-live="polite" aria-atomic="true">
          <div className="bg-zinc-950/35 backdrop-blur-xl border border-zinc-900/60 p-4 rounded-2xl rounded-tl-none flex flex-col gap-2 min-w-[220px] shadow-sm">
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
                className="text-xs font-mono text-zinc-400"
              >
                {thinkingStep}
              </motion.span>
            )}
          </div>
        </div>
      )}

      {/* Modal Overlay for RAG Context */}
      <AnimatePresence>
        {activeSources && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl flex flex-col max-h-[80vh] font-mono text-[10px]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-200 font-bold uppercase tracking-wider text-[11px]">Retrieved Context Sources</span>
                    <span className="text-zinc-550 text-[9px] mt-0.5">Enriched locally from IndexedDB / OPFS</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSources(null)}
                  className="p-1.5 rounded-lg border border-transparent hover:border-zinc-800 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-all duration-200"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {activeSources.map((src, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-300 truncate max-w-[70%]" title={src.documentName}>
                        {src.documentName}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-zinc-500">Chunk #{src.chunkIndex}</span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 font-semibold">
                          Score: {src.score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] font-sans text-zinc-400 bg-zinc-950/20 border border-zinc-900/40 p-2.5 rounded-lg leading-relaxed select-text whitespace-pre-wrap">
                      {src.textContent}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="p-3 border-t border-zinc-800 bg-zinc-950/30 flex justify-end">
                <button
                  onClick={() => setActiveSources(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-sans font-bold text-xs cursor-pointer active:scale-95 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Shield, Zap, Database, Activity, Cpu } from "lucide-react";
import { sovereignRuntime } from "@/lib/runtime/AgentRuntime";
import { GlassCard } from "@/components/ui/GlassCard";
import { PrivacyFirewall } from "@/components/agent/PrivacyFirewall";
import { CAMPResult } from "@/lib/middleware/CAMP";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [initProgress, setInitProgress] = useState("Waking up local engine...");
  const [lastCamp, setLastCamp] = useState<CAMPResult | null>(null);
  const [toolExecuting, setToolExecuting] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await sovereignRuntime.initialize((report) => {
          setInitProgress(report.text);
        });
        setIsInitializing(false);
      } catch {
        setInitProgress("WebGPU Error: Please use a compatible browser.");
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    setToolExecuting(null);

    try {
      let streamingText = "";
      const result = await sovereignRuntime.generateResponse(
        [...messages, userMessage],
        (chunk) => {
          streamingText += chunk;
          // Update last message if it's from assistant, otherwise add it
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant") {
              return [...prev.slice(0, -1), { role: "assistant", content: streamingText }];
            }
            return [...prev, { role: "assistant", content: streamingText }];
          });
        },
        (toolName) => {
          setToolExecuting(toolName);
        }
      );

      setLastCamp(result.camp);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
      setToolExecuting(null);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 scale-150" />
            <Cpu className="w-16 h-16 text-primary relative mx-auto" />
          </div>
          <h1 className="text-3xl font-bold glow-text">Sovereign Intelligence</h1>
          <p className="text-foreground/60 font-mono text-sm">{initProgress}</p>
          <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
            <motion.div 
              className="h-full bg-primary"
              animate={{ width: ["0%", "100%"] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="flex h-screen max-h-screen bg-background overflow-hidden p-4 gap-4">
      {/* Sidebar: Metrics & Firewall */}
      <aside className="w-80 flex flex-col gap-4 overflow-y-auto pr-2">
        <GlassCard className="p-4" gradient>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-widest">System Metrics</h2>
          </div>
          <div className="space-y-4">
            <MetricItem icon={<Zap className="w-3 h-3"/>} label="Inference Latency" value="18ms" color="text-yellow-400" />
            <MetricItem icon={<Shield className="w-3 h-3"/>} label="Leakage Prob." value="0.00" color="text-emerald-400" />
            <MetricItem icon={<Database className="w-3 h-3"/>} label="Checkpoints" value="12 Saved" color="text-blue-400" />
          </div>
        </GlassCard>

        <PrivacyFirewall result={lastCamp} />

        {toolExecuting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard className="p-4 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-mono">Executing: {toolExecuting}</span>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </aside>

      {/* Main Chat Area */}
      <section className="flex-1 flex flex-col gap-4">
        <GlassCard className="flex-1 flex flex-col relative">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium">Local Engine: Phi-4-mini (WebGPU)</span>
            </div>
            <div className="flex gap-4">
              <span className="text-[10px] opacity-40 uppercase tracking-tighter">Encrypted</span>
              <span className="text-[10px] opacity-40 uppercase tracking-tighter">Zero-Cloud</span>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
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
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isThinking && (
              <div className="flex justify-start">
                <div className="glass p-4 rounded-2xl rounded-tl-none border-white/10">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(d => (
                      <motion.div 
                        key={d}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1, delay: d * 0.2 }}
                        className="w-2 h-2 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white/5 border-t border-white/5">
            <div className="relative group">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about medical aid, food banks, or community resources..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20 text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={isThinking || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-primary/20 text-primary disabled:opacity-30 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[9px] text-center mt-4 opacity-30 uppercase tracking-[0.2em]">
              Sovereign Intelligence Layer • Privacy-Native Edge Node
            </p>
          </div>
        </GlassCard>
      </section>
    </main>
  );
}

function MetricItem({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg bg-white/5 ${color}`}>{icon}</div>
        <span className="text-[10px] text-white/50 uppercase">{label}</span>
      </div>
      <span className={`text-xs font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useSovereignAgent } from "@/hooks/useSovereignAgent";
import { MetricsSidebar } from "@/components/chat/MetricsSidebar";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";

export default function Home() {
  const {
    input,
    setInput,
    messages,
    isInitializing,
    isThinking,
    initProgress,
    lastCamp,
    toolExecuting,
    metrics,
    handleSend,
    // P2P State
    p2pStatus,
    offerCode,
    answerCode,
    peerCodeInput,
    setPeerCodeInput,
    // P2P Handlers
    handleGenerateOffer,
    handleAcceptOffer,
    handleCompleteConnection,
    handleSendP2PData
  } = useSovereignAgent();
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  if (isInitializing) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
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
      </main>
    );
  }

  return (
    <main className="flex h-screen max-h-screen bg-background overflow-hidden p-4 gap-4">
      <MetricsSidebar 
        metrics={metrics} 
        lastCamp={lastCamp} 
        toolExecuting={toolExecuting} 
        p2pStatus={p2pStatus}
        offerCode={offerCode}
        answerCode={answerCode}
        peerCodeInput={peerCodeInput}
        setPeerCodeInput={setPeerCodeInput}
        handleGenerateOffer={handleGenerateOffer}
        handleAcceptOffer={handleAcceptOffer}
        handleCompleteConnection={handleCompleteConnection}
        handleSendP2PData={handleSendP2PData}
      />

      <section className="flex-1 flex flex-col gap-4">
        <GlassCard className="flex-1 flex flex-col relative">
          <header className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium">Local Engine: Llama-3.2-1B (WebGPU)</span>
            </div>
            <div className="flex gap-4">
              <span className="text-[10px] opacity-40 uppercase tracking-tighter">Encrypted</span>
              <span className="text-[10px] opacity-40 uppercase tracking-tighter">Zero-Cloud</span>
            </div>
          </header>

          <MessageList 
            messages={messages} 
            isThinking={isThinking} 
            scrollRef={scrollRef} 
          />

          <ChatInput 
            input={input} 
            setInput={setInput} 
            isThinking={isThinking} 
            onSend={handleSend} 
          />
        </GlassCard>
      </section>
    </main>
  );
}

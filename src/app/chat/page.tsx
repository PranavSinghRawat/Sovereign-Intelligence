"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Cpu, ChevronLeft, Shield } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useSentinelAgent } from "@/hooks/useSentinelAgent";
import { useWebRTC } from "@/hooks/useWebRTC";
import { MetricsSidebar } from "@/components/chat/MetricsSidebar";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { useAgentStore } from "@/store/agentStore";

export default function ChatPage() {
  const isSimulationMode = useAgentStore((state) => state.isSimulationMode);

  const {
    input,
    setInput,
    messages,
    isInitializing,
    isThinking,
    initProgress,
    lastCamp,
    toolExecuting,
    thinkingStep,
    metrics,
    handleSend,
    addExternalMessage
  } = useSentinelAgent();

  const {
    p2pStatus,
    offerCode,
    answerCode,
    peerCodeInput,
    setPeerCodeInput,
    handleGenerateOffer,
    handleAcceptOffer,
    handleCompleteConnection,
    handleSendP2PData,
    // ZK-Signaling props
    roomPassphrase,
    setRoomPassphrase,
    isSignaling,
    signalingLogs,
    handleInitZKSignaling,
    handleJoinZKSignaling,
    handleCancelZKSignaling,
    localPubKey,
    peerPubKey,
    isFirewallBlocked
  } = useWebRTC(addExternalMessage);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  if (isInitializing) {
    return (
      <ErrorBoundary>
        <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-zinc-950">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-center space-y-6 max-w-sm"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 animate-pulse rounded-full bg-zinc-800 scale-125" />
              <Cpu className="w-12 h-12 text-zinc-100 relative mx-auto" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Sentinel Intelligence</h1>
            <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">{initProgress}</p>
            <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden mx-auto">
              <motion.div 
                className="h-full bg-zinc-100"
                animate={{ width: ["0%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </main>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <main className="flex h-screen max-h-screen bg-zinc-950 overflow-hidden p-6 gap-6 relative">
        
        {/* Option C: Layered Masked Spotlight Background Pattern */}
        <div 
          className="absolute inset-0 bg-[radial-gradient(rgba(244,244,245,0.012)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0 transform-gpu will-change-transform" 
          style={{ maskImage: "radial-gradient(circle at 10% 10%, black 20%, transparent 70%)", WebkitMaskImage: "radial-gradient(circle at 10% 10%, black 20%, transparent 70%)" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(63,63,70,0.06),transparent_40%)] pointer-events-none z-0 transform-gpu will-change-opacity" />

        <div className="z-10 flex w-full h-full gap-6">
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
            // ZK-Signaling props
            roomPassphrase={roomPassphrase}
            setRoomPassphrase={setRoomPassphrase}
            isSignaling={isSignaling}
            signalingLogs={signalingLogs}
            handleInitZKSignaling={handleInitZKSignaling}
            handleJoinZKSignaling={handleJoinZKSignaling}
            handleCancelZKSignaling={handleCancelZKSignaling}
            localPubKey={localPubKey}
            peerPubKey={peerPubKey}
            isFirewallBlocked={isFirewallBlocked}
          />

          <section className="flex-1 flex flex-col gap-6" aria-label="Secure Chat Area">
            <GlassCard className="flex-1 flex flex-col relative border-zinc-800 bg-zinc-900/20">
              <header className="p-4 border-b border-zinc-800/80 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <Link 
                  href="/"
                  className="p-1 rounded bg-zinc-950 border border-zinc-850 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors duration-200"
                  aria-label="Back to landing page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Link>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono text-zinc-300">Local Engine: Llama-3.2-1B</span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 uppercase tracking-wider">Encrypted</span>
                <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 uppercase tracking-wider">Zero-Cloud</span>
              </div>
            </header>

            {isSimulationMode && (
              <div className="bg-amber-955/10 border-b border-amber-900/40 px-4 py-2 flex items-center justify-between text-[10px] text-amber-300 font-mono">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  Demonstration Mode Active (WebGPU is unsupported or disabled in this browser).
                </span>
                <span className="text-[9px] text-amber-500 uppercase tracking-wider font-bold">Sanitization & Local Simulation Live</span>
              </div>
            )}

            <MessageList 
              messages={messages} 
              isThinking={isThinking} 
              thinkingStep={thinkingStep}
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
        </div>
      </main>
    </ErrorBoundary>
  );
}

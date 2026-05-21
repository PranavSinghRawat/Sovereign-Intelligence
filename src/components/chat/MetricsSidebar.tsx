import React, { useState } from "react";
import { Activity, Zap, Shield, Database, Radio, Share2, Send, Check, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { PrivacyFirewall } from "@/components/agent/PrivacyFirewall";
import { SystemMetrics } from "@/lib/metrics/MetricsCapture";
import { CAMPResult } from "@/lib/middleware/CAMP";
import { telemetry } from "@/lib/metrics/Telemetry";
import { cn } from "@/lib/utils";

interface MetricsSidebarProps {
  metrics: SystemMetrics;
  lastCamp: CAMPResult | null;
  toolExecuting: string | null;
  
  // P2P WebRTC Props
  p2pStatus: RTCPeerConnectionState;
  offerCode: string;
  answerCode: string;
  peerCodeInput: string;
  setPeerCodeInput: (val: string) => void;
  handleGenerateOffer: () => void;
  handleAcceptOffer: (invite: string) => void;
  handleCompleteConnection: (answer: string) => void;
  handleSendP2PData: (text: string) => void;
}

export const MetricsSidebar: React.FC<MetricsSidebarProps> = ({ 
  metrics, 
  lastCamp, 
  toolExecuting,
  p2pStatus,
  offerCode,
  answerCode,
  peerCodeInput,
  setPeerCodeInput,
  handleGenerateOffer,
  handleAcceptOffer,
  handleCompleteConnection,
  handleSendP2PData
}) => {
  const [optIn, setOptIn] = useState(telemetry.getOptInStatus());
  const [copied, setCopied] = useState("");
  const [p2pMsgInput, setP2pMsgInput] = useState("");

  const handleOptIn = () => {
    const newStatus = !optIn;
    setOptIn(newStatus);
    telemetry.setOptIn(newStatus);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <aside className="w-80 flex flex-col gap-6 overflow-y-auto pr-2" role="complementary" aria-label="System Metrics and Settings">
      <GlassCard className="p-4 border-zinc-900 bg-zinc-950/20 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-zinc-400" />
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 font-mono">Research Metrics</h2>
          </div>
        </div>
        <div className="space-y-3">
          <MetricItem 
            icon={<Zap className="w-3.5 h-3.5"/>} 
            label="Inference Speed" 
            value={`${metrics.inferenceSpeed.toFixed(1)} tok/s`} 
            color="text-zinc-200" 
          />
          <MetricItem 
            icon={<Shield className="w-3.5 h-3.5"/>} 
            label="Resilience Factor" 
            value={`I_rp = ${metrics.irpIndex.toFixed(2)}`} 
            color="text-zinc-200" 
          />
          <MetricItem 
            icon={<Database className="w-3.5 h-3.5"/>} 
            label="Pruned Fragments" 
            value={metrics.totalPrunedFragments.toString()} 
            color="text-zinc-400" 
          />

          {/* Benchmark Comparison Table */}
          <div className="border-t border-zinc-900/60 pt-4 mt-2">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block mb-2 font-bold">Local vs Cloud Benchmarks</span>
            <table className="w-full text-[10px] text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-zinc-900/80 text-zinc-500">
                  <th className="pb-1.5 uppercase font-semibold">Metric</th>
                  <th className="pb-1.5 text-right uppercase font-semibold text-zinc-400">Local (CAMP)</th>
                  <th className="pb-1.5 text-right uppercase font-semibold">Cloud API</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-900/40">
                  <td className="py-2 text-zinc-400">Privacy Efficacy</td>
                  <td className="py-2 text-right text-emerald-400 font-medium">{(metrics.privacyEfficacy * 100).toFixed(0)}%</td>
                  <td className="py-2 text-right text-zinc-600">0%</td>
                </tr>
                <tr className="border-b border-zinc-900/40">
                  <td className="py-2 text-zinc-400">Speed (tok/s)</td>
                  <td className="py-2 text-right text-zinc-200">{metrics.inferenceSpeed > 0 ? metrics.inferenceSpeed.toFixed(1) : "0.0"}</td>
                  <td className="py-2 text-right text-zinc-500">35.0</td>
                </tr>
                <tr>
                  <td className="py-2 text-zinc-300 font-bold uppercase text-[9px] tracking-wide">Resilience I_rp</td>
                  <td className="py-2 text-right text-zinc-100 font-bold">{metrics.irpIndex.toFixed(2)}</td>
                  <td className="py-2 text-right text-zinc-600 font-bold">35.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </GlassCard>

      <PrivacyFirewall result={lastCamp} />

      {toolExecuting && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="p-4 border-zinc-900 bg-zinc-950/20">
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span className="text-[10px] font-mono text-zinc-450">Executing: {toolExecuting}</span>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* WebRTC P2P Console */}
      <GlassCard className="p-4 flex flex-col gap-4 border-zinc-900 bg-zinc-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-zinc-400" />
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 font-mono">P2P Secure Channel</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-2 h-2 rounded-full",
              p2pStatus === "connected" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
              p2pStatus === "connecting" ? "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-zinc-800"
            )} />
            <span className="text-[10px] font-mono text-zinc-400 capitalize">{p2pStatus}</span>
          </div>
        </div>

        {p2pStatus !== "connected" ? (
          <div className="flex flex-col gap-4 text-[10px]">
            {/* Step A: Generate Offer */}
            <div className="flex flex-col gap-2">
              <span className="text-zinc-500 uppercase font-mono tracking-wider font-bold">1. Host a P2P Session</span>
              {!offerCode ? (
                <button 
                  onClick={handleGenerateOffer}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-800/50 hover:text-zinc-100 active:scale-[0.98] text-zinc-300 font-mono text-xs cursor-pointer transition-all duration-200 ease-out focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none shadow-sm"
                >
                  Generate Invite Code
                </button>
              ) : (
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={offerCode} 
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 font-mono text-xs text-zinc-200 select-all outline-none focus:border-zinc-750 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
                    aria-label="Host invitation code"
                  />
                  <button 
                    onClick={() => copyToClipboard(offerCode, "offer")}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer text-zinc-400 hover:text-zinc-200"
                    aria-label="Copy invitation code"
                  >
                    {copied === "offer" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Step B: Connect with Peer Code */}
            <div className="flex flex-col gap-2 border-t border-zinc-900/60 pt-4">
              <span className="text-zinc-500 uppercase font-mono tracking-wider font-bold">2. Join Peer Session</span>
              <textarea 
                value={peerCodeInput}
                onChange={(e) => setPeerCodeInput(e.target.value)}
                placeholder="Paste Peer Invitation or Answer code..."
                className="w-full h-16 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 font-mono text-xs text-zinc-200 placeholder-zinc-600 resize-none outline-none focus:border-zinc-700/80 transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
                aria-label="Peer invite code input"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAcceptOffer(peerCodeInput)}
                  className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-800/50 hover:text-zinc-100 active:scale-[0.98] text-zinc-300 font-mono text-xs cursor-pointer transition-all duration-200 ease-out focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none"
                >
                  Generate Answer
                </button>
                <button 
                  onClick={() => handleCompleteConnection(peerCodeInput)}
                  className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-600/80 hover:bg-zinc-700/50 hover:text-white active:scale-[0.98] text-zinc-200 font-mono text-xs cursor-pointer transition-all duration-200 ease-out focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none"
                >
                  Complete Link
                </button>
              </div>

              {answerCode && (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-emerald-450 uppercase font-mono tracking-wider font-bold">Answer Code Generated:</span>
                  <div className="flex gap-2">
                    <input 
                      readOnly 
                      value={answerCode} 
                      className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 font-mono text-xs text-zinc-200 select-all outline-none focus:border-zinc-750 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
                      aria-label="Answer code output"
                    />
                    <button 
                      onClick={() => copyToClipboard(answerCode, "answer")}
                      className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer text-zinc-400 hover:text-zinc-200"
                      aria-label="Copy answer code"
                    >
                      {copied === "answer" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 text-[10px]">
            <span className="text-emerald-400 font-mono font-medium">✓ Secure Channel Established.</span>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Type secure peer message..."
                value={p2pMsgInput}
                onChange={(e) => setP2pMsgInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 font-mono text-xs text-zinc-200 placeholder-zinc-650 outline-none focus:border-zinc-700/80 transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
                aria-label="P2P chat input"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && p2pMsgInput.trim()) {
                    handleSendP2PData(p2pMsgInput);
                    setP2pMsgInput("");
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (p2pMsgInput.trim()) {
                    handleSendP2PData(p2pMsgInput);
                    setP2pMsgInput("");
                  }
                }}
                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700/80 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 ease-out cursor-pointer shadow-sm"
                aria-label="Send P2P Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Telemetry Opt-In */}
      <div className="mt-auto pt-4 flex items-center justify-between text-[10px] border-t border-zinc-900">
        <div className="flex items-center gap-2 text-zinc-400">
          <Radio className="w-3.5 h-3.5" />
          <span className="font-mono uppercase tracking-wider font-semibold">Diagnostics Uplink</span>
        </div>
        <button 
          onClick={handleOptIn}
          className={cn(
            "w-8 h-4 rounded-full transition-colors relative cursor-pointer",
            optIn ? 'bg-zinc-200' : 'bg-zinc-800'
          )}
          aria-label="Toggle anonymous diagnostics sharing"
          aria-checked={optIn}
          role="switch"
        >
          <div className={cn(
            "absolute top-0.5 w-3 h-3 rounded-full transition-transform",
            optIn ? 'translate-x-4 bg-zinc-950' : 'translate-x-1 bg-zinc-100'
          )} />
        </button>
      </div>
    </aside>
  );
};

function MetricItem({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-900/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] hover:border-zinc-800/40 transition-all duration-200">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 shadow-sm">{icon}</div>
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <span className={`text-[10px] font-mono font-bold tracking-tight ${color}`}>{value}</span>
    </div>
  );
}

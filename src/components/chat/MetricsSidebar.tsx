import React, { useState } from "react";
import { Activity, Zap, Shield, Database, Radio, Share2, Send, Check, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { PrivacyFirewall } from "@/components/agent/PrivacyFirewall";
import { SystemMetrics } from "@/lib/metrics/MetricsCapture";
import { CAMPResult } from "@/lib/middleware/CAMP";
import { telemetry } from "@/lib/metrics/Telemetry";

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
    <aside className="w-80 flex flex-col gap-4 overflow-y-auto pr-2">
      <GlassCard className="p-4" gradient>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Research Metrics</h2>
          </div>
        </div>
        <div className="space-y-4">
          <MetricItem 
            icon={<Zap className="w-3 h-3"/>} 
            label="Inference Latency" 
            value={`${metrics.latencyMs.toFixed(0)} ms (${metrics.inferenceSpeed.toFixed(1)} tok/s)`} 
            color="text-yellow-400" 
          />
          <MetricItem 
            icon={<Shield className="w-3 h-3"/>} 
            label="Resilience-Privacy Index" 
            value={`I_rp = ${metrics.irpIndex.toFixed(2)}`} 
            color="text-emerald-400" 
          />
          <MetricItem 
            icon={<Database className="w-3 h-3"/>} 
            label="Total Fragments Pruned" 
            value={metrics.totalPrunedFragments.toString()} 
            color="text-blue-400" 
          />

          {/* $I_{rp}$ Benchmark Comparison Table */}
          <div className="border-t border-white/10 pt-3 mt-3">
            <span className="text-[9px] text-white/40 font-mono uppercase tracking-wider block mb-2">Research Benchmark: Local vs Cloud API</span>
            <table className="w-full text-[10px] text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-white/40">
                  <th className="py-1 font-mono">Metric</th>
                  <th className="py-1 font-mono text-right">Local (CAMP)</th>
                  <th className="py-1 font-mono text-right">Cloud API</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-1 text-white/60">Privacy Efficacy</td>
                  <td className="py-1 text-right text-emerald-400">{(metrics.privacyEfficacy * 100).toFixed(0)}%</td>
                  <td className="py-1 text-right text-red-400">0%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-1 text-white/60">Speed (tok/s)</td>
                  <td className="py-1 text-right">{metrics.inferenceSpeed > 0 ? metrics.inferenceSpeed.toFixed(1) : "0.0"}</td>
                  <td className="py-1 text-right text-white/40">35.0</td>
                </tr>
                <tr>
                  <td className="py-1 text-white/80 font-bold">Resilience I_rp</td>
                  <td className="py-1 text-right text-emerald-400 font-bold font-mono">{metrics.irpIndex.toFixed(2)}</td>
                  <td className="py-1 text-right text-white/40 font-bold font-mono">35.00</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[8px] text-white/30 font-mono leading-tight mt-2">
              * Cloud API lacks local PII masking (Privacy Efficacy = 0), reducing its real private resilience despite raw speed.
            </p>
          </div>
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

      {/* WebRTC P2P Console */}
      <GlassCard className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-widest">P2P Secure Connection</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              p2pStatus === "connected" ? "bg-emerald-500 animate-pulse" :
              p2pStatus === "connecting" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
            }`} />
            <span className="text-[10px] font-mono capitalize text-white/50">{p2pStatus}</span>
          </div>
        </div>

        {p2pStatus !== "connected" ? (
          <div className="flex flex-col gap-3 text-xs">
            {/* Step A: Generate Offer */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-white/40 uppercase font-mono">1. Host a P2P Session</span>
              {!offerCode ? (
                <button 
                  onClick={handleGenerateOffer}
                  className="w-full py-1.5 rounded bg-primary/25 hover:bg-primary/40 border border-primary/40 text-white font-medium transition-colors font-mono text-[10px]"
                >
                  Generate Invite Code
                </button>
              ) : (
                <div className="flex gap-1.5">
                  <input 
                    readOnly 
                    value={offerCode} 
                    className="flex-1 px-2 py-1 rounded bg-black/40 border border-white/10 font-mono text-[9px] select-all outline-none"
                  />
                  <button 
                    onClick={() => copyToClipboard(offerCode, "offer")}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    {copied === "offer" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Step B: Connect with Peer Code */}
            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2">
              <span className="text-[10px] text-white/40 uppercase font-mono">2. Join Peer Session</span>
              <textarea 
                value={peerCodeInput}
                onChange={(e) => setPeerCodeInput(e.target.value)}
                placeholder="Paste Peer Invitation or Answer code..."
                className="w-full h-12 px-2 py-1 rounded bg-black/40 border border-white/10 font-mono text-[9px] resize-none outline-none focus:border-primary/50"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAcceptOffer(peerCodeInput)}
                  className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] transition-colors font-mono"
                >
                  Generate Answer
                </button>
                <button 
                  onClick={() => handleCompleteConnection(peerCodeInput)}
                  className="flex-1 py-1 rounded bg-primary/20 hover:bg-primary/30 border border-primary/30 text-[10px] text-primary transition-colors font-mono"
                >
                  Complete Link
                </button>
              </div>

              {answerCode && (
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[9px] text-emerald-400 uppercase font-mono">Answer Code Generated:</span>
                  <div className="flex gap-1.5">
                    <input 
                      readOnly 
                      value={answerCode} 
                      className="flex-1 px-2 py-1 rounded bg-black/40 border border-white/10 font-mono text-[9px] select-all outline-none"
                    />
                    <button 
                      onClick={() => copyToClipboard(answerCode, "answer")}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      {copied === "answer" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 text-xs">
            <span className="text-[10px] text-emerald-400 font-mono">✓ Secure Channel Established.</span>
            <div className="flex gap-1.5">
              <input 
                type="text"
                placeholder="Type secure peer message..."
                value={p2pMsgInput}
                onChange={(e) => setP2pMsgInput(e.target.value)}
                className="flex-1 px-2 py-1 rounded bg-black/40 border border-white/10 font-mono text-[10px] outline-none focus:border-primary/50"
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
                className="p-1 rounded bg-primary hover:bg-primary/80 transition-colors text-white"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Telemetry Opt-In */}
      <div className="mt-auto pt-4 flex items-center justify-between text-xs border-t border-white/5">
        <div className="flex items-center gap-2 text-white/60">
          <Radio className="w-3 h-3" />
          <span>Anonymous Diagnostics</span>
        </div>
        <button 
          onClick={handleOptIn}
          className={`w-8 h-4 rounded-full transition-colors relative ${optIn ? 'bg-primary' : 'bg-white/10'}`}
        >
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${optIn ? 'translate-x-4' : 'translate-x-1'}`} />
        </button>
      </div>
    </aside>
  );
};

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

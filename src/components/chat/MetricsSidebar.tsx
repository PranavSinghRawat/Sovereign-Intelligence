import React from "react";
import { Activity, Zap, Shield, Database } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { PrivacyFirewall } from "@/components/agent/PrivacyFirewall";
import { SystemMetrics } from "@/lib/metrics/MetricsCapture";
import { CAMPResult } from "@/lib/middleware/CAMP";

interface MetricsSidebarProps {
  metrics: SystemMetrics;
  lastCamp: CAMPResult | null;
  toolExecuting: string | null;
}

export const MetricsSidebar: React.FC<MetricsSidebarProps> = ({ metrics, lastCamp, toolExecuting }) => {
  return (
    <aside className="w-80 flex flex-col gap-4 overflow-y-auto pr-2">
      <GlassCard className="p-4" gradient>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-widest">Research Metrics</h2>
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

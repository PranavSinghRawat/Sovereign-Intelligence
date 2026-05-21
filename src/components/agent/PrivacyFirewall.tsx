"use client";

import React from "react";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { CAMPResult } from "@/lib/middleware/CAMP";
import { cn } from "@/lib/utils";

interface PrivacyFirewallProps {
  result: CAMPResult | null;
}

export const PrivacyFirewall: React.FC<PrivacyFirewallProps> = ({ result }) => {
  if (!result) return null;

  // Premium status-specific configurations for border glows
  const statusConfig = result.pruned
    ? {
        borderColor: "border-rose-500/20",
        iconColor: "text-rose-400",
        glowColor: "bg-rose-500/5",
        lightSweep: "from-transparent via-rose-500/20 to-transparent",
        message: "High re-identification risk detected. Autonomous pruning applied.",
        icon: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
      }
    : result.cpeScore > 0.5
    ? {
        borderColor: "border-amber-500/20",
        iconColor: "text-amber-400",
        glowColor: "bg-amber-500/5",
        lightSweep: "from-transparent via-amber-500/20 to-transparent",
        message: "Moderate re-identification risk. Secondary masking applied.",
        icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
      }
    : {
        borderColor: "border-emerald-500/20",
        iconColor: "text-emerald-400",
        glowColor: "bg-emerald-500/5",
        lightSweep: "from-transparent via-emerald-500/20 to-transparent",
        message: "Privacy threshold maintained. All data fragments masked locally.",
        icon: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
      };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "relative bg-zinc-950/35 border rounded-2xl overflow-hidden backdrop-blur-xl p-4 transition-all duration-300",
        statusConfig.borderColor
      )}
    >
      {/* Top light sweep colored border */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r pointer-events-none",
        statusConfig.lightSweep
      )} />

      {/* Status glow reflection */}
      <div className={cn(
        "absolute -top-10 -left-10 w-24 h-24 rounded-full blur-2xl pointer-events-none",
        statusConfig.glowColor
      )} />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Shield className={cn("w-4 h-4", statusConfig.iconColor)} />
          <h3 className="font-bold uppercase tracking-wider text-[10px] text-zinc-300 font-mono">CAMP Firewall</h3>
        </div>
        <div className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
          CPE Score: <span className="font-bold">{result.cpeScore.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex items-start gap-2 text-xs text-zinc-200">
          {statusConfig.icon}
          <span className="leading-normal">{statusConfig.message}</span>
        </div>

        {result.fragmentsDetected.length > 0 && (
          <div className="border-t border-zinc-900/40 pt-3 mt-1">
            <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-2 font-bold">Identified Entities</p>
            <div className="flex flex-wrap gap-1.5">
              {result.fragmentsDetected.map((f, i) => (
                <span 
                  key={i} 
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 hover:text-zinc-200 transition-colors"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

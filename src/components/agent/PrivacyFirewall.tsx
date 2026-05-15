"use client";

import React from "react";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { CAMPResult } from "@/lib/middleware/CAMP";

interface PrivacyFirewallProps {
  result: CAMPResult | null;
}

export const PrivacyFirewall: React.FC<PrivacyFirewallProps> = ({ result }) => {
  if (!result) return null;

  const getStatusColor = () => {
    if (result.pruned) return "text-red-400 border-red-400/50 bg-red-400/10";
    if (result.cpeScore > 0.5) return "text-yellow-400 border-yellow-400/50 bg-yellow-400/10";
    return "text-emerald-400 border-emerald-400/50 bg-emerald-400/10";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border backdrop-blur-md transition-colors ${getStatusColor()}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <h3 className="font-semibold uppercase tracking-wider text-xs">Privacy Firewall (CAMP)</h3>
        </div>
        <div className="text-xs font-mono px-2 py-1 rounded bg-black/20">
          CPE Score: {result.cpeScore.toFixed(2)}
        </div>
      </div>

      <div className="space-y-2">
        {result.pruned ? (
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>High re-identification risk detected. Autonomous pruning applied.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Privacy threshold maintained. All data fragments masked locally.</span>
          </div>
        )}

        {result.fragmentsDetected.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] uppercase opacity-60 mb-1">Detected Fragments:</p>
            <div className="flex flex-wrap gap-2">
              {result.fragmentsDetected.map((f, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/5">
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

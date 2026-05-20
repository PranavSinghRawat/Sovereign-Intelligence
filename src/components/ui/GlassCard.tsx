import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, gradient = false }) => {
  return (
    <div className={cn(
      "bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-200 ease-out",
      gradient && "border-zinc-800/90 shadow-sm",
      className
    )}>
      {children}
    </div>
  );
};

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradient?: boolean;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  gradient = false, 
  hoverEffect = false,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "relative bg-zinc-950/35 border border-zinc-900/60 rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-350 ease-out",
        hoverEffect && "hover:border-zinc-800/50 hover:bg-zinc-900/10 hover:shadow-[0_12px_45px_rgba(0,0,0,0.5)] hover:-translate-y-[2px] cursor-pointer",
        gradient && "bg-gradient-to-b from-zinc-900/20 to-zinc-950/40 border-zinc-850/50 shadow-sm",
        className
      )}
      {...props}
    >
      {/* Top Inner Light Sweep border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-800/30 to-transparent pointer-events-none" />
      
      {/* Subtle corner light highlight reflection */}
      <div className="absolute -top-10 -left-10 w-20 h-20 bg-zinc-500/5 rounded-full blur-xl pointer-events-none" />
      
      {children}
    </div>
  );
};


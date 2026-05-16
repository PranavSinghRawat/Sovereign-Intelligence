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
      "glass rounded-2xl overflow-hidden transition-all duration-300",
      gradient && "gradient-border",
      className
    )}>
      {children}
    </div>
  );
};

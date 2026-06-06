"use client";

import React from "react";
import Link from "next/link";
import { 
  Shield, Cpu, Share2, 
  ArrowRight, ChevronRight,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { useCanvas } from "@/context/CanvasContext";

export default function LandingPage() {
  const { activeShape, setActiveShape } = useCanvas();

  return (
    <div className="min-h-screen relative overflow-x-hidden text-zinc-100 flex flex-col justify-between selection:bg-zinc-800">
      
      {/* Subtle dot-grid background overlay */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(rgba(244,244,245,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0 transform-gpu will-change-transform" 
        style={{ maskImage: "radial-gradient(circle at 70% 30%, black 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(circle at 70% 30%, black 30%, transparent 80%)" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(63,63,70,0.08),transparent_50%)] pointer-events-none z-0 transform-gpu will-change-opacity" />

      <Header />

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center z-10 py-16 lg:py-24">
        
        {/* Left Side Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-900 text-zinc-400 font-mono text-[10px] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
            V1.0 Edge-Native Release
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 max-w-[20ch] leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-400">
            Trustless Aid. Private by Design.
          </h1>

          <p className="text-zinc-400 text-base leading-relaxed max-w-[65ch]">
            The Sentinel Intelligence Layer compiles and runs a grounded 1.2B AI assistant directly in your browser. Utilizing hardware-accelerated WebGPU, no network requests are sent. Search medical clinics and community aid in complete safety.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              href="/chat"
              className="px-6 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus:outline-none"
            >
              Launch Agent 
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/simulator"
              className="px-6 py-3 rounded-xl bg-zinc-900/60 border border-zinc-900 hover:bg-zinc-900/90 text-zinc-200 font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus:outline-none"
            >
              Try Simulator <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 border-t border-zinc-900 pt-6 max-w-lg">
            <div>
              <div className="text-2xl font-semibold text-zinc-100 font-mono tracking-tight flex items-baseline gap-0.5">
                22.2
                <span className="text-[10px] text-zinc-500 font-medium">tok/s</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse" />
                Local Speed
              </div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-zinc-100 font-mono tracking-tight">100%</div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80 shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
                PII Scrubbed
              </div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-zinc-100 font-mono tracking-tight flex items-baseline gap-0.5">
                0.00
                <span className="text-[10px] text-zinc-500 font-medium">USD</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500/80 shadow-[0_0_6px_rgba(139,92,246,0.5)]" />
                Server Cost
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Overview Grid — shape hover cards */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-4">
          <GlassCard 
            onMouseEnter={() => { setActiveShape("cpu"); }}
            onMouseLeave={() => { setActiveShape("globe"); }}
            hoverEffect
            className={`p-6 space-y-4 cursor-pointer transition-all duration-300 ${
              activeShape === "cpu" 
                ? "border-amber-500/30 bg-zinc-950/70 shadow-[0_4px_25px_rgba(251,191,36,0.06)] -translate-y-0.5" 
                : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-zinc-900/80 border text-zinc-300 shadow-inner transition-colors duration-300 ${
                activeShape === "cpu" ? "border-amber-500/40 text-amber-400" : "border-zinc-800"
              }`}>
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className={`font-semibold text-sm tracking-tight transition-colors duration-300 ${
                activeShape === "cpu" ? "text-zinc-50 font-bold" : "text-zinc-100"
              }`}>WebGPU Local Inference</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Downloads and runs model weights directly in browser cache memory, using local unified memory architecture for serverless execution.
            </p>
          </GlassCard>

          <GlassCard 
            onMouseEnter={() => { setActiveShape("shield"); }}
            onMouseLeave={() => { setActiveShape("globe"); }}
            hoverEffect
            className={`p-6 space-y-4 cursor-pointer transition-all duration-300 ${
              activeShape === "shield" 
                ? "border-cyan-500/30 bg-zinc-950/70 shadow-[0_4px_25px_rgba(6,182,212,0.06)] -translate-y-0.5" 
                : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-zinc-900/80 border text-zinc-300 shadow-inner transition-colors duration-300 ${
                activeShape === "shield" ? "border-cyan-500/40 text-cyan-400" : "border-zinc-800"
              }`}>
                <Shield className="w-4 h-4" />
              </div>
              <h3 className={`font-semibold text-sm tracking-tight transition-colors duration-300 ${
                activeShape === "shield" ? "text-zinc-50 font-bold" : "text-zinc-100"
              }`}>CAMP Privacy Firewall</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Cumulative Agentic Masking and Pruning intercepts and anonymizes identity markers in a background worker before they enter the model context window.
            </p>
          </GlassCard>

          <GlassCard 
            onMouseEnter={() => { setActiveShape("p2p"); }}
            onMouseLeave={() => { setActiveShape("globe"); }}
            hoverEffect
            className={`p-6 space-y-4 cursor-pointer transition-all duration-300 ${
              activeShape === "p2p" 
                ? "border-purple-500/30 bg-zinc-950/70 shadow-[0_4px_25px_rgba(139,92,246,0.06)] -translate-y-0.5" 
                : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-zinc-900/80 border text-zinc-300 shadow-inner transition-colors duration-300 ${
                activeShape === "p2p" ? "border-purple-500/40 text-purple-400" : "border-zinc-800"
              }`}>
                <Share2 className="w-4 h-4" />
              </div>
              <h3 className={`font-semibold text-sm tracking-tight transition-colors duration-300 ${
                activeShape === "p2p" ? "text-zinc-50 font-bold" : "text-zinc-100"
              }`}>P2P Capability Network</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Decentralized browser-to-browser WebRTC database queries resolve resources dynamically via manual or automated mesh nodes.
            </p>
          </GlassCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}

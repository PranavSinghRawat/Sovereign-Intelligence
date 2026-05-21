"use client";

import React from "react";
import { Zap, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden text-zinc-100 flex flex-col selection:bg-zinc-800">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(244,244,245,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0 transform-gpu" style={{ maskImage: "radial-gradient(circle at 50% 20%, black 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(circle at 50% 20%, black 30%, transparent 80%)" }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(63,63,70,0.08),transparent_50%)] pointer-events-none z-0 transform-gpu" />

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-16 space-y-8 z-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-800 text-zinc-400 font-mono text-xs uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Evolutionary Roadmap
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 via-zinc-150 to-zinc-400">
            Development Milestones
          </h1>
          <p className="text-zinc-400 text-sm max-w-[65ch] mx-auto leading-relaxed">
            Sovereign Intelligence is architected as a five-phase system to prove that private, localized models can securely scale to match centralized architectures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <GlassCard hoverEffect className="p-6 space-y-4 relative">
            <div className="absolute top-4 right-4 text-xs font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-full uppercase tracking-wider">Active</div>
            <div className="text-zinc-400 font-mono text-xs">VERSION 1.0</div>
            <h3 className="font-bold text-sm text-zinc-200">Sovereign Edge</h3>
            <ul className="text-xs text-zinc-400 space-y-2 pt-2">
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" /> WebGPU Local LLM</li>
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" /> CAMP Firewall</li>
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" /> OPFS SQLite Cache</li>
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" /> Manual P2P WebRTC</li>
            </ul>
          </GlassCard>
          <GlassCard hoverEffect className="p-6 space-y-4 relative">
            <div className="absolute top-4 right-4 text-xs font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-full uppercase tracking-wider">Active</div>
            <div className="text-zinc-400 font-mono text-xs">VERSION 2.0</div>
            <h3 className="font-bold text-sm text-zinc-200">Connected Node</h3>
            <ul className="text-xs text-zinc-400 space-y-2 pt-2">
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" /> Live OpenStreetMap API</li>
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" /> Anonymous Weather Tool</li>
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" /> General WebGPU LLM</li>
              <li className="flex items-start gap-1 text-zinc-500"><span className="shrink-0 mt-0.5 w-3.5 text-center">•</span> ZK-Signaling & WebRTC</li>
            </ul>
          </GlassCard>
          <GlassCard hoverEffect className="p-6 space-y-4">
            <div className="text-zinc-500 font-mono text-xs">VERSION 3.0</div>
            <h3 className="font-bold text-sm text-zinc-300">On-Device RAG</h3>
            <ul className="text-xs text-zinc-400 space-y-2 pt-2"><li>• Transformers.js Embeddings</li><li>• Local Vector Indexes</li><li>• Offline Drag & Drop PDF</li><li>• In-browser Semantic Search</li></ul>
          </GlassCard>
          <GlassCard hoverEffect className="p-6 space-y-4">
            <div className="text-zinc-500 font-mono text-xs">VERSION 4.0</div>
            <h3 className="font-bold text-sm text-zinc-300">Knowledge Mesh</h3>
            <ul className="text-xs text-zinc-400 space-y-2 pt-2"><li>• Federated Search Query</li><li>• P2P Semantic Routing</li><li>• Zero-Knowledge Proofs</li><li>• Sybil-Resilient Reputation</li></ul>
          </GlassCard>
          <GlassCard hoverEffect className="p-6 space-y-4">
            <div className="text-zinc-500 font-mono text-xs">VERSION 5.0</div>
            <h3 className="font-bold text-sm text-zinc-300">Multimodal Privacy</h3>
            <ul className="text-xs text-zinc-400 space-y-2 pt-2"><li>• Local WebGPU VLM</li><li>• On-Device Whisper Voice</li><li>• Face & Voice Redaction</li><li>• Multimodal CAMP Firewall</li></ul>
          </GlassCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}

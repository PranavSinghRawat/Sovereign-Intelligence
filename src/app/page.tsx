"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Cpu, Share2, Database, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = 900);
    let height = (canvas.height = 900);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }> = [];

    // Initialize particles
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Create glowing radial center
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        width / 2
      );
      grad.addColorStop(0, "rgba(59, 130, 246, 0.08)");
      grad.addColorStop(0.5, "rgba(20, 184, 166, 0.03)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Move and draw particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha})`;
        ctx.fill();

        // Draw connections between neighboring nodes
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      // Draw orbiting aesthetic lines
      const time = Date.now() * 0.0003;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 280, time, time + Math.PI * 0.6);
      ctx.strokeStyle = "rgba(20, 184, 166, 0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 340, -time * 1.5, -time * 1.5 + Math.PI * 0.3);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.08)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width * 1.5;
      height = canvas.height = rect.height * 1.5;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-radial-gradient text-foreground flex flex-col justify-between selection:bg-primary/20">
      
      {/* Dynamic Visualizer Element requested by user */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-40 pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} width="900" height="900" />
      </div>

      {/* Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent-teal flex items-center justify-center shadow-lg shadow-primary/25">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-wider font-mono text-lg glow-text">SOVEREIGN</span>
        </div>
        <Link 
          href="/chat"
          className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-mono text-sm flex items-center gap-2"
        >
          Workspace <ChevronRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 py-12 lg:py-24">
        
        {/* Left Side Content */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            V1.0 Edge-Native Release
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] glow-text">
            Trustless Aid.<br />
            Private by Design.
          </h1>

          <p className="text-foreground/75 text-lg max-w-xl leading-relaxed">
            The Sovereign Intelligence Layer runs a high-performance 1.2B AI assistant entirely in your browser using WebGPU. No cloud, no central tracking. Seek medical and financial resource aid with complete anonymity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              href="/chat"
              className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-semibold flex items-center justify-center gap-3 shadow-lg shadow-primary/30 transition-all group"
            >
              Launch Sovereign Agent 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#roadmap"
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-center font-semibold transition-all"
            >
              View Research Roadmap
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 border-t border-white/5 pt-8 max-w-lg">
            <div>
              <div className="text-2xl font-bold text-primary font-mono">22.2 tok/s</div>
              <div className="text-xs text-foreground/50">Local Speed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-teal font-mono">100%</div>
              <div className="text-xs text-foreground/50">PII Scrubbed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-emerald font-mono">0.00$</div>
              <div className="text-xs text-foreground/50">Server Costs</div>
            </div>
          </div>
        </div>

        {/* Right Side Overview Grid */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-4">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base">WebGPU Local Inference</h3>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Downloads and runs model weights directly in browser cache memory, using local unified memory architecture for serverless execution.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-teal/10 border border-accent-teal/20 text-accent-teal">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base">CAMP Privacy Firewall</h3>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Cumulative Agentic Masking and Pruning intercepts and anonymizes identity markers in a background worker before they enter the model context window.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-amber/10 border border-accent-amber/20 text-accent-amber">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base">P2P Capability Network</h3>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Decentralized browser-to-browser WebRTC database queries resolve resources dynamically via manual or automated mesh nodes.
            </p>
          </GlassCard>
        </div>
      </main>

      {/* Research Paper Roadmap Section */}
      <section id="roadmap" className="w-full max-w-7xl mx-auto px-6 py-24 z-10 border-t border-white/5 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight glow-text">Research & Evolution Roadmap</h2>
          <p className="text-foreground/60 text-sm sm:text-base leading-relaxed">
            The Sovereign Intelligence Layer is designed as a multi-stage cognitive framework to prove the scalability of privacy-centric distributed edge systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Phase 1 */}
          <GlassCard className="p-6 space-y-4 relative border-primary/20">
            <div className="absolute top-4 right-4 text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
              Active
            </div>
            <div className="text-primary font-mono text-xs">VERSION 1.0</div>
            <h3 className="font-bold text-sm">Sovereign Edge</h3>
            <ul className="text-xs text-foreground/60 space-y-2 pt-2">
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> WebGPU Local LLM</li>
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> CAMP Firewall</li>
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> OPFS SQLite Cache</li>
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> Manual P2P WebRTC</li>
            </ul>
          </GlassCard>

          {/* Phase 2 */}
          <GlassCard className="p-6 space-y-4">
            <div className="text-foreground/40 font-mono text-xs">VERSION 2.0</div>
            <h3 className="font-bold text-sm text-foreground/80">Connected Node</h3>
            <ul className="text-xs text-foreground/50 space-y-2 pt-2">
              <li className="flex items-start gap-1.5">• ZK-Signaling Relays</li>
              <li className="flex items-start gap-1.5">• Automated WebRTC</li>
              <li className="flex items-start gap-1.5">• Dynamic agent:// protocol</li>
              <li className="flex items-start gap-1.5">• Live OpenStreetMap API</li>
            </ul>
          </GlassCard>

          {/* Phase 3 */}
          <GlassCard className="p-6 space-y-4">
            <div className="text-foreground/40 font-mono text-xs">VERSION 3.0</div>
            <h3 className="font-bold text-sm text-foreground/80">On-Device RAG</h3>
            <ul className="text-xs text-foreground/50 space-y-2 pt-2">
              <li className="flex items-start gap-1.5">• Transformers.js Embeddings</li>
              <li className="flex items-start gap-1.5">• Local Vector Indexes</li>
              <li className="flex items-start gap-1.5">• Offline Drag & Drop PDF</li>
              <li className="flex items-start gap-1.5">• In-browser Semantic Retrieval</li>
            </ul>
          </GlassCard>

          {/* Phase 4 */}
          <GlassCard className="p-6 space-y-4">
            <div className="text-foreground/40 font-mono text-xs">VERSION 4.0</div>
            <h3 className="font-bold text-sm text-foreground/80">Knowledge Mesh</h3>
            <ul className="text-xs text-foreground/50 space-y-2 pt-2">
              <li className="flex items-start gap-1.5">• Federated Search Query</li>
              <li className="flex items-start gap-1.5">• P2P Semantic Routing</li>
              <li className="flex items-start gap-1.5">• Zero-Knowledge Proofs</li>
              <li className="flex items-start gap-1.5">• Sybil-Resilient Reputation</li>
            </ul>
          </GlassCard>

          {/* Phase 5 */}
          <GlassCard className="p-6 space-y-4">
            <div className="text-foreground/40 font-mono text-xs">VERSION 5.0</div>
            <h3 className="font-bold text-sm text-foreground/80">Multimodal Privacy</h3>
            <ul className="text-xs text-foreground/50 space-y-2 pt-2">
              <li className="flex items-start gap-1.5">• Local WebGPU VLM</li>
              <li className="flex items-start gap-1.5">• On-Device Whisper Voice</li>
              <li className="flex items-start gap-1.5">• Face & Voice Redaction</li>
              <li className="flex items-start gap-1.5">• Multimodal CAMP Firewall</li>
            </ul>
          </GlassCard>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center z-10 text-xs text-foreground/45 gap-4">
        <div>© 2026 Sovereign Intelligence Layer. Local-first Open Source.</div>
        <div className="flex gap-6">
          <Link href="/chat" className="hover:text-foreground/75 transition-colors">Workspace</Link>
          <a href="https://github.com/PranavSinghRawat/Sovereign-Intelligence" target="_blank" rel="noreferrer" className="hover:text-foreground/75 transition-colors">GitHub</a>
        </div>
      </footer>

    </div>
  );
}

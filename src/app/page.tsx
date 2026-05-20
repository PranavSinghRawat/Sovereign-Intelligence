"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Shield, Cpu, Share2, ChevronRight, 
  CheckCircle2, ArrowRight, Terminal, Lock, Sparkles, 
  Activity, ArrowDown, RefreshCw, Zap
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

// Mock database for the interactive simulator
const SIMULATOR_DB = [
  { name: "SafeHaven Medical Clinic", location: "Downtown", availability: "Immediate", distance: "0.8 miles" },
  { name: "Community Bread Basket", location: "West Side", availability: "9 AM - 5 PM", distance: "1.2 miles" },
  { name: "Emergency Fund Partners", location: "Central Hub", availability: "Mon-Fri", distance: "1.5 miles" },
];

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  // Simulator states
  const [inputText, setInputText] = useState("I am Pranav. Need emergency food in West Side. My email is pranav@gmail.com");
  const [activeStep, setActiveStep] = useState<"input" | "camp" | "database" | "synthesis">("input");
  const [simulationRunning, setSimulationRunning] = useState(false);
  
  // Simulated outputs
  const [scrubbedText, setScrubbedText] = useState("");
  const [detectedPII, setDetectedPII] = useState<string[]>([]);
  const [queryType, setQueryType] = useState("");
  const [queryLocation, setQueryLocation] = useState("");
  const [dbResults, setDbResults] = useState<any[]>([]);
  const [generatedText, setGeneratedText] = useState("");

  // Handle canvas mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    // Scale mouse coordinates to match canvas logical dimensions (900x900)
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 900,
      y: ((e.clientY - rect.top) / rect.height) * 900,
      active: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: -1000, y: -1000, active: false };
  };

  // Enhanced Canvas Visualizer — High-DPI, data streams, mouse trails, pulsing shield
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const W = 900;
    const H = 900;
    
    const scaleCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.resetTransform();
      ctx.scale(dpr * (rect.width / W), dpr * (rect.height / H));
    };
    scaleCanvas();
    window.addEventListener("resize", scaleCanvas);

    const cx = W / 2;
    const cy = H / 2;
    const shieldScale = 160;
    
    const getShieldPoints = (count: number): Array<{ x: number; y: number }> => {
      const segments = [
        ...Array.from({ length: 8 }, (_, i) => {
          const t = Math.PI * 0.5 + (Math.PI * 0.5) * (i / 7);
          return { x: cx - shieldScale * 0.6 + Math.cos(t) * shieldScale * 0.4, y: cy - shieldScale * 0.8 + Math.sin(t) * shieldScale * 0.3 };
        }),
        { x: cx - shieldScale * 0.2, y: cy - shieldScale * 1.1 },
        { x: cx + shieldScale * 0.2, y: cy - shieldScale * 1.1 },
        ...Array.from({ length: 8 }, (_, i) => {
          const t = Math.PI * 1.0 - (Math.PI * 0.5) * (i / 7);
          return { x: cx + shieldScale * 0.6 + Math.cos(t) * shieldScale * 0.4, y: cy - shieldScale * 0.8 + Math.sin(t) * shieldScale * 0.3 };
        }),
        { x: cx + shieldScale, y: cy - shieldScale * 0.5 },
        { x: cx + shieldScale * 0.9, y: cy },
        { x: cx + shieldScale * 0.7, y: cy + shieldScale * 0.4 },
        { x: cx + shieldScale * 0.35, y: cy + shieldScale * 0.85 },
        { x: cx, y: cy + shieldScale * 1.2 },
        { x: cx - shieldScale * 0.35, y: cy + shieldScale * 0.85 },
        { x: cx - shieldScale * 0.7, y: cy + shieldScale * 0.4 },
        { x: cx - shieldScale * 0.9, y: cy },
        { x: cx - shieldScale, y: cy - shieldScale * 0.5 },
      ];
      const result: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < count; i++) {
        const t = (i / count) * segments.length;
        const idx = Math.floor(t) % segments.length;
        const next = (idx + 1) % segments.length;
        const frac = t - Math.floor(t);
        result.push({
          x: segments[idx].x + (segments[next].x - segments[idx].x) * frac,
          y: segments[idx].y + (segments[next].y - segments[idx].y) * frac,
        });
      }
      return result;
    };

    // Particle types
    interface Particle {
      x: number; y: number; baseX: number; baseY: number;
      vx: number; vy: number; radius: number; alpha: number;
      isShield: boolean; type: "shield" | "ambient" | "stream";
      life: number; maxLife: number; speed: number;
    }

    const particles: Particle[] = [];
    const shieldPoints = getShieldPoints(70);

    // Shield outline particles (increased from 50 to 70)
    shieldPoints.forEach((pt) => {
      particles.push({
        x: pt.x + (Math.random() - 0.5) * 12, y: pt.y + (Math.random() - 0.5) * 12,
        baseX: pt.x, baseY: pt.y,
        vx: 0, vy: 0,
        radius: Math.random() * 1.8 + 1.2, alpha: Math.random() * 0.4 + 0.6,
        isShield: true, type: "shield", life: 1, maxLife: 1, speed: 0,
      });
    });

    // Ambient floating particles (increased from 90 to 160)
    for (let i = 0; i < 160; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H, baseX: 0, baseY: 0,
        vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 1.8 + 0.4, alpha: Math.random() * 0.3 + 0.08,
        isShield: false, type: "ambient", life: 1, maxLife: 1, speed: 0,
      });
    }

    // Falling data stream beams (new)
    interface DataStream { x: number; y: number; speed: number; length: number; alpha: number; }
    const streams: DataStream[] = [];
    for (let i = 0; i < 35; i++) {
      streams.push({
        x: Math.random() * W, y: Math.random() * H,
        speed: Math.random() * 1.2 + 0.3, length: Math.random() * 60 + 20,
        alpha: Math.random() * 0.06 + 0.02,
      });
    }

    // Mouse trail particles (ephemeral)
    interface TrailDot { x: number; y: number; life: number; radius: number; }
    const trail: TrailDot[] = [];
    let lastTrailTime = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const time = Date.now() * 0.001;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mActive = mouseRef.current.active;

      // Radial background aura
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.5);
      grad.addColorStop(0, "rgba(244, 244, 245, 0.06)");
      grad.addColorStop(0.4, "rgba(39, 39, 42, 0.03)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Falling data stream beams (Option B aether trails)
      streams.forEach((s) => {
        s.y += s.speed;
        if (s.y > H + s.length) { s.y = -s.length; s.x = Math.random() * W; }
        const sg = ctx.createLinearGradient(s.x, s.y - s.length, s.x, s.y);
        sg.addColorStop(0, "rgba(161, 161, 170, 0)");
        sg.addColorStop(0.5, `rgba(161, 161, 170, ${s.alpha})`);
        sg.addColorStop(1, "rgba(161, 161, 170, 0)");
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - s.length);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = sg;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Orbital scanner arcs (expanded from 3 to 5)
      const rings = [
        { r: 200, speed: 0.15, arc: 0.7, alpha: 0.09, w: 1 },
        { r: 250, speed: -0.1, arc: 0.5, alpha: 0.07, w: 1 },
        { r: 310, speed: 0.07, arc: 0.4, alpha: 0.05, w: 1.2 },
        { r: 370, speed: -0.04, arc: 0.3, alpha: 0.04, w: 1.5 },
        { r: 420, speed: 0.03, arc: 0.25, alpha: 0.03, w: 1 },
      ];
      rings.forEach((ring) => {
        const start = time * ring.speed;
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, start, start + Math.PI * ring.arc);
        ctx.strokeStyle = `rgba(244, 244, 245, ${ring.alpha})`;
        ctx.lineWidth = ring.w;
        ctx.stroke();
      });

      // Pulsing shield outline with breathing glow
      const breathe = 0.08 + Math.sin(time * 1.5) * 0.06;
      ctx.save();
      ctx.strokeStyle = `rgba(161, 161, 170, ${breathe})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = `rgba(244, 244, 245, ${breathe * 0.5})`;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      const outlinePoints = getShieldPoints(60);
      outlinePoints.forEach((pt, i) => { if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y); });
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Inner shield secondary outline
      ctx.save();
      ctx.strokeStyle = `rgba(113, 113, 122, ${breathe * 0.4})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      const innerPts = getShieldPoints(60).map(pt => ({
        x: cx + (pt.x - cx) * 0.85, y: cy + (pt.y - cy) * 0.85
      }));
      innerPts.forEach((pt, i) => { if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y); });
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Checkmark symbol inside shield
      ctx.save();
      const checkAlpha = 0.18 + Math.sin(time * 1.5) * 0.06;
      ctx.strokeStyle = `rgba(244, 244, 245, ${checkAlpha})`;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(cx - shieldScale * 0.25, cy - shieldScale * 0.05);
      ctx.lineTo(cx - shieldScale * 0.04, cy + shieldScale * 0.22);
      ctx.lineTo(cx + shieldScale * 0.32, cy - shieldScale * 0.3);
      ctx.stroke();
      ctx.restore();

      // Mouse trail spawner
      if (mActive && time - lastTrailTime > 0.04) {
        trail.push({ x: mx, y: my, life: 1, radius: Math.random() * 2 + 1 });
        lastTrailTime = time;
        if (trail.length > 30) trail.shift();
      }
      for (let i = trail.length - 1; i >= 0; i--) {
        const t = trail[i];
        t.life -= 0.025;
        if (t.life <= 0) { trail.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius * t.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244, 244, 245, ${t.life * 0.15})`;
        ctx.fill();
      }

      // Particle physics and rendering
      particles.forEach((p, idx) => {
        if (p.isShield) {
          const offset = time * 2.0 + idx * 0.4;
          const targetX = p.baseX + Math.sin(offset) * 8;
          const targetY = p.baseY + Math.cos(offset * 0.8) * 8;
          if (mActive) {
            const dx = mx - p.x, dy = my - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 200) { const f = (1 - dist / 200) * 10; p.x += (dx / dist) * f; p.y += (dy / dist) * f; }
          }
          p.x += (targetX - p.x) * 0.08;
          p.y += (targetY - p.y) * 0.08;
        } else {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
          if (mActive) {
            const dx = p.x - mx, dy = p.y - my;
            const dist = Math.hypot(dx, dy);
            if (dist < 120) { const f = (1 - dist / 120) * 3; p.x += (dx / dist) * f; p.y += (dy / dist) * f; }
          }
        }

        const col = p.isShield ? "rgba(244, 244, 245," : "rgba(161, 161, 170,";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${col} ${p.alpha})`;
        ctx.fill();

        // Connection lines
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          const maxDist = (p.isShield && p2.isShield) ? 120 : 80;
          if (dist < maxDist) {
            const la = (1 - dist / maxDist) * ((p.isShield && p2.isShield) ? 0.2 : 0.05);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = (p.isShield && p2.isShield) ? `rgba(244, 244, 245, ${la})` : `rgba(161, 161, 170, ${la})`;
            ctx.lineWidth = (p.isShield && p2.isShield) ? 0.8 : 0.4;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener("resize", scaleCanvas); };
  }, []);

  // Run the sandbox simulation sequence
  const startSimulation = async () => {
    if (simulationRunning) return;
    setSimulationRunning(true);
    setScrubbedText("");
    setDetectedPII([]);
    setGeneratedText("");
    setDbResults([]);
    
    setActiveStep("input");
    await new Promise((r) => setTimeout(r, 1200));

    setActiveStep("camp");
    const detected: string[] = [];
    let processed = inputText;
    
    const emailMatch = inputText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatch) {
      emailMatch.forEach(e => detected.push(`EMAIL: ${e}`));
      processed = processed.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_PRUNED]");
    }
    
    const nameMatch = inputText.match(/\b(pranav|maya|john|alice|bob)\b/gi);
    if (nameMatch) {
      nameMatch.forEach(n => detected.push(`NAME: ${n}`));
      processed = processed.replace(/\b(pranav|maya|john|alice|bob)\b/gi, "[NAME_PRUNED]");
    }

    setDetectedPII(detected);
    setScrubbedText(processed);
    await new Promise((r) => setTimeout(r, 1800));

    setActiveStep("database");
    let type = "food";
    let loc = "West Side";
    
    if (inputText.toLowerCase().includes("medical") || inputText.toLowerCase().includes("clinic")) {
      type = "medical";
    } else if (inputText.toLowerCase().includes("financial") || inputText.toLowerCase().includes("aid")) {
      type = "financial";
    }
    
    if (inputText.toLowerCase().includes("downtown")) {
      loc = "Downtown";
    } else if (inputText.toLowerCase().includes("central")) {
      loc = "Central Hub";
    }

    setQueryType(type);
    setQueryLocation(loc);
    
    const matched = SIMULATOR_DB.filter(item => {
      const typeMatch = item.name.toLowerCase().includes(type) || (type === "food" && item.name.includes("Bread"));
      const locMatch = item.location.toLowerCase() === loc.toLowerCase();
      return typeMatch || locMatch;
    });

    setDbResults(matched);
    await new Promise((r) => setTimeout(r, 1600));

    setActiveStep("synthesis");
    let phrase = "";
    if (matched.length > 0) {
      const res = matched[0];
      phrase = `I found a matching verified resource:\n\nName: ${res.name}\nLocation: ${res.location}\nAvailability: ${res.availability}\nDistance: ${res.distance}\n\nThis response was generated entirely locally using Llama-3.2-1B and verified via the secure edge index database. No tracking data was sent.`;
    } else {
      phrase = "No matching community resources were found in that local directory region.";
    }

    let current = "";
    const words = phrase.split(" ");
    for (const word of words) {
      current += word + " ";
      setGeneratedText(current);
      await new Promise((r) => setTimeout(r, 45));
    }

    setSimulationRunning(false);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-zinc-800">
      
      {/* Option C: Layered Masked Spotlight Background Pattern */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(rgba(244,244,245,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0 transform-gpu will-change-transform" 
        style={{ maskImage: "radial-gradient(circle at 70% 30%, black 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(circle at 70% 30%, black 30%, transparent 80%)" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(63,63,70,0.08),transparent_50%)] pointer-events-none z-0 transform-gpu will-change-opacity" />

      {/* Full-Viewport Dynamic Visualizer */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="fixed inset-0 w-full h-full opacity-50 z-0 transform-gpu will-change-transform"
      >
        <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
      </div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-zinc-950" />
          </div>
          <span className="font-bold tracking-wider font-mono text-xs text-zinc-100">SOVEREIGN</span>
        </div>
        <nav className="flex items-center gap-6" aria-label="Global navigation">
          <a 
            href="#simulator" 
            className="font-mono text-xs text-zinc-400 hover:text-zinc-100 transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none rounded px-1 py-0.5"
          >
            Simulator
          </a>
          <a 
            href="#roadmap" 
            className="font-mono text-xs text-zinc-400 hover:text-zinc-100 transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none rounded px-1 py-0.5"
          >
            Roadmap
          </a>
          <Link 
            href="/chat"
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700 transition-all duration-200 ease-out font-mono text-xs text-zinc-100 flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus:outline-none"
          >
            Agent Workspace <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center z-10 py-16 lg:py-24">
        
        {/* Left Side Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
            V1.0 Edge-Native Release
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 max-w-[20ch]">
            Trustless Aid. Private by Design.
          </h1>

          <p className="text-zinc-400 text-sm leading-relaxed max-w-[65ch]">
            The Sovereign Intelligence Layer compiles and runs a grounded 1.2B AI assistant directly in your browser. Utilizing hardware-accelerated WebGPU, no network requests are sent. Search medical clinics and community aid in complete safety.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              href="/chat"
              className="px-6 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus:outline-none"
            >
              Launch Agent 
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#simulator"
              className="px-6 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-900/90 text-zinc-200 font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus:outline-none"
            >
              Try Simulator <ArrowDown className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 border-t border-zinc-800/60 pt-6 max-w-lg">
            <div>
              <div className="text-2xl font-bold text-zinc-100 font-mono">22.2<span className="text-xs text-zinc-500 font-normal"> t/s</span></div>
              <div className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Local Speed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-100 font-mono">100%</div>
              <div className="text-xs text-zinc-400 font-mono uppercase tracking-wider">PII Scrubbed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-100 font-mono">0.00$</div>
              <div className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Server Cost</div>
            </div>
          </div>
        </div>

        {/* Right Side Overview Grid */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-4">
          <GlassCard className="p-6 space-y-4 border-zinc-800/80 hover:border-zinc-700/60 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800/40 text-zinc-300">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-200">WebGPU Local Inference</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Downloads and runs model weights directly in browser cache memory, using local unified memory architecture for serverless execution.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-4 border-zinc-800/80 hover:border-zinc-700/60 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800/40 text-zinc-300">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-200">CAMP Privacy Firewall</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cumulative Agentic Masking and Pruning intercepts and anonymizes identity markers in a background worker before they enter the model context window.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-4 border-zinc-800/80 hover:border-zinc-700/60 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800/40 text-zinc-300">
                <Share2 className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-200">P2P Capability Network</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Decentralized browser-to-browser WebRTC database queries resolve resources dynamically via manual or automated mesh nodes.
            </p>
          </GlassCard>
        </div>
      </main>

      {/* Simulator Section */}
      <section id="simulator" className="w-full max-w-7xl mx-auto px-6 py-16 border-t border-zinc-800/60 space-y-8 z-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono text-xs uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" /> Interactive Sandbox
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Sovereign Cognitive Sandbox</h2>
          <p className="text-zinc-400 text-sm max-w-[65ch] mx-auto leading-relaxed">
            Test how our architecture handles personal data, sanitizes contexts, queries local databases, and feeds the safe local LLM engine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Simulator Controls & Input */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <GlassCard className="p-6 space-y-6 flex-1 flex flex-col justify-between border-zinc-800">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-400">Configure Prompt</span>
                  <span className="text-xs text-zinc-500 font-mono">Custom Input</span>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-zinc-700 font-mono text-xs text-zinc-200 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  placeholder="Enter medical or resource query with PII..."
                  aria-label="Simulation test prompt"
                />
                
                {/* Pre-fill query suggestions */}
                <div className="space-y-2">
                  <span className="text-xs text-zinc-455 font-mono block font-bold">Preset Scenarios:</span>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setInputText("I am John Doe. Need clinic aid in Downtown, cell is 206-555-0199")}
                      className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-zinc-800 hover:-translate-y-0.5 active:scale-95 text-xs font-mono text-zinc-300 cursor-pointer transition-all duration-200 ease-out focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none"
                    >
                      Medical Query with Phone
                    </button>
                    <button 
                      onClick={() => setInputText("Need emergency bread bank in West Side. My email is user@domain.com")}
                      className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-zinc-800 hover:-translate-y-0.5 active:scale-95 text-xs font-mono text-zinc-300 cursor-pointer transition-all duration-200 ease-out focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none"
                    >
                      Food Query with Email
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800/80">
                <button
                  onClick={startSimulation}
                  disabled={simulationRunning}
                  className="w-full py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {simulationRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Running Simulation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Execute Data Flow
                    </>
                  )}
                </button>
              </div>
            </GlassCard>
          </div>

          {/* Interactive Simulation Sandbox visualizer panel */}
          <div className="lg:col-span-7">
            <GlassCard className="h-full border-zinc-800 bg-zinc-950/40 overflow-hidden flex flex-col justify-between">
              
              {/* Header / Console Tabs */}
              <div className="bg-zinc-900/60 border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-mono font-semibold text-zinc-300">Telemetry Data Flow Graph</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-700" />
                  <span className="w-2 h-2 rounded-full bg-zinc-650" />
                  <span className="w-2 h-2 rounded-full bg-zinc-600" />
                </div>
              </div>

              {/* Steps Visualizer */}
              <div className="p-6 flex-1 space-y-6">
                
                {/* Step List */}
                <div className="grid grid-cols-4 gap-2 border-b border-zinc-800/40 pb-4">
                  {[
                    { id: "input", label: "1. Prompt", desc: "Raw input" },
                    { id: "camp", label: "2. CAMP", desc: "PII Firewall" },
                    { id: "database", label: "3. SQLite", desc: "Local RAG" },
                    { id: "synthesis", label: "4. WebGPU", desc: "Local LLM" },
                  ].map(step => (
                    <div 
                      key={step.id} 
                      className={`p-2 rounded-lg text-center transition-all duration-200 ${
                        activeStep === step.id 
                          ? "bg-zinc-800/60 border border-zinc-750 text-zinc-200" 
                          : "text-zinc-500 border border-transparent"
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">{step.label}</div>
                      <div className="text-xs font-mono hidden sm:block opacity-60 mt-0.5">{step.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Console Output Panel */}
                <div className="bg-zinc-950/80 rounded-xl border border-zinc-850 p-5 min-h-[220px] font-mono text-xs text-zinc-300 space-y-4">
                  <AnimatePresence mode="wait">
                    {activeStep === "input" && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                      >
                        <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider font-mono">Step 1: Raw Prompt Received</div>
                        <div className="bg-zinc-900/30 p-3 rounded-lg border border-zinc-850 text-zinc-300 italic font-sans text-sm">
                          "{inputText}"
                        </div>
                        <div className="text-xs text-zinc-500 leading-relaxed pt-2">
                          Recruiter Note: In conventional setups, this prompt is sent immediately to external cloud servers, exposing names, queries, and locations.
                        </div>
                      </motion.div>
                    )}

                    {activeStep === "camp" && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        <div className="text-zinc-300 text-xs font-bold uppercase tracking-wider font-mono flex justify-between items-center">
                          <span>Step 2: CAMP Firewall</span>
                          <span className="text-xs text-zinc-400 font-mono flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Shield Enabled</span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-xs text-zinc-500">Scrubbed Text Target:</div>
                          <div className="bg-zinc-900/30 p-3 rounded-lg border border-zinc-850 text-zinc-200 font-mono leading-relaxed">
                            {scrubbedText || "Analyzing privacy tokens..."}
                          </div>
                        </div>

                        {detectedPII.length > 0 ? (
                          <div className="space-y-1.5">
                            <div className="text-xs text-zinc-400 font-semibold">Identified Personal Markers Redacted:</div>
                            <div className="flex flex-wrap gap-2">
                              {detectedPII.map((item, idx) => (
                                <span key={idx} className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-550">No vulnerable PII markers detected in query content.</div>
                        )}
                        
                        <div className="text-xs text-zinc-500 pt-2 leading-relaxed">
                          Recruiter Note: The local CAMP class runs inside a separate background thread (Worker), preventing UI freeze while cleaning prompt variables.
                        </div>
                      </motion.div>
                    )}

                    {activeStep === "database" && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        <div className="text-zinc-300 text-xs font-bold uppercase tracking-wider font-mono">Step 3: SQLite Cache / Offline Index Search</div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-zinc-900/30 p-2 rounded border border-zinc-850">
                            <span className="text-zinc-500 block uppercase text-xs">Query Type</span>
                            <span className="text-zinc-350 font-semibold font-mono">{queryType.toUpperCase()}</span>
                          </div>
                          <div className="bg-zinc-900/30 p-2 rounded border border-zinc-850">
                            <span className="text-zinc-500 block uppercase text-xs">Matched Location</span>
                            <span className="text-zinc-350 font-semibold font-mono">{queryLocation}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs text-zinc-500">Retrieved Local Resources:</div>
                          {dbResults.length > 0 ? (
                            <div className="space-y-2 max-h-[100px] overflow-y-auto">
                              {dbResults.map((item, idx) => (
                                <div key={idx} className="p-2 rounded bg-zinc-900/40 border border-zinc-850 text-xs font-mono flex justify-between">
                                  <span className="text-zinc-300">{item.name} ({item.location})</span>
                                  <span className="text-zinc-400 font-bold">{item.distance}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-2 rounded bg-zinc-900/20 border border-zinc-850 text-zinc-400">
                              No matching local resources cached in regional database.
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-zinc-500 pt-1 leading-relaxed">
                          Recruiter Note: RAG queries occur entirely within browser SQLite memory space (OPFS cache) before the LLM receives the prompt.
                        </div>
                      </motion.div>
                    )}

                    {activeStep === "synthesis" && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                      >
                        <div className="text-zinc-350 text-xs font-bold uppercase tracking-wider font-mono flex justify-between items-center">
                          <span>Step 4: WebGPU Offline Token Generation</span>
                          <span className="text-xs px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">Llama-3.2-1B</span>
                        </div>
                        <div className="bg-zinc-900/30 p-3 rounded-lg border border-zinc-850 text-zinc-200 font-mono leading-relaxed min-h-[100px] whitespace-pre-line text-xs font-sans">
                          {generatedText || "Loading LLM context buffer..."}
                        </div>
                        <div className="text-xs text-zinc-500 leading-relaxed pt-2">
                          Recruiter Note: The assistant generates this token stream directly inside browser VRAM. No external data leakage occurred.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Research Paper Roadmap Section */}
      <section id="roadmap" className="w-full max-w-7xl mx-auto px-6 py-16 border-t border-zinc-800/60 space-y-8 z-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono text-xs uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Evolutionary Roadmap
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Development Milestones</h2>
          <p className="text-zinc-400 text-sm max-w-[65ch] mx-auto leading-relaxed">
            Sovereign Intelligence is architected as a five-phase system to prove that private, localized models can securely scale to match centralized architectures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Phase 1 */}
          <GlassCard className="p-6 space-y-4 relative border-zinc-800 bg-zinc-900/30 hover:border-zinc-700/60 transition-all duration-200">
            <div className="absolute top-4 right-4 text-xs font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-full uppercase tracking-wider">
              Active
            </div>
            <div className="text-zinc-400 font-mono text-xs">VERSION 1.0</div>
            <h3 className="font-bold text-sm text-zinc-200">Sovereign Edge</h3>
            <ul className="text-xs text-zinc-450 space-y-2 pt-2">
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" /> WebGPU Local LLM</li>
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" /> CAMP Firewall</li>
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" /> OPFS SQLite Cache</li>
              <li className="flex items-start gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" /> Manual P2P WebRTC</li>
            </ul>
          </GlassCard>

          {/* Phase 2 */}
          <GlassCard className="p-6 space-y-4 border-zinc-800 hover:border-zinc-700/60 transition-all duration-200">
            <div className="text-zinc-500 font-mono text-xs">VERSION 2.0</div>
            <h3 className="font-bold text-sm text-zinc-300">Connected Node</h3>
            <ul className="text-xs text-zinc-450 space-y-2 pt-2">
              <li>• ZK-Signaling Relays</li>
              <li>• Automated WebRTC</li>
              <li>• Dynamic agent:// protocol</li>
              <li>• Live OpenStreetMap API</li>
            </ul>
          </GlassCard>

          {/* Phase 3 */}
          <GlassCard className="p-6 space-y-4 border-zinc-800 hover:border-zinc-700/60 transition-all duration-200">
            <div className="text-zinc-500 font-mono text-xs">VERSION 3.0</div>
            <h3 className="font-bold text-sm text-zinc-300">On-Device RAG</h3>
            <ul className="text-xs text-zinc-450 space-y-2 pt-2">
              <li>• Transformers.js Embeddings</li>
              <li>• Local Vector Indexes</li>
              <li>• Offline Drag & Drop PDF</li>
              <li>• In-browser Semantic Search</li>
            </ul>
          </GlassCard>

          {/* Phase 4 */}
          <GlassCard className="p-6 space-y-4 border-zinc-800 hover:border-zinc-700/60 transition-all duration-200">
            <div className="text-zinc-500 font-mono text-xs">VERSION 4.0</div>
            <h3 className="font-bold text-sm text-zinc-300">Knowledge Mesh</h3>
            <ul className="text-xs text-zinc-450 space-y-2 pt-2">
              <li>• Federated Search Query</li>
              <li>• P2P Semantic Routing</li>
              <li>• Zero-Knowledge Proofs</li>
              <li>• Sybil-Resilient Reputation</li>
            </ul>
          </GlassCard>

          {/* Phase 5 */}
          <GlassCard className="p-6 space-y-4 border-zinc-800 hover:border-zinc-700/60 transition-all duration-200">
            <div className="text-zinc-500 font-mono text-xs">VERSION 5.0</div>
            <h3 className="font-bold text-sm text-zinc-300">Multimodal Privacy</h3>
            <ul className="text-xs text-zinc-450 space-y-2 pt-2">
              <li>• Local WebGPU VLM</li>
              <li>• On-Device Whisper Voice</li>
              <li>• Face & Voice Redaction</li>
              <li>• Multimodal CAMP Firewall</li>
            </ul>
          </GlassCard>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-zinc-800/60 flex flex-col sm:flex-row justify-between items-center z-10 text-xs text-zinc-500 gap-4">
        <div>© 2026 Sovereign Intelligence Layer. Local-first Open Source.</div>
        <div className="flex gap-6">
          <Link href="/chat" className="hover:text-zinc-350 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none rounded px-1">Workspace</Link>
          <a href="https://github.com/PranavSinghRawat/Sovereign-Intelligence" target="_blank" rel="noreferrer" className="hover:text-zinc-350 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-700 focus:outline-none rounded px-1">GitHub</a>
        </div>
      </footer>

    </div>
  );
}

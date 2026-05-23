"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, RefreshCw, Sparkles, Terminal, Lock, Share2, Shield,
  Database, Cpu, CheckCircle2, Check, Copy, Zap, Key, ArrowRight,
  BookOpen, Layers, Server
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";

interface DBResource {
  name: string;
  location: string;
  availability: string;
  distance: string;
}

const SIMULATOR_DB: DBResource[] = [
  { name: "SafeHaven Medical Clinic", location: "Downtown", availability: "Immediate", distance: "0.8 miles" },
  { name: "Community Bread Basket", location: "West Side", availability: "9 AM - 5 PM", distance: "1.2 miles" },
  { name: "Emergency Fund Partners", location: "Central Hub", availability: "Mon-Fri", distance: "1.5 miles" },
];

export default function SimulatorPage() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"single" | "p2p" | "blueprints">("single");

  // Code Copy State
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Copy helper
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // --- State for Single-Agent Sandbox ---
  const [inputText, setInputText] = useState("I am Pranav. Need emergency food in West Side. My email is pranav@gmail.com");
  const [activeStep, setActiveStep] = useState<"input" | "camp" | "database" | "synthesis">("input");
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [scrubbedText, setScrubbedText] = useState("");
  const [detectedPII, setDetectedPII] = useState<string[]>([]);
  const [queryType, setQueryType] = useState("");
  const [queryLocation, setQueryLocation] = useState("");
  const [dbResults, setDbResults] = useState<DBResource[]>([]);
  const [generatedText, setGeneratedText] = useState("");
  const [speedVal, setSpeedVal] = useState(0);

  // --- State for P2P Simulator ---
  const [p2pRunning, setP2pRunning] = useState(false);
  const [p2pStep, setP2pStep] = useState<"idle" | "generating_keys" | "signaling" | "verifying" | "connected" | "transferring" | "complete">("idle");
  const [p2pLogs, setP2pLogs] = useState<string[]>([]);
  const [p2pDB, setP2pDB] = useState<DBResource[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [p2pLogs]);

  // Execute Single Agent Simulation
  const startSimulation = async () => {
    if (simulationRunning) return;
    setSimulationRunning(true);
    setScrubbedText("");
    setDetectedPII([]);
    setGeneratedText("");
    setDbResults([]);
    setSpeedVal(0);
    
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
    if (inputText.toLowerCase().includes("medical") || inputText.toLowerCase().includes("clinic")) type = "medical";
    else if (inputText.toLowerCase().includes("financial") || inputText.toLowerCase().includes("aid")) type = "financial";
    if (inputText.toLowerCase().includes("downtown")) loc = "Downtown";
    else if (inputText.toLowerCase().includes("central")) loc = "Central Hub";
    
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
    
    // Simulate Speed dial ramping up
    setSpeedVal(26.4);
    
    let current = "";
    for (const word of phrase.split(" ")) {
      current += word + " ";
      setGeneratedText(current);
      await new Promise((r) => setTimeout(r, 45));
    }
    setSimulationRunning(false);
  };

  // Execute P2P Simulation
  const startP2pSimulation = async () => {
    if (p2pRunning) return;
    setP2pRunning(true);
    setP2pDB([]);
    setP2pLogs([]);
    
    const log = (msg: string) => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setP2pLogs(prev => [...prev, `[${time}] ${msg}`]);
    };

    setP2pStep("generating_keys");
    log("SYSTEM: Initializing cryptographic handshake simulation...");
    await new Promise(r => setTimeout(r, 900));
    log("IDENTITY: Accessing secure IndexedDB sandboxed store...");
    await new Promise(r => setTimeout(r, 600));
    log("IDENTITY: Generating unique Ed25519 keypair for session validation.");
    log("IDENTITY: Private key created with { extractable: false } (isolated).");
    log("IDENTITY: Public key fingerprint derived: 0x9b3a7f8d6e2c4a...");
    
    await new Promise(r => setTimeout(r, 1400));
    setP2pStep("signaling");
    log("ZK-SIGNAL: Connecting to peer discovery signaling node...");
    await new Promise(r => setTimeout(r, 500));
    log("ZK-SIGNAL: Generating SHA-256 room passphrase hash: 'emergency-aid-west'");
    log("ZK-SIGNAL: Subscribing to discovery pipeline on signaling server.");
    log("ZK-SIGNAL: Signing WebRTC connection offer metadata with Ed25519 private key.");
    await new Promise(r => setTimeout(r, 800));
    log("ZK-SIGNAL: Encrypted offer broadcasted (Signature: 0x3045022100e478a...)");

    await new Promise(r => setTimeout(r, 1400));
    setP2pStep("verifying");
    log("ZK-SIGNAL: Found candidate peer node match.");
    log("ZK-SIGNAL: Received remote peer connection answer signed with Peer private key.");
    log("ZK-SIGNAL: Peer Public Key fingerprint: 0xaef188d2c49b0e...");
    await new Promise(r => setTimeout(r, 600));
    log("CRYPTO: Verifying peer cryptographic authenticity signature...");
    await new Promise(r => setTimeout(r, 500));
    log("CRYPTO: Signature check: VALID. Authentication handshake success.");
    log("CRYPTO: Diffie-Hellman shared secret established for session encryption.");

    await new Promise(r => setTimeout(r, 1200));
    setP2pStep("connected");
    log("WEBRTC: Initiating ICE candidate gathering...");
    await new Promise(r => setTimeout(r, 400));
    log("WEBRTC: Establishing direct browser-to-browser P2P socket connection...");
    log("WEBRTC: NAT Traversal active. Tunnel Status changed: CONNECTED.");
    log("WEBRTC: Direct P2P Encrypted Data Channel open.");

    await new Promise(r => setTimeout(r, 1400));
    setP2pStep("transferring");
    log("P2P DATA: Querying peer local directory for regional aid databases...");
    await new Promise(r => setTimeout(r, 800));
    log("P2P DATA: Peer transmitting signed database payload (452 bytes)...");
    await new Promise(r => setTimeout(r, 600));
    log("P2P DATA: Decrypting peer payload using ECDH session key... complete.");

    await new Promise(r => setTimeout(r, 1400));
    setP2pStep("complete");
    log("SQLITE: Unpacking verified resource nodes...");
    await new Promise(r => setTimeout(r, 500));
    log("SQLITE: Syncing 3 synchronized records into local OPFS SQLite index...");
    log("SQLITE: Local cache update complete. Directory synced.");
    log("SYSTEM: P2P Tunnel closed gracefully. Key destruction complete.");
    
    setP2pDB([
      { name: "Westside Soup Kitchen", location: "West Side", availability: "9 AM - 5 PM", distance: "0.4 miles" },
      { name: "Downtown Emergency Clinic", location: "Downtown", availability: "Immediate", distance: "0.9 miles" },
      { name: "SafeHaven Shelter", location: "Central Hub", availability: "24/7", distance: "1.3 miles" }
    ]);
    setP2pRunning(false);
  };

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden text-zinc-100 flex flex-col selection:bg-zinc-800">
      
      {/* Visual background grids */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(rgba(244,244,245,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0 transform-gpu" 
        style={{ maskImage: "radial-gradient(circle at 50% 20%, black 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(circle at 50% 20%, black 30%, transparent 80%)" }} 
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(63,63,70,0.08),transparent_50%)] pointer-events-none z-0 transform-gpu" />

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 space-y-8 z-10">
        
        {/* Cockpit Intro Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-900 text-zinc-400 font-mono text-[10px] uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5 text-zinc-500 animate-pulse" /> Recruiter Showcase Cockpit
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 via-zinc-150 to-zinc-400">
            Sovereign Edge Sandbox
          </h1>
          <p className="text-zinc-400 text-sm max-w-[70ch] mx-auto leading-relaxed">
            Because direct browser-to-browser WebRTC database synchronization and local WebGPU LLMs are hard to experience instantly, use this interactive console to inspect the underlying protocol stacks, security constraints, and data routes.
          </p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex justify-center shrink-0">
          <div className="flex bg-zinc-950 p-0.5 rounded-xl border border-zinc-900 text-xs font-mono w-full max-w-md shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <button 
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-2 px-3 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                activeTab === "single" ? "bg-zinc-900 text-zinc-200 font-semibold border-b border-zinc-800" : "text-zinc-500 hover:text-zinc-450"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              1. Single-Agent
            </button>
            <button 
              onClick={() => setActiveTab("p2p")}
              className={`flex-1 py-2 px-3 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                activeTab === "p2p" ? "bg-zinc-900 text-zinc-200 font-semibold border-b border-zinc-800" : "text-zinc-500 hover:text-zinc-450"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              2. Cryptographic P2P
            </button>
            <button 
              onClick={() => setActiveTab("blueprints")}
              className={`flex-1 py-2 px-3 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                activeTab === "blueprints" ? "bg-zinc-900 text-zinc-200 font-semibold border-b border-zinc-800" : "text-zinc-500 hover:text-zinc-450"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              3. Blueprints
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            
            {/* Tab 1: Single Agent Pipeline */}
            {activeTab === "single" && (
              <motion.div
                key="single-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              >
                {/* Input Panel */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <GlassCard className="p-6 space-y-6 flex-1 flex flex-col justify-between border-zinc-900 bg-zinc-950/20">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-400">Configure Prompt</span>
                        <span className="text-xs text-zinc-500 font-mono">Telemetry Input</span>
                      </div>
                      <textarea 
                        value={inputText} 
                        onChange={(e) => setInputText(e.target.value)} 
                        className="w-full h-32 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-900 focus:border-zinc-800 font-mono text-xs text-zinc-200 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-850 transition-all duration-200" 
                        placeholder="Enter medical or resource query with PII..." 
                        aria-label="Simulation test prompt" 
                      />
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-500 font-mono block font-bold uppercase tracking-wider">Preset Scenarios:</span>
                        <div className="flex flex-wrap gap-2">
                          <button 
                            onClick={() => setInputText("I am John Doe. Need clinic aid in Downtown, cell is 206-555-0199")} 
                            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/40 text-xs font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer transition-all duration-250 ease-out"
                          >
                            Medical Query + Phone
                          </button>
                          <button 
                            onClick={() => setInputText("Need emergency bread bank in West Side. My email is user@domain.com")} 
                            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/40 text-xs font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer transition-all duration-250 ease-out"
                          >
                            Food Query + Email
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-zinc-900/80">
                      <button 
                        onClick={startSimulation} 
                        disabled={simulationRunning} 
                        className="w-full py-3.5 rounded-xl bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer transition-all duration-250 ease-out hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,255,255,0.06)]"
                      >
                        {simulationRunning ? (
                          <><RefreshCw className="w-4 h-4 animate-spin" /> Running Simulation...</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Execute Local Pipeline</>
                        )}
                      </button>
                    </div>
                  </GlassCard>
                </div>

                {/* Telemetry Output Panel */}
                <div className="lg:col-span-7">
                  <GlassCard className="h-full border-zinc-900 bg-zinc-950/40 overflow-hidden flex flex-col justify-between">
                    <div className="bg-zinc-950/50 border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-mono font-semibold text-zinc-300">Telemetry Data Flow Graph</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-zinc-800" />
                        <span className="w-2 h-2 rounded-full bg-zinc-750" />
                        <span className="w-2 h-2 rounded-full bg-zinc-700" />
                      </div>
                    </div>
                    <div className="p-6 flex-1 space-y-6">
                      <div className="grid grid-cols-4 gap-2 border-b border-zinc-900 pb-4">
                        {[
                          { id: "input", label: "1. Prompt", desc: "Raw input" },
                          { id: "camp", label: "2. CAMP", desc: "PII Firewall" },
                          { id: "database", label: "3. SQLite", desc: "Local RAG" },
                          { id: "synthesis", label: "4. WebGPU", desc: "Local LLM" }
                        ].map(step => {
                          const isActive = activeStep === step.id;
                          return (
                            <div key={step.id} className={`p-2 rounded-xl text-center transition-all duration-300 relative border ${isActive ? "bg-zinc-900 border-zinc-800 text-zinc-100 shadow-[0_0_15px_rgba(255,255,255,0.02)]" : "text-zinc-500 border-transparent bg-transparent"}`}>
                              {isActive && <span className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-zinc-200 rounded-full" />}
                              <div className={`text-xs font-bold font-mono ${isActive ? "text-zinc-250" : "text-zinc-500"}`}>{step.label}</div>
                              <div className="text-[10px] font-mono hidden sm:block opacity-60 mt-0.5">{step.desc}</div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 min-h-[260px] font-mono text-xs text-zinc-300 space-y-4 relative shadow-inner">
                        <div className="absolute bottom-3 right-4 text-[9px] text-zinc-850 tracking-widest uppercase pointer-events-none select-none font-mono">SECURE AGENT CACHE</div>
                        
                        <AnimatePresence mode="wait">
                          {activeStep === "input" && (
                            <motion.div key="step-input" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                              <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                                Telemetry Output (Raw Prompts)
                              </div>
                              <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 text-zinc-300 italic font-sans text-sm leading-relaxed">&quot;{inputText}&quot;</div>
                              <div className="text-xs text-zinc-500 leading-relaxed font-sans pt-1">
                                Notice: Traditional LLMs transmit this raw payload across open networks, risking leakage of identifying names, medical queries, or contact details to third-party logs.
                              </div>
                            </motion.div>
                          )}
                          {activeStep === "camp" && (
                            <motion.div key="step-camp" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                              <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider font-mono flex justify-between items-center">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                                  Telemetry Output (PII scrubbing worker)
                                </span>
                                <span className="text-[10px] text-emerald-450 bg-emerald-950/30 border border-emerald-900/50 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-emerald-400" /> Shield Active
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Sanitized Prompt Payload:</div>
                                <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 text-zinc-200 font-mono leading-relaxed text-sm">{scrubbedText || "Analyzing privacy tokens..."}</div>
                              </div>
                              {detectedPII.length > 0 ? (
                                <div className="space-y-2">
                                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Pruned Entities:</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {detectedPII.map((item, idx) => (
                                      <span key={idx} className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500/85" />
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[10px] text-zinc-500 font-sans italic">No identifiers requiring sanitization found.</div>
                              )}
                            </motion.div>
                          )}
                          {activeStep === "database" && (
                            <motion.div key="step-db" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                              <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80 shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
                                Telemetry Output (SQLite OPFS Cache)
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-900">
                                  <span className="text-zinc-500 block uppercase text-[10px] tracking-wider mb-0.5">Resolved Entity Type</span>
                                  <span className="font-mono text-zinc-300 font-bold">{queryType || "Pending..."}</span>
                                </div>
                                <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-900">
                                  <span className="text-zinc-500 block uppercase text-[10px] tracking-wider mb-0.5">Resolved Location</span>
                                  <span className="font-mono text-zinc-300 font-bold">{queryLocation || "Pending..."}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">SQLite Local Matches:</div>
                                <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20">
                                  <table className="w-full text-[10px] text-left border-collapse font-mono">
                                    <thead>
                                      <tr className="border-b border-zinc-900 text-zinc-500 bg-zinc-950/40">
                                        <th className="p-2 font-semibold">Resource</th>
                                        <th className="p-2 font-semibold">Loc</th>
                                        <th className="p-2 font-semibold">Dist</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {dbResults.length > 0 ? (
                                        dbResults.map((r, idx) => (
                                          <tr key={idx} className="border-b border-zinc-900/40 text-zinc-300">
                                            <td className="p-2">{r.name}</td>
                                            <td className="p-2">{r.location}</td>
                                            <td className="p-2">{r.distance}</td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={3} className="p-2 text-zinc-600 text-center italic">No records in local cache. Run query...</td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          {activeStep === "synthesis" && (
                            <motion.div key="step-synthesis" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                              <div className="text-zinc-300 text-[10px] font-bold uppercase tracking-wider font-mono flex justify-between items-center">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500/80 shadow-[0_0_6px_rgba(139,92,246,0.5)] animate-pulse" />
                                  Telemetry Output (Browser Hardware Synthesis)
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">Llama-3.2-1B</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 text-zinc-200 font-mono leading-relaxed min-h-[120px] whitespace-pre-line text-xs font-sans">
                                  {generatedText || "Initializing local GPU weights..."}
                                </div>
                                <div className="flex flex-col gap-3 justify-center">
                                  {/* Simulated Speedometer */}
                                  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/40 border border-zinc-900/60">
                                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                                      <svg className="w-full h-full transform -rotate-90 overflow-visible">
                                        <circle cx="24" cy="24" r="20" className="fill-none stroke-zinc-900" strokeWidth="3" />
                                        {speedVal > 0 && (
                                          <motion.circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            className="fill-none stroke-emerald-500"
                                            strokeWidth="3"
                                            strokeDasharray={2 * Math.PI * 20}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                                            animate={{ strokeDashoffset: (2 * Math.PI * 20) * (1 - speedVal / 35) }}
                                            transition={{ type: "spring", stiffness: 60, damping: 15 }}
                                            strokeLinecap="round"
                                          />
                                        )}
                                      </svg>
                                      <span className="absolute text-[10px] font-mono font-bold text-zinc-100">{speedVal.toFixed(1)}</span>
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold block">Local Speed</span>
                                      <span className="text-[8.5px] font-mono text-zinc-550 block leading-tight mt-0.5">Tokens/sec executed entirely on client GPU.</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {/* Tab 2: P2P Cryptography Network Simulator */}
            {activeTab === "p2p" && (
              <motion.div
                key="p2p-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              >
                {/* Left Side Controls & Console Logs */}
                <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
                  <GlassCard className="p-6 flex flex-col gap-6 flex-1 border-zinc-900 bg-zinc-950/20">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-400">P2P Control Deck</span>
                        <span className="text-xs text-zinc-500 font-mono">Mesh Simulation</span>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                          Witness the zero-knowledge WebRTC link initialization. This simulates the signaling handshake, verifies key signatures, exchanges an ECDH secret, and syncs databases.
                        </p>
                        
                        <div className="grid grid-cols-3 gap-2 py-2">
                          {[
                            { id: "generating_keys", label: "Identity" },
                            { id: "signaling", label: "Signaling" },
                            { id: "verifying", label: "Verification" },
                            { id: "connected", label: "Connected" },
                            { id: "transferring", label: "Transferring" },
                            { id: "complete", label: "Synced" }
                          ].map((step, idx) => {
                            const statuses = ["generating_keys", "signaling", "verifying", "connected", "transferring", "complete"];
                            const currentIdx = statuses.indexOf(p2pStep);
                            const selfIdx = statuses.indexOf(step.id);
                            
                            const isCompleted = selfIdx < currentIdx || p2pStep === "complete";
                            const isCurrent = p2pStep === step.id;

                            return (
                              <div 
                                key={step.id} 
                                className={`p-2 rounded-xl border text-center transition-all duration-300 ${
                                  isCurrent ? "border-emerald-500/30 bg-emerald-950/5 text-emerald-300" :
                                  isCompleted ? "border-zinc-800 bg-zinc-900/10 text-zinc-450" : "border-transparent bg-transparent text-zinc-600"
                                }`}
                              >
                                <div className="text-[10px] font-mono font-bold leading-tight">{idx + 1}. {step.label}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t border-zinc-900/60">
                      <button 
                        onClick={startP2pSimulation} 
                        disabled={p2pRunning}
                        className="w-full py-3.5 rounded-xl bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,255,255,0.06)]"
                      >
                        {p2pRunning ? (
                          <><RefreshCw className="w-4.5 h-4.5 animate-spin" /> Synchronizing Mesh...</>
                        ) : (
                          <><Share2 className="w-4.5 h-4.5" /> Execute P2P Handshake</>
                        )}
                      </button>
                    </div>
                  </GlassCard>
                </div>

                {/* Right Side Visual SVG Topology & Terminal */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <GlassCard className="p-6 border-zinc-900 bg-zinc-950/40 flex-1 flex flex-col justify-between min-h-[350px]">
                    <div className="space-y-4">
                      {/* SVG Visualizer */}
                      <div className="w-full bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden h-32 select-none shadow-inner">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:12px_12px] opacity-30" />
                        
                        <svg className="w-full h-16 relative z-10 overflow-visible" viewBox="0 0 320 60">
                          {/* Dotted lines during signaling search */}
                          {(p2pStep === "signaling" || p2pStep === "verifying") && (
                            <motion.line 
                              x1="65" y1="30" x2="255" y2="30" 
                              stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 5"
                              animate={{ strokeDashoffset: [-20, 0] }}
                              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                            />
                          )}

                          {/* Solid line when connected / transmitting */}
                          {(p2pStep === "connected" || p2pStep === "transferring" || p2pStep === "complete") && (
                            <line x1="65" y1="30" x2="255" y2="30" stroke="#10b981" strokeWidth="1.5" />
                          )}

                          {/* Transmitting Packets */}
                          {p2pStep === "transferring" && (
                            <>
                              <motion.circle r="3" fill="#8b5cf6" animate={{ cx: [255, 65] }} transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }} style={{ filter: "drop-shadow(0 0 4px #8b5cf6)" }} />
                              <motion.circle r="2.5" fill="#34d399" animate={{ cx: [255, 65] }} transition={{ repeat: Infinity, duration: 1.6, ease: "linear", delay: 0.5 }} style={{ filter: "drop-shadow(0 0 4px #34d399)" }} />
                            </>
                          )}

                          {/* Local Node */}
                          <g transform="translate(65, 30)">
                            <circle r="14" className="fill-zinc-950 stroke-zinc-800" strokeWidth="2" />
                            <circle r="5" className="fill-emerald-500" />
                            {p2pStep === "generating_keys" && (
                              <motion.circle r="14" className="fill-none stroke-emerald-500/40" strokeWidth="1.5" animate={{ scale: [1, 1.6, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                            )}
                          </g>

                          {/* Peer Node */}
                          <g transform="translate(255, 30)">
                            <circle r="14" className="fill-zinc-950 stroke-zinc-800" strokeWidth="2" />
                            <circle 
                              r="5" 
                              className={
                                p2pStep === "idle" || p2pStep === "generating_keys" ? "fill-zinc-700" :
                                p2pStep === "signaling" || p2pStep === "verifying" ? "fill-amber-500 animate-pulse" :
                                "fill-purple-500"
                              } 
                            />
                            {(p2pStep === "connected" || p2pStep === "transferring") && (
                              <motion.circle r="14" className="fill-none stroke-purple-500/30" strokeWidth="1.5" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.8, delay: 0.4 }} />
                            )}
                          </g>

                          <text x="65" y="54" textAnchor="middle" className="text-[9px] font-mono fill-zinc-550 font-bold uppercase tracking-wider">Local Agent</text>
                          <text x="255" y="54" textAnchor="middle" className="text-[9px] font-mono fill-zinc-550 font-bold uppercase tracking-wider">Remote Peer</text>
                        </svg>

                        <div className="text-[9px] font-mono mt-1 z-10 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                          {p2pStep === "idle" && <span className="text-zinc-500">Handshake Off</span>}
                          {p2pStep === "generating_keys" && <span className="text-emerald-450 animate-pulse">Generating Secure Identity</span>}
                          {p2pStep === "signaling" && <span className="text-amber-400 animate-pulse">Broadcasting Signed Offer</span>}
                          {p2pStep === "verifying" && <span className="text-amber-400 animate-pulse">Verifying Peer Signature</span>}
                          {p2pStep === "connected" && <span className="text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Direct Tunnel Open</span>}
                          {p2pStep === "transferring" && <span className="text-purple-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />Syncing Directories</span>}
                          {p2pStep === "complete" && <span className="text-emerald-450 flex items-center gap-1">✓ Complete Cache Synced</span>}
                        </div>
                      </div>

                      {/* Console output logs */}
                      <div className="flex flex-col gap-2">
                        <span className="text-zinc-500 uppercase font-mono tracking-wider font-bold text-[9px] flex items-center gap-1">
                          <Terminal className="w-3 h-3" />
                          Cryptographic Signaling Terminal
                        </span>
                        <div className="h-32 overflow-y-auto bg-zinc-950 border border-zinc-900 p-3 rounded-2xl font-mono text-[9.5px] text-zinc-400 space-y-1.5 scrollbar-thin shadow-inner">
                          {p2pLogs.length === 0 ? (
                            <div className="text-zinc-650 italic text-[10px] h-full flex items-center justify-center">Awaiting execution... Click the Control Deck button.</div>
                          ) : (
                            p2pLogs.map((log, idx) => {
                              let logClass = "text-zinc-450";
                              if (log.includes("IDENTITY")) logClass = "text-emerald-400/90";
                              if (log.includes("ZK-SIGNAL")) logClass = "text-amber-400/90";
                              if (log.includes("CRYPTO")) logClass = "text-cyan-400 font-bold";
                              if (log.includes("DATA")) logClass = "text-purple-400";
                              if (log.includes("SYSTEM")) logClass = "text-zinc-200 font-semibold";
                              return (
                                <div key={idx} className={`leading-tight ${logClass}`}>
                                  {log}
                                </div>
                              );
                            })
                          )}
                          <div ref={terminalEndRef} />
                        </div>
                      </div>

                      {/* Synchronized database result */}
                      <AnimatePresence>
                        {p2pDB.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 border-t border-zinc-900/60 pt-4"
                          >
                            <span className="text-[10px] text-emerald-450 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <Database className="w-3.5 h-3.5 text-emerald-400" />
                              Synced Peer Directory Rows:
                            </span>
                            <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20 shadow-inner">
                              <table className="w-full text-[10px] text-left border-collapse font-mono">
                                <thead>
                                  <tr className="border-b border-zinc-900 text-zinc-550 bg-zinc-950/40">
                                    <th className="p-2 font-semibold">Resource Name</th>
                                    <th className="p-2 font-semibold">Location</th>
                                    <th className="p-2 font-semibold">Availability</th>
                                    <th className="p-2 font-semibold">Mesh Distance</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {p2pDB.map((r, idx) => (
                                    <tr key={idx} className="border-b border-zinc-900/40 text-zinc-350 hover:bg-zinc-900/10 transition-colors">
                                      <td className="p-2 text-zinc-250 font-medium">{r.name}</td>
                                      <td className="p-2">{r.location}</td>
                                      <td className="p-2 text-zinc-400">{r.availability}</td>
                                      <td className="p-2 text-emerald-450 font-bold">{r.distance}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {/* Tab 3: System Blueprints & Code snippets */}
            {activeTab === "blueprints" && (
              <motion.div
                key="blueprints-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Card 1: Key isolation */}
                  <GlassCard className="p-6 border-zinc-900 bg-zinc-950/20 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 shadow-inner">
                          <Key className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">1. WebCrypto Key Isolation</h3>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                        Storing private identity keys in standard <code className="text-zinc-300 font-mono bg-zinc-900 px-1 py-0.5 rounded text-[11px]">localStorage</code> leaves them open to NPM supply chain script injection (XSS attacks). We generate Ed25519 keys with <code className="text-zinc-300 font-mono bg-zinc-900 px-1 py-0.5 rounded text-[11px]">extractable: false</code> and commit the key structures to isolated IndexedDB objects, preventing raw Javascript access.
                      </p>
                    </div>
                    <div className="relative mt-2">
                      <button 
                        onClick={() => handleCopyCode(`const keyPair = await window.crypto.subtle.generateKey(
  { name: "Ed25519" },
  false, // extractable: false (Sandbox Lock)
  ["sign", "verify"]
);`, "keys")}
                        className="absolute right-3 top-3 p-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:text-zinc-200 text-zinc-400 cursor-pointer transition-colors"
                        aria-label="Copy key generation code"
                      >
                        {copiedCode === "keys" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <pre className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl font-mono text-[10px] text-zinc-300 overflow-x-auto shadow-inner leading-relaxed">
{`// Generate non-extractable Agent key
const keyPair = await window.crypto.subtle.generateKey(
  { name: "Ed25519" },
  false, // extractable: false (Sandbox Lock)
  ["sign", "verify"]
);`}
                      </pre>
                    </div>
                  </GlassCard>

                  {/* Card 2: ZK-Signaling Authentication */}
                  <GlassCard className="p-6 border-zinc-900 bg-zinc-950/20 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-400">
                        <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 shadow-inner">
                          <Shield className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">2. MitM Proof ZK-Signaling</h3>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                        WebRTC handshakes run through public, untrusted WebSockets signaling channels. To prevent Session Hijacking, signaling payloads are cryptographically signed using the agent's private key. Peers verify signatures using public key fingerprints, discarding packets outside a short timestamp threshold.
                      </p>
                    </div>
                    <div className="relative mt-2">
                      <button 
                        onClick={() => handleCopyCode(`const signature = await window.crypto.subtle.sign(
  { name: "Ed25519" },
  privateKey,
  new TextEncoder().encode(payload)
);`, "sig")}
                        className="absolute right-3 top-3 p-1.5 rounded bg-zinc-900 hover:bg-zinc-855 border border-zinc-800 hover:text-zinc-200 text-zinc-400 cursor-pointer transition-colors"
                        aria-label="Copy signing code"
                      >
                        {copiedCode === "sig" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <pre className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl font-mono text-[10px] text-zinc-300 overflow-x-auto shadow-inner leading-relaxed">
{`// Sign signaling packet using sandboxed private key
const signature = await window.crypto.subtle.sign(
  { name: "Ed25519" },
  privateKey,
  new TextEncoder().encode(payload)
);`}
                      </pre>
                    </div>
                  </GlassCard>

                  {/* Card 3: Worker Thread Execution */}
                  <GlassCard className="p-6 border-zinc-900 bg-zinc-950/20 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-purple-400">
                        <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 shadow-inner">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">3. Multi-Thread Worker Offloading</h3>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                        Running local WebGPU LLM compiler routines and streaming tokens on the main thread causes severe browser thread starvation, dropping frame rates. We offload MLC Web-LLM inference routines into a background Web Worker. The main thread communication is reduced to message serialization, preserving a responsive 60fps UI.
                      </p>
                    </div>
                    <div className="relative mt-2">
                      <button 
                        onClick={() => handleCopyCode(`const engine = await CreateWebWorkerMLCEngine(
  new Worker(new URL("./llm.worker.ts", import.meta.url)),
  modelId,
  { initProgressCallback }
);`, "worker")}
                        className="absolute right-3 top-3 p-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:text-zinc-200 text-zinc-400 cursor-pointer transition-colors"
                        aria-label="Copy worker code"
                      >
                        {copiedCode === "worker" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <pre className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl font-mono text-[10px] text-zinc-300 overflow-x-auto shadow-inner leading-relaxed">
{`// Spawn worker thread hosting MLC engine to preserve 60fps
const engine = await CreateWebWorkerMLCEngine(
  new Worker(new URL("./llm.worker.ts", import.meta.url)),
  modelId,
  { initProgressCallback }
);`}
                      </pre>
                    </div>
                  </GlassCard>

                  {/* Card 4: CAMP privacy firewall */}
                  <GlassCard className="p-6 border-zinc-900 bg-zinc-950/20 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 shadow-inner">
                          <Lock className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">4. CAMP Privacy Firewall</h3>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                        Even client-side models contain prompt contexts vulnerable to caching leaks. Cumulative Agentic Masking & Pruning (CAMP) middleware intercept prompt strings, masks detected PII (names, contact numbers) using regex mapping, queries the local SQLite OPFS index database, and formats context templates before tokenization.
                      </p>
                    </div>
                    <div className="relative mt-2">
                      <button 
                        onClick={() => handleCopyCode(`const cleanPrompt = rawPrompt
  .replace(EMAIL_REGEX, "[EMAIL_PRUNED]")
  .replace(PHONE_REGEX, "[PHONE_PRUNED]");`, "camp")}
                        className="absolute right-3 top-3 p-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:text-zinc-200 text-zinc-400 cursor-pointer transition-colors"
                        aria-label="Copy CAMP code"
                      >
                        {copiedCode === "camp" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <pre className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl font-mono text-[10px] text-zinc-300 overflow-x-auto shadow-inner leading-relaxed">
{`// Intercept context payload & redact identification tokens
const cleanPrompt = rawPrompt
  .replace(EMAIL_REGEX, "[EMAIL_PRUNED]")
  .replace(PHONE_REGEX, "[PHONE_PRUNED]");`}
                      </pre>
                    </div>
                  </GlassCard>

                </div>

                {/* System Dataflow Blueprint SVG flowchart */}
                <GlassCard className="p-6 border-zinc-900 bg-zinc-950/20 space-y-4">
                  <div className="flex items-center gap-2 text-zinc-350">
                    <Layers className="w-4 h-4" />
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">Overall Architecture Blueprint</h3>
                  </div>
                  
                  <div className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 overflow-x-auto flex justify-center shadow-inner">
                    <div className="min-w-[650px] py-4 select-none flex justify-between items-center text-[10px] font-mono text-zinc-400 relative">
                      
                      {/* Flow Step 1 */}
                      <div className="w-32 p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl text-center flex flex-col items-center gap-1 hover:border-zinc-700/60 transition-colors">
                        <Terminal className="w-4 h-4 text-zinc-400" />
                        <span className="font-bold text-zinc-300">Browser UI</span>
                        <span className="text-[8px] text-zinc-550 leading-tight">User prompt entry</span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-zinc-700" />

                      {/* Flow Step 2 */}
                      <div className="w-32 p-3 bg-emerald-950/5 border border-emerald-900/40 rounded-xl text-center flex flex-col items-center gap-1 hover:border-emerald-800/50 transition-colors">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-emerald-300">CAMP (Worker)</span>
                        <span className="text-[8px] text-zinc-500 leading-tight">PII tokens scrubbed</span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-zinc-700" />

                      {/* Flow Step 3 */}
                      <div className="w-32 p-3 bg-cyan-950/5 border border-cyan-900/40 rounded-xl text-center flex flex-col items-center gap-1 hover:border-cyan-800/50 transition-colors">
                        <Database className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-cyan-300">Local SQLite</span>
                        <span className="text-[8px] text-zinc-500 leading-tight">Index context loaded</span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-zinc-700" />

                      {/* Flow Step 4 */}
                      <div className="w-32 p-3 bg-purple-950/5 border border-purple-900/40 rounded-xl text-center flex flex-col items-center gap-1 hover:border-purple-800/50 transition-colors">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <span className="font-bold text-purple-300">LLM (WebGPU)</span>
                        <span className="text-[8px] text-zinc-500 leading-tight">Local worker stream</span>
                      </div>

                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      <Footer />
    </div>
  );
}

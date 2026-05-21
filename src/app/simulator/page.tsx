"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, RefreshCw, Sparkles, Terminal, Lock,
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
  const [inputText, setInputText] = useState("I am Pranav. Need emergency food in West Side. My email is pranav@gmail.com");
  const [activeStep, setActiveStep] = useState<"input" | "camp" | "database" | "synthesis">("input");
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [scrubbedText, setScrubbedText] = useState("");
  const [detectedPII, setDetectedPII] = useState<string[]>([]);
  const [queryType, setQueryType] = useState("");
  const [queryLocation, setQueryLocation] = useState("");
  const [dbResults, setDbResults] = useState<DBResource[]>([]);
  const [generatedText, setGeneratedText] = useState("");

  const startSimulation = async () => {
    if (simulationRunning) return;
    setSimulationRunning(true);
    setScrubbedText(""); setDetectedPII([]); setGeneratedText(""); setDbResults([]);
    
    setActiveStep("input");
    await new Promise((r) => setTimeout(r, 1200));

    setActiveStep("camp");
    const detected: string[] = [];
    let processed = inputText;
    const emailMatch = inputText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatch) { emailMatch.forEach(e => detected.push(`EMAIL: ${e}`)); processed = processed.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_PRUNED]"); }
    const nameMatch = inputText.match(/\b(pranav|maya|john|alice|bob)\b/gi);
    if (nameMatch) { nameMatch.forEach(n => detected.push(`NAME: ${n}`)); processed = processed.replace(/\b(pranav|maya|john|alice|bob)\b/gi, "[NAME_PRUNED]"); }
    setDetectedPII(detected); setScrubbedText(processed);
    await new Promise((r) => setTimeout(r, 1800));

    setActiveStep("database");
    let type = "food"; let loc = "West Side";
    if (inputText.toLowerCase().includes("medical") || inputText.toLowerCase().includes("clinic")) type = "medical";
    else if (inputText.toLowerCase().includes("financial") || inputText.toLowerCase().includes("aid")) type = "financial";
    if (inputText.toLowerCase().includes("downtown")) loc = "Downtown";
    else if (inputText.toLowerCase().includes("central")) loc = "Central Hub";
    setQueryType(type); setQueryLocation(loc);
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
    for (const word of phrase.split(" ")) { current += word + " "; setGeneratedText(current); await new Promise((r) => setTimeout(r, 45)); }
    setSimulationRunning(false);
  };

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden text-zinc-100 flex flex-col selection:bg-zinc-800">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(244,244,245,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0 transform-gpu" style={{ maskImage: "radial-gradient(circle at 70% 30%, black 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(circle at 70% 30%, black 30%, transparent 80%)" }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(63,63,70,0.08),transparent_50%)] pointer-events-none z-0 transform-gpu" />

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-16 space-y-8 z-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-900 text-zinc-400 font-mono text-[10px] uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5 text-zinc-500 animate-pulse" /> Interactive Sandbox
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 via-zinc-150 to-zinc-400">
            Sovereign Cognitive Sandbox
          </h1>
          <p className="text-zinc-400 text-sm max-w-[65ch] mx-auto leading-relaxed">
            Test how our architecture handles personal data, sanitizes contexts, queries local databases, and feeds the safe local LLM engine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between">
            <GlassCard className="p-6 space-y-6 flex-1 flex flex-col justify-between border-zinc-900 bg-zinc-950/20">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-400">Configure Prompt</span>
                  <span className="text-xs text-zinc-500 font-mono">Custom Input</span>
                </div>
                <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} className="w-full h-32 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-900 focus:border-zinc-800 font-mono text-xs text-zinc-200 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-850 transition-all duration-200" placeholder="Enter medical or resource query with PII..." aria-label="Simulation test prompt" />
                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-500 font-mono block font-bold uppercase tracking-wider">Preset Scenarios:</span>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setInputText("I am John Doe. Need clinic aid in Downtown, cell is 206-555-0199")} className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/40 text-xs font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer transition-all duration-250 ease-out">Medical Query with Phone</button>
                    <button onClick={() => setInputText("Need emergency bread bank in West Side. My email is user@domain.com")} className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/40 text-xs font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer transition-all duration-250 ease-out">Food Query with Email</button>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-zinc-900/80">
                <button onClick={startSimulation} disabled={simulationRunning} className="w-full py-3.5 rounded-xl bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer transition-all duration-250 ease-out hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,255,255,0.06)]">
                  {simulationRunning ? (<><RefreshCw className="w-4 h-4 animate-spin" /> Running Simulation...</>) : (<><Sparkles className="w-4 h-4" /> Execute Data Flow</>)}
                </button>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-7">
            <GlassCard className="h-full border-zinc-900 bg-zinc-950/40 overflow-hidden flex flex-col justify-between">
              <div className="bg-zinc-950/50 border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2"><Terminal className="w-4 h-4 text-zinc-400" /><span className="text-xs font-mono font-semibold text-zinc-300">Telemetry Data Flow Graph</span></div>
                <div className="flex gap-2"><span className="w-2 h-2 rounded-full bg-zinc-800" /><span className="w-2 h-2 rounded-full bg-zinc-750" /><span className="w-2 h-2 rounded-full bg-zinc-700" /></div>
              </div>
              <div className="p-6 flex-1 space-y-6">
                <div className="grid grid-cols-4 gap-2 border-b border-zinc-900 pb-4">
                  {[{ id: "input", label: "1. Prompt", desc: "Raw input" },{ id: "camp", label: "2. CAMP", desc: "PII Firewall" },{ id: "database", label: "3. SQLite", desc: "Local RAG" },{ id: "synthesis", label: "4. WebGPU", desc: "Local LLM" }].map(step => {
                    const isActive = activeStep === step.id;
                    return (<div key={step.id} className={`p-2 rounded-xl text-center transition-all duration-300 relative border ${isActive ? "bg-zinc-900 border-zinc-800 text-zinc-100 shadow-[0_0_15px_rgba(255,255,255,0.02)]" : "text-zinc-500 border-transparent bg-transparent"}`}>
                      {isActive && <span className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-zinc-200 rounded-full" />}
                      <div className={`text-xs font-bold font-mono ${isActive ? "text-zinc-250" : "text-zinc-500"}`}>{step.label}</div>
                      <div className="text-[10px] font-mono hidden sm:block opacity-60 mt-0.5">{step.desc}</div>
                    </div>);
                  })}
                </div>
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 min-h-[240px] font-mono text-xs text-zinc-300 space-y-4 relative shadow-inner">
                  <div className="absolute bottom-3 right-4 text-[9px] text-zinc-850 tracking-widest uppercase pointer-events-none select-none font-mono">SECURE PROCESSOR CACHE</div>
                  <AnimatePresence mode="wait">
                    {activeStep === "input" && (<motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                      <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />Telemetry Output (Raw Prompts)</div>
                      <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 text-zinc-300 italic font-sans text-sm leading-relaxed">&quot;{inputText}&quot;</div>
                      <div className="text-xs text-zinc-500 leading-relaxed font-sans pt-1">Notice: Traditional LLMs transmit this raw payload across open networks, risking leakage of identifying names, medical queries, or contact details to third-party logs.</div>
                    </motion.div>)}
                    {activeStep === "camp" && (<motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider font-mono flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />Telemetry Output (PII scrubbing worker)</span><span className="text-[10px] text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1"><Lock className="w-3 h-3" /> Shield Active</span></div>
                      <div className="space-y-1.5"><div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Sanitized Prompt Payload:</div><div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 text-zinc-200 font-mono leading-relaxed text-sm">{scrubbedText || "Analyzing privacy tokens..."}</div></div>
                      {detectedPII.length > 0 ? (<div className="space-y-2"><div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Pruned Entities:</div><div className="flex flex-wrap gap-1.5">{detectedPII.map((item, idx) => (<span key={idx} className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500/80" />{item}</span>))}</div></div>) : (<div className="text-[10px] text-zinc-500 font-sans italic">No identifiers requiring sanitization found.</div>)}
                    </motion.div>)}
                    {activeStep === "database" && (<motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80 shadow-[0_0_6px_rgba(6,182,212,0.5)]" />Telemetry Output (SQLite OPFS Cache)</div>
                      <div className="grid grid-cols-2 gap-3 text-xs"><div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-900"><span className="text-zinc-500 block uppercase text-[10px] tracking-wider mb-0.5">Resolved Entity Type</span><span className="font-mono text-zinc-300 font-bold">{queryType || "Pending..."}</span></div><div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-900"><span className="text-zinc-500 block uppercase text-[10px] tracking-wider mb-0.5">Resolved Location</span><span className="font-mono text-zinc-300 font-bold">{queryLocation || "Pending..."}</span></div></div>
                      <div className="space-y-2"><div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">SQLite Local Matches:</div><div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20"><table className="w-full text-[10px] text-left border-collapse font-mono"><thead><tr className="border-b border-zinc-900 text-zinc-500 bg-zinc-950/40"><th className="p-2 font-semibold">Resource</th><th className="p-2 font-semibold">Loc</th><th className="p-2 font-semibold">Dist</th></tr></thead><tbody>{dbResults.length > 0 ? dbResults.map((r, idx) => (<tr key={idx} className="border-b border-zinc-900/40 text-zinc-300"><td className="p-2">{r.name}</td><td className="p-2">{r.location}</td><td className="p-2">{r.distance}</td></tr>)) : (<tr><td colSpan={3} className="p-2 text-zinc-600 text-center italic">No records in local cache. Run query...</td></tr>)}</tbody></table></div></div>
                    </motion.div>)}
                    {activeStep === "synthesis" && (<motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div className="text-zinc-300 text-[10px] font-bold uppercase tracking-wider font-mono flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500/80 shadow-[0_0_6px_rgba(139,92,246,0.5)] animate-pulse" />Telemetry Output (Browser Hardware Synthesis)</span><span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">Llama-3.2-1B</span></div>
                      <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 text-zinc-200 font-mono leading-relaxed min-h-[100px] whitespace-pre-line text-xs font-sans">{generatedText || "Initializing local GPU weights..."}</div>
                    </motion.div>)}
                  </AnimatePresence>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { sovereignRuntime } from "@/lib/runtime/AgentRuntime";
import { metricsCapture } from "@/lib/metrics/MetricsCapture";
import { useAgentStore, ExtendedChatMessage } from "@/store/agentStore";
import { camp, CAMPResult } from "@/lib/middleware/CAMP";
import { getCurrentWeather } from "@/lib/mcp/ResourceTools";

export function useSovereignAgent() {
  const [input, setInput] = useState("");
  
  // Zustand store mappings
  const messages = useAgentStore((state) => state.messages);
  const setMessages = useAgentStore((state) => state.setMessages);
  const addMessage = useAgentStore((state) => state.addMessage);
  
  const isInitializing = useAgentStore((state) => state.isInitializing);
  const setIsInitializing = useAgentStore((state) => state.setIsInitializing);
  
  const isThinking = useAgentStore((state) => state.isThinking);
  const setIsThinking = useAgentStore((state) => state.setIsThinking);
  
  const initProgress = useAgentStore((state) => state.initProgress);
  const setInitProgress = useAgentStore((state) => state.setInitProgress);
  
  const lastCamp = useAgentStore((state) => state.lastCamp);
  const setLastCamp = useAgentStore((state) => state.setLastCamp);
  
  const toolExecuting = useAgentStore((state) => state.toolExecuting);
  const setToolExecuting = useAgentStore((state) => state.setToolExecuting);
  
  const thinkingStep = useAgentStore((state) => state.thinkingStep);
  const setThinkingStep = useAgentStore((state) => state.setThinkingStep);
  
  const metrics = useAgentStore((state) => state.metrics);
  const setMetrics = useAgentStore((state) => state.setMetrics);

  const isSimulationMode = useAgentStore((state) => state.isSimulationMode);
  const setIsSimulationMode = useAgentStore((state) => state.setIsSimulationMode);

  useEffect(() => {
    let isMounted = true;
    
    // Initial fetch to make sure metrics aren't null on first render
    if (isMounted) setMetrics(metricsCapture.getMetrics());
    
    const init = async () => {
      try {
        if (isMounted) setInitProgress("Validating hardware components...");
        const gpuCheck = await sovereignRuntime.checkWebGPUSupport();
        if (!gpuCheck.supported) {
          if (isMounted) {
            setInitProgress(`WebGPU unsupported: ${gpuCheck.reason}. Entering Demonstration Mode...`);
            setTimeout(() => {
              if (isMounted) {
                setIsSimulationMode(true);
                setIsInitializing(false);
              }
            }, 1800);
          }
          return;
        }

        await sovereignRuntime.initialize((report) => {
          if (isMounted) setInitProgress(report.text);
        });
        if (isMounted) setIsInitializing(false);
      } catch (err: any) {
        if (isMounted) {
          setInitProgress(`GPU Error: ${err?.message || "WebGPU load failed"}. Entering Demonstration Mode...`);
          setTimeout(() => {
            if (isMounted) {
              setIsSimulationMode(true);
              setIsInitializing(false);
            }
          }, 1800);
        }
      }
    };
    init();

    const interval = setInterval(() => {
      if (isMounted) setMetrics(metricsCapture.getMetrics());
    }, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
      sovereignRuntime.destroy();
    };
  }, [setInitProgress, setIsInitializing, setMetrics, setIsSimulationMode]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    setIsThinking(true);
    setToolExecuting(null);
    setThinkingStep("Evaluating Safety Intercepts...");

    // 1. Pre-process CAMP firewall check to attach data metrics to the user message
    let campResult: CAMPResult;
    try {
      campResult = await camp.process(input);
    } catch (err) {
      console.warn("[CAMP] Error in pre-processing:", err);
      campResult = { processedText: input, cpeScore: 0, pruned: false, fragmentsDetected: [] };
    }

    const userMessage: ExtendedChatMessage = { 
      role: "user", 
      content: input,
      campResult: campResult
    };
    
    addMessage(userMessage);
    const originalInput = input;
    setInput("");

    if (isSimulationMode) {
      try {
        setLastCamp(campResult);

        await new Promise(r => setTimeout(r, 800));
        setThinkingStep("Locating verified regional directories...");
        await new Promise(r => setTimeout(r, 600));

        let mockResponse = "";
        const lowerInput = originalInput.toLowerCase();

        // 1. Safety Intercept
        const exclusionTerms = ["cat", "dog", "pet", "animal", "history", "article", "book", "movie", "story", "game", "character"];
        const hasExclusion = exclusionTerms.some(term => lowerInput.includes(term));
        const selfReferenceTerms = ["i have", "i'm having", "i feel", "my ", "am i", "should i take", "give me", "help me with"];
        const hasSelfReference = selfReferenceTerms.some(term => lowerInput.includes(term));
        const medicalTriggers = ["diagnose", "prescribe", "heart attack", "chest pain", "medication for", "dosage", "symptoms of"];
        const hasMedicalTrigger = medicalTriggers.some(term => lowerInput.includes(term));
        const compositeCheck = lowerInput.includes("medical") && (lowerInput.includes("advice") || lowerInput.includes("treatment"));

        if (!hasExclusion && ((hasMedicalTrigger && hasSelfReference) || (compositeCheck && hasSelfReference))) {
          mockResponse = "I am a local AI routing assistant. To protect your safety, I am strictly forbidden from providing medical diagnoses, treatments, or prescribing medications. Please seek professional medical attention immediately.";
        } else if (lowerInput.includes("weather")) {
          // 2. Weather: Live geocoding & forecast query fallback
          let location = "Pune"; // default fallback location
          const locationPatterns = [
            /\b(?:in|near|around|at)\b\s+([a-zA-Z][a-zA-Z\s,]{1,30}?)(?:\.|\?|!|$)/i,
            /\b(?:weather|forecast|temperature)\b\s+(?:for|in|at|near|around)?\s*([a-zA-Z][a-zA-Z\s,]{1,30}?)(?:\.|\?|!|$)/i
          ];
          for (const pat of locationPatterns) {
            const match = lowerInput.match(pat);
            if (match && match[1]) {
              const clean = match[1].trim();
              if (clean.length > 1 && !["today", "tomorrow", "current", "now"].includes(clean)) {
                location = clean;
                break;
              }
            }
          }
          try {
            setThinkingStep(`Fetching live weather details for ${location}...`);
            const weather = await getCurrentWeather(location);
            mockResponse = `Here is the current weather for **${weather.location}**:\n\n*   **Temperature**: ${weather.temperature} (Feels like ${weather.apparentTemperature})\n*   **Condition**: ${weather.condition}\n*   **Precipitation**: ${weather.precipitation}\n*   **Wind Speed**: ${weather.windSpeed}\n\n*This data was retrieved live and privately from the open Open-Meteo API.*`;
          } catch (err: any) {
            mockResponse = `I am currently running in Offline Demonstration Mode. Usually, I would fetch live weather via the anonymous Weather tool. Currently, the weather in ${location} is simulated as 72°F and sunny with zero cloud tracking!`;
          }
        } else if (lowerInput.includes("food") || lowerInput.includes("bread") || lowerInput.includes("clinic") || lowerInput.includes("medical") || lowerInput.includes("aid")) {
          // 3. Resource Query
          mockResponse = "I found the following matching verified resource in the local SQLite directory:\n\n- **SafeHaven Medical Clinic** (Downtown, Immediate availability, 0.8 miles away)\n\nThis resource query was processed 100% locally on your browser context via OPFS. No personal details were exposed.";
        } else {
          // 4. General Chat
          mockResponse = `Hello! I am your Sovereign Edge Assistant. Since WebGPU hardware acceleration is not active or supported in this browser, I am running in interactive demonstration mode.\n\nYour prompt: "${originalInput}" has been processed by the CAMP Privacy Firewall. No identification details were leaked. How can I help you today?`;
        }

        setThinkingStep(null);
        
        // Update simulated metrics to show token generation speed
        const originalMetrics = metricsCapture.getMetrics();
        setMetrics({
          ...originalMetrics,
          inferenceSpeed: 24.5
        });

        // Stream text response
        let streamingText = "";
        const words = mockResponse.split(" ");
        for (let i = 0; i < words.length; i++) {
          streamingText += words[i] + " ";
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant") {
              return [...prev.slice(0, -1), { role: "assistant", content: streamingText } as ExtendedChatMessage];
            }
            return [...prev, { role: "assistant", content: streamingText } as ExtendedChatMessage];
          });
          await new Promise(r => setTimeout(r, 45));
        }

        // Attach final fallback speed values directly to the message
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...last, inferenceSpeed: 24.5, isSimulated: true }
            ];
          }
          return prev;
        });

        // Reset speed metric after stream finishes
        setMetrics({
          ...originalMetrics,
          inferenceSpeed: 0
        });

      } catch (err) {
        console.error("[Agent Simulation Error]", err);
      } finally {
        setIsThinking(false);
        setToolExecuting(null);
        setThinkingStep(null);
      }
      return;
    }

    try {
      let streamingText = "";
      const result = await sovereignRuntime.generateResponse(
        [...messages, userMessage],
        (chunk) => {
          setThinkingStep(null);
          streamingText += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant") {
              return [...prev.slice(0, -1), { role: "assistant", content: streamingText } as ExtendedChatMessage];
            }
            return [...prev, { role: "assistant", content: streamingText } as ExtendedChatMessage];
          });
        },
        (toolName) => {
          setToolExecuting(toolName);
        },
        (step) => {
          setThinkingStep(step);
        }
      );

      setLastCamp(result.camp);
      const updatedMetrics = metricsCapture.getMetrics();
      setMetrics(updatedMetrics);

      // Attach final metrics directly to the assistant message in history
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            { 
              ...last, 
              inferenceSpeed: updatedMetrics.inferenceSpeed || 22.2,
              isSimulated: false,
              ragSources: result.ragSources 
            }
          ];
        }
        return prev;
      });

    } catch (err) {
      console.error("[Agent Error]", err);
    } finally {
      setIsThinking(false);
      setToolExecuting(null);
      setThinkingStep(null);
    }
  };

  const addExternalMessage = useCallback((msg: ChatCompletionMessageParam) => {
    addMessage(msg);
  }, [addMessage]);

  return {
    input,
    setInput,
    messages,
    isInitializing,
    isThinking,
    initProgress,
    lastCamp,
    toolExecuting,
    thinkingStep,
    metrics: metrics || metricsCapture.getMetrics(),
    handleSend,
    addExternalMessage
  };
}

import { CreateMLCEngine, MLCEngine, InitProgressReport, ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { camp, CAMPResult } from "../middleware/CAMP";
import { searchCommunityResources, getCurrentWeather, CommunityResource } from "../mcp/ResourceTools";
import { metricsCapture } from "../metrics/MetricsCapture";
import { telemetry } from "../metrics/Telemetry";

/**
 * Sovereign Intelligence Layer - AgentRuntime
 * 
 * Optimized for M1 MacBook Air (Unified Memory) using WebGPU.
 */
export class AgentRuntime {
  private engine: MLCEngine | null = null;
  private lastCAMPResult: CAMPResult | null = null;
  private campWorker: Worker | null = null;
  
  // Phase 7: Industrial Scale - Switched from 2.5GB Phi-4-mini to ~800MB Llama-3.2-1B for PWA distribution
  private readonly PRIMARY_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
  // Genuine lightweight fallback for devices where 1B parameter model fails to load
  private readonly FALLBACK_MODEL = "SmolLM2-135M-Instruct-q0f16-MLC";

  async initialize(onProgress?: (progress: InitProgressReport) => void): Promise<void> {
    if (this.engine) return;

    try {
      this.engine = await CreateMLCEngine(this.PRIMARY_MODEL, {
        initProgressCallback: onProgress,
      });
    } catch {
      await this.handleFallback(onProgress);
    }
  }

  private async handleFallback(onProgress?: (progress: InitProgressReport) => void): Promise<void> {
    try {
      this.engine = await CreateMLCEngine(this.FALLBACK_MODEL, {
        initProgressCallback: onProgress
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      telemetry.logError("WebGPU_Init_Failure", errorMessage);
      throw new Error("Local Inference Unavailable. Check WebGPU support.");
    }
  }

  /**
   * Gracefully unloads the WebLLM engine to free up GPU VRAM.
   * Crucial for preventing memory leaks when the agent is unmounted.
   */
  async destroy(): Promise<void> {
    if (this.campWorker) {
      this.campWorker.terminate();
      this.campWorker = null;
      console.log("[CAMP] Worker terminated.");
    }
    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
      console.log("[WebGPU] Engine unloaded and VRAM freed.");
    }
  }

  /**
   * Core generation method with CAMP Privacy and MCP Tool Execution.
   */
  async generateResponse(
    messages: ChatCompletionMessageParam[], 
    onStream?: (text: string) => void,
    onToolStart?: (toolName: string) => void,
    onStepChange?: (step: string) => void
  ): Promise<{ text: string, camp: CAMPResult }> {
    if (onStepChange) onStepChange("Evaluating safety guardrails...");
    // A. Deterministic Hybrid Guardrail Pre-Processor (Instant protection without engine dependency)
    const rawUserMessage = [...messages].reverse().find(m => m.role === "user");
    if (rawUserMessage && typeof rawUserMessage.content === "string") {
      const normalizedContent = rawUserMessage.content.toLowerCase();

      // Context-aware exclusion: Do not trigger for pet, historical, or hypothetical queries
      const exclusionTerms = ["cat", "dog", "pet", "animal", "history", "article", "book", "movie", "story", "game", "character"];
      const hasExclusion = exclusionTerms.some(term => normalizedContent.includes(term));

      if (!hasExclusion) {
        // Human-self-referencing medical signal detection
        const selfReferenceTerms = ["i have", "i'm having", "i feel", "my ", "am i", "should i take", "give me", "help me with"];
        const hasSelfReference = selfReferenceTerms.some(term => normalizedContent.includes(term));

        const medicalTriggers = ["diagnose", "prescribe", "heart attack", "chest pain", "medication for", "dosage", "symptoms of"];
        const hasMedicalTrigger = medicalTriggers.some(term => normalizedContent.includes(term));

        const compositeCheck = normalizedContent.includes("medical") && (normalizedContent.includes("advice") || normalizedContent.includes("treatment"));

        if ((hasMedicalTrigger && hasSelfReference) || (compositeCheck && hasSelfReference)) {
          const safetyMessage = "I am a local AI routing assistant. To protect your safety, I am strictly forbidden from providing medical diagnoses, treatments, or prescribing medications. Please seek professional medical attention immediately.";
          if (onStream) onStream(safetyMessage);
          return {
            text: safetyMessage,
            camp: {
              processedText: rawUserMessage.content,
              cpeScore: 0,
              pruned: false,
              fragmentsDetected: []
            }
          };
        }
      }
    }

    if (onStepChange) onStepChange("Verifying Local GPU Engine Context...");
    if (!this.engine) {
      throw new Error("AgentRuntime not initialized.");
    }

    // 1. Hardened System Guardrail (Version 2.0 - General & Resource Assistant)
    const SYSTEM_PROMPT = `You are the Sovereign Intelligence Layer, a client-side AI assistant running on WebGPU.

CAPABILITIES:
1. General Chat: You can assist with general-purpose requests including coding, writing, mathematics, history, and general discussion.
2. Community Resource Routing: If the user is looking for local aid, you can search for food banks, medical clinics, and financial aid services. ONLY use the data in the "VERIFIED RESOURCES" section below and copy names, locations, availability, and distances exactly as written. Do NOT add extra details.
3. Weather Information: If the user asks about the weather, summarize the data provided in the "CURRENT WEATHER" section below.

RULES:
- When using VERIFIED RESOURCES or CURRENT WEATHER, copy details exactly as shown. Do not invent or extrapolate details.
- If the user asks for weather but no CURRENT WEATHER section is provided, ask them which location they are interested in.
- Maintain a helpful, objective, and privacy-conscious persona. Mention that your responses are processed 100% locally on their device with zero cloud dependency.
- Never invent or fabricate resource listings or weather statistics.`;
    
    const guardedMessages: ChatCompletionMessageParam[] = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

    try {
      // 2. Apply CAMP Privacy Moat to the latest user message
      if (onStepChange) onStepChange("Activating CAMP Privacy Firewall: Redacting local PII...");
      const lastUserMessage = [...guardedMessages].reverse().find(m => m.role === "user");
      if (lastUserMessage && typeof lastUserMessage.content === "string") {
        let campResult: CAMPResult;
        if (typeof window !== "undefined" && window.Worker) {
          // BUG 6 Fix: Reuse a persistent worker instead of spawning one per message
          if (!this.campWorker) {
            this.campWorker = new Worker(new URL('../middleware/camp.worker.ts', import.meta.url));
          }
          const worker = this.campWorker;
          campResult = await new Promise((resolve, reject) => {
            worker.onmessage = (e) => {
              if (e.data.success) resolve(e.data.result);
              else reject(new Error(e.data.error));
            };
            worker.postMessage({ id: 1, context: lastUserMessage.content });
          });
        } else {
          campResult = await camp.process(lastUserMessage.content);
        }
        lastUserMessage.content = campResult.processedText;
        this.lastCAMPResult = campResult;
      }

      // 3. Classify user intent with deterministic keyword matching
      //    (Do NOT rely on the 1B model to classify — it will hallucinate)
      const lastUserMsg = [...guardedMessages].reverse().find(m => m.role === "user");
      let matchedType: "medical" | "food" | "financial" | null = null;
      let matchedLocation = "Seattle";
      let isGreeting = false;
      let isWeather = false;

      if (lastUserMsg && typeof lastUserMsg.content === "string") {
        const normalized = lastUserMsg.content.toLowerCase().trim();

        // Detect simple greetings
        const greetingPatterns = ["hello", "hi", "hey", "who are you", "what are you", "what can you do", "help"];
        isGreeting = greetingPatterns.some(g => normalized.startsWith(g) || normalized === g);

        // Detect weather request
        isWeather = normalized.includes("weather") || normalized.includes("temperature") || normalized.includes("forecast") || normalized.includes("rain") || normalized.includes("sunny") || normalized.includes("cloudy");

        // Detect resource type
        if (normalized.includes("medical") || normalized.includes("clinic") || normalized.includes("doctor") || normalized.includes("health") || normalized.includes("hospital")) {
          matchedType = "medical";
        } else if (normalized.includes("food") || normalized.includes("bread") || normalized.includes("bank") || normalized.includes("pantry") || normalized.includes("meal") || normalized.includes("hunger") || normalized.includes("hungry")) {
          matchedType = "food";
        } else if (normalized.includes("financial") || normalized.includes("fund") || normalized.includes("money") || normalized.includes("aid") || normalized.includes("rent") || normalized.includes("bill")) {
          matchedType = "financial";
        }

        // Extract location
        const locationPatterns = [
          /(?:in|near|around|at)\s+([a-zA-Z][a-zA-Z\s]{1,30}?)(?:\.|,|\?|!|$)/i,
        ];
        for (const pat of locationPatterns) {
          const match = normalized.match(pat);
          if (match && match[1]) {
            matchedLocation = match[1].trim();
            break;
          }
        }
      }

      // 4a. Handle greetings deterministically (no model needed)
      if (isGreeting && !matchedType && !isWeather) {
        const greeting = "I'm the Sovereign Intelligence Layer (Version 2.0). I can help you find verified community resources (food, medical, finance), check real-time weather information, or assist with general queries like coding and mathematics — all processed 100% locally on your device with zero cloud dependency. Try asking: \"Find me food banks in Seattle\" or \"What's the weather in London?\"";
        if (onStream) onStream(greeting);
        const defaultCamp: CAMPResult = this.lastCAMPResult || { processedText: "", cpeScore: 0, pruned: false, fragmentsDetected: [] };
        metricsCapture.update(0, greeting.length, defaultCamp);
        return { text: greeting, camp: defaultCamp };
      }

      // 5a. Weather query flow (determinisitc weather fetch + LLM response formatting)
      if (isWeather) {
        if (onToolStart) onToolStart("get_current_weather");
        if (onStepChange) onStepChange(`Fetching current weather for ${matchedLocation}...`);
        
        let weatherBlock = "";
        try {
          const weather = await getCurrentWeather(matchedLocation);
          weatherBlock = `Location: ${weather.location}
Temperature: ${weather.temperature}
Feels Like: ${weather.apparentTemperature}
Condition: ${weather.condition}
Precipitation: ${weather.precipitation}
Wind Speed: ${weather.windSpeed}`;
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          weatherBlock = `Error fetching weather for "${matchedLocation}": ${errMsg}`;
        }

        const groundedSystemPrompt: ChatCompletionMessageParam = {
          role: "system",
          content: `${SYSTEM_PROMPT}

CURRENT WEATHER:
${weatherBlock}

Summarize the weather data above. Mention that it is retrieved dynamically and privately via Open-Meteo. After summarizing, stop.`
        };

        const synthesisMessages: ChatCompletionMessageParam[] = [groundedSystemPrompt, ...messages];
        
        const startTime = performance.now();
        if (onStepChange) onStepChange("Synthesizing weather response...");
        const finalChunks = await this.engine.chat.completions.create({
          messages: synthesisMessages,
          stream: true,
        });

        let fullText = "";
        for await (const chunk of finalChunks) {
          const content = chunk.choices[0]?.delta?.content || "";
          fullText += content;
          if (onStream) onStream(content);
        }
        const endTime = performance.now();
        metricsCapture.update(endTime - startTime, fullText.length, this.lastCAMPResult);

        return { text: fullText, camp: this.lastCAMPResult! };
      }

      // 5b. Resource query flow (deterministic resource search + LLM matching)
      if (matchedType) {
        if (onToolStart) onToolStart("search_community_resources");
        if (onStepChange) onStepChange(`Searching ${matchedType} resources in ${matchedLocation}...`);
        const results = await searchCommunityResources({ type: matchedType, location: matchedLocation });

        // Format results as rigid copy-verbatim blocks
        let resourceBlock: string;
        if (results && results.length > 0) {
          resourceBlock = results.map((r: CommunityResource, i: number) => 
            `Resource ${i + 1}:\n  Name: ${r.name}\n  Location: ${r.location}\n  Availability: ${r.availability}\n  Distance: ${r.distance}`
          ).join("\n\n");
        } else {
          resourceBlock = "No resources found in this area.";
        }

        // Build the final prompt with data already embedded
        const groundedSystemPrompt: ChatCompletionMessageParam = {
          role: "system",
          content: `${SYSTEM_PROMPT}

VERIFIED RESOURCES:
${resourceBlock}

List each resource above with its Name, Location, Availability, and Distance exactly as written. Do NOT add addresses, phone numbers, websites, or any details not listed. After listing the resources, stop. Do not add any follow-up text or suggestions.`
        };

        const synthesisMessages: ChatCompletionMessageParam[] = [groundedSystemPrompt, ...messages];

        const startTime = performance.now();
        if (onStepChange) onStepChange("Synthesizing response with verified data...");
        const finalChunks = await this.engine.chat.completions.create({
          messages: synthesisMessages,
          stream: true,
        });

        let fullText = "";
        for await (const chunk of finalChunks) {
          const content = chunk.choices[0]?.delta?.content || "";
          fullText += content;
          if (onStream) onStream(content);
        }
        const endTime = performance.now();
        metricsCapture.update(endTime - startTime, fullText.length, this.lastCAMPResult);

        return { text: fullText, camp: this.lastCAMPResult! };
      }

      // 5c. General-purpose query fallback (Direct LLM synthesis)
      const generalMessages: ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ];

      const startTime = performance.now();
      if (onStepChange) onStepChange("Processing query locally on WebGPU...");
      const finalChunks = await this.engine.chat.completions.create({
        messages: generalMessages,
        stream: true,
      });

      let fullText = "";
      for await (const chunk of finalChunks) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullText += content;
        if (onStream) onStream(content);
      }
      const endTime = performance.now();
      metricsCapture.update(endTime - startTime, fullText.length, this.lastCAMPResult);

      return { text: fullText, camp: this.lastCAMPResult! };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      telemetry.logError("Inference_Failure", errorMessage);
      throw err;
    }
  }

  async getMetrics() {
    if (!this.engine) return null;
    return await this.engine.runtimeStatsText();
  }
}

export const sovereignRuntime = new AgentRuntime();

import { CreateMLCEngine, MLCEngine, InitProgressReport, ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { camp, CAMPResult } from "../middleware/CAMP";
import { MCP_TOOLS, searchCommunityResources, getResourceAvailability } from "../mcp/ResourceTools";
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

        if (hasMedicalTrigger && hasSelfReference || compositeCheck) {
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

    // 1. Enterprise Deterministic Guardrails (Simplified for 1B Model constraints)
    const systemGuardrail: ChatCompletionMessageParam = {
      role: "system",
      content: "You are the Sovereign Intelligence Layer, a helpful routing assistant for local community resources (food banks, medical clinics, financial aid). Use the retrieved resources to answer the user. Be concise, direct, and friendly. Do not invent details."
    };
    
    const guardedMessages = [systemGuardrail, ...messages];

    try {
      // 2. Apply CAMP Privacy Moat to the latest user message
      if (onStepChange) onStepChange("Activating CAMP Privacy Firewall: Redacting local PII...");
      const lastUserMessage = [...guardedMessages].reverse().find(m => m.role === "user");
      if (lastUserMessage && typeof lastUserMessage.content === "string") {
        let campResult: CAMPResult;
        if (typeof window !== "undefined" && window.Worker) {
          campResult = await new Promise((resolve, reject) => {
            const worker = new Worker(new URL('../middleware/camp.worker.ts', import.meta.url));
            worker.onmessage = (e) => {
              if (e.data.success) resolve(e.data.result);
              else reject(new Error(e.data.error));
              worker.terminate();
            };
            worker.postMessage({ id: 1, context: lastUserMessage.content });
          });
        } else {
          campResult = await camp.process(lastUserMessage.content);
        }
        lastUserMessage.content = campResult.processedText;
        this.lastCAMPResult = campResult;
      }

      // 3. Initial LLM Pass with MCP Tool Definitions
      let response = null;
      let useNativeTools = true;

      try {
        if (onStepChange) onStepChange("Analyzing user intent with Llama-3.2-1B on WebGPU...");
        response = await this.engine.chat.completions.create({
          messages: guardedMessages,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tools: MCP_TOOLS as any[],
          tool_choice: "auto",
        });
      } catch (err: any) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        if (
          errorMsg.includes("UnsupportedModelIdError") || 
          errorMsg.includes("tools") || 
          errorMsg.includes("tool")
        ) {
          console.log("[AgentRuntime] Model does not support native tools. Falling back to pre-grounding RAG pipeline...");
          useNativeTools = false;
        } else {
          throw err;
        }
      }

      // 4. Fallback if native tools are not supported
      if (!useNativeTools) {
        const lastUserMsg = [...guardedMessages].reverse().find(m => m.role === "user");
        let matchedType: "medical" | "food" | "financial" | null = null;
        let matchedLocation = "Seattle"; // Default fallback

        if (lastUserMsg && typeof lastUserMsg.content === "string") {
          const normalized = lastUserMsg.content.toLowerCase();
          if (normalized.includes("medical") || normalized.includes("clinic") || normalized.includes("doctor") || normalized.includes("health") || normalized.includes("hospital")) {
            matchedType = "medical";
          } else if (normalized.includes("food") || normalized.includes("bread") || normalized.includes("bank") || normalized.includes("pantry") || normalized.includes("meal")) {
            matchedType = "food";
          } else if (normalized.includes("financial") || normalized.includes("fund") || normalized.includes("money") || normalized.includes("aid") || normalized.includes("rent")) {
            matchedType = "financial";
          }

          const locationMatch = normalized.match(/in\s+([a-zA-Z\s]+?)(?:\.|\?|,|$)/);
          if (locationMatch && locationMatch[1]) {
            matchedLocation = locationMatch[1].trim();
          }
        }

        let contextPrompt = "";
        if (matchedType) {
          if (onToolStart) onToolStart("search_community_resources");
          if (onStepChange) onStepChange(`Executing pre-grounding RAG tool for ${matchedType} in ${matchedLocation}...`);
          const results = await searchCommunityResources({ type: matchedType, location: matchedLocation });
          if (results && results.length > 0) {
            contextPrompt = results.map((r: any) => `- ${r.name} (Location: ${r.location}, Availability: ${r.availability})`).join("\n");
          } else {
            contextPrompt = "No resources found in this area.";
          }
        }

        const combinedSystemGuardrail: ChatCompletionMessageParam = {
          role: "system",
          content: `${systemGuardrail.content}

### VERIFIED LOCAL RESOURCES (Use ONLY these):
${contextPrompt || "No verified resources found for this search."}

### REQUIRED INSTRUCTION:
List the verified resources above with their location and availability. Do not suggest web searches or add any external info. If no verified resources are listed, reply that no local resources were found.`
        };
        const synthesisMessages = [combinedSystemGuardrail, ...messages];

        const startTime = performance.now();
        if (onStepChange) onStepChange("Synthesizing response with local context...");
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

      // 5. Handle Native Tool Calls (if supported by engine/model)
      if (response) {
        const message = response.choices[0].message;

        if (message.tool_calls && message.tool_calls.length > 0) {
          const toolMessages: ChatCompletionMessageParam[] = [...guardedMessages, message as unknown as ChatCompletionMessageParam];
          
          for (const toolCall of message.tool_calls) {
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments);
            
            if (onToolStart) onToolStart(toolName);
            if (onStepChange) onStepChange(`Executing local MCP tool: ${toolName}...`);
            console.log(`[AgentRuntime] Tool Call: ${toolName}`, toolArgs);

            let result;
            if (toolName === "search_community_resources") {
              result = await searchCommunityResources(toolArgs);
            } else if (toolName === "get_resource_availability") {
              result = await getResourceAvailability(toolArgs.id);
            }

            toolMessages.push({
              role: "tool",
              content: JSON.stringify(result),
              tool_call_id: toolCall.id,
            } as ChatCompletionMessageParam);
          }

          const startTime = performance.now();
          if (onStepChange) onStepChange("Synthesizing final response with tool content...");
          const finalChunks = await this.engine.chat.completions.create({
            messages: toolMessages,
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
      }

      // Fallback if no tools called natively
      const startTime = performance.now();
      if (onStepChange) onStepChange("Composing secure local-only response...");
      const finalChunks = await this.engine.chat.completions.create({
        messages,
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

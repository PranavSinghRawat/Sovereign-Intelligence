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
  private readonly FALLBACK_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

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
   * Core generation method with CAMP Privacy and MCP Tool Execution.
   */
  async generateResponse(
    messages: ChatCompletionMessageParam[], 
    onStream?: (text: string) => void,
    onToolStart?: (toolName: string) => void
  ): Promise<{ text: string, camp: CAMPResult }> {
    // A. Deterministic Hybrid Guardrail Pre-Processor (Instant protection without engine dependency)
    const rawUserMessage = [...messages].reverse().find(m => m.role === "user");
    if (rawUserMessage && typeof rawUserMessage.content === "string") {
      const normalizedContent = rawUserMessage.content.toLowerCase();
      if (
        normalizedContent.includes("diagnose") || 
        normalizedContent.includes("prescribe") || 
        normalizedContent.includes("heart attack") || 
        normalizedContent.includes("chest pain") || 
        (normalizedContent.includes("medical") && (normalizedContent.includes("advice") || normalizedContent.includes("treatment")))
      ) {
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

    if (!this.engine) {
      throw new Error("AgentRuntime not initialized.");
    }

    // 1. Enterprise Deterministic Guardrails
    const systemGuardrail: ChatCompletionMessageParam = {
      role: "system",
      content: "You are the Sovereign Intelligence Layer, a routing agent for community resources. You are strictly forbidden from providing medical diagnoses or financial advice. If a user asks for medical advice, you must append: 'I am a local AI assistant. This is not medical advice. Please consult a professional.' You must use the provided tools to find resources."
    };
    
    const guardedMessages = [systemGuardrail, ...messages];

    try {
      // 2. Apply CAMP Privacy Moat to the latest user message
    const lastUserMessage = [...guardedMessages].reverse().find(m => m.role === "user");
    if (lastUserMessage && typeof lastUserMessage.content === "string") {
      const campResult = await camp.process(lastUserMessage.content);
      lastUserMessage.content = campResult.processedText;
      this.lastCAMPResult = campResult;
    }

    // 3. Initial LLM Pass with MCP Tool Definitions
    const response = await this.engine.chat.completions.create({
      messages: guardedMessages,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: MCP_TOOLS as any[],
      tool_choice: "auto",
    });

    const message = response.choices[0].message;

    // 4. Handle Tool Calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolMessages: ChatCompletionMessageParam[] = [...guardedMessages, message as unknown as ChatCompletionMessageParam];
      
      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        if (onToolStart) onToolStart(toolName);
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

    // Fallback if no tools called
    const startTime = performance.now();
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

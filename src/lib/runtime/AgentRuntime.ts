import { CreateMLCEngine, MLCEngine, InitProgressReport, ModelRecord, ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { camp, CAMPResult } from "../middleware/CAMP";
import { MCP_TOOLS, searchCommunityResources, getResourceAvailability } from "../mcp/ResourceTools";

/**
 * Sovereign Intelligence Layer - AgentRuntime
 */
export class AgentRuntime {
  private engine: MLCEngine | null = null;
  private lastCAMPResult: CAMPResult | null = null;
  
  private readonly PRIMARY_MODEL = "Phi-4-mini-instruct-q4f16_1-MLC";
  private readonly FALLBACK_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

  async initialize(onProgress?: (progress: InitProgressReport) => void): Promise<void> {
    if (this.engine) return;

    try {
      this.engine = await CreateMLCEngine(this.PRIMARY_MODEL, {
        initProgressCallback: onProgress,
        appConfig: {
          model_list: [
            {
              model: `https://huggingface.co/mlc-ai/${this.PRIMARY_MODEL}`,
              model_id: this.PRIMARY_MODEL,
              model_lib: `https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/phi-4-mini/phi-4-mini-q4f16_1-v1.wasm`,
            } as ModelRecord,
          ],
        },
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
    } catch {
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
    if (!this.engine) {
      throw new Error("AgentRuntime not initialized.");
    }

    // 1. Apply CAMP Privacy Moat to the latest user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMessage && typeof lastUserMessage.content === "string") {
      const campResult = await camp.process(lastUserMessage.content);
      lastUserMessage.content = campResult.processedText;
      this.lastCAMPResult = campResult;
    }

    // 2. Initial LLM Pass with MCP Tool Definitions
    const response = await this.engine.chat.completions.create({
      messages,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: MCP_TOOLS as any[],
      tool_choice: "auto",
    });

    const message = response.choices[0].message;

    // 3. Handle Tool Calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolMessages: ChatCompletionMessageParam[] = [...messages, message as unknown as ChatCompletionMessageParam];
      
      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        if (onToolStart) onToolStart(toolName);
        console.log(`[AgentRuntime] Tool Call: ${toolName}`, toolArgs);

        let result;
        if (toolName === "search_community_resources") {
          result = searchCommunityResources(toolArgs);
        } else if (toolName === "get_resource_availability") {
          result = getResourceAvailability(toolArgs.id);
        }

        toolMessages.push({
          role: "tool",
          content: JSON.stringify(result),
          tool_call_id: toolCall.id,
        } as ChatCompletionMessageParam);
      }

      // 4. Final Pass with Tool Results
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

      return { text: fullText, camp: this.lastCAMPResult! };
    }

    return { text: message.content || "", camp: this.lastCAMPResult! };
  }

  async getMetrics() {
    if (!this.engine) return null;
    return await this.engine.runtimeStatsText();
  }
}

export const sovereignRuntime = new AgentRuntime();

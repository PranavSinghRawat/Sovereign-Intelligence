import { CreateMLCEngine, MLCEngine, InitProgressReport, ModelRecord } from "@mlc-ai/web-llm";
import { camp, CAMPResult } from "../middleware/CAMP";

/**
 * Sovereign Intelligence Layer - AgentRuntime
 * 
 * Optimized for M1 MacBook Air (Unified Memory) using WebGPU.
 * Manages the lifecycle of local-first LLM inference with CAMP Privacy.
 */
export class AgentRuntime {
  private engine: MLCEngine | null = null;
  private lastCAMPResult: CAMPResult | null = null;
  
  // Model IDs for MLC-compiled versions
  private readonly PRIMARY_MODEL = "Phi-4-mini-instruct-q4f16_1-MLC";
  private readonly FALLBACK_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

  /**
   * Initializes the WebLLM engine with the primary model.
   */
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
    } catch (error) {
      await this.handleFallback(onProgress);
    }
  }

  private async handleFallback(onProgress?: (progress: InitProgressReport) => void): Promise<void> {
    try {
      this.engine = await CreateMLCEngine(this.FALLBACK_MODEL, {
        initProgressCallback: onProgress
      });
    } catch (fallbackError) {
      throw new Error("Local Inference Unavailable. Check WebGPU support.");
    }
  }

  /**
   * Core generation method with CAMP Middleware integration.
   */
  async generateResponse(messages: any[], onStream?: (text: string) => void): Promise<{ text: string, camp: CAMPResult }> {
    if (!this.engine) {
      throw new Error("AgentRuntime not initialized.");
    }

    // Apply CAMP Privacy Moat to the latest message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      const campResult = await camp.process(lastMessage.content);
      lastMessage.content = campResult.processedText;
      this.lastCAMPResult = campResult;
    }

    const chunks = await this.engine.chat.completions.create({
      messages,
      stream: true,
    });

    let fullText = "";
    for await (const chunk of chunks) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullText += content;
      if (onStream) onStream(content);
    }

    return { 
      text: fullText, 
      camp: this.lastCAMPResult! 
    };
  }

  async getMetrics() {
    if (!this.engine) return null;
    return await this.engine.runtimeStatsText();
  }
}

export const sovereignRuntime = new AgentRuntime();

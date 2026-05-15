import { CreateMLCEngine, MLCEngine, InitProgressReport, ModelRecord } from "@mlc-ai/web-llm";

/**
 * Sovereign Intelligence Layer - AgentRuntime
 * 
 * Optimized for M1 MacBook Air (Unified Memory) using WebGPU.
 * Manages the lifecycle of local-first LLM inference.
 */
export class AgentRuntime {
  private engine: MLCEngine | null = null;
  
  // Model IDs for MLC-compiled versions
  private readonly PRIMARY_MODEL = "Phi-4-mini-instruct-q4f16_1-MLC";
  private readonly FALLBACK_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

  /**
   * Initializes the WebLLM engine with the primary model.
   * Leverages WebGPU for near-native performance on M1 Silicon.
   */
  async initialize(onProgress?: (progress: InitProgressReport) => void): Promise<void> {
    if (this.engine) {
      console.log("[AgentRuntime] Engine already initialized.");
      return;
    }

    try {
      console.log(`[AgentRuntime] Initializing local engine with ${this.PRIMARY_MODEL}...`);
      
      this.engine = await CreateMLCEngine(this.PRIMARY_MODEL, {
        initProgressCallback: (report) => {
          console.log(`[WebLLM Load Progress]: ${report.text}`);
          if (onProgress) onProgress(report);
        },
        // M1 Optimization: Ensure we target the GPU via WebGPU
        appConfig: {
          model_list: [
            {
              model: `https://huggingface.co/mlc-ai/${this.PRIMARY_MODEL}`,
              model_id: this.PRIMARY_MODEL,
              // Optimized WASM binary for Phi-4-mini
              model_lib: `https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/phi-4-mini/phi-4-mini-q4f16_1-v1.wasm`,
            } as ModelRecord,
          ],
        },
      });

      console.log("[AgentRuntime] Sovereign Intelligence Layer initialized via WebGPU.");
    } catch (error) {
      console.error("[AgentRuntime] Primary initialization failed:", error);
      await this.handleFallback(onProgress);
    }
  }

  /**
   * Fallback logic for low-resource environments or WebGPU failures.
   */
  private async handleFallback(onProgress?: (progress: InitProgressReport) => void): Promise<void> {
    console.warn(`[AgentRuntime] Attempting fallback to ${this.FALLBACK_MODEL}...`);
    try {
      this.engine = await CreateMLCEngine(this.FALLBACK_MODEL, {
        initProgressCallback: onProgress
      });
      console.log("[AgentRuntime] Fallback engine initialized successfully.");
    } catch (fallbackError) {
      console.error("[AgentRuntime] Critical Error: All local models failed to load.", fallbackError);
      throw new Error("Local Inference Unavailable. Check WebGPU support.");
    }
  }

  /**
   * Core generation method.
   * All reasoning happens entirely within the browser's GPU memory.
   */
  async generateResponse(messages: any[], onStream?: (text: string) => void): Promise<string> {
    if (!this.engine) {
      throw new Error("AgentRuntime not initialized. Call initialize() first.");
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

    return fullText;
  }

  /**
   * Returns current engine stats for the Metrics dashboard.
   */
  async getMetrics() {
    if (!this.engine) return null;
    // Note: runtimeStats is a MLC feature to track tokens/sec
    return await this.engine.runtimeStats();
  }
}

// Export a singleton instance for use across the Next.js app
export const sovereignRuntime = new AgentRuntime();

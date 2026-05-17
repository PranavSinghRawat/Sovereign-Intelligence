import { vi, describe, it, expect } from "vitest";

// Mock @mlc-ai/web-llm to prevent CommonJS/ESM require errors in Vitest Node environment
vi.mock("@mlc-ai/web-llm", () => {
  return {
    CreateMLCEngine: vi.fn(),
    MLCEngine: vi.fn(),
  };
});

import { sovereignRuntime } from "../lib/runtime/AgentRuntime";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";

describe("AgentRuntime - Hybrid Safety Guardrails", () => {
  it("should intercept self-referencing medical diagnosis prompts", async () => {
    const dangerousQuery: ChatCompletionMessageParam[] = [
      { role: "user", content: "I have heavy chest pain, am i having a heart attack?" }
    ];

    const response = await sovereignRuntime.generateResponse(dangerousQuery);

    expect(response.text).toContain("strictly forbidden from providing medical diagnoses");
    expect(response.text).toContain("Please seek professional medical attention immediately");
  });

  it("should block self-referencing prescription requests", async () => {
    const dangerousQuery: ChatCompletionMessageParam[] = [
      { role: "user", content: "Should i take antibiotics? Can you prescribe me some?" }
    ];

    const response = await sovereignRuntime.generateResponse(dangerousQuery);

    expect(response.text).toContain("strictly forbidden from providing medical diagnoses");
  });

  it("should NOT block pet-related medical questions (false positive prevention)", async () => {
    const safeQuery: ChatCompletionMessageParam[] = [
      { role: "user", content: "My cat was diagnosed with a cold, what food should I get?" }
    ];

    // This should NOT trigger the guardrail — it should pass through and hit the engine check
    await expect(sovereignRuntime.generateResponse(safeQuery)).rejects.toThrow("AgentRuntime not initialized.");
  });

  it("should throw initialization error for standard prompts if engine is not initialized", async () => {
    const standardQuery: ChatCompletionMessageParam[] = [
      { role: "user", content: "Where is the nearest food bank?" }
    ];

    await expect(sovereignRuntime.generateResponse(standardQuery)).rejects.toThrow("AgentRuntime not initialized.");
  });
});

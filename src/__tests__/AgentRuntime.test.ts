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

  it("should throw initialization error for standard resource queries if engine is not initialized", async () => {
    const standardQuery: ChatCompletionMessageParam[] = [
      { role: "user", content: "Where is the nearest food bank in Seattle?" }
    ];

    await expect(sovereignRuntime.generateResponse(standardQuery)).rejects.toThrow("AgentRuntime not initialized.");
  });

  it("should route general-purpose chat queries to the LLM", async () => {
    const mockCreate = vi.fn(() => {
      throw new Error("LLM Engine call reached for general chat");
    });
    (sovereignRuntime as unknown as { engine: unknown }).engine = {
      chat: {
        completions: {
          create: mockCreate
        }
      }
    };

    const codingQuery: ChatCompletionMessageParam[] = [
      { role: "user", content: "Write a JavaScript function to reverse a string." }
    ];

    await expect(sovereignRuntime.generateResponse(codingQuery)).rejects.toThrow("LLM Engine call reached for general chat");
    expect(mockCreate).toHaveBeenCalled();

    // Verify the system prompt has the general chat rules
    const lastCall = (mockCreate.mock.calls as unknown as [ [ { messages: { content: string }[] } ] ])[0][0];
    const systemPrompt = lastCall.messages[0].content;
    expect(systemPrompt).toContain("General Chat: You can assist with general-purpose requests");

    // Cleanup
    (sovereignRuntime as unknown as { engine: unknown }).engine = null;
  });

  it("should route weather queries to the weather tool, execute fetch, and then call the LLM engine", async () => {
    const mockFetch = vi.fn((url: string) => {
      if (url.includes("geocoding-api")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            results: [{ latitude: 47.6, longitude: -122.3, name: "Seattle", country: "United States" }]
          })
        } as Response);
      }
      if (url.includes("api.open-meteo.com")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            current: {
              temperature_2m: 15.5,
              apparent_temperature: 14.2,
              precipitation: 0.0,
              weather_code: 1,
              wind_speed_10m: 10.0
            }
          })
        } as Response);
      }
      return Promise.reject(new Error("Unknown URL"));
    });
    vi.stubGlobal("fetch", mockFetch);

    const mockCreate = vi.fn(() => {
      throw new Error("LLM Engine call reached for weather");
    });
    (sovereignRuntime as unknown as { engine: unknown }).engine = {
      chat: {
        completions: {
          create: mockCreate
        }
      }
    };

    const weatherQuery: ChatCompletionMessageParam[] = [
      { role: "user", content: "What is the weather in Seattle?" }
    ];

    // Triggers weather fetch tool successfully first, then reaches LLM engine step
    await expect(sovereignRuntime.generateResponse(weatherQuery)).rejects.toThrow("LLM Engine call reached for weather");

    expect(mockFetch).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalled();

    // Verify the arguments passed to the LLM engine contain weather data
    const lastCall = (mockCreate.mock.calls as unknown as [ [ { messages: { content: string }[] } ] ])[0][0];
    const systemPrompt = lastCall.messages[0].content;
    expect(systemPrompt).toContain("CURRENT WEATHER:");
    expect(systemPrompt).toContain("Temperature: 15.5°C");

    // Cleanup
    (sovereignRuntime as unknown as { engine: unknown }).engine = null;
    vi.unstubAllGlobals();
  });
});

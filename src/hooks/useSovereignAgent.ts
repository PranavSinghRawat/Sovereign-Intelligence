import { useState, useEffect, useCallback } from "react";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { sovereignRuntime } from "@/lib/runtime/AgentRuntime";
import { metricsCapture, SystemMetrics } from "@/lib/metrics/MetricsCapture";
import { CAMPResult } from "@/lib/middleware/CAMP";
import { SearchResult } from "@/lib/runtime/RAGManager";

export type ExtendedChatMessage = ChatCompletionMessageParam & {
  ragSources?: SearchResult[];
};

export function useSovereignAgent() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [initProgress, setInitProgress] = useState("Waking up local engine...");
  const [lastCamp, setLastCamp] = useState<CAMPResult | null>(null);
  const [toolExecuting, setToolExecuting] = useState<string | null>(null);
  const [thinkingStep, setThinkingStep] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics>(metricsCapture.getMetrics());

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        await sovereignRuntime.initialize((report) => {
          if (isMounted) setInitProgress(report.text);
        });
        if (isMounted) setIsInitializing(false);
      } catch {
        if (isMounted) setInitProgress("WebGPU Error: Please use a compatible browser.");
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
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: ExtendedChatMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    setToolExecuting(null);
    setThinkingStep("Evaluating Safety Intercepts...");

    try {
      let streamingText = "";
      const result = await sovereignRuntime.generateResponse(
        [...messages, userMessage],
        (chunk) => {
          setThinkingStep(null); // Clear progress text once actual token stream starts
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
      setMetrics(metricsCapture.getMetrics());

      // If we got RAG sources, store them in the last assistant message
      if (result.ragSources && result.ragSources.length > 0) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...last, ragSources: result.ragSources }
            ];
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("[Agent Error]", err);
    } finally {
      setIsThinking(false);
      setToolExecuting(null);
      setThinkingStep(null);
    }
  };

  const addExternalMessage = useCallback((msg: ChatCompletionMessageParam) => {
    setMessages(prev => [...prev, msg]);
  }, []);

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
    metrics,
    handleSend,
    addExternalMessage
  };
}

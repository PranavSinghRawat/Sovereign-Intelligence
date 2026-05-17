import { useState, useEffect } from "react";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { sovereignRuntime } from "@/lib/runtime/AgentRuntime";
import { metricsCapture, SystemMetrics } from "@/lib/metrics/MetricsCapture";
import { CAMPResult } from "@/lib/middleware/CAMP";

export function useSovereignAgent() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [initProgress, setInitProgress] = useState("Waking up local engine...");
  const [lastCamp, setLastCamp] = useState<CAMPResult | null>(null);
  const [toolExecuting, setToolExecuting] = useState<string | null>(null);
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
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: ChatCompletionMessageParam = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    setToolExecuting(null);

    try {
      let streamingText = "";
      const result = await sovereignRuntime.generateResponse(
        [...messages, userMessage],
        (chunk) => {
          streamingText += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant") {
              return [...prev.slice(0, -1), { role: "assistant", content: streamingText } as ChatCompletionMessageParam];
            }
            return [...prev, { role: "assistant", content: streamingText } as ChatCompletionMessageParam];
          });
        },
        (toolName) => {
          setToolExecuting(toolName);
        }
      );

      setLastCamp(result.camp);
      setMetrics(metricsCapture.getMetrics());
    } catch (err) {
      console.error("[Agent Error]", err);
    } finally {
      setIsThinking(false);
      setToolExecuting(null);
    }
  };

  return {
    input,
    setInput,
    messages,
    isInitializing,
    isThinking,
    initProgress,
    lastCamp,
    toolExecuting,
    metrics,
    handleSend
  };
}

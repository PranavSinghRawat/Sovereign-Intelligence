import { useState, useEffect, useCallback } from "react";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { sovereignRuntime } from "@/lib/runtime/AgentRuntime";
import { metricsCapture } from "@/lib/metrics/MetricsCapture";
import { useAgentStore, ExtendedChatMessage } from "@/store/agentStore";

export function useSovereignAgent() {
  const [input, setInput] = useState("");
  
  // Zustand store mappings
  const messages = useAgentStore((state) => state.messages);
  const setMessages = useAgentStore((state) => state.setMessages);
  const addMessage = useAgentStore((state) => state.addMessage);
  
  const isInitializing = useAgentStore((state) => state.isInitializing);
  const setIsInitializing = useAgentStore((state) => state.setIsInitializing);
  
  const isThinking = useAgentStore((state) => state.isThinking);
  const setIsThinking = useAgentStore((state) => state.setIsThinking);
  
  const initProgress = useAgentStore((state) => state.initProgress);
  const setInitProgress = useAgentStore((state) => state.setInitProgress);
  
  const lastCamp = useAgentStore((state) => state.lastCamp);
  const setLastCamp = useAgentStore((state) => state.setLastCamp);
  
  const toolExecuting = useAgentStore((state) => state.toolExecuting);
  const setToolExecuting = useAgentStore((state) => state.setToolExecuting);
  
  const thinkingStep = useAgentStore((state) => state.thinkingStep);
  const setThinkingStep = useAgentStore((state) => state.setThinkingStep);
  
  const metrics = useAgentStore((state) => state.metrics);
  const setMetrics = useAgentStore((state) => state.setMetrics);

  useEffect(() => {
    let isMounted = true;
    
    // Initial fetch to make sure metrics aren't null on first render
    if (isMounted) setMetrics(metricsCapture.getMetrics());
    
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
  }, [setInitProgress, setIsInitializing, setMetrics]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: ExtendedChatMessage = { role: "user", content: input };
    addMessage(userMessage);
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
    addMessage(msg);
  }, [addMessage]);

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
    metrics: metrics || metricsCapture.getMetrics(), // Fallback if null
    handleSend,
    addExternalMessage
  };
}

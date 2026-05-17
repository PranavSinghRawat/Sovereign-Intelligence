import { useState, useEffect } from "react";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { sovereignRuntime } from "@/lib/runtime/AgentRuntime";
import { metricsCapture, SystemMetrics } from "@/lib/metrics/MetricsCapture";
import { CAMPResult } from "@/lib/middleware/CAMP";
import { p2pNode } from "@/lib/network/WebRTCNode";

export function useSovereignAgent() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [initProgress, setInitProgress] = useState("Waking up local engine...");
  const [lastCamp, setLastCamp] = useState<CAMPResult | null>(null);
  const [toolExecuting, setToolExecuting] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics>(metricsCapture.getMetrics());

  // WebRTC P2P manual signaling state
  const [p2pStatus, setP2pStatus] = useState<RTCPeerConnectionState>("new");
  const [offerCode, setOfferCode] = useState("");
  const [answerCode, setAnswerCode] = useState("");
  const [peerCodeInput, setPeerCodeInput] = useState("");

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

    p2pNode.onStatusChange((status) => {
      if (isMounted) setP2pStatus(status);
    });

    p2pNode.onReceiveData((data: unknown) => {
      console.log("[P2P Hook Received]:", data);
      const parsed = data as { text?: string };
      if (isMounted && parsed?.text) {
        setMessages(prev => [...prev, { role: "assistant", content: `[P2P Node]: ${parsed.text}` } as ChatCompletionMessageParam]);
      }
    });

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

  const handleGenerateOffer = async () => {
    try {
      const offer = await p2pNode.createOffer();
      setOfferCode(offer);
    } catch (err) {
      console.error("[P2P Generate Offer Failed]", err);
    }
  };

  const handleAcceptOffer = async (invite: string) => {
    try {
      const answer = await p2pNode.acceptOffer(invite);
      setAnswerCode(answer);
    } catch (err) {
      console.error("[P2P Accept Offer Failed]", err);
    }
  };

  const handleCompleteConnection = async (answer: string) => {
    try {
      await p2pNode.acceptAnswer(answer);
    } catch (err) {
      console.error("[P2P Accept Answer Failed]", err);
    }
  };

  const handleSendP2PData = (text: string) => {
    p2pNode.sendResourceData({ text });
    setMessages(prev => [...prev, { role: "user", content: `[P2P Sent]: ${text}` } as ChatCompletionMessageParam]);
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
    handleSend,
    // P2P State
    p2pStatus,
    offerCode,
    answerCode,
    peerCodeInput,
    setPeerCodeInput,
    // P2P Handlers
    handleGenerateOffer,
    handleAcceptOffer,
    handleCompleteConnection,
    handleSendP2PData,
  };
}

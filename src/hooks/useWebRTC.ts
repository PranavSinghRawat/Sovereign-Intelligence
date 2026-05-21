import { useState, useEffect, useRef } from "react";
import { p2pNode } from "@/lib/network/WebRTCNode";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";

export function useWebRTC(onReceiveMessage: (msg: ChatCompletionMessageParam) => void) {
  const [p2pStatus, setP2pStatus] = useState<RTCPeerConnectionState>("new");
  const [offerCode, setOfferCode] = useState("");
  const [answerCode, setAnswerCode] = useState("");
  const [peerCodeInput, setPeerCodeInput] = useState("");

  const onReceiveRef = useRef(onReceiveMessage);

  useEffect(() => {
    onReceiveRef.current = onReceiveMessage;
  }, [onReceiveMessage]);

  useEffect(() => {
    let isMounted = true;

    p2pNode.onStatusChange((status) => {
      if (isMounted) setP2pStatus(status);
    });

    p2pNode.onReceiveData((data: unknown) => {
      console.log("[P2P Hook Received]:", data);
      const parsed = data as { text?: string };
      if (isMounted && parsed?.text) {
        onReceiveRef.current({ role: "assistant", content: `[P2P Node]: ${parsed.text}` } as ChatCompletionMessageParam);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleSendP2PData = async (text: string) => {
    await p2pNode.sendResourceData({ text });
    // Optimistic UI update via callback
    onReceiveMessage({ role: "user", content: `[P2P Sent]: ${text}` } as ChatCompletionMessageParam);
  };

  return {
    p2pStatus,
    offerCode,
    answerCode,
    peerCodeInput,
    setPeerCodeInput,
    handleGenerateOffer,
    handleAcceptOffer,
    handleCompleteConnection,
    handleSendP2PData,
  };
}

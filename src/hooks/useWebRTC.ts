import { useState, useEffect, useRef } from "react";
import { p2pNode } from "@/lib/network/WebRTCNode";
import { ZKSignalingChannel } from "@/lib/network/ZKSignaling";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";

export function useWebRTC(onReceiveMessage: (msg: ChatCompletionMessageParam) => void) {
  const [p2pStatus, setP2pStatus] = useState<RTCPeerConnectionState>("new");
  const [offerCode, setOfferCode] = useState("");
  const [answerCode, setAnswerCode] = useState("");
  const [peerCodeInput, setPeerCodeInput] = useState("");
  
  // ZK-Signaling states
  const [roomPassphrase, setRoomPassphrase] = useState("");
  const [isSignaling, setIsSignaling] = useState(false);
  const [signalingLogs, setSignalingLogs] = useState<string[]>([]);

  const onReceiveRef = useRef(onReceiveMessage);
  const signalingChannelRef = useRef<ZKSignalingChannel | null>(null);

  useEffect(() => {
    onReceiveRef.current = onReceiveMessage;
  }, [onReceiveMessage]);

  useEffect(() => {
    let isMounted = true;

    p2pNode.onStatusChange((status) => {
      if (isMounted) {
        setP2pStatus(status);
        if (status === "connected") {
          // Connection established! Safe to close signaling channels.
          if (signalingChannelRef.current) {
            signalingChannelRef.current.close();
            signalingChannelRef.current = null;
          }
          setIsSignaling(false);
        }
      }
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
      if (signalingChannelRef.current) {
        signalingChannelRef.current.close();
      }
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
    onReceiveRef.current({ role: "user", content: `[P2P Sent]: ${text}` } as ChatCompletionMessageParam);
  };

  // ZK-Signaling Host flow
  const handleInitZKSignaling = async (passphrase: string) => {
    if (!passphrase.trim()) return;
    setIsSignaling(true);
    setSignalingLogs([]);

    const log = (msg: string) => {
      setSignalingLogs((prev) => [...prev, `[Host] ${msg}`]);
    };

    try {
      log("Initializing host session...");

      if (signalingChannelRef.current) {
        signalingChannelRef.current.close();
      }

      const channel = new ZKSignalingChannel(
        passphrase,
        async (msg) => {
          if (msg.type === "ping") {
            log("Peer ping received. Re-publishing encrypted Offer...");
            const currentOffer = await p2pNode.createOffer();
            await channel.send("offer", currentOffer);
          } else if (msg.type === "answer" && msg.payload) {
            log("Encrypted SDP Answer received from peer.");
            try {
              const answer = await channel.decrypt(msg.payload);
              log("SDP Answer decrypted. Completing Link...");
              await p2pNode.acceptAnswer(answer);
              log("WebRTC link completed. Awaiting peer connection...");
            } catch (err) {
              log(`Error processing answer: ${err}`);
            }
          }
        },
        log
      );

      signalingChannelRef.current = channel;
      await channel.initialize();

      log("Generating local SDP Offer (NAT discovery)...");
      const offer = await p2pNode.createOffer();
      log("SDP Offer generated. Waiting for peer...");

      await channel.send("offer", offer);
      log("Encrypted SDP Offer published. Listening...");
    } catch (err) {
      log(`Host initialization failed: ${err}`);
      setIsSignaling(false);
    }
  };

  // ZK-Signaling Joiner flow
  const handleJoinZKSignaling = async (passphrase: string) => {
    if (!passphrase.trim()) return;
    setIsSignaling(true);
    setSignalingLogs([]);

    const log = (msg: string) => {
      setSignalingLogs((prev) => [...prev, `[Joiner] ${msg}`]);
    };

    try {
      log("Initializing joiner session...");

      if (signalingChannelRef.current) {
        signalingChannelRef.current.close();
      }

      const channel = new ZKSignalingChannel(
        passphrase,
        async (msg) => {
          if (msg.type === "offer" && msg.payload) {
            log("Encrypted SDP Offer received from host.");
            try {
              const offer = await channel.decrypt(msg.payload);
              log("SDP Offer decrypted. Generating SDP Answer...");
              const answer = await p2pNode.acceptOffer(offer);
              log("SDP Answer generated.");
              await channel.send("answer", answer);
              log("Encrypted SDP Answer published. Awaiting connection...");
            } catch (err) {
              log(`Error processing offer: ${err}`);
            }
          }
        },
        log
      );

      signalingChannelRef.current = channel;
      await channel.initialize();

      log("Sending peer ping to notify host...");
      await channel.send("ping");
    } catch (err) {
      log(`Joiner initialization failed: ${err}`);
      setIsSignaling(false);
    }
  };

  const handleCancelZKSignaling = () => {
    if (signalingChannelRef.current) {
      signalingChannelRef.current.close();
      signalingChannelRef.current = null;
    }
    setIsSignaling(false);
    setSignalingLogs([]);
    p2pNode.reset();
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
    // Export new ZK-Signaling features
    roomPassphrase,
    setRoomPassphrase,
    isSignaling,
    signalingLogs,
    handleInitZKSignaling,
    handleJoinZKSignaling,
    handleCancelZKSignaling,
  };
}


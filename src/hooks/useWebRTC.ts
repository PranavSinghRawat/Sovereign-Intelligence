import { useState, useEffect, useRef } from "react";
import { p2pNode } from "@/lib/network/WebRTCNode";
import { ZKSignalingChannel } from "@/lib/network/ZKSignaling";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { initAgentIdentity } from "@/lib/network/Identity";

export function useWebRTC(onReceiveMessage: (msg: ChatCompletionMessageParam) => void) {
  const [p2pStatus, setP2pStatus] = useState<RTCPeerConnectionState>("new");
  const [offerCode, setOfferCode] = useState("");
  const [answerCode, setAnswerCode] = useState("");
  const [peerCodeInput, setPeerCodeInput] = useState("");
  
  // ZK-Signaling states
  const [roomPassphrase, setRoomPassphrase] = useState("");
  const [isSignaling, setIsSignaling] = useState(false);
  const [signalingLogs, setSignalingLogs] = useState<string[]>([]);
  const [localPubKey, setLocalPubKey] = useState("");
  const [peerPubKey, setPeerPubKey] = useState("");
  const [isFirewallBlocked, setIsFirewallBlocked] = useState(false);

  const onReceiveRef = useRef(onReceiveMessage);
  const signalingChannelRef = useRef<ZKSignalingChannel | null>(null);
  const connectionTimeoutRef = useRef<any>(null);

  useEffect(() => {
    initAgentIdentity()
      .then((key) => setLocalPubKey(key))
      .catch((err) => console.error("[WebRTC] Identity initialization failed:", err));
  }, []);

  useEffect(() => {
    onReceiveRef.current = onReceiveMessage;
  }, [onReceiveMessage]);

  useEffect(() => {
    let isMounted = true;

    p2pNode.onStatusChange((status) => {
      if (isMounted) {
        setP2pStatus(status);

        // Clear existing timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        if (status === "connected") {
          setSignalingLogs((prev) => [...prev, "[System] WebRTC connected. Signaling channel retained for self-healing."]);
          setIsSignaling(false);
          setIsFirewallBlocked(false);
        } else if (status === "connecting") {
          // Set a 15-second timer to detect Symmetric NAT blockage
          connectionTimeoutRef.current = setTimeout(() => {
            setP2pStatus((currentStatus) => {
              if (currentStatus !== "connected") {
                setIsFirewallBlocked(true);
                setSignalingLogs((prev) => [...prev, "[Warning] Connection taking too long. Possible Symmetric NAT/firewall block detected."]);
              }
              return currentStatus;
            });
          }, 15000);
        } else if (status === "failed") {
          setIsFirewallBlocked(true);
          setSignalingLogs((prev) => [...prev, "[Error] WebRTC link failed. Symmetric NAT blocking direct connection."]);
        }
      }
    });

    p2pNode.onIceCandidate(async (candidate) => {
      const channel = signalingChannelRef.current;
      if (channel) {
        try {
          await channel.send("ice-candidate", candidate);
        } catch (err) {
          console.error("[WebRTC] Failed to send ICE candidate:", err);
        }
      }
    });

    // Self-healing: when ICE restart is needed, re-use retained signaling channel
    p2pNode.onIceRestartNeeded(async () => {
      const channel = signalingChannelRef.current;
      if (!channel) {
        console.warn("[ICE Restart] No signaling channel available for recovery.");
        return;
      }
      try {
        setSignalingLogs((prev) => [...prev, "[ICE Restart] Connection dropped. Attempting ICE restart..."]);
        setIsSignaling(true);
        const newOffer = await p2pNode.performIceRestart();
        await channel.send("offer", newOffer);
        setSignalingLogs((prev) => [...prev, "[ICE Restart] New SDP offer published. Awaiting peer response..."]);
      } catch (err) {
        console.error("[ICE Restart] Failed:", err);
        setSignalingLogs((prev) => [...prev, `[ICE Restart] Failed: ${err}`]);
        setIsSignaling(false);
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
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
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
          if (msg.pubKey) {
            setPeerPubKey(msg.pubKey);
          }
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
          } else if (msg.type === "ice-candidate" && msg.payload) {
            try {
              const candidate = await channel.decrypt(msg.payload);
              await p2pNode.addIceCandidate(candidate);
            } catch (err) {
              log(`Error processing remote ICE candidate: ${err}`);
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
          if (msg.pubKey) {
            setPeerPubKey(msg.pubKey);
          }
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
          } else if (msg.type === "ice-candidate" && msg.payload) {
            try {
              const candidate = await channel.decrypt(msg.payload);
              await p2pNode.addIceCandidate(candidate);
            } catch (err) {
              log(`Error processing remote ICE candidate: ${err}`);
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
    setPeerPubKey("");
    setIsFirewallBlocked(false);
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
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
    localPubKey,
    peerPubKey,
    isFirewallBlocked,
  };
}


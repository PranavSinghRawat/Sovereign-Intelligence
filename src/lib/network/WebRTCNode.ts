/**
 * WebRTC Node - True P2P Decentralization (`agent://` Protocol Backend)
 * 
 * Establishes direct browser-to-browser data channels bypassing central APIs.
 * Uses Google's free public STUN servers for NAT Traversal.
 */

import { encryptPayload, decryptPayload } from "./Encryption";

export class WebRTCNode {
  private peerConnection!: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;
  private encryptionSeed: string | null = null;
  private onMessageCallback: ((data: unknown) => void) | null = null;
  private onStatusChangeCallback: ((status: RTCPeerConnectionState) => void) | null = null;
  private onIceRestartNeededCallback: (() => void) | null = null;
  private iceRestartAttempts = 0;
  private static MAX_ICE_RESTARTS = 3;

  constructor() {
    // Prevent SSR crashes during Next.js production builds
    if (typeof window !== "undefined") {
      this.initPeerConnection();
    }
  }

  /**
   * Creates a fresh RTCPeerConnection. Called on construction and on reset().
   */
  private initPeerConnection() {
    const stunServer = process.env.NEXT_PUBLIC_STUN_SERVER || "stun:stun.l.google.com:19302";
    const iceServers: RTCIceServer[] = [{ urls: stunServer }];

    const turnServer = process.env.NEXT_PUBLIC_TURN_SERVER;
    if (turnServer) {
      iceServers.push({
        urls: turnServer,
        username: process.env.NEXT_PUBLIC_TURN_USERNAME || "",
        credential: process.env.NEXT_PUBLIC_TURN_PASSWORD || "",
      });
    }

    this.peerConnection = new RTCPeerConnection({ iceServers });

    // Listen for connection status changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      console.log("[WebRTC] Connection State:", state);
      if (this.onStatusChangeCallback) {
        this.onStatusChangeCallback(state);
      }

      // Self-healing: trigger ICE restart on transient failures
      if (state === "connected") {
        this.iceRestartAttempts = 0; // Reset on successful connection
      } else if ((state === "disconnected" || state === "failed") && this.iceRestartAttempts < WebRTCNode.MAX_ICE_RESTARTS) {
        console.log(`[WebRTC] Connection ${state}. Attempting ICE restart (${this.iceRestartAttempts + 1}/${WebRTCNode.MAX_ICE_RESTARTS})...`);
        if (this.onIceRestartNeededCallback) {
          this.onIceRestartNeededCallback();
        }
      }
    };

    // Listen for incoming data channels (if we are the Answerer)
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
  }

  /**
   * Tears down the current connection and creates a fresh one.
   * Allows reconnecting to a different peer without reloading the page.
   */
  reset() {
    try {
      if (this.dataChannel) this.dataChannel.close();
      this.peerConnection.close();
    } catch {
      // Silently handle already-closed connections
    }
    this.dataChannel = null;
    this.encryptionSeed = null;
    this.initPeerConnection();
    console.log("[WebRTC] Connection reset. Ready for new peer.");
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback("new");
    }
  }

  /**
   * Generates an Offer to initiate a connection.
   * In a real app, this SDP string is sent via a Signaling Server (or copy-pasted).
   */
  async createOffer(): Promise<string> {
    // We are the Offerer, so we create the channel
    this.dataChannel = this.peerConnection.createDataChannel("sovereign-agent-protocol");
    this.setupDataChannel();

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Wait for ICE candidates to gather
    const offerString = await new Promise<string>((resolve) => {
      if (this.peerConnection.iceGatheringState === "complete") {
        resolve(JSON.stringify(this.peerConnection.localDescription));
      } else {
        this.peerConnection.onicecandidate = (event) => {
          if (event.candidate === null) {
            resolve(JSON.stringify(this.peerConnection.localDescription));
          }
        };
      }
    });

    this.encryptionSeed = offerString;
    return offerString;
  }

  /**
   * Receives an Offer and generates an Answer.
   */
  async acceptOffer(offerString: string): Promise<string> {
    this.encryptionSeed = offerString;
    const offer = JSON.parse(offerString);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return new Promise((resolve) => {
      if (this.peerConnection.iceGatheringState === "complete") {
        resolve(JSON.stringify(this.peerConnection.localDescription));
      } else {
        this.peerConnection.onicecandidate = (event) => {
          if (event.candidate === null) {
            resolve(JSON.stringify(this.peerConnection.localDescription));
          }
        };
      }
    });
  }

  /**
   * Completes the connection by accepting the Answer.
   */
  async acceptAnswer(answerString: string): Promise<void> {
    const answer = JSON.parse(answerString);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  /**
   * Sends encrypted data directly to the peer.
   */
  async sendResourceData(data: Record<string, unknown>) {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      const plaintext = JSON.stringify(data);
      if (this.encryptionSeed) {
        try {
          const cipherText = await encryptPayload(plaintext, this.encryptionSeed);
          this.dataChannel.send(JSON.stringify({ encrypted: true, payload: cipherText }));
          console.log("[WebRTC] Sent E2EE encrypted data peer-to-peer");
        } catch {
          this.dataChannel.send(plaintext);
        }
      } else {
        this.dataChannel.send(plaintext);
      }
    } else {
      console.error("[WebRTC] Data channel is not open.");
    }
  }

  onReceiveData(callback: (data: unknown) => void) {
    this.onMessageCallback = callback;
  }

  onStatusChange(callback: (status: RTCPeerConnectionState) => void) {
    this.onStatusChangeCallback = callback;
  }

  onIceRestartNeeded(callback: () => void) {
    this.onIceRestartNeededCallback = callback;
  }

  /**
   * Performs an ICE restart by creating a new offer with iceRestart: true.
   * Returns the new SDP offer string for re-signaling.
   */
  async performIceRestart(): Promise<string> {
    this.iceRestartAttempts++;
    console.log(`[WebRTC] Performing ICE restart attempt ${this.iceRestartAttempts}...`);

    const offer = await this.peerConnection.createOffer({ iceRestart: true });
    await this.peerConnection.setLocalDescription(offer);

    return new Promise<string>((resolve) => {
      if (this.peerConnection.iceGatheringState === "complete") {
        resolve(JSON.stringify(this.peerConnection.localDescription));
      } else {
        this.peerConnection.onicecandidate = (event) => {
          if (event.candidate === null) {
            resolve(JSON.stringify(this.peerConnection.localDescription));
          }
        };
      }
    });
  }

  private setupDataChannel() {
    if (!this.dataChannel) return;
    this.dataChannel.onopen = () => console.log("[WebRTC] Data Channel Opened. Secure P2P Active.");
    this.dataChannel.onmessage = async (event) => {
      console.log("[WebRTC] Received Data (Raw):", event.data);
      if (this.onMessageCallback) {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.encrypted && parsed.payload && this.encryptionSeed) {
            const decryptedPlaintext = await decryptPayload(parsed.payload, this.encryptionSeed);
            this.onMessageCallback(JSON.parse(decryptedPlaintext));
          } else {
            this.onMessageCallback(parsed);
          }
        } catch {
          try {
            this.onMessageCallback(JSON.parse(event.data));
          } catch {
            this.onMessageCallback(event.data);
          }
        }
      }
    };
  }
}

export const p2pNode = new WebRTCNode();

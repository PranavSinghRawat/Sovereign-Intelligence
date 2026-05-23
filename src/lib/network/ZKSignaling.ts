import { encryptPayload, decryptPayload } from "./Encryption";

export interface ZKSignalingMessage {
  type: "ping" | "offer" | "answer" | "ice-candidate";
  sender: string;
  room: string;
  payload?: string;
}

export class ZKSignalingChannel {
  private passphraseHex: string = "";
  private passphraseRaw: string;
  private ws: WebSocket | null = null;
  private bc: BroadcastChannel | null = null;
  private onMessageCallback: (msg: ZKSignalingMessage) => void;
  private onLogCallback: (log: string) => void;
  private isConnected = false;
  private clientId: string;

  constructor(
    passphrase: string,
    onMessage: (msg: ZKSignalingMessage) => void,
    onLog: (log: string) => void
  ) {
    this.passphraseRaw = passphrase;
    this.onMessageCallback = onMessage;
    this.onLogCallback = onLog;
    this.clientId = typeof window !== "undefined" 
      ? (window.name || (window.name = Math.random().toString(36).substring(7)))
      : "node-peer";
  }

  async initialize() {
    this.onLogCallback("Deriving cryptographic channel ID (SHA-256)...");
    this.passphraseHex = await this.hashPassphrase(this.passphraseRaw);
    this.onLogCallback(`Channel ID derived: ${this.passphraseHex.substring(0, 12)}...`);

    // 1. Setup Local BroadcastChannel (for same-device cross-tab communication)
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.bc = new BroadcastChannel(`sovereign-zk-sig-${this.passphraseHex}`);
        this.bc.onmessage = (event) => {
          this.onLogCallback("Received local signaling handshake signal.");
          this.handleIncomingRawMessage(event.data);
        };
        this.onLogCallback("Local signaling channel (BroadcastChannel) active.");
      } catch (err) {
        console.error("[ZKSignaling] BroadcastChannel setup failed:", err);
      }
    }

    // 2. Setup Remote WebSocket (for multi-device network communication)
    const relayUrl = process.env.NEXT_PUBLIC_SIGNALING_SERVER || "wss://signaling.sarisia.cc";
    this.onLogCallback(`Connecting to ZK signaling relay: ${relayUrl}...`);
    try {
      this.ws = new WebSocket(relayUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.onLogCallback("Connected to ZK signaling relay. Subscribed to channel.");
        // Some pub/sub signaling servers require a join room request:
        this.ws?.send(JSON.stringify({ type: "join", room: this.passphraseHex }));
      };

      this.ws.onmessage = (event) => {
        this.handleIncomingRawMessage(event.data);
      };

      this.ws.onerror = () => {
        this.onLogCallback("ZK signaling relay error. Falling back to local offline mode.");
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.onLogCallback("ZK signaling relay disconnected.");
      };
    } catch (err) {
      this.onLogCallback("Failed to connect to signaling relay. Operating in local-only mode.");
      console.error("[ZKSignaling] WebSocket setup failed:", err);
    }
  }

  private async hashPassphrase(passphrase: string): Promise<string> {
    if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
      // Return simple fallback for tests running in Node environment
      return passphrase.split("").reduce((acc, char) => acc + char.charCodeAt(0).toString(16), "");
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(passphrase);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private handleIncomingRawMessage(data: string) {
    try {
      const parsed = JSON.parse(data) as ZKSignalingMessage;
      // Filter out messages that we sent ourselves
      if (parsed.sender === this.clientId) {
        return;
      }
      // Ensure the message belongs to our room/channel
      if (parsed.room !== this.passphraseHex) {
        return;
      }
      this.onMessageCallback(parsed);
    } catch {
      // Silently ignore non-JSON or malformed messages
    }
  }

  /**
   * Encrypts and publishes a signaling message
   */
  async send(type: "ping" | "offer" | "answer" | "ice-candidate", plaintextPayload?: string) {
    let encryptedPayload: string | undefined;

    if (plaintextPayload) {
      this.onLogCallback(`Encrypting SDP ${type} using AES-GCM-256 derived key...`);
      encryptedPayload = await encryptPayload(plaintextPayload, this.passphraseRaw);
    }

    const msg: ZKSignalingMessage = {
      type,
      sender: this.clientId,
      room: this.passphraseHex,
      payload: encryptedPayload
    };

    const serialized = JSON.stringify(msg);

    // Send locally via BroadcastChannel
    if (this.bc) {
      this.bc.postMessage(serialized);
    }

    // Send remotely via WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(serialized);
    }
  }

  /**
   * Decrypts an incoming message payload
   */
  async decrypt(encryptedPayload: string): Promise<string> {
    this.onLogCallback("Decrypting received SDP payload using derived key...");
    return await decryptPayload(encryptedPayload, this.passphraseRaw);
  }

  close() {
    if (this.bc) {
      this.bc.close();
      this.bc = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.onLogCallback("ZK signaling channel closed.");
  }
}

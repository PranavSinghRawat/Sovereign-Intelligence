/**
 * WebRTC Node - True P2P Decentralization (`agent://` Protocol Backend)
 * 
 * Establishes direct browser-to-browser data channels bypassing central APIs.
 * Uses Google's free public STUN servers for NAT Traversal.
 */

export class WebRTCNode {
  private peerConnection: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;
  private onMessageCallback: ((data: unknown) => void) | null = null;

  constructor() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    // Listen for incoming data channels (if we are the Answerer)
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
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
   * Receives an Offer and generates an Answer.
   */
  async acceptOffer(offerString: string): Promise<string> {
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
  sendResourceData(data: Record<string, unknown>) {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(JSON.stringify(data));
      console.log("[WebRTC] Sent data peer-to-peer:", data);
    } else {
      console.error("[WebRTC] Data channel is not open.");
    }
  }

  onReceiveData(callback: (data: unknown) => void) {
    this.onMessageCallback = callback;
  }

  private setupDataChannel() {
    if (!this.dataChannel) return;
    this.dataChannel.onopen = () => console.log("[WebRTC] Data Channel Opened. Secure P2P Active.");
    this.dataChannel.onmessage = (event) => {
      console.log("[WebRTC] Received Data:", event.data);
      if (this.onMessageCallback) {
        this.onMessageCallback(JSON.parse(event.data));
      }
    };
  }
}

export const p2pNode = new WebRTCNode();

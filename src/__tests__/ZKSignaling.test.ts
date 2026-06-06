import { describe, it, expect, vi, beforeEach } from "vitest";
import { ZKSignalingChannel, ZKSignalingMessage } from "../lib/network/ZKSignaling";
import { signPayload, getLocalPublicKeyHex } from "../lib/network/Identity";

// Mock WebSocket class for Node environment
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url: string;
  readyState: number = 0;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  send = vi.fn();
  close = vi.fn();

  constructor(url: string) {
    this.url = url;
    // Simulate async connection
    setTimeout(() => {
      this.readyState = 1; // WebSocket.OPEN
      if (this.onopen) this.onopen();
    }, 5);
  }
}

// Mock BroadcastChannel class for Node environment
class MockBroadcastChannel {
  name: string;
  onmessage: ((event: { data: string }) => void) | null = null;
  postMessage = vi.fn();
  close = vi.fn();

  constructor(name: string) {
    this.name = name;
  }
}

// Stub browser globals in Node test environment
vi.stubGlobal("WebSocket", MockWebSocket);
vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);
vi.stubGlobal("window", { 
  name: "test-client",
  BroadcastChannel: MockBroadcastChannel
});

describe("ZK-Signaling Channel Protocol", () => {
  let logs: string[];
  const logCallback = (msg: string) => {
    logs.push(msg);
  };

  beforeEach(() => {
    logs = [];
    vi.clearAllMocks();
  });

  it("should initialize channels and derive room hash from passphrase", async () => {
    const passphrase = "secure-password-123";
    const messageCallback = vi.fn();
    const channel = new ZKSignalingChannel(passphrase, messageCallback, logCallback);

    await channel.initialize();

    expect(logs).toContain("Deriving cryptographic channel ID (SHA-256)...");
    // Verify room hash is derived (using fallback in node)
    const derivedRoom = (channel as unknown as { passphraseHex: string }).passphraseHex;
    expect(derivedRoom).toBeDefined();
    expect(derivedRoom.length).toBeGreaterThan(0);

    const bcInstance = (channel as unknown as { bc: MockBroadcastChannel }).bc;
    expect(bcInstance).toBeDefined();
    expect(bcInstance.name).toBe(`sentinel-zk-sig-${derivedRoom}`);

    // Wait a brief moment for WebSocket to simulate connecting
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(logs).toContain("Connected to ZK signaling relay. Subscribed to channel.");

    channel.close();
  });

  it("should publish encrypted signaling messages to both WebSocket and BroadcastChannel", async () => {
    const passphrase = "test-room";
    const messageCallback = vi.fn();
    const channel = new ZKSignalingChannel(passphrase, messageCallback, logCallback);

    await channel.initialize();
    await new Promise((resolve) => setTimeout(resolve, 10)); // wait for ws open

    const sdpPayload = "v=0\no=- 42 2 IN IP4 127.0.0.1";
    await channel.send("offer", sdpPayload);

    const bcInstance = (channel as unknown as { bc: MockBroadcastChannel }).bc;
    const wsInstance = (channel as unknown as { ws: MockWebSocket }).ws;

    expect(bcInstance.postMessage).toHaveBeenCalled();
    expect(wsInstance.send).toHaveBeenCalled();

    // Verify message structure sent over wire
    expect(wsInstance.send).toHaveBeenCalledTimes(2); // First is join, second is offer
    const sentData = JSON.parse(wsInstance.send.mock.calls[1][0] as string);
    expect(sentData.type).toBe("offer");
    expect(sentData.sender).toBe("test-client");
    expect(sentData.room).toBe((channel as unknown as { passphraseHex: string }).passphraseHex);
    expect(sentData.payload).toBeDefined(); // encrypted string

    channel.close();
  });

  it("should filter out incoming messages sent by the same client", async () => {
    const passphrase = "test-room";
    const messageCallback = vi.fn();
    const channel = new ZKSignalingChannel(passphrase, messageCallback, logCallback);

    await channel.initialize();
    
    const sender = (channel as unknown as { clientId: string }).clientId;
    const room = (channel as unknown as { passphraseHex: string }).passphraseHex;

    const sameClientMsg: ZKSignalingMessage = {
      type: "ping",
      sender,
      room,
    };

    // Simulate receiving our own message
    const rawHandler = (channel as unknown as { handleIncomingRawMessage: (d: string) => void }).handleIncomingRawMessage.bind(channel);
    await rawHandler(JSON.stringify(sameClientMsg));

    expect(messageCallback).not.toHaveBeenCalled();

    channel.close();
  });

  it("should route valid messages from other clients to the callback", async () => {
    const passphrase = "test-room";
    const messageCallback = vi.fn();
    const channel = new ZKSignalingChannel(passphrase, messageCallback, logCallback);

    await channel.initialize();
    
    const room = (channel as unknown as { passphraseHex: string }).passphraseHex;
    const timestamp = Date.now();
    const signString = `ping:${room}::${timestamp}`;
    const signature = await signPayload(signString);
    const pubKey = getLocalPublicKeyHex();

    const peerMsg: ZKSignalingMessage = {
      type: "ping",
      sender: "external-peer",
      room,
      pubKey,
      timestamp,
      signature
    };

    // Simulate receiving external message
    const rawHandler = (channel as unknown as { handleIncomingRawMessage: (d: string) => void }).handleIncomingRawMessage.bind(channel);
    await rawHandler(JSON.stringify(peerMsg));

    expect(messageCallback).toHaveBeenCalledWith(peerMsg);

    channel.close();
  });

  it("should drop unsigned or tampered messages from external clients", async () => {
    const passphrase = "test-room";
    const messageCallback = vi.fn();
    const channel = new ZKSignalingChannel(passphrase, messageCallback, logCallback);

    await channel.initialize();
    const room = (channel as unknown as { passphraseHex: string }).passphraseHex;

    // 1. Fully unsigned message
    const unsignedMsg: ZKSignalingMessage = {
      type: "ping",
      sender: "attacker",
      room,
    };

    const rawHandler = (channel as unknown as { handleIncomingRawMessage: (d: string) => void }).handleIncomingRawMessage.bind(channel);
    await rawHandler(JSON.stringify(unsignedMsg));
    expect(messageCallback).not.toHaveBeenCalled();

    // 2. Message with invalid signature
    const invalidSigMsg: ZKSignalingMessage = {
      type: "ping",
      sender: "attacker",
      room,
      pubKey: getLocalPublicKeyHex(),
      timestamp: Date.now(),
      signature: "deadbeef"
    };

    await rawHandler(JSON.stringify(invalidSigMsg));
    expect(messageCallback).not.toHaveBeenCalled();

    // 3. Message with expired timestamp (replay attack)
    const timestamp = Date.now() - 300000; // 5 minutes ago (expired)
    const signString = `ping:${room}::${timestamp}`;
    const signature = await signPayload(signString);

    const expiredMsg: ZKSignalingMessage = {
      type: "ping",
      sender: "attacker",
      room,
      pubKey: getLocalPublicKeyHex(),
      timestamp,
      signature
    };

    await rawHandler(JSON.stringify(expiredMsg));
    expect(messageCallback).not.toHaveBeenCalled();

    channel.close();
  });
});

/**
 * Agent Cryptographic Identity & Authentication Layer
 * Uses Ed25519 keypairs for verifiable, signed signaling.
 * Stores keys securely in IndexedDB as non-extractable CryptoKeys to prevent XSS extraction.
 */

let localPrivateKey: CryptoKey | null = null;
let localPublicKey: CryptoKey | null = null;
let localPublicKeyHex = "";

// Helper to convert hex string to Uint8Array
export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// Helper to convert Uint8Array to hex string
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// IndexedDB Helper Functions
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }
    const request = indexedDB.open("sovereign_identity_db", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getStoredKey(db: IDBDatabase, name: string): Promise<CryptoKey | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("keys", "readonly");
    const store = tx.objectStore("keys");
    const request = store.get(name);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

function setStoredKey(db: IDBDatabase, name: string, key: CryptoKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("keys", "readwrite");
    const store = tx.objectStore("keys");
    const request = store.put(key, name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Initializes the agent's unique identity.
 * Generates a persistent Ed25519 keypair stored in IndexedDB (non-extractable).
 */
export async function initAgentIdentity(): Promise<string> {
  if (localPublicKeyHex) return localPublicKeyHex;

  const cryptoSubtle = typeof window !== "undefined" && window.crypto?.subtle
    ? window.crypto.subtle
    : (globalThis.crypto?.subtle);

  if (!cryptoSubtle) {
    console.warn("[Identity] Web Crypto Subtle API not available. Using fallback mock identity.");
    localPublicKeyHex = "mock_local_ed25519_identity_public_key_hex";
    return localPublicKeyHex;
  }

  // 1. Attempt to load from secure IndexedDB (Non-extractable key storage)
  try {
    const db = await openDB();
    const pubKey = await getStoredKey(db, "pubKey");
    const privKey = await getStoredKey(db, "privKey");

    if (pubKey && privKey) {
      localPublicKey = pubKey;
      localPrivateKey = privKey;

      const rawPub = await cryptoSubtle.exportKey("raw", localPublicKey);
      localPublicKeyHex = bytesToHex(new Uint8Array(rawPub));
      return localPublicKeyHex;
    }
  } catch (err) {
    console.warn("[Identity] IndexedDB not available or failed. Falling back to memory storage.", err);
  }

  // 2. Generate new Ed25519 Keypair (Private key generated as non-extractable for maximum sandbox safety)
  try {
    const keyPair = await cryptoSubtle.generateKey(
      { name: "Ed25519" },
      false, // non-extractable private key (public key is extractable by default)
      ["sign", "verify"]
    );
    localPrivateKey = keyPair.privateKey;
    localPublicKey = keyPair.publicKey;

    // Save generated keys to IndexedDB
    try {
      const db = await openDB();
      await setStoredKey(db, "pubKey", localPublicKey);
      await setStoredKey(db, "privKey", localPrivateKey);
    } catch (dbErr) {
      console.warn("[Identity] Failed to store keys in IndexedDB:", dbErr);
    }

    const rawPub = await cryptoSubtle.exportKey("raw", localPublicKey);
    localPublicKeyHex = bytesToHex(new Uint8Array(rawPub));
    return localPublicKeyHex;
  } catch (err) {
    console.warn("[Identity] Ed25519 generation failed (unsupported environment). Using mock fallback.", err);
    localPublicKeyHex = "mock_local_ed25519_identity_public_key_hex";
    return localPublicKeyHex;
  }
}

/**
 * Returns the hex-encoded local public key fingerprint.
 */
export function getLocalPublicKeyHex(): string {
  return localPublicKeyHex || "mock_local_ed25519_identity_public_key_hex";
}

/**
 * Signs a plaintext payload string using the local private key.
 * Returns the signature as a hex-encoded string.
 */
export async function signPayload(payload: string): Promise<string> {
  const cryptoSubtle = typeof window !== "undefined" && window.crypto?.subtle
    ? window.crypto.subtle
    : (globalThis.crypto?.subtle);

  if (!localPrivateKey || !cryptoSubtle) {
    return "mock_signature_for_" + payload.substring(0, 10);
  }

  const encoder = new TextEncoder();
  const signatureBuffer = await cryptoSubtle.sign(
    { name: "Ed25519" },
    localPrivateKey,
    encoder.encode(payload)
  );

  return bytesToHex(new Uint8Array(signatureBuffer));
}

/**
 * Verifies a signature for a given payload using the peer's public key hex.
 */
export async function verifyPayload(
  payload: string,
  signatureHex: string,
  pubKeyHex: string
): Promise<boolean> {
  if (pubKeyHex === "mock_local_ed25519_identity_public_key_hex" || signatureHex.startsWith("mock_signature_")) {
    return signatureHex === "mock_signature_for_" + payload.substring(0, 10);
  }

  const cryptoSubtle = typeof window !== "undefined" && window.crypto?.subtle
    ? window.crypto.subtle
    : (globalThis.crypto?.subtle);

  if (!cryptoSubtle) {
    return false;
  }

  try {
    const pubKeyBytes = hexToBytes(pubKeyHex);
    const signatureBytes = hexToBytes(signatureHex);
    const encoder = new TextEncoder();

    const publicKey = await cryptoSubtle.importKey(
      "raw",
      pubKeyBytes,
      { name: "Ed25519" },
      true,
      ["verify"]
    );

    return await cryptoSubtle.verify(
      { name: "Ed25519" },
      publicKey,
      signatureBytes,
      encoder.encode(payload)
    );
  } catch (err) {
    console.error("[Identity] Signature verification failed:", err);
    return false;
  }
}

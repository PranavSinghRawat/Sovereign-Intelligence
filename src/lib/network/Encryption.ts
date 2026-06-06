/**
 * Application-level End-to-End Encryption (E2EE) helper for signaling channels.
 * Uses Web Crypto API (AES-GCM-256) to encrypt and decrypt JSON payloads using a shared passphrase.
 * Do NOT use this for WebRTC Data Channels (which use native DTLS) or with public SDP seeds.
 */

// Simple salt for PBKDF2 key derivation
const SALT = new Uint8Array([83, 101, 110, 116, 105, 110, 101, 108, 95, 69, 50, 69, 69, 95, 83, 95]); // "Sentinel_E2EE_S_"

/**
 * Derives a CryptoKey from a given seed string (SDP offer string) using PBKDF2.
 */
async function deriveKey(seed: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(seed),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: SALT,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a plaintext string using a derived key.
 * Returns a base64-encoded string containing IV + Ciphertext.
 */
export async function encryptPayload(plaintext: string, seed: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto) return plaintext;
  try {
    const key = await deriveKey(seed);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoder.encode(plaintext)
    );

    // Combine IV and Ciphertext into a single array
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.error("[Encryption] Failed to encrypt payload:", err);
    throw err;
  }
}

/**
 * Decrypts a base64-encoded IV+Ciphertext string using a derived key.
 */
export async function decryptPayload(ciphertextBase64: string, seed: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto) return ciphertextBase64;
  try {
    const key = await deriveKey(seed);
    const combined = new Uint8Array(
      atob(ciphertextBase64)
        .split("")
        .map((c) => c.charCodeAt(0))
    );

    // Extract IV (first 12 bytes) and Ciphertext
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (err) {
    console.error("[Encryption] Failed to decrypt payload:", err);
    throw err;
  }
}

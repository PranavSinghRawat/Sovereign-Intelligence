import { db } from "../store/sqlite-db";

/**
 * PII Registry - Session-level tracking of sensitive data fragments.
 * Hardened with SQLite Wasm persistence and SHA-256 hashing.
 *
 * Security: PII values are NEVER stored in plain text. Only a one-way
 * SHA-256 hash of the normalized value is persisted. This ensures that
 * the registry can still detect duplicate fragments across sessions
 * without ever leaking raw PII if the database is compromised.
 */

export enum PIIType {
  NAME = "NAME",
  EMAIL = "EMAIL",
  CREDENTIAL = "CREDENTIAL",
  PHONE = "PHONE",
  ADDRESS = "ADDRESS",
  LOCATION = "LOCATION",
  PROFESSION = "PROFESSION",
  AGE = "AGE",
  ID = "ID",
  FINANCIAL = "FINANCIAL",
  MEDICAL = "MEDICAL",
  SENSITIVE_FIELD = "SENSITIVE_FIELD",
}

const PII_WEIGHTS: Record<PIIType, number> = {
  [PIIType.NAME]: 0.8,
  [PIIType.EMAIL]: 0.9,
  [PIIType.CREDENTIAL]: 1.0,
  [PIIType.PHONE]: 0.8,
  [PIIType.ADDRESS]: 0.8,
  [PIIType.LOCATION]: 0.3,
  [PIIType.PROFESSION]: 0.4,
  [PIIType.AGE]: 0.2,
  [PIIType.ID]: 0.9,
  [PIIType.FINANCIAL]: 1.0,
  [PIIType.MEDICAL]: 0.7,
  [PIIType.SENSITIVE_FIELD]: 1.0,
};

/**
 * Computes a SHA-256 hex digest of a string value.
 * Uses the Web Crypto API when available (browser/worker),
 * falls back to a simple deterministic hash in Node test environments.
 */
async function sha256(value: string): Promise<string> {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback for Node.js test environment without Web Crypto
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

export class PIIRegistry {
  private fragments: Set<string> = new Set();
  private sessionCPE: number = 0;
  private threshold: number = 1.0;
  private initialized: boolean = false;

  /**
   * Loads persisted fragment hashes from SQLite.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const rows = await db.exec("SELECT type, value FROM pii_fragments");
      const results = rows as unknown as unknown[][];
      results.forEach((row) => {
        // BUG 5 Fix: Validate row structure before accessing indices
        if (!Array.isArray(row) || row.length < 2 || typeof row[0] !== "string" || typeof row[1] !== "string") return;
        const type = row[0] as PIIType;
        const hashedValue = row[1]; // Already stored as a hash
        const fragmentKey = `${type}:${hashedValue}`;
        if (!this.fragments.has(fragmentKey)) {
          this.fragments.add(fragmentKey);
          this.sessionCPE += PII_WEIGHTS[type] ?? 0;
        }
      });
      this.initialized = true;
      console.log(`[PIIRegistry] Loaded ${this.fragments.size} fragments from persistence.`);
    } catch (err) {
      console.error("[PIIRegistry] Load failed:", err);
    }
  }

  /**
   * Adds a fragment and persists its SHA-256 hash to SQLite.
   * The raw value is NEVER written to the database.
   */
  async registerFragment(type: PIIType, value: string): Promise<boolean> {
    const hashedValue = await sha256(value.toLowerCase());
    const fragmentKey = `${type}:${hashedValue}`;
    if (this.fragments.has(fragmentKey)) return false;

    // 1. Update In-Memory
    this.fragments.add(fragmentKey);
    this.sessionCPE += PII_WEIGHTS[type];

    // 2. Update Persistent Store with hashed value only
    try {
      await db.exec(
        "INSERT OR IGNORE INTO pii_fragments (type, value) VALUES (?, ?)",
        [type, hashedValue]
      );
    } catch (err) {
      console.error("[PIIRegistry] Persistence failed:", err);
    }

    return true;
  }

  getCPE(): number {
    return this.sessionCPE;
  }

  isReidentifiable(): boolean {
    return this.sessionCPE >= this.threshold;
  }

  async clear(): Promise<void> {
    this.fragments.clear();
    this.sessionCPE = 0;
    await db.exec("DELETE FROM pii_fragments");
  }

  getCapturedTypes(): PIIType[] {
    return Array.from(this.fragments).map(f => f.split(":")[0] as PIIType);
  }
}

export const sessionPII = new PIIRegistry();

import { db } from "../store/sqlite-db";

/**
 * PII Registry - Session-level tracking of sensitive data fragments.
 * Now hardened with SQLite Wasm persistence.
 */

export enum PIIType {
  NAME = "NAME",
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  LOCATION = "LOCATION",
  PROFESSION = "PROFESSION",
  AGE = "AGE",
  ID = "ID",
}

const PII_WEIGHTS: Record<PIIType, number> = {
  [PIIType.NAME]: 0.8,
  [PIIType.EMAIL]: 0.9,
  [PIIType.PHONE]: 0.8,
  [PIIType.LOCATION]: 0.3,
  [PIIType.PROFESSION]: 0.4,
  [PIIType.AGE]: 0.2,
  [PIIType.ID]: 0.9,
};

export class PIIRegistry {
  private fragments: Set<string> = new Set();
  private sessionCPE: number = 0;
  private threshold: number = 1.0;
  private initialized: boolean = false;

  /**
   * Loads persisted fragments from SQLite.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const rows = await db.exec("SELECT type, value FROM pii_fragments");
      rows.forEach((row: any) => {
        const type = row[0] as PIIType;
        const value = row[1];
        const fragmentKey = `${type}:${value.toLowerCase()}`;
        if (!this.fragments.has(fragmentKey)) {
          this.fragments.add(fragmentKey);
          this.sessionCPE += PII_WEIGHTS[type];
        }
      });
      this.initialized = true;
      console.log(`[PIIRegistry] Loaded ${this.fragments.size} fragments from persistence.`);
    } catch (err) {
      console.error("[PIIRegistry] Load failed:", err);
    }
  }

  /**
   * Adds a fragment and persists it to SQLite.
   */
  async registerFragment(type: PIIType, value: string): Promise<boolean> {
    const fragmentKey = `${type}:${value.toLowerCase()}`;
    if (this.fragments.has(fragmentKey)) return false;

    // 1. Update In-Memory
    this.fragments.add(fragmentKey);
    this.sessionCPE += PII_WEIGHTS[type];

    // 2. Update Persistent Store (Fire and forget or await depending on strictness)
    try {
      await db.exec(
        "INSERT OR IGNORE INTO pii_fragments (type, value) VALUES (?, ?)",
        [type, value.toLowerCase()]
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
export { PIIType };

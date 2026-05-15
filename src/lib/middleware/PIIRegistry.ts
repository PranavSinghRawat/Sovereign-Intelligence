/**
 * PII Registry - Session-level tracking of sensitive data fragments.
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

export interface PIIFragment {
  type: PIIType;
  value: string;
  weight: number;
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

  /**
   * Adds a fragment to the registry and updates the CPE score.
   * Returns true if the fragment is new.
   */
  registerFragment(type: PIIType, value: string): boolean {
    const fragmentKey = `${type}:${value.toLowerCase()}`;
    if (this.fragments.has(fragmentKey)) return false;

    this.fragments.add(fragmentKey);
    this.sessionCPE += PII_WEIGHTS[type];
    return true;
  }

  getCPE(): number {
    return this.sessionCPE;
  }

  isReidentifiable(): boolean {
    return this.sessionCPE >= this.threshold;
  }

  reset(): void {
    this.fragments.clear();
    this.sessionCPE = 0;
  }

  getCapturedTypes(): PIIType[] {
    return Array.from(this.fragments).map(f => f.split(":")[0] as PIIType);
  }
}

export const sessionPII = new PIIRegistry();

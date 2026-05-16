import { sessionPII, PIIType } from "./PIIRegistry";

/**
 * CAMP: Cumulative Agentic Masking and Pruning Middleware
 * 
 * Ensures that as context accumulates, the user does not become re-identifiable
 * by pruning sensitive fragments before they reach the local LLM.
 */

export interface CAMPResult {
  processedText: string;
  cpeScore: number;
  pruned: boolean;
  fragmentsDetected: string[];
}

export class CAMPMiddleware {
  // Heuristic patterns for PII detection
  private patterns = [
    { type: PIIType.EMAIL, regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
    { type: PIIType.PHONE, regex: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g },
    { type: PIIType.NAME, regex: /(?<=my name is |i am |this is )\b([A-Z][a-z]+)\b/gi },
    { type: PIIType.LOCATION, regex: /(?<=in |from |lives in )\b(New York|London|San Francisco|Seattle|Mumbai|Delhi)\b/gi }, // Example locations
    { type: PIIType.PROFESSION, regex: /(?<=a |an |working as a |i am a )\b(doctor|lawyer|engineer|teacher|nurse|software developer)\b/gi },
  ];

  /**
   * Processes the input text through the CAMP framework.
   */
  async process(text: string): Promise<CAMPResult> {
    let processedText = text;
    const detected: string[] = [];
    let shouldPrune = false;

    // Ensure registry is loaded
    await sessionPII.initialize();

    // 1. Scan and Register
    for (const { type, regex } of this.patterns) {
      const matches = text.match(regex);
      if (matches) {
        for (const match of matches) {
          await sessionPII.registerFragment(type, match);
          detected.push(`${type}: ${match}`);
        }
      }
    }

    // 2. Check Re-identifiability
    const currentCPE = sessionPII.getCPE();
    if (sessionPII.isReidentifiable()) {
      shouldPrune = true;
      processedText = this.prune(processedText);
    }

    return {
      processedText,
      cpeScore: currentCPE,
      pruned: shouldPrune,
      fragmentsDetected: detected
    };
  }

  /**
   * Prunes/Masks the text to stay below the re-identification threshold.
   */
  private prune(text: string): string {
    let pruned = text;
    
    // Replace detected patterns with placeholders if re-identifiable
    this.patterns.forEach(({ type, regex }) => {
      pruned = pruned.replace(regex, `[${type}_PRUNED]`);
    });

    return pruned;
  }
}

export const camp = new CAMPMiddleware();

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
  // Production-grade PII detection patterns with broad coverage
  private patterns = [
    { type: PIIType.EMAIL, regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
    { type: PIIType.PHONE, regex: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g },
    { type: PIIType.NAME, regex: /(?<=my name is |i am |this is |i'm |call me )\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/gi },
    { type: PIIType.LOCATION, regex: /(?<=in |from |lives in |live in |near |at |moved to )(?:[A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2})/gi },
    { type: PIIType.PROFESSION, regex: /(?<=a |an |working as a |i am a |i'm a |work as a )\b(doctor|lawyer|engineer|teacher|nurse|software developer|accountant|dentist|therapist|pharmacist|architect|mechanic|plumber|electrician|firefighter|paramedic|professor|scientist|chef|pilot|journalist|driver|farmer|cashier|janitor|waiter|clerk|receptionist|analyst|consultant|designer|manager|director|student|intern)\b/gi },
    { type: PIIType.MEDICAL, regex: /(?<=my |have |with |suffering from |diagnosed with |taking |struggle with )\b(diabetes|cancer|asthma|anxiety|depression|hypertension|hepatitis|arthritis|epilepsy|hiv|aids|tuberculosis|malaria|covid|pneumonia|bronchitis|cholesterol|migraine|insomnia|adhd|ptsd|bipolar|schizophrenia|dementia|alzheimer|parkinson|stroke|tumor|leukemia|anemia|thyroid|obesity|ulcer|eczema|psoriasis)\b/gi },
  ];

  /**
   * Processes the input text through the CAMP framework.
   * BUG 3 Fix: Collects ALL match positions in a single scan pass, then replaces
   * them in reverse order so that earlier replacements don't shift positions
   * or destroy lookbehind context for later patterns.
   */
  async process(text: string): Promise<CAMPResult> {
    const detected: string[] = [];
    let shouldPrune = false;

    // Ensure registry is loaded
    await sessionPII.initialize();

    // 0. Extract markdown code blocks to prevent PII scanning inside them
    const codeBlocks: string[] = [];
    let placeholderText = text;

    // Fenced code blocks
    const fencedRegex = /```[\s\S]*?```/g;
    placeholderText = placeholderText.replace(fencedRegex, (match) => {
      const idx = codeBlocks.length;
      codeBlocks.push(match);
      return `__CAMP_CODE_BLOCK_${idx}__`;
    });

    // Inline code blocks
    const inlineRegex = /`[^`\n]+`/g;
    placeholderText = placeholderText.replace(inlineRegex, (match) => {
      const idx = codeBlocks.length;
      codeBlocks.push(match);
      return `__CAMP_CODE_BLOCK_${idx}__`;
    });

    // 1. Scan ALL patterns and collect match positions + types on the placeholder text
    interface MatchRecord { start: number; end: number; type: PIIType; value: string; }
    const allMatches: MatchRecord[] = [];

    for (const { type, regex } of this.patterns) {
      // Reset regex lastIndex for global patterns
      regex.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(placeholderText)) !== null) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          type,
          value: match[0],
        });
      }
    }

    // 2. Register all detected fragments
    for (const m of allMatches) {
      await sessionPII.registerFragment(m.type, m.value);
      detected.push(`${m.type}: ${m.value}`);
    }

    // 3. Check Re-identifiability
    const currentCPE = sessionPII.getCPE();
    let processedText = placeholderText;

    if (sessionPII.isReidentifiable()) {
      shouldPrune = true;

      // 4. Sort matches by start position DESCENDING so replacements
      //    don't shift the positions of earlier matches
      const sorted = [...allMatches].sort((a, b) => b.start - a.start);
      for (const m of sorted) {
        const before = processedText.slice(0, m.start);
        const after = processedText.slice(m.end);
        processedText = before + `[${m.type}_PRUNED]` + after;
      }
    }

    // 5. Restore the code blocks
    for (let i = 0; i < codeBlocks.length; i++) {
      processedText = processedText.replace(`__CAMP_CODE_BLOCK_${i}__`, codeBlocks[i]);
    }

    return {
      processedText,
      cpeScore: currentCPE,
      pruned: shouldPrune,
      fragmentsDetected: detected
    };
  }
}

export const camp = new CAMPMiddleware();

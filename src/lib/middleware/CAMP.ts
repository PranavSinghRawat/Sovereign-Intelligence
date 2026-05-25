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

interface PIIDetector {
  type: PIIType;
  regex: RegExp;
  priority: number;
  valueGroup?: number;
}

export class CAMPMiddleware {
  // Specific detectors handle known high-risk entities. The generic disclosure
  // detector catches arbitrary "my field is value" data without model calls.
  private patterns: PIIDetector[] = [
    { type: PIIType.EMAIL, regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, priority: 100 },
    { type: PIIType.CREDENTIAL, regex: /\b(?:password|passcode|pin|token|api\s*key|secret|credential|recovery phrase|seed phrase)\s*(?:is|=|:)\s*["']?([^"',;.\n]{4,})["']?/gi, priority: 100 },
    { type: PIIType.FINANCIAL, regex: /\b(?:card|credit card|debit card|bank account|routing number)\s*(?:number\s*)?(?:is|=|:)\s*([0-9][0-9\s-]{5,24})/gi, priority: 95 },
    { type: PIIType.FINANCIAL, regex: /\b(?:iban|upi)\s*(?:id\s*)?(?:is|=|:)\s*([A-Z0-9._%+-]{3,34}(?:@[A-Z0-9.-]{2,30})?)/gi, priority: 95 },
    { type: PIIType.FINANCIAL, regex: /\b(?:\d[ -]*?){13,19}\b/g, priority: 90 },
    { type: PIIType.ID, regex: /\b(?:ssn|social security|passport|driver'?s license|aadhaar|pan)\s*(?:number\s*)?(?:is|=|:)\s*([A-Z0-9-]{4,24})/gi, priority: 95 },
    { type: PIIType.PHONE, regex: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, priority: 90 },
    { type: PIIType.ADDRESS, regex: /\b(?:my address is|our address is|i live at|ship(?:ping)? address is|billing address is)\s+([^.!?\n]{6,100}?)(?=\s+and\s+(?:my|our)\s+|[.!?\n]|$)/gi, priority: 90 },
    { type: PIIType.AGE, regex: /\b(?:i am|i'm|my age is)\s+(\d{1,3})\s*(?:years old|yrs old|yo)?\b/gi, priority: 80 },
    { type: PIIType.NAME, regex: /(?<=my name is |My name is |i am |I am |this is |This is |i'm |I'm |call me |Call me )\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/g, priority: 85 },
    { type: PIIType.LOCATION, regex: /(?<=in |from |lives in |live in |near |at |moved to )(?:[A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2})/g, priority: 65 },
    { type: PIIType.PROFESSION, regex: /(?<=a |an |working as a |i am a |i'm a |work as a )\b(doctor|lawyer|engineer|teacher|nurse|software developer|accountant|dentist|therapist|pharmacist|architect|mechanic|plumber|electrician|firefighter|paramedic|professor|scientist|chef|pilot|journalist|driver|farmer|cashier|janitor|waiter|clerk|receptionist|analyst|consultant|designer|manager|director|student|intern)\b/gi, priority: 60 },
    { type: PIIType.MEDICAL, regex: /(?<=my |have |with |suffering from |diagnosed with |taking |struggle with )\b(diabetes|cancer|asthma|anxiety|depression|hypertension|hepatitis|arthritis|epilepsy|hiv|aids|tuberculosis|malaria|covid|pneumonia|bronchitis|cholesterol|migraine|insomnia|adhd|ptsd|bipolar|schizophrenia|dementia|alzheimer|parkinson|stroke|tumor|leukemia|anemia|thyroid|obesity|ulcer|eczema|psoriasis)\b/gi, priority: 80 },
    { type: PIIType.SENSITIVE_FIELD, regex: /\b(?:the\s+)?(?:thing|code|phrase|word|answer|key|clue|value)\s+(?:i|we)\s+use\s+(?:to|for)\s+[^.!?\n]{2,60}?\s*(?:is|=|:)\s*([^.!?\n]{2,100})/gi, priority: 75 },
    { type: PIIType.SENSITIVE_FIELD, regex: /\b(?:private|secret|confidential|internal)\s+(?:note|code|phrase|answer|key|clue|value)\s*(?:is|=|:)\s*([^.!?\n]{2,100})/gi, priority: 75 },
    { type: PIIType.SENSITIVE_FIELD, regex: /\b(?:my|our)\s+(?!name\b|email\b|password\b|passcode\b|pin\b|phone\b|address\b|age\b)([a-z][a-z\s-]{1,32}?)\s*(?:is|=|:)\s*([^.!?\n]{2,100}?)(?=\s+and\s+(?:my|our)\s+|[.!?\n]|$)/gi, priority: 40, valueGroup: 2 },
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
    interface MatchRecord { start: number; end: number; type: PIIType; value: string; priority: number; }
    const allMatches: MatchRecord[] = [];

    for (const { type, regex, priority, valueGroup } of this.patterns) {
      // Reset regex lastIndex for global patterns
      regex.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(placeholderText)) !== null) {
        const matchedValue = match[valueGroup ?? 1] ?? match[0];
        const valueOffset = match[valueGroup ?? 1] ? match[0].indexOf(matchedValue) : 0;
        const start = match.index + Math.max(valueOffset, 0);
        allMatches.push({
          start,
          end: start + matchedValue.length,
          type,
          value: matchedValue,
          priority,
        });
      }
    }

    const nonOverlappingMatches = [...allMatches]
      .sort((a, b) => b.priority - a.priority || a.start - b.start || (b.end - b.start) - (a.end - a.start))
      .reduce<MatchRecord[]>((accepted, candidate) => {
        const overlaps = accepted.some(match => candidate.start < match.end && match.start < candidate.end);
        return overlaps ? accepted : [...accepted, candidate];
      }, [])
      .sort((a, b) => a.start - b.start);

    // 2. Register all detected fragments
    for (const m of nonOverlappingMatches) {
      await sessionPII.registerFragment(m.type, m.value);
      const displayValue = this.shouldHideDetectedValue(m.type) ? "[REDACTED]" : m.value;
      detected.push(`${m.type}: ${displayValue}`);
    }

    // 3. Check Re-identifiability
    const currentCPE = sessionPII.getCPE();
    let processedText = placeholderText;

    if (sessionPII.isReidentifiable()) {
      shouldPrune = true;

      // 4. Sort matches by start position DESCENDING so replacements
      //    don't shift the positions of earlier matches
      const sorted = [...nonOverlappingMatches].sort((a, b) => b.start - a.start);
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

  private shouldHideDetectedValue(type: PIIType): boolean {
    return [
      PIIType.CREDENTIAL,
      PIIType.FINANCIAL,
      PIIType.ID,
      PIIType.ADDRESS,
      PIIType.SENSITIVE_FIELD,
    ].includes(type);
  }
}

export const camp = new CAMPMiddleware();

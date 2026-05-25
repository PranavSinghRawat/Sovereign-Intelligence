import { PIIType } from "../../lib/middleware/PIIRegistry";
import { RedactionResult } from "../types";

interface BaselinePattern {
  type: PIIType;
  regex: RegExp;
  replacement: string;
}

const PATTERNS: BaselinePattern[] = [
  {
    type: PIIType.EMAIL,
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: "[EMAIL_PRUNED]",
  },
  {
    type: PIIType.PHONE,
    regex: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
    replacement: "[PHONE_PRUNED]",
  },
  {
    type: PIIType.FINANCIAL,
    regex: /\b(?:\d[ -]*?){13,19}\b/g,
    replacement: "[FINANCIAL_PRUNED]",
  },
  {
    type: PIIType.CREDENTIAL,
    regex: /\b(?:password|passcode|pin|token|api\s*key|secret)\s*(?:is|=|:)\s*["']?([^"',;.\n]{4,})["']?/gi,
    replacement: "password is [CREDENTIAL_PRUNED]",
  },
  {
    type: PIIType.NAME,
    regex: /(?<=my name is |i am |this is |i'm |call me )\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/gi,
    replacement: "[NAME_PRUNED]",
  },
];

export async function runSimpleRegexBaseline(input: string): Promise<RedactionResult> {
  const start = performance.now();
  const detected = new Set<PIIType>();
  let processedText = input;

  for (const pattern of PATTERNS) {
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(processedText)) {
      detected.add(pattern.type);
      pattern.regex.lastIndex = 0;
      processedText = processedText.replace(pattern.regex, pattern.replacement);
    }
  }

  return {
    processedText,
    pruned: detected.size > 0,
    fragmentsDetected: Array.from(detected).map((type) => `${type}: detected`),
    latencyMs: performance.now() - start,
  };
}

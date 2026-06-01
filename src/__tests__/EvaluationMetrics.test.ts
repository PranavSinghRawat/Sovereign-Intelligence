import { describe, expect, it } from "vitest";
import { PIIType } from "../lib/middleware/PIIRegistry";
import {
  evaluateCase,
  extractDetectedTypes,
  renderMarkdownReport,
  renderSummaryCsv,
  summarizeEvaluations,
} from "../evaluation/metrics";
import { createBenchmarkReport } from "../evaluation/metrics";
import { PIIBenchmarkCase, RedactionResult } from "../evaluation/types";
import { adversarialBenchmarkCases } from "../evaluation/datasets/adversarialBenchmarkCases";

describe("Evaluation metrics", () => {
  it("extracts PII types from CAMP fragment labels", () => {
    expect(extractDetectedTypes([
      "EMAIL: user@example.com",
      "CREDENTIAL: [REDACTED]",
      "UNKNOWN: ignored",
      "EMAIL: duplicate@example.com",
    ])).toEqual([PIIType.EMAIL, PIIType.CREDENTIAL]);
  });

  it("computes type-level precision, recall, and pruning errors", () => {
    const testCase: PIIBenchmarkCase = {
      id: "mixed",
      category: "unit",
      input: "My email is user@example.com and my phone is 415-555-1212.",
      expectedTypes: [PIIType.EMAIL, PIIType.PHONE],
      shouldPrune: true,
      mustNotContain: ["user@example.com"],
    };
    const result: RedactionResult = {
      processedText: "My email is [EMAIL_PRUNED] and my phone is 415-555-1212.",
      pruned: true,
      fragmentsDetected: ["EMAIL: user@example.com", "LOCATION: Example"],
      latencyMs: 2,
    };

    const evaluation = evaluateCase(testCase, result);
    const summary = summarizeEvaluations([evaluation]);

    expect(evaluation.truePositiveTypes).toEqual([PIIType.EMAIL]);
    expect(evaluation.falsePositiveTypes).toEqual([PIIType.LOCATION]);
    expect(evaluation.falseNegativeTypes).toEqual([PIIType.PHONE]);
    expect(evaluation.textCheckFailures).toEqual([]);
    expect(summary.precision).toBe(0.5);
    expect(summary.recall).toBe(0.5);
    expect(summary.f1).toBe(0.5);
  });

  it("renders a Markdown report with failure details", () => {
    const evaluation = evaluateCase(
      {
        id: "leak",
        category: "unit",
        input: "My password is secret.",
        expectedTypes: [PIIType.CREDENTIAL],
        shouldPrune: true,
        mustNotContain: ["secret"],
      },
      {
        processedText: "My password is secret.",
        pruned: false,
        fragmentsDetected: [],
        latencyMs: 1,
      }
    );

    const markdown = renderMarkdownReport([
      createBenchmarkReport("Unit redactor", [evaluation]),
    ]);

    expect(markdown).toContain("| Unit redactor | 1 | 0.0% | 0.0% | 0.0%");
    expect(markdown).toContain("leak: false positives [none], false negatives [CREDENTIAL]");
    expect(markdown).toContain("under-pruned true");
  });

  it("renders CSV summary rows for paper figures", () => {
    const report = createBenchmarkReport("Unit redactor", [
      evaluateCase(
        {
          id: "email",
          category: "unit",
          input: "My email is user@example.com.",
          expectedTypes: [PIIType.EMAIL],
          shouldPrune: true,
        },
        {
          processedText: "My email is [EMAIL_PRUNED].",
          pruned: true,
          fragmentsDetected: ["EMAIL: user@example.com"],
          latencyMs: 1.25,
        }
      ),
    ]);

    const csv = renderSummaryCsv([report]);

    expect(csv).toContain("variant,cases,precision,recall,f1");
    expect(csv).toContain("Unit redactor,1,1.0000,1.0000,1.0000");
  });

  it("keeps the adversarial benchmark at publication scale", () => {
    expect(adversarialBenchmarkCases).toHaveLength(100);
    expect(new Set(adversarialBenchmarkCases.map((testCase) => testCase.id)).size).toBe(100);
  });
});

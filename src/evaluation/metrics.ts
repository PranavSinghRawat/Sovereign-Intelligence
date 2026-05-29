import { PIIType } from "../lib/middleware/PIIRegistry";
import {
  BenchmarkReport,
  BenchmarkSummary,
  CategorySummary,
  CaseEvaluation,
  PIIBenchmarkCase,
  RedactionResult,
} from "./types";

export function extractDetectedTypes(fragments: string[]): PIIType[] {
  return uniqueTypes(
    fragments
      .map((fragment) => fragment.split(":")[0])
      .filter((type): type is PIIType => Object.values(PIIType).includes(type as PIIType))
  );
}

export function evaluateCase(testCase: PIIBenchmarkCase, result: RedactionResult): CaseEvaluation {
  const expectedTypes = uniqueTypes(testCase.expectedTypes);
  const detectedTypes = extractDetectedTypes(result.fragmentsDetected);
  const truePositiveTypes = detectedTypes.filter((type) => expectedTypes.includes(type));
  const falsePositiveTypes = detectedTypes.filter((type) => !expectedTypes.includes(type));
  const falseNegativeTypes = expectedTypes.filter((type) => !detectedTypes.includes(type));
  const textCheckFailures = collectTextCheckFailures(testCase, result.processedText);

  return {
    id: testCase.id,
    category: testCase.category,
    expectedTypes,
    detectedTypes,
    truePositiveTypes,
    falsePositiveTypes,
    falseNegativeTypes,
    shouldPrune: testCase.shouldPrune,
    didPrune: result.pruned,
    overPruned: result.pruned && !testCase.shouldPrune,
    underPruned: !result.pruned && testCase.shouldPrune,
    textCheckFailures,
    latencyMs: result.latencyMs,
  };
}

export function summarizeEvaluations(cases: CaseEvaluation[]): BenchmarkSummary {
  const truePositives = sum(cases.map((testCase) => testCase.truePositiveTypes.length));
  const falsePositives = sum(cases.map((testCase) => testCase.falsePositiveTypes.length));
  const falseNegatives = sum(cases.map((testCase) => testCase.falseNegativeTypes.length));
  const precision = safeDivide(truePositives, truePositives + falsePositives);
  const recall = safeDivide(truePositives, truePositives + falseNegatives);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  const latencies = cases.map((testCase) => testCase.latencyMs).sort((a, b) => a - b);

  return {
    caseCount: cases.length,
    truePositives,
    falsePositives,
    falseNegatives,
    precision,
    recall,
    f1,
    overPruningRate: safeDivide(cases.filter((testCase) => testCase.overPruned).length, cases.length),
    underPruningRate: safeDivide(cases.filter((testCase) => testCase.underPruned).length, cases.length),
    textCheckFailureRate: safeDivide(
      cases.filter((testCase) => testCase.textCheckFailures.length > 0).length,
      cases.length
    ),
    averageLatencyMs: safeDivide(sum(latencies), latencies.length),
    p95LatencyMs: percentile(latencies, 0.95),
  };
}

export function createBenchmarkReport(label: string, cases: CaseEvaluation[]): BenchmarkReport {
  return {
    label,
    generatedAt: new Date().toISOString(),
    cases,
    summary: summarizeEvaluations(cases),
    categories: summarizeByCategory(cases),
  };
}

export function renderMarkdownReport(reports: BenchmarkReport[]): string {
  const lines = [
    "# CAMP Benchmark Summary",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "| Variant | Cases | Precision | Recall | F1 | Over-prune | Under-prune | Avg latency | p95 latency | Text failures |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];

  for (const report of reports) {
    const summary = report.summary;
    lines.push(
      `| ${report.label} | ${summary.caseCount} | ${formatRate(summary.precision)} | ${formatRate(summary.recall)} | ${formatRate(summary.f1)} | ${formatRate(summary.overPruningRate)} | ${formatRate(summary.underPruningRate)} | ${summary.averageLatencyMs.toFixed(2)} ms | ${summary.p95LatencyMs.toFixed(2)} ms | ${formatRate(summary.textCheckFailureRate)} |`
    );
  }

  lines.push("", "## Category Breakdown", "");
  for (const report of reports) {
    lines.push(`### ${report.label}`, "");
    lines.push("| Category | Cases | Precision | Recall | F1 | Over-prune | Under-prune | Text failures |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
    for (const category of report.categories) {
      lines.push(
        `| ${category.category} | ${category.caseCount} | ${formatRate(category.precision)} | ${formatRate(category.recall)} | ${formatRate(category.f1)} | ${formatRate(category.overPruningRate)} | ${formatRate(category.underPruningRate)} | ${formatRate(category.textCheckFailureRate)} |`
      );
    }
    lines.push("");
  }

  lines.push("", "## Failure Cases", "");
  for (const report of reports) {
    const failures = report.cases.filter(
      (testCase) =>
        testCase.falsePositiveTypes.length > 0 ||
        testCase.falseNegativeTypes.length > 0 ||
        testCase.overPruned ||
        testCase.underPruned ||
        testCase.textCheckFailures.length > 0
    );

    lines.push(`### ${report.label}`, "");
    if (failures.length === 0) {
      lines.push("No failures detected.", "");
      continue;
    }

    for (const failure of failures) {
      lines.push(
        `- ${failure.id}: false positives [${failure.falsePositiveTypes.join(", ") || "none"}], false negatives [${failure.falseNegativeTypes.join(", ") || "none"}], over-pruned ${failure.overPruned}, under-pruned ${failure.underPruned}, text failures [${failure.textCheckFailures.join("; ") || "none"}]`
      );
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export function summarizeByCategory(cases: CaseEvaluation[]): CategorySummary[] {
  const grouped = new Map<string, CaseEvaluation[]>();
  for (const testCase of cases) {
    grouped.set(testCase.category, [...(grouped.get(testCase.category) ?? []), testCase]);
  }

  return Array.from(grouped.entries())
    .sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB))
    .map(([category, categoryCases]) => ({
      category,
      ...summarizeEvaluations(categoryCases),
    }));
}

function collectTextCheckFailures(testCase: PIIBenchmarkCase, processedText: string): string[] {
  const failures: string[] = [];

  for (const phrase of testCase.mustContain ?? []) {
    if (!processedText.includes(phrase)) {
      failures.push(`missing required phrase: ${phrase}`);
    }
  }

  for (const phrase of testCase.mustNotContain ?? []) {
    if (processedText.includes(phrase)) {
      failures.push(`contains sensitive phrase: ${phrase}`);
    }
  }

  return failures;
}

function uniqueTypes(types: PIIType[]): PIIType[] {
  return Array.from(new Set(types));
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function percentile(values: number[], percentileRank: number): number {
  if (values.length === 0) return 0;
  const index = Math.ceil(values.length * percentileRank) - 1;
  return values[Math.max(0, Math.min(index, values.length - 1))];
}

function formatRate(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

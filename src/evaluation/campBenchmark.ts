import { camp } from "../lib/middleware/CAMP";
import { sessionPII } from "../lib/middleware/PIIRegistry";
import { adversarialBenchmarkCases } from "./datasets/adversarialBenchmarkCases";
import { piiBenchmarkCases } from "./datasets/piiBenchmarkCases";
import { runSimpleRegexBaseline } from "./baselines/simpleRegexRedactor";
import {
  createBenchmarkReport,
  evaluateCase,
} from "./metrics";
import {
  BenchmarkReport,
  RedactionResult,
} from "./types";

export async function runCampBenchmark(
  cases = piiBenchmarkCases,
  label = "CAMP clean synthetic"
): Promise<BenchmarkReport> {
  const evaluations = [];

  for (const testCase of cases) {
    await sessionPII.clear();
    const start = performance.now();
    const result = await camp.process(testCase.input);
    const redactionResult: RedactionResult = {
      processedText: result.processedText,
      pruned: result.pruned,
      fragmentsDetected: result.fragmentsDetected,
      latencyMs: performance.now() - start,
    };
    evaluations.push(evaluateCase(testCase, redactionResult));
  }

  return createBenchmarkReport(label, evaluations);
}

export async function runSimpleRegexBenchmark(
  cases = piiBenchmarkCases,
  label = "Simple regex baseline clean synthetic"
): Promise<BenchmarkReport> {
  const evaluations = [];

  for (const testCase of cases) {
    const result = await runSimpleRegexBaseline(testCase.input);
    evaluations.push(evaluateCase(testCase, result));
  }

  return createBenchmarkReport(label, evaluations);
}

export async function runAllBenchmarks(): Promise<BenchmarkReport[]> {
  return [
    await runCampBenchmark(piiBenchmarkCases, "CAMP clean synthetic"),
    await runSimpleRegexBenchmark(piiBenchmarkCases, "Simple regex baseline clean synthetic"),
    await runCampBenchmark(adversarialBenchmarkCases, "CAMP adversarial/noisy"),
    await runSimpleRegexBenchmark(adversarialBenchmarkCases, "Simple regex baseline adversarial/noisy"),
  ];
}

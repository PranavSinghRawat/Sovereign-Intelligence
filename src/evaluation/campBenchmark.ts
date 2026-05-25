import { camp } from "../lib/middleware/CAMP";
import { sessionPII } from "../lib/middleware/PIIRegistry";
import benchmarkCases from "./datasets/pii-benchmark.json";
import { runSimpleRegexBaseline } from "./baselines/simpleRegexRedactor";
import {
  createBenchmarkReport,
  evaluateCase,
} from "./metrics";
import {
  BenchmarkReport,
  PIIBenchmarkCase,
  RedactionResult,
} from "./types";

export const piiBenchmarkCases = benchmarkCases as PIIBenchmarkCase[];

export async function runCampBenchmark(): Promise<BenchmarkReport> {
  const evaluations = [];

  for (const testCase of piiBenchmarkCases) {
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

  return createBenchmarkReport("CAMP", evaluations);
}

export async function runSimpleRegexBenchmark(): Promise<BenchmarkReport> {
  const evaluations = [];

  for (const testCase of piiBenchmarkCases) {
    const result = await runSimpleRegexBaseline(testCase.input);
    evaluations.push(evaluateCase(testCase, result));
  }

  return createBenchmarkReport("Simple regex baseline", evaluations);
}

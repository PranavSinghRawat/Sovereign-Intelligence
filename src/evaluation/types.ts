import { PIIType } from "../lib/middleware/PIIRegistry";

export interface PIIBenchmarkCase {
  id: string;
  category: string;
  input: string;
  expectedTypes: PIIType[];
  shouldPrune: boolean;
  mustContain?: string[];
  mustNotContain?: string[];
}

export interface RedactionResult {
  processedText: string;
  pruned: boolean;
  fragmentsDetected: string[];
  latencyMs: number;
}

export interface CaseEvaluation {
  id: string;
  category: string;
  expectedTypes: PIIType[];
  detectedTypes: PIIType[];
  truePositiveTypes: PIIType[];
  falsePositiveTypes: PIIType[];
  falseNegativeTypes: PIIType[];
  shouldPrune: boolean;
  didPrune: boolean;
  overPruned: boolean;
  underPruned: boolean;
  textCheckFailures: string[];
  latencyMs: number;
}

export interface BenchmarkSummary {
  caseCount: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1: number;
  overPruningRate: number;
  underPruningRate: number;
  textCheckFailureRate: number;
  minLatencyMs: number;
  p50LatencyMs: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  maxLatencyMs: number;
}

export interface CategorySummary extends BenchmarkSummary {
  category: string;
}

export interface BenchmarkReport {
  label: string;
  generatedAt: string;
  cases: CaseEvaluation[];
  summary: BenchmarkSummary;
  categories: CategorySummary[];
}

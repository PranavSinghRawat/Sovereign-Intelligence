import { CAMPResult } from "../middleware/CAMP";

export interface SystemMetrics {
  inferenceSpeed: number; // Tokens per second
  privacyEfficacy: number; // 0 to 1
  irpIndex: number; // Resilience-Privacy Index
  totalPrunedFragments: number;
  latencyMs: number;
}

class MetricsCapture {
  private metrics: SystemMetrics = {
    inferenceSpeed: 0,
    privacyEfficacy: 0,
    irpIndex: 0,
    totalPrunedFragments: 0,
    latencyMs: 0
  };

  /**
   * Updates metrics based on the latest inference and CAMP results.
   */
  update(timeMs: number, outputLengthChars: number, campResult: CAMPResult | null) {
    this.metrics.latencyMs = timeMs;
    const timeSec = timeMs / 1000;
    
    // Estimate tokens (roughly 4 chars per token)
    const estimatedTokens = outputLengthChars / 4;
    this.metrics.inferenceSpeed = timeSec > 0 ? estimatedTokens / timeSec : 0;

    if (campResult) {
      const threshold = 1.0; 
      let efficacy = 0;
      if (campResult.pruned) {
        efficacy = Math.min(campResult.cpeScore / threshold, 1.0);
        this.metrics.totalPrunedFragments += campResult.fragmentsDetected.length;
      }
      this.metrics.privacyEfficacy = efficacy;
    }

    // Calculate I_rp = Speed * (1 + PrivacyEfficacy)
    // High speed + High privacy = High I_rp
    this.metrics.irpIndex = this.metrics.inferenceSpeed * (1 + this.metrics.privacyEfficacy);
  }

  getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }
}

export const metricsCapture = new MetricsCapture();

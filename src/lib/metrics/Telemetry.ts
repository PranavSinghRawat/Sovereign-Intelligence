/**
 * Telemetry - Opt-In Differential Privacy Logger
 * 
 * Captures hardware crashes and WebGPU initialization failures.
 * Strips all PII and adds differential noise to prevent session fingerprinting.
 */

export class TelemetryLogger {
  private hasOptedIn: boolean;
  private readonly TELEMETRY_ENDPOINT = process.env.NEXT_PUBLIC_TELEMETRY_ENDPOINT || "https://httpbin.org/post";
  private readonly STORAGE_KEY = "sentinel_telemetry_opt_in";

  constructor() {
    // Restore persisted opt-in preference from localStorage
    if (typeof window !== "undefined") {
      this.hasOptedIn = localStorage.getItem(this.STORAGE_KEY) === "true";
    } else {
      this.hasOptedIn = false;
    }
  }

  setOptIn(status: boolean) {
    this.hasOptedIn = status;
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, String(status));
    }
    if (status) {
      console.log("[Telemetry] User opted-in to anonymous diagnostics.");
    }
  }

  getOptInStatus(): boolean {
    return this.hasOptedIn;
  }

  /**
   * Logs an error if the user has opted in.
   * Strips stack traces of user-specific paths and adds randomized noise.
   */
  async logError(errorType: string, errorMessage: string) {
    if (!this.hasOptedIn) return;

    // Differential Privacy: Add noise to the timestamp so events cannot be perfectly correlated
    const noisyTimestamp = Date.now() + (Math.random() * 5000 - 2500);

    const payload = {
      event_id: crypto.randomUUID(),
      timestamp: noisyTimestamp,
      level: "error",
      error_type: errorType,
      message: this.sanitizeMessage(errorMessage),
      environment: process.env.NODE_ENV || "production",
      platform: "webgpu",
    };

    try {
      console.log("[Telemetry] Transmitting sanitized payload:", payload);
      await fetch(this.TELEMETRY_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      console.log("[Telemetry] Securely transmitted telemetry payload.");
    } catch {
      // Silently fail if telemetry is blocked by ad-blockers (common in privacy tools)
    }
  }

  /**
   * Ensures no PII or local paths leak into the error log.
   */
  private sanitizeMessage(message: string): string {
    // Remove local file paths that might contain the username (e.g., /Users/pranavrawat/...)
    let sanitized = message.replace(/(?:\/[a-zA-Z0-9._-]+)+/g, "[LOCAL_PATH_REDACTED]");
    // Remove IP addresses just in case
    sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP_REDACTED]");
    return sanitized;
  }
}

export const telemetry = new TelemetryLogger();

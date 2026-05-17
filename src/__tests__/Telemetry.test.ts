import { describe, it, expect, vi, beforeEach } from "vitest";
import { telemetry } from "../lib/metrics/Telemetry";

describe("Telemetry Logger - Privacy Sanitization Moat", () => {
  beforeEach(() => {
    // Enable telemetry opt-in for testing
    telemetry.setOptIn(true);
    vi.clearAllMocks();
  });

  it("should successfully sanitize and remove local system file paths with usernames", () => {
    const rawErrorMessage = "Uncaught error in /Users/pranavrawat/Desktop/researchproj/src/app.tsx line 42";
    
    // Cast to access the private method cleanly in tests without using any
    const logger = telemetry as unknown as { sanitizeMessage: (msg: string) => string };
    const sanitized = logger.sanitizeMessage(rawErrorMessage);
    
    expect(sanitized).not.toContain("pranavrawat");
    expect(sanitized).not.toContain("Desktop");
    expect(sanitized).toContain("[LOCAL_PATH_REDACTED]");
  });

  it("should successfully mask IP addresses to prevent session geolocation leaks", () => {
    const rawErrorMessage = "Failed to connect to database at 192.168.1.105:5432 after 3 attempts";
    
    const logger = telemetry as unknown as { sanitizeMessage: (msg: string) => string };
    const sanitized = logger.sanitizeMessage(rawErrorMessage);
    
    expect(sanitized).not.toContain("192.168.1.105");
    expect(sanitized).toContain("[IP_REDACTED]");
  });

  it("should respect the opt-out configuration and not transmit any telemetry if disabled", async () => {
    telemetry.setOptIn(false);
    
    const fetchSpy = vi.spyOn(global, "fetch");
    await telemetry.logError("Test_Type", "Test_Message");
    
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

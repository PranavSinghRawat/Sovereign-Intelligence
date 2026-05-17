import { describe, it, expect, beforeEach, vi } from "vitest";
import { camp } from "../lib/middleware/CAMP";
import { sessionPII } from "../lib/middleware/PIIRegistry";

// Mock the SQLite OPFS database dependency since OPFS doesn't run in Node.js test environment
vi.mock("../lib/store/sqlite-db", () => {
  return {
    db: {
      isReady: () => true,
      exec: vi.fn(() => []),
    }
  };
});

describe("CAMP Middleware (Privacy Firewall)", () => {
  beforeEach(async () => {
    // Reset the internal session state
    vi.clearAllMocks();
    // Re-initialize registry with mocked DB
    await sessionPII.clear();
  });


  it("should detect and prune high-risk PII (Name + Location + Medical)", async () => {
    const input = "Hi, my name is John Doe. I live in Seattle and I need help with my diabetes medication.";
    
    const result = await camp.process(input);
    
    // Assertions
    expect(result.cpeScore).toBeGreaterThanOrEqual(1.0);
    expect(result.pruned).toBe(true);
    
    // The name and medical condition should be scrubbed
    expect(result.processedText).not.toContain("John Doe");
    expect(result.processedText).not.toContain("diabetes");
    
    // Check if the placeholders were inserted
    expect(result.processedText).toContain("[NAME_PRUNED]");
    expect(result.processedText).toContain("[MEDICAL_PRUNED]");
  });

  it("should not prune low-risk generic queries", async () => {
    const input = "Where can I find a food bank in this city?";
    
    const result = await camp.process(input);
    
    expect(result.cpeScore).toBeLessThan(1.0);
    expect(result.pruned).toBe(false);
    expect(result.processedText).toBe(input);
  });
});

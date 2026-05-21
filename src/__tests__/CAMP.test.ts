import { describe, it, expect, beforeEach, vi } from "vitest";
import { camp } from "../lib/middleware/CAMP";
import { sessionPII, PIIType } from "../lib/middleware/PIIRegistry";

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

  it("should whitelist and NOT prune mock PII content inside markdown code blocks", async () => {
    // Fill the registry with PII to force the system into a high-risk re-identifiable state
    await sessionPII.registerFragment(PIIType.NAME, "John Doe");
    await sessionPII.registerFragment(PIIType.LOCATION, "Seattle");
    await sessionPII.registerFragment(PIIType.MEDICAL, "diabetes");

    const input = "Check this Python script:\n```python\nemail = 'user@example.com'\nprint('Hello ' + name)\n```\nAlso I live in Seattle.";
    const result = await camp.process(input);

    // The code block content must remain completely unmodified, but external location "Seattle" should be pruned
    expect(result.processedText).toContain("email = 'user@example.com'");
    expect(result.processedText).toContain("print('Hello ' + name)");
    expect(result.processedText).not.toContain("user@example.com_PRUNED");
    expect(result.processedText).toContain("[LOCATION_PRUNED]");
  });
});

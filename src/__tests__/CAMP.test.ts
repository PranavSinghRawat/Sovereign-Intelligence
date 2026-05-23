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

  it("should detect credentials as high-risk PII and prune only the secret value", async () => {
    const input = "My name is Pranav and my email is pranav@example.com and my password is SuperSecret123.";

    const result = await camp.process(input);

    expect(result.cpeScore).toBeGreaterThanOrEqual(1.0);
    expect(result.pruned).toBe(true);
    expect(result.fragmentsDetected).toContain("CREDENTIAL: [REDACTED]");
    expect(result.fragmentsDetected).not.toContain("CREDENTIAL: SuperSecret123");
    expect(result.processedText).toContain("password is [CREDENTIAL_PRUNED]");
    expect(result.processedText).not.toContain("SuperSecret123");
    expect(result.processedText).toContain("[NAME_PRUNED]");
    expect(result.processedText).toContain("[EMAIL_PRUNED]");
  });

  it("should prune arbitrary sensitive disclosure fields without predefining the field name", async () => {
    const input = "My vault clue is blue-lamp-77 and our internal project code is ORION-42.";

    const result = await camp.process(input);

    expect(result.cpeScore).toBeGreaterThanOrEqual(1.0);
    expect(result.pruned).toBe(true);
    expect(result.fragmentsDetected).toContain("SENSITIVE_FIELD: [REDACTED]");
    expect(result.processedText).toContain("My vault clue is [SENSITIVE_FIELD_PRUNED]");
    expect(result.processedText).toContain("our internal project code is [SENSITIVE_FIELD_PRUNED]");
    expect(result.processedText).not.toContain("blue-lamp-77");
    expect(result.processedText).not.toContain("ORION-42");
  });

  it("should prioritize specific detectors over broad disclosure pruning", async () => {
    const input = "My bank account is 123456789 and my backup label is silver-door.";

    const result = await camp.process(input);

    expect(result.pruned).toBe(true);
    expect(result.fragmentsDetected).toContain("FINANCIAL: [REDACTED]");
    expect(result.processedText).toContain("My bank account is [FINANCIAL_PRUNED]");
    expect(result.processedText).toContain("my backup label is [SENSITIVE_FIELD_PRUNED]");
    expect(result.processedText).not.toContain("123456789");
    expect(result.processedText).not.toContain("silver-door");
  });

  it("should prune natural-language secret disclosures beyond direct field labels", async () => {
    const input = "The thing I use to unlock my account is blue lamp seven seven.";

    const result = await camp.process(input);

    expect(result.pruned).toBe(true);
    expect(result.fragmentsDetected).toContain("SENSITIVE_FIELD: [REDACTED]");
    expect(result.processedText).toContain("The thing I use to unlock my account is [SENSITIVE_FIELD_PRUNED]");
    expect(result.processedText).not.toContain("blue lamp seven seven");
  });

  it("should preserve sensitive-looking samples inside code while pruning surrounding prose", async () => {
    const input = "Here is a fixture: `const password = \"SuperSecret123\"`. My recovery hint is north-window.";

    const result = await camp.process(input);

    expect(result.pruned).toBe(true);
    expect(result.processedText).toContain("`const password = \"SuperSecret123\"`");
    expect(result.processedText).toContain("My recovery hint is [SENSITIVE_FIELD_PRUNED]");
    expect(result.processedText).not.toContain("north-window");
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

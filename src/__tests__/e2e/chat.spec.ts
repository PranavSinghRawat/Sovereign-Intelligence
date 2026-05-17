import { test, expect } from "@playwright/test";

test.describe("Sovereign Intelligence Layer - Landing Page E2E Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local server
    await page.goto("/");
  });

  test("should display main branding and loading state or chat layout", async ({ page }) => {
    // Wait for either the loading engine container or the main interface to load
    const title = page.locator("h1");
    await expect(title).toContainText("Sovereign Intelligence");
  });

  test("should render the P2P secure connections widget inside the sidebar", async ({ page }) => {
    // Check if the P2P secure connection header and buttons exist
    const p2pHeader = page.locator("text=P2P Secure Connection");
    const generateBtn = page.locator("text=Generate Invite Code");
    
    // We expect the P2P elements to be present in the sidebar
    await expect(p2pHeader).toBeVisible();
    await expect(generateBtn).toBeVisible();
  });

  test("should render the anonymous diagnostics toggle and allow clicking", async ({ page }) => {
    const telemetryLabel = page.locator("text=Anonymous Diagnostics");
    const toggleBtn = page.locator("button:has-div").first(); // Get the custom toggle button
    
    await expect(telemetryLabel).toBeVisible();
    await expect(toggleBtn).toBeVisible();
    
    // Toggle can be clicked cleanly
    await toggleBtn.click();
  });

  test("should render the local database stats in research metrics sidebar", async ({ page }) => {
    const latencyLabel = page.locator("text=Inference Latency");
    const privacyLabel = page.locator("text=Resilience-Privacy Index");
    
    await expect(latencyLabel).toBeVisible();
    await expect(privacyLabel).toBeVisible();
  });
});

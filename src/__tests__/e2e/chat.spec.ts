import { test, expect } from "@playwright/test";

test.describe("Sovereign Intelligence Layer - Landing Page E2E Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local server
    await page.goto("/chat");
  });

  test("should display main branding and loading state or chat layout", async ({ page }) => {
    // Wait for either the loading engine container or the main interface to load
    const title = page.locator("h1");
    await expect(title).toContainText("Sovereign Intelligence");
  });

  test("should render the P2P secure connections widget inside the sidebar", async ({ page }) => {
    // Click the P2P tab to make it visible
    await page.locator("text=P2P Link").click();

    // Check if the P2P secure connection header exists
    const p2pHeader = page.locator("text=P2P Secure Channel");
    await expect(p2pHeader).toBeVisible();

    // Click Manual Link to show generate button
    await page.locator("text=Manual Link").click();
    const generateBtn = page.locator("text=Generate Invite Code");
    await expect(generateBtn).toBeVisible();
  });

  test("should render the anonymous diagnostics toggle and allow clicking", async ({ page }) => {
    const telemetryLabel = page.locator("text=Diagnostics Uplink");
    const toggleBtn = page.locator("button[role='switch']").first(); // Get the custom toggle button
    
    await expect(telemetryLabel).toBeVisible();
    await expect(toggleBtn).toBeVisible();
    
    // Toggle can be clicked cleanly
    await toggleBtn.click();
  });

  test("should render the local database stats in research metrics sidebar", async ({ page }) => {
    // The Metrics tab is active by default
    const latencyLabel = page.locator("text=Inference Speed");
    const privacyLabel = page.locator("text=Resilience Factor");
    
    await expect(latencyLabel).toBeVisible();
    await expect(privacyLabel).toBeVisible();
  });
});

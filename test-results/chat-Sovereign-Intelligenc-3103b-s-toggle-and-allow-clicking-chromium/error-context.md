# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat.spec.ts >> Sovereign Intelligence Layer - Landing Page E2E Suite >> should render the anonymous diagnostics toggle and allow clicking
- Location: src/__tests__/e2e/chat.spec.ts:29:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Diagnostics Uplink')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Diagnostics Uplink')

```

```yaml
- main:
  - heading "Sovereign Intelligence" [level=1]
  - paragraph: Waking up local engine...
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Sovereign Intelligence Layer - Landing Page E2E Suite", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Navigate to local server
  6  |     await page.goto("/chat");
  7  |   });
  8  | 
  9  |   test("should display main branding and loading state or chat layout", async ({ page }) => {
  10 |     // Wait for either the loading engine container or the main interface to load
  11 |     const title = page.locator("h1");
  12 |     await expect(title).toContainText("Sovereign Intelligence");
  13 |   });
  14 | 
  15 |   test("should render the P2P secure connections widget inside the sidebar", async ({ page }) => {
  16 |     // Click the P2P tab to make it visible
  17 |     await page.locator("text=P2P Link").click();
  18 | 
  19 |     // Check if the P2P secure connection header exists
  20 |     const p2pHeader = page.locator("text=P2P Secure Channel");
  21 |     await expect(p2pHeader).toBeVisible();
  22 | 
  23 |     // Click Manual Link to show generate button
  24 |     await page.locator("text=Manual Link").click();
  25 |     const generateBtn = page.locator("text=Generate Invite Code");
  26 |     await expect(generateBtn).toBeVisible();
  27 |   });
  28 | 
  29 |   test("should render the anonymous diagnostics toggle and allow clicking", async ({ page }) => {
  30 |     const telemetryLabel = page.locator("text=Diagnostics Uplink");
  31 |     const toggleBtn = page.locator("button[role='switch']").first(); // Get the custom toggle button
  32 |     
> 33 |     await expect(telemetryLabel).toBeVisible();
     |                                  ^ Error: expect(locator).toBeVisible() failed
  34 |     await expect(toggleBtn).toBeVisible();
  35 |     
  36 |     // Toggle can be clicked cleanly
  37 |     await toggleBtn.click();
  38 |   });
  39 | 
  40 |   test("should render the local database stats in research metrics sidebar", async ({ page }) => {
  41 |     // The Metrics tab is active by default
  42 |     const latencyLabel = page.locator("text=Inference Speed");
  43 |     const privacyLabel = page.locator("text=Resilience Factor");
  44 |     
  45 |     await expect(latencyLabel).toBeVisible();
  46 |     await expect(privacyLabel).toBeVisible();
  47 |   });
  48 | });
  49 | 
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat.spec.ts >> Sovereign Intelligence Layer - Landing Page E2E Suite >> should display main branding and loading state or chat layout
- Location: src/__tests__/e2e/chat.spec.ts:9:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Sovereign Intelligence"
Received string:    "Trustless Aid. Private by Design."
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    12 × locator resolved to <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 max-w-[20ch] leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-400">Trustless Aid. Private by Design.</h1>
       - unexpected value "Trustless Aid. Private by Design."

```

```yaml
- heading "Trustless Aid. Private by Design." [level=1]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Sovereign Intelligence Layer - Landing Page E2E Suite", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Navigate to local server
  6  |     await page.goto("/");
  7  |   });
  8  | 
  9  |   test("should display main branding and loading state or chat layout", async ({ page }) => {
  10 |     // Wait for either the loading engine container or the main interface to load
  11 |     const title = page.locator("h1");
> 12 |     await expect(title).toContainText("Sovereign Intelligence");
     |                         ^ Error: expect(locator).toContainText(expected) failed
  13 |   });
  14 | 
  15 |   test("should render the P2P secure connections widget inside the sidebar", async ({ page }) => {
  16 |     // Check if the P2P secure connection header and buttons exist
  17 |     const p2pHeader = page.locator("text=P2P Secure Connection");
  18 |     const generateBtn = page.locator("text=Generate Invite Code");
  19 |     
  20 |     // We expect the P2P elements to be present in the sidebar
  21 |     await expect(p2pHeader).toBeVisible();
  22 |     await expect(generateBtn).toBeVisible();
  23 |   });
  24 | 
  25 |   test("should render the anonymous diagnostics toggle and allow clicking", async ({ page }) => {
  26 |     const telemetryLabel = page.locator("text=Anonymous Diagnostics");
  27 |     const toggleBtn = page.locator("button:has-div").first(); // Get the custom toggle button
  28 |     
  29 |     await expect(telemetryLabel).toBeVisible();
  30 |     await expect(toggleBtn).toBeVisible();
  31 |     
  32 |     // Toggle can be clicked cleanly
  33 |     await toggleBtn.click();
  34 |   });
  35 | 
  36 |   test("should render the local database stats in research metrics sidebar", async ({ page }) => {
  37 |     const latencyLabel = page.locator("text=Inference Latency");
  38 |     const privacyLabel = page.locator("text=Resilience-Privacy Index");
  39 |     
  40 |     await expect(latencyLabel).toBeVisible();
  41 |     await expect(privacyLabel).toBeVisible();
  42 |   });
  43 | });
  44 | 
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat.spec.ts >> Sovereign Intelligence Layer - Landing Page E2E Suite >> should render the local database stats in research metrics sidebar
- Location: src/__tests__/e2e/chat.spec.ts:36:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Inference Latency')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Inference Latency')

```

```yaml
- banner:
  - link "SOVEREIGN":
    - /url: /
  - navigation "Global navigation":
    - link "Home":
      - /url: /
    - link "Simulator":
      - /url: /simulator
    - link "Roadmap":
      - /url: /roadmap
    - link "Agent Workspace":
      - /url: /chat
- main:
  - text: V1.0 Edge-Native Release
  - heading "Trustless Aid. Private by Design." [level=1]
  - paragraph: The Sovereign Intelligence Layer compiles and runs a grounded 1.2B AI assistant directly in your browser. Utilizing hardware-accelerated WebGPU, no network requests are sent. Search medical clinics and community aid in complete safety.
  - link "Launch Agent":
    - /url: /chat
  - link "Try Simulator":
    - /url: /simulator
  - text: 22.2 tok/s Local Speed 100% PII Scrubbed 0.00 USD Server Cost
  - heading "WebGPU Local Inference" [level=3]
  - paragraph: Downloads and runs model weights directly in browser cache memory, using local unified memory architecture for serverless execution.
  - heading "CAMP Privacy Firewall" [level=3]
  - paragraph: Cumulative Agentic Masking and Pruning intercepts and anonymizes identity markers in a background worker before they enter the model context window.
  - heading "P2P Capability Network" [level=3]
  - paragraph: Decentralized browser-to-browser WebRTC database queries resolve resources dynamically via manual or automated mesh nodes.
- contentinfo:
  - text: © 2026 Sovereign Intelligence Layer. Local-first Open Source.
  - link "Workspace":
    - /url: /chat
  - link "GitHub":
    - /url: https://github.com/PranavSinghRawat/Sovereign-Intelligence
- alert
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
  12 |     await expect(title).toContainText("Sovereign Intelligence");
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
> 40 |     await expect(latencyLabel).toBeVisible();
     |                                ^ Error: expect(locator).toBeVisible() failed
  41 |     await expect(privacyLabel).toBeVisible();
  42 |   });
  43 | });
  44 | 
```
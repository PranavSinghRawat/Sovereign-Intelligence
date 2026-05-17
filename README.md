# Sovereign Intelligence Layer

The **Sovereign Intelligence Layer** is a privacy-native, local-first agentic framework designed to provide community members with secure access to sensitive aid resources (e.g., medical, financial) without data ever reaching the cloud.

It proves that **Privacy is a Feature, not a Limitation**, achieving a scalable, zero-cost, and absolute-privacy infrastructure.

## 🚀 Key Innovations

### 1. True Edge Sovereignty (Zero-Cloud)
Powered by WebGPU and the `Phi-4-mini` model, all reasoning occurs natively within the user's browser. It requires zero cloud APIs, scales infinitely at zero marginal cost, and is completely immune to server-side data breaches.

### 2. Autonomous Privacy Engineering (CAMP)
The **Cumulative Agentic Masking and Pruning (CAMP)** middleware represents a breakthrough in local data security. It calculates a **Cumulative PII Exposure (CPE)** score on-the-fly. If a user's prompt contains a "deadly trio" of identifiers (e.g., Name + Location + Medical Need), CAMP autonomously intercepts and prunes the prompt before the AI model processes it.

### 3. Decentralized Action Layer (`agent://`)
By leveraging the new **Model Context Protocol (MCP)**, the Sovereign Intelligence Layer acts as a peer-to-peer node, resolving capabilities via a custom `agent://` URI scheme to securely locate local aid resources.

### 4. Mathematical Proof of Trust ($I_{rp}$)
We introduce the **Resilience-Privacy Index ($I_{rp}$)**, a real-time metric that proves the system's viability:
`I_rp = Edge Speed (tokens/sec) * (1 + Privacy Efficacy)`
This index guarantees high edge speed (resilience) coupled with active data pruning (privacy).

---

## 🛠️ Architecture

* **Frontend**: Next.js 15+ (App Router), Tailwind CSS (Glassmorphism UI), Framer Motion.
* **Edge Inference**: `@mlc-ai/web-llm` running `Phi-4-mini-instruct-q4f16_1-MLC`.
* **Privacy Moat**: Custom `CAMP` middleware with OPFS SQLite-backed `PIIRegistry`.
* **Action Protocols**: Model Context Protocol (MCP) standardized tool schemas.

## 📦 Getting Started

### Prerequisites
* A WebGPU-compatible browser (e.g., Chrome/Edge version 113+).
* Node.js v18+

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/PranavSinghRawat/Sovereign-Intelligence.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Usage
Open `http://localhost:3000` in your WebGPU-enabled browser. The system will download and cache the Phi-4 model weights upon first load. Subsequent loads will be near-instantaneous from local cache.

## 🧪 Research Metrics Lab

The included "Command Center" dashboard actively tracks:
- **Inference Latency** & Tokens/sec
- **Total Fragments Pruned**
- **$I_{rp}$ Index Calculation**

This data is meant for scientific research validating the efficiency of fully autonomous edge nodes.

---
*Built as a blueprint for the future of private, agentic software.*

# Related Work Notes

## Browser-Local LLM Inference

WebLLM demonstrates high-performance in-browser LLM inference using WebGPU and WebAssembly, and exposes an OpenAI-style API for browser applications. This project builds on that deployment direction but studies a different systems question: whether sensitive-assistance prompts can be filtered before local model context or tool routing.

Reference:
- WebLLM paper: https://arxiv.org/abs/2412.15803
- WebLLM repository: https://github.com/mlc-ai/web-llm

Recent WebGPU inference work such as LlamaWeb further supports the broader feasibility of browser-based LLM execution across model formats and devices.

Reference:
- LlamaWeb paper: https://arxiv.org/abs/2605.20706

## PII Detection and De-Identification

Microsoft Presidio is a production-oriented data protection SDK for PII detection and de-identification in text. CAMP differs by focusing on a lightweight deterministic browser-local middleware path for pre-tokenization pruning, rather than a general server-side anonymization SDK.

Reference:
- Microsoft Presidio: https://microsoft.github.io/presidio/

## WebRTC Security

WebRTC security architecture defines browser-mediated real-time communication with signaling and identity considerations. This project uses signed encrypted signaling as an implementation hardening step, but it does not claim to implement formal zero-knowledge proofs.

Reference:
- RFC 8827, WebRTC Security Architecture: https://www.rfc-editor.org/rfc/rfc8827.html

## Differential Privacy Terminology

The project avoids claiming differential privacy because CAMP is a deterministic redaction layer and does not define a formal privacy budget. This follows the distinction between practical de-identification and mathematically specified differential privacy mechanisms.

References:
- NIST threat models for differential privacy: https://www.nist.gov/node/1636466
- Dwork and Roth, The Algorithmic Foundations of Differential Privacy: https://www.cis.upenn.edu/~aaroth/Papers/privacybook.pdf


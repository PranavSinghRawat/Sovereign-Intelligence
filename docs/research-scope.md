# Research Scope

## Working Title

Evaluating Browser-Local Privacy Filtering for Sensitive AI Assistance Workflows

## Research Claim

This project should be framed as a feasibility study of a browser-local agent runtime that reduces privacy exposure by pruning sensitive user fragments before local model inference and retrieval/tool routing.

The defensible claim is:

> Browser-local AI agents can reduce privacy exposure in sensitive assistance workflows through deterministic pre-tokenization pruning, while preserving enough task utility for constrained resource-routing scenarios.

## Primary Contribution

The core contribution is the integration and evaluation of:

- Browser-local LLM execution through WebGPU.
- Pre-tokenization PII pruning through CAMP.
- Local persistence for privacy state and retrieval cache metadata.
- Signed and encrypted peer signaling for optional browser-to-browser coordination.
- A reproducible evaluation harness for privacy filtering behavior.

This is a systems and privacy-engineering contribution. It should not be presented as a new foundation model, a complete anonymity system, or a formally verified privacy protocol.

## Non-Goals

- Proving complete anonymity.
- Replacing professional medical, legal, or social services advice.
- Claiming that all workflows are cloud-free when optional external APIs or relays are enabled.
- Claiming formal zero-knowledge security without implementing a zero-knowledge proof system.
- Claiming formal differential privacy without defining a privacy budget and mechanism.

## Evaluation Questions

1. How accurately does CAMP detect and prune sensitive fragments across common sensitive-assistance prompts?
2. What false positives does CAMP introduce on benign prompts and code samples?
3. What latency overhead does CAMP add before local model inference?
4. How does CAMP compare against a simple regex redaction baseline?
5. Which sensitive categories remain weak, ambiguous, or over-pruned?

## Publication Positioning

Best-fit venues are applied AI, privacy engineering, human-centered security, systems demo, or student research workshops. The project can also be published as an arXiv preprint after evaluation results, limitations, and reproducibility commands are included.

The paper should use measured language: prototype, feasibility study, browser-local, privacy-preserving, pre-tokenization redaction, and signed encrypted signaling.


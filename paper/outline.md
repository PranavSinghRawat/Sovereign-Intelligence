# Paper Outline

## Working Title

Evaluating Browser-Local Privacy Filtering for Sensitive AI Assistance Workflows

## 1. Introduction

- Sensitive assistance workflows can require names, location, medical status, financial status, or credentials-adjacent context.
- Cloud inference improves capability but expands the privacy boundary.
- Browser-local inference creates a narrower boundary, but prompts must still be sanitized before model context, retrieval, or tool routing.
- This paper evaluates a browser-local prototype with deterministic pre-tokenization privacy filtering.

## 2. Research Questions

1. Can deterministic browser-local filtering detect and prune common sensitive fragments before inference?
2. How does CAMP compare with a simple regex baseline?
3. What latency overhead does pre-tokenization filtering add?
4. Which privacy claims remain unsupported without stronger formal mechanisms?

## 3. System Design

- Browser-local WebGPU inference.
- CAMP pre-tokenization middleware.
- Local PII fingerprint registry.
- Local SQLite/OPFS persistence.
- Optional resource routing and peer coordination.
- Optional signed encrypted signaling.

## 4. CAMP Middleware

- Entity-specific detectors.
- Generic sensitive-field disclosure detector.
- Cumulative PII Exposure score.
- Code-block preservation.
- Reverse-order replacement to avoid offset corruption.

## 5. Evaluation Method

- Deterministic 100-case clean synthetic benchmark.
- Separate 100-case adversarial/noisy split.
- Case categories: mixed PII, contact data, address, medical, financial, identity, arbitrary secret fields, benign prompts, developer workflow prompts, quasi-identifiers.
- Baselines: no filtering as conceptual baseline, simple regex redactor as implemented baseline, CAMP as proposed middleware.
- Metrics: precision, recall, F1, over-pruning, under-pruning, text-check failure rate, average latency, p95 latency.

## 6. Results

- Use `evaluation-results/camp-summary.md` as the source table.
- Report headline comparison between CAMP and the simple regex baseline on the clean split and adversarial/noisy split.
- Include category breakdown to avoid hiding weak classes.
- Report latency as local benchmark overhead, not a universal browser performance guarantee.
- Highlight that the current adversarial split is detector-aware and should be followed by independently authored prompts.

## 7. Security and Privacy Analysis

- Summarize the threat model from `docs/threat-model.md`.
- Explain what the system protects against.
- Explain what remains out of scope.
- Avoid using zero-knowledge or differential privacy claims unless those mechanisms are added formally.

## 8. Limitations

- Synthetic benchmark.
- English-centered prompts.
- Pattern-aligned test distribution.
- Current adversarial split is still synthetic and detector-aware.
- Current benchmark does not prove performance on independently authored or real-world prompts.
- No formal anonymity proof.
- No formal differential privacy mechanism.
- Browser/runtime compromise remains out of scope.
- External APIs and signaling relays can leak metadata when enabled.

## 9. Related Work

- Local inference in browsers.
- Privacy-preserving NLP and redaction.
- Client-side personal data stores.
- WebRTC security and signaling.
- Human-centered privacy assistants.

## 10. Conclusion

- Browser-local privacy filtering is feasible for constrained sensitive-assistance workflows.
- CAMP improves coverage over a simple regex baseline in the current synthetic benchmark.
- Stronger claims require larger real-world datasets, adversarial testing, multilingual coverage, and formal privacy mechanisms.

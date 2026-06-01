# Evaluating Browser-Local Privacy Filtering for Sensitive AI Assistance Workflows

## Abstract

Sensitive assistance workflows often require users to disclose personal context before receiving useful routing, search, or triage support. Cloud-hosted language models can improve these workflows, but they also expand the privacy boundary by transmitting raw prompts to remote inference providers. This paper evaluates a browser-local alternative: a privacy-preserving agent runtime that performs deterministic pre-tokenization pruning of personally identifying information before local inference and tool routing.

We present the Sovereign Intelligence Layer, a browser-native prototype combining WebGPU-based local language-model execution, Cumulative Agentic Masking and Pruning (CAMP), local browser persistence, and optional signed encrypted peer signaling. CAMP is evaluated on two deterministic 100-case benchmark splits: a clean synthetic split and an adversarial/noisy split. CAMP achieves 100.0% F1 on both current splits, while a simple regex baseline achieves 60.0% F1 on the clean split and 32.1% F1 on the adversarial/noisy split. These results are feasibility evidence, not universal privacy guarantees, because the benchmark remains synthetic and detector-aware.

## 1. Introduction

AI assistance systems are increasingly used for tasks where users may disclose sensitive context: medical needs, location, identity, financial stress, housing status, and credentials-adjacent recovery clues. A cloud-hosted model can be useful in such workflows, but raw prompt transmission expands the privacy boundary. Browser-local inference reduces that boundary, yet local inference alone is not enough: sensitive fragments can still enter model context, retrieval pipelines, logs, caches, or peer-routing messages.

This project studies whether a browser-local agent can reduce sensitive exposure before inference. The key idea is deterministic pre-tokenization pruning: detect sensitive fragments in the browser, replace them with typed placeholders, and only then pass the sanitized prompt to local model and tool-routing components.

## 2. System Overview

The prototype combines browser-local WebGPU inference, CAMP privacy middleware, SQLite-backed local persistence, resource-routing tools, and optional signed encrypted WebRTC signaling. The system is browser-local by default, but optional integrations such as weather APIs, geocoding, telemetry, or signaling relays can still introduce external metadata exposure.

The measurable research contribution is CAMP, a deterministic privacy middleware layer that detects PII and sensitive disclosures before model tokenization.

## 3. CAMP Middleware

CAMP uses entity-specific detectors for email, credentials, financial identifiers, government IDs, phone numbers, addresses, age, names, locations, professions, and medical terms. It also includes generic sensitive-field detectors for disclosures such as private recovery clues or internal codes. A cumulative exposure score controls when detected fragments are pruned, and code-block preservation avoids modifying developer fixtures.

## 4. Evaluation

The evaluation compares CAMP with a simple regex baseline. The clean split contains 100 deterministic prompts covering common sensitive-assistance patterns. The adversarial/noisy split contains 100 prompts with lowercase phrasing, obfuscated contact details, dotted card numbers, multilingual templates, code fixtures, unlabeled addresses, and recovery-secret variants.

Metrics include precision, recall, F1, over-pruning, under-pruning, text-check failure rate, p50 latency, average latency, and p95 latency. Generated results are stored in `evaluation-results/camp-summary.md`, `evaluation-results/camp-summary.csv`, and `evaluation-results/camp-results.json`.

## 5. Results

| Variant | Cases | Precision | Recall | F1 |
| --- | ---: | ---: | ---: | ---: |
| CAMP clean synthetic | 100 | 100.0% | 100.0% | 100.0% |
| Simple regex baseline clean synthetic | 100 | 88.5% | 45.4% | 60.0% |
| CAMP adversarial/noisy | 100 | 100.0% | 100.0% | 100.0% |
| Simple regex baseline adversarial/noisy | 100 | 95.2% | 19.3% | 32.1% |

The results show that CAMP substantially outperforms the simple regex baseline on the current synthetic benchmark. The largest baseline failures occur on arbitrary sensitive fields, code-block preservation, multilingual templates, obfuscated contact data, and unlabeled addresses.

## 6. Limitations

The benchmark is synthetic and detector-aware. A stronger submission should include independently authored prompts, broader multilingual coverage, and real user-task paraphrases with all raw sensitive values replaced by consent-safe synthetic fixtures. CAMP is deterministic and can miss unfamiliar phrasing. The system does not provide formal anonymity, zero-knowledge proofs, or differential privacy. Browser compromise, malicious extensions, and side-channel leakage remain out of scope.

## 7. Conclusion

The current prototype shows that browser-local pre-tokenization privacy filtering is feasible for constrained sensitive-assistance workflows. CAMP provides stronger coverage than a simple regex baseline in the current benchmark while preserving a reproducible evaluation harness. The next stage is external validation: independent prompt authoring, broader language coverage, and runtime measurements across browsers and hardware.


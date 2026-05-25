# Threat Model

## Assets

- Raw user prompts that may contain PII, credentials, medical facts, financial identifiers, addresses, or private contextual clues.
- Local PII fragment fingerprints stored by the browser-side registry.
- Local model context before and after CAMP processing.
- Peer signaling payloads used for WebRTC setup.
- Optional telemetry payloads when the user opts in.

## Intended Protections

The system is designed to reduce exposure to:

- Cloud model providers receiving raw sensitive prompts.
- Accidental retention of raw PII in browser persistence.
- Basic signaling tampering through unsigned or replayed handshake messages.
- Resource-routing hallucination when verified resource or weather sections are provided.
- Sensitive examples in prose being sent onward without deterministic pruning.

## Trust Assumptions

- The browser runtime is not compromised.
- The web application code loaded by the user is the intended application code.
- WebCrypto implementations are correct.
- Users understand when optional external APIs or signaling relays are enabled.
- Local device access controls protect browser profile storage.

## Out of Scope

- Malicious browser extensions.
- Compromised operating systems or devices.
- Side-channel attacks against GPU, memory, timing, or browser internals.
- Formal anonymity guarantees.
- Formal zero-knowledge proofs.
- Formal differential privacy unless a complete mechanism and privacy budget are added.
- Perfect PII detection across all languages, slang, misspellings, and adversarial prompts.

## Known Residual Risks

- CAMP is deterministic and pattern-driven, so it can miss unfamiliar or deliberately obfuscated PII.
- CAMP can over-prune benign data when wording resembles a sensitive disclosure.
- Optional API calls can still reveal location or query intent to the external service used.
- A public signaling relay can observe metadata such as connection timing and room identifiers, even when payloads are encrypted.
- Local LLMs can hallucinate if asked outside the evaluated resource-routing workflow.
- Browser storage protects against casual leakage, not against a compromised local account.

## Terminology Guidance

Use "signed encrypted signaling" unless a real zero-knowledge proof protocol is implemented.

Use "timestamp noise" or "jittered telemetry timestamp" unless a formal differential privacy mechanism is specified.

Use "browser-local by default" instead of "zero-cloud" when optional weather, geocoding, telemetry, or signaling services are enabled.


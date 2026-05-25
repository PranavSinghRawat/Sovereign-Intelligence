# CAMP Benchmark Summary

Generated: 2026-05-25T10:53:28.015Z

| Variant | Cases | Precision | Recall | F1 | Over-prune | Under-prune | Avg latency | p95 latency | Text failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| CAMP | 16 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.41 ms | 3.03 ms | 0.0% |
| Simple regex baseline | 16 | 90.0% | 40.9% | 56.3% | 0.0% | 12.5% | 0.02 ms | 0.24 ms | 50.0% |

## Failure Cases

### CAMP

No failures detected.

### Simple regex baseline

- pii-medical-location: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Seattle; contains sensitive phrase: diabetes]
- pii-phone-address: false positives [none], false negatives [ADDRESS], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 145 Market Street]
- pii-government-id: false positives [none], false negatives [ID], over-pruned false, under-pruned false, text failures [none]
- pii-secret-field: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: blue-lamp-77; contains sensitive phrase: ORION-42]
- pii-natural-language-secret: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: blue lamp seven seven]
- pii-code-block-preservation: false positives [CREDENTIAL], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned false, text failures [missing required phrase: `const password = "SuperSecret123"`; contains sensitive phrase: north-window]
- benign-weather: false positives [none], false negatives [LOCATION], over-pruned false, under-pruned false, text failures [none]
- pii-age-profession: false positives [none], false negatives [AGE, PROFESSION], over-pruned false, under-pruned false, text failures [none]
- pii-upi: false positives [none], false negatives [FINANCIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: pranav@bank]
- pii-aadhaar: false positives [none], false negatives [ID], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 1234-5678-9012]
- pii-address-shipping: false positives [none], false negatives [ADDRESS], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 10 Oak Avenue]


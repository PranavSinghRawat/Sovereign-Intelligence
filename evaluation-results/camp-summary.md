# CAMP Benchmark Summary

Generated: 2026-05-29T14:31:53.640Z

| Variant | Cases | Precision | Recall | F1 | Over-prune | Under-prune | Avg latency | p95 latency | Text failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| CAMP | 100 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.09 ms | 0.08 ms | 0.0% |
| Simple regex baseline | 100 | 88.5% | 45.4% | 60.0% | 0.0% | 12.0% | 0.01 ms | 0.01 ms | 56.0% |

## Category Breakdown

### CAMP

| Category | Cases | Precision | Recall | F1 | Over-prune | Under-prune | Text failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| address | 11 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| benign | 10 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| benign-code | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| benign-general | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| benign-resource | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| benign-weather | 1 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| contact | 11 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| developer-workflow | 9 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| financial | 12 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| identity | 12 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| medical | 11 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| mixed-pii | 1 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| quasi-identifiers | 7 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| sensitive-field | 12 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |

### Simple regex baseline

| Category | Cases | Precision | Recall | F1 | Over-prune | Under-prune | Text failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| address | 11 | 100.0% | 50.0% | 66.7% | 0.0% | 0.0% | 100.0% |
| benign | 10 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| benign-code | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| benign-general | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| benign-resource | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| benign-weather | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| contact | 11 | 100.0% | 95.5% | 97.7% | 0.0% | 0.0% | 9.1% |
| developer-workflow | 9 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% |
| financial | 12 | 100.0% | 92.3% | 96.0% | 0.0% | 0.0% | 8.3% |
| identity | 12 | 100.0% | 47.8% | 64.7% | 0.0% | 0.0% | 91.7% |
| medical | 11 | 100.0% | 33.3% | 50.0% | 0.0% | 0.0% | 100.0% |
| mixed-pii | 1 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| quasi-identifiers | 7 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| sensitive-field | 12 | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |


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
- generated-medical-1: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Mumbai; contains sensitive phrase: diabetes]
- generated-medical-2: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Delhi; contains sensitive phrase: asthma]
- generated-medical-3: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Seattle; contains sensitive phrase: anxiety]
- generated-medical-4: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Austin; contains sensitive phrase: migraine]
- generated-medical-5: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Boston; contains sensitive phrase: hypertension]
- generated-medical-6: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Denver; contains sensitive phrase: insomnia]
- generated-medical-7: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Chicago; contains sensitive phrase: arthritis]
- generated-medical-8: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Portland; contains sensitive phrase: depression]
- generated-medical-9: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Phoenix; contains sensitive phrase: thyroid]
- generated-medical-10: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Atlanta; contains sensitive phrase: epilepsy]
- generated-address-1: false positives [none], false negatives [ADDRESS], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 12 Maple Street Apartment 2A, Boston]
- generated-address-2: false positives [none], false negatives [ADDRESS], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 44 Cedar Road, Seattle]
- generated-address-3: false positives [none], false negatives [ADDRESS], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 901 Pine Avenue Unit 5, Denver]
- generated-address-4: false positives [none], false negatives [ADDRESS], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 77 Market Street, San Francisco]
- generated-address-5: false positives [none], false negatives [ADDRESS], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 188 Lake View Drive, Chicago]
- generated-address-6: false positives [none], false negatives [ADDRESS], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 26 Hill Lane, Austin]
- generated-address-7: false positives [none], false negatives [ADDRESS], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 310 River Road, Portland]
- generated-address-8: false positives [none], false negatives [ADDRESS], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 62 Park Avenue, Atlanta]
- generated-address-9: false positives [none], false negatives [ADDRESS], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 9 Sunset Boulevard, Phoenix]
- generated-address-10: false positives [none], false negatives [ADDRESS], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 55 Oak Street, Dallas]
- generated-secret-1: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: blue-lamp-77]
- generated-secret-2: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: north-window]
- generated-secret-3: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: silver-door]
- generated-secret-4: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: delta-forest-19]
- generated-secret-5: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: orange-moon]
- generated-secret-6: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: river-stone-42]
- generated-secret-7: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: hidden-bridge]
- generated-secret-8: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: winter-key-08]
- generated-secret-9: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: quiet-harbor]
- generated-secret-10: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: green-vault-6]
- generated-id-1: false positives [none], false negatives [ID], over-pruned false, under-pruned false, text failures [contains sensitive phrase: P1A3B5C]
- generated-id-2: false positives [none], false negatives [ID], over-pruned false, under-pruned false, text failures [contains sensitive phrase: P2A4B6C]
- generated-id-3: false positives [none], false negatives [ID], over-pruned false, under-pruned false, text failures [contains sensitive phrase: P3A5B7C]
- generated-id-4: false positives [none], false negatives [ID], over-pruned false, under-pruned false, text failures [contains sensitive phrase: P4A6B8C]
- generated-id-5: false positives [none], false negatives [ID], over-pruned false, under-pruned false, text failures [contains sensitive phrase: P5A7B9C]
- generated-id-6: false positives [none], false negatives [ID], over-pruned false, under-pruned false, text failures [contains sensitive phrase: P6A8B10C]
- generated-id-7: false positives [none], false negatives [ID], over-pruned false, under-pruned false, text failures [contains sensitive phrase: P7A9B11C]
- generated-id-8: false positives [none], false negatives [ID], over-pruned false, under-pruned false, text failures [contains sensitive phrase: P8A10B12C]
- generated-id-9: false positives [none], false negatives [ID], over-pruned false, under-pruned false, text failures [contains sensitive phrase: P9A11B13C]
- generated-id-10: false positives [none], false negatives [ID], over-pruned false, under-pruned false, text failures [contains sensitive phrase: P10A12B14C]
- generated-code-preservation-1: false positives [CREDENTIAL], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned false, text failures [missing required phrase: `const password = "blue-lamp-77"`; contains sensitive phrase: north-window]
- generated-code-preservation-2: false positives [CREDENTIAL], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned false, text failures [missing required phrase: `const password = "north-window"`; contains sensitive phrase: silver-door]
- generated-code-preservation-3: false positives [CREDENTIAL], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned false, text failures [missing required phrase: `const password = "silver-door"`; contains sensitive phrase: delta-forest-19]
- generated-code-preservation-4: false positives [CREDENTIAL], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned false, text failures [missing required phrase: `const password = "delta-forest-19"`; contains sensitive phrase: orange-moon]
- generated-code-preservation-5: false positives [CREDENTIAL], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned false, text failures [missing required phrase: `const password = "orange-moon"`; contains sensitive phrase: river-stone-42]
- generated-code-preservation-6: false positives [CREDENTIAL], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned false, text failures [missing required phrase: `const password = "river-stone-42"`; contains sensitive phrase: hidden-bridge]
- generated-code-preservation-7: false positives [CREDENTIAL], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned false, text failures [missing required phrase: `const password = "hidden-bridge"`; contains sensitive phrase: winter-key-08]
- generated-code-preservation-8: false positives [CREDENTIAL], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned false, text failures [missing required phrase: `const password = "winter-key-08"`; contains sensitive phrase: quiet-harbor]
- generated-quasi-1: false positives [none], false negatives [AGE, PROFESSION], over-pruned false, under-pruned false, text failures [none]
- generated-quasi-2: false positives [none], false negatives [AGE, PROFESSION], over-pruned false, under-pruned false, text failures [none]
- generated-quasi-3: false positives [none], false negatives [AGE, PROFESSION], over-pruned false, under-pruned false, text failures [none]
- generated-quasi-4: false positives [none], false negatives [AGE, PROFESSION], over-pruned false, under-pruned false, text failures [none]
- generated-quasi-5: false positives [none], false negatives [AGE, PROFESSION], over-pruned false, under-pruned false, text failures [none]
- generated-quasi-6: false positives [none], false negatives [AGE, PROFESSION], over-pruned false, under-pruned false, text failures [none]


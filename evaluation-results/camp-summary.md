# CAMP Benchmark Summary

Generated: 2026-06-01T13:37:33.996Z

| Variant | Cases | Precision | Recall | F1 | Over-prune | Under-prune | p50 latency | Avg latency | p95 latency | Text failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| CAMP clean synthetic | 100 | 100.0% | 100.0% | 100.0% | 1.0% | 0.0% | 0.04 ms | 0.11 ms | 0.13 ms | 0.0% |
| Simple regex baseline clean synthetic | 100 | 88.5% | 45.4% | 60.0% | 0.0% | 12.0% | 0.00 ms | 0.01 ms | 0.01 ms | 56.0% |
| CAMP adversarial/noisy | 100 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.05 ms | 0.06 ms | 0.09 ms | 0.0% |
| Simple regex baseline adversarial/noisy | 100 | 95.2% | 19.3% | 32.1% | 1.0% | 57.0% | 0.00 ms | 0.00 ms | 0.00 ms | 98.0% |

## Category Breakdown

### CAMP clean synthetic

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
| identity | 12 | 100.0% | 100.0% | 100.0% | 8.3% | 0.0% | 0.0% |
| medical | 11 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| mixed-pii | 1 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| quasi-identifiers | 7 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| sensitive-field | 12 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |

### Simple regex baseline clean synthetic

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

### CAMP adversarial/noisy

| Category | Cases | Precision | Recall | F1 | Over-prune | Under-prune | Text failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| adversarial-address | 1 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| adversarial-benign | 2 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| adversarial-casing | 12 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| adversarial-credential | 1 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| adversarial-developer | 11 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| adversarial-financial | 12 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| adversarial-identity | 2 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| adversarial-medical | 2 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| adversarial-mixed | 1 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| adversarial-multilingual | 22 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| adversarial-obfuscation | 22 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| adversarial-quasi | 1 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |
| adversarial-secret | 11 | 100.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% |

### Simple regex baseline adversarial/noisy

| Category | Cases | Precision | Recall | F1 | Over-prune | Under-prune | Text failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| adversarial-address | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| adversarial-benign | 2 | 0.0% | 0.0% | 0.0% | 50.0% | 0.0% | 50.0% |
| adversarial-casing | 12 | 100.0% | 34.3% | 51.1% | 0.0% | 0.0% | 100.0% |
| adversarial-credential | 1 | 100.0% | 50.0% | 66.7% | 0.0% | 0.0% | 0.0% |
| adversarial-developer | 11 | 0.0% | 0.0% | 0.0% | 0.0% | 90.9% | 100.0% |
| adversarial-financial | 12 | 100.0% | 45.8% | 62.9% | 0.0% | 8.3% | 100.0% |
| adversarial-identity | 2 | 100.0% | 50.0% | 66.7% | 0.0% | 0.0% | 100.0% |
| adversarial-medical | 2 | 100.0% | 25.0% | 40.0% | 0.0% | 50.0% | 100.0% |
| adversarial-mixed | 1 | 100.0% | 50.0% | 66.7% | 0.0% | 0.0% | 100.0% |
| adversarial-multilingual | 22 | 100.0% | 16.7% | 28.6% | 0.0% | 50.0% | 100.0% |
| adversarial-obfuscation | 22 | 100.0% | 2.3% | 4.4% | 0.0% | 95.5% | 100.0% |
| adversarial-quasi | 1 | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| adversarial-secret | 11 | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |


## Failure Cases

### CAMP clean synthetic

- pii-government-id: false positives [none], false negatives [none], over-pruned true, under-pruned false, text failures [none]

### Simple regex baseline clean synthetic

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

### CAMP adversarial/noisy

No failures detected.

### Simple regex baseline adversarial/noisy

- adv-lowercase-name-location: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: seattle; contains sensitive phrase: asthma]
- adv-spaced-email: false positives [none], false negatives [EMAIL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: pranav [at] example [dot] com]
- adv-phone-words: false positives [none], false negatives [PHONE, ADDRESS], over-pruned false, under-pruned true, text failures [contains sensitive phrase: four one five; contains sensitive phrase: 12 Maple Street]
- adv-medical-synonym: false positives [none], false negatives [MEDICAL, LOCATION], over-pruned false, under-pruned true, text failures [contains sensitive phrase: high blood pressure; contains sensitive phrase: Austin]
- adv-secret-without-trigger: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: blue-lamp-77]
- adv-card-with-dots: false positives [none], false negatives [FINANCIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 4111.1111.1111.1111]
- adv-aadhaar-spaced: false positives [none], false negatives [ID], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 1234 5678 9012]
- adv-json-code-preservation: false positives [EMAIL], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned false, text failures [missing required phrase: `{"email":"user@example.com"}`; contains sensitive phrase: north-window]
- adv-multilingual-spanish: false positives [none], false negatives [NAME, LOCATION, MEDICAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: Sofia Garcia; contains sensitive phrase: Austin; contains sensitive phrase: diabetes]
- adv-multilingual-hindi-english: false positives [none], false negatives [NAME, CREDENTIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Aarav Mehta; contains sensitive phrase: Secret123]
- adv-benign-fake-password-code: false positives [CREDENTIAL], false negatives [none], over-pruned true, under-pruned false, text failures [missing required phrase: `password = "example"`]
- adv-credential-api-key: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned false, text failures [none]
- adv-address-no-label: false positives [none], false negatives [ADDRESS], over-pruned false, under-pruned true, text failures [contains sensitive phrase: 44 Cedar Road; contains sensitive phrase: Seattle]
- adv-age-profession-lowercase: false positives [none], false negatives [AGE, PROFESSION, LOCATION], over-pruned false, under-pruned true, text failures [contains sensitive phrase: 71; contains sensitive phrase: pharmacist; contains sensitive phrase: Boston]
- adv-email-plus-secret: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned false, text failures [contains sensitive phrase: quiet harbor]
- adv-medical-abbreviation: false positives [none], false negatives [MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: HTN]
- adv-ssn-dashes: false positives [none], false negatives [ID], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 123-45-6789]
- adv-banking-natural: false positives [none], false negatives [FINANCIAL, SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: 7788; contains sensitive phrase: landlord bridge]
- adv-location-lowercase: false positives [none], false negatives [LOCATION], over-pruned false, under-pruned false, text failures [contains sensitive phrase: phoenix]
- adv-generated-lowercase-1: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: mumbai; contains sensitive phrase: diabetes]
- adv-generated-lowercase-2: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: delhi; contains sensitive phrase: asthma]
- adv-generated-lowercase-3: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: seattle; contains sensitive phrase: anxiety]
- adv-generated-lowercase-4: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: austin; contains sensitive phrase: migraine]
- adv-generated-lowercase-5: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: boston; contains sensitive phrase: hypertension]
- adv-generated-lowercase-6: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: denver; contains sensitive phrase: insomnia]
- adv-generated-lowercase-7: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: chicago; contains sensitive phrase: arthritis]
- adv-generated-lowercase-8: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: portland; contains sensitive phrase: depression]
- adv-generated-lowercase-9: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: phoenix; contains sensitive phrase: thyroid]
- adv-generated-lowercase-10: false positives [none], false negatives [LOCATION, MEDICAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: atlanta; contains sensitive phrase: epilepsy]
- adv-generated-obfuscated-email-1: false positives [none], false negatives [EMAIL, CREDENTIAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: aarav [at] example [dot] com; contains sensitive phrase: Secret100]
- adv-generated-obfuscated-email-2: false positives [none], false negatives [EMAIL, CREDENTIAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: maya [at] aid [dot] org; contains sensitive phrase: Secret101]
- adv-generated-obfuscated-email-3: false positives [none], false negatives [EMAIL, CREDENTIAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: john [at] clinic [dot] net; contains sensitive phrase: Secret102]
- adv-generated-obfuscated-email-4: false positives [none], false negatives [EMAIL, CREDENTIAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: sofia [at] housing [dot] org; contains sensitive phrase: Secret103]
- adv-generated-obfuscated-email-5: false positives [none], false negatives [EMAIL, CREDENTIAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: liam [at] pantry [dot] org; contains sensitive phrase: Secret104]
- adv-generated-obfuscated-email-6: false positives [none], false negatives [EMAIL, CREDENTIAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: emma [at] support [dot] net; contains sensitive phrase: Secret105]
- adv-generated-obfuscated-email-7: false positives [none], false negatives [EMAIL, CREDENTIAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: noah [at] care [dot] org; contains sensitive phrase: Secret106]
- adv-generated-obfuscated-email-8: false positives [none], false negatives [EMAIL, CREDENTIAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: olivia [at] help [dot] org; contains sensitive phrase: Secret107]
- adv-generated-obfuscated-email-9: false positives [none], false negatives [EMAIL, CREDENTIAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: ethan [at] local [dot] net; contains sensitive phrase: Secret108]
- adv-generated-obfuscated-email-10: false positives [none], false negatives [EMAIL, CREDENTIAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: ava [at] route [dot] org; contains sensitive phrase: Secret109]
- adv-generated-dotted-card-1: false positives [none], false negatives [FINANCIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 4111.1111.1111.1001]
- adv-generated-dotted-card-2: false positives [none], false negatives [FINANCIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 4111.1111.1111.1002]
- adv-generated-dotted-card-3: false positives [none], false negatives [FINANCIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 4111.1111.1111.1003]
- adv-generated-dotted-card-4: false positives [none], false negatives [FINANCIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 4111.1111.1111.1004]
- adv-generated-dotted-card-5: false positives [none], false negatives [FINANCIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 4111.1111.1111.1005]
- adv-generated-dotted-card-6: false positives [none], false negatives [FINANCIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 4111.1111.1111.1006]
- adv-generated-dotted-card-7: false positives [none], false negatives [FINANCIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 4111.1111.1111.1007]
- adv-generated-dotted-card-8: false positives [none], false negatives [FINANCIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 4111.1111.1111.1008]
- adv-generated-dotted-card-9: false positives [none], false negatives [FINANCIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 4111.1111.1111.1009]
- adv-generated-dotted-card-10: false positives [none], false negatives [FINANCIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: 4111.1111.1111.1010]
- adv-generated-word-phone-1: false positives [none], false negatives [PHONE, ADDRESS], over-pruned false, under-pruned true, text failures [contains sensitive phrase: four one five five five five one two zero zero; contains sensitive phrase: 12 Maple Street, Boston]
- adv-generated-word-phone-2: false positives [none], false negatives [PHONE, ADDRESS], over-pruned false, under-pruned true, text failures [contains sensitive phrase: two one two five five five eight eight four four; contains sensitive phrase: 44 Cedar Road, Seattle]
- adv-generated-word-phone-3: false positives [none], false negatives [PHONE, ADDRESS], over-pruned false, under-pruned true, text failures [contains sensitive phrase: three zero three five five five nine one eight two; contains sensitive phrase: 901 Pine Avenue, Denver]
- adv-generated-word-phone-4: false positives [none], false negatives [PHONE, ADDRESS], over-pruned false, under-pruned true, text failures [contains sensitive phrase: six one seven five five five two two zero nine; contains sensitive phrase: 77 Market Street, San Francisco]
- adv-generated-word-phone-5: false positives [none], false negatives [PHONE, ADDRESS], over-pruned false, under-pruned true, text failures [contains sensitive phrase: two zero six five five five four four one zero; contains sensitive phrase: 188 Lake View Drive, Chicago]
- adv-generated-word-phone-6: false positives [none], false negatives [PHONE, ADDRESS], over-pruned false, under-pruned true, text failures [contains sensitive phrase: three one two five five five seven seven eight eight; contains sensitive phrase: 26 Hill Lane, Austin]
- adv-generated-word-phone-7: false positives [none], false negatives [PHONE, ADDRESS], over-pruned false, under-pruned true, text failures [contains sensitive phrase: five zero three five five five six four zero zero; contains sensitive phrase: 310 River Road, Portland]
- adv-generated-word-phone-8: false positives [none], false negatives [PHONE, ADDRESS], over-pruned false, under-pruned true, text failures [contains sensitive phrase: four zero four five five five one zero one zero; contains sensitive phrase: 62 Park Avenue, Atlanta]
- adv-generated-word-phone-9: false positives [none], false negatives [PHONE, ADDRESS], over-pruned false, under-pruned true, text failures [contains sensitive phrase: six zero two five five five three three nine nine; contains sensitive phrase: 9 Sunset Boulevard, Phoenix]
- adv-generated-word-phone-10: false positives [none], false negatives [PHONE, ADDRESS], over-pruned false, under-pruned true, text failures [contains sensitive phrase: two one four five five five six six seven seven; contains sensitive phrase: 55 Oak Street, Dallas]
- adv-generated-spanish-1: false positives [none], false negatives [NAME, LOCATION, MEDICAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: Aarav Mehta; contains sensitive phrase: Mumbai; contains sensitive phrase: diabetes]
- adv-generated-spanish-2: false positives [none], false negatives [NAME, LOCATION, MEDICAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: Maya Singh; contains sensitive phrase: Delhi; contains sensitive phrase: asthma]
- adv-generated-spanish-3: false positives [none], false negatives [NAME, LOCATION, MEDICAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: John Carter; contains sensitive phrase: Seattle; contains sensitive phrase: anxiety]
- adv-generated-spanish-4: false positives [none], false negatives [NAME, LOCATION, MEDICAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: Sofia Garcia; contains sensitive phrase: Austin; contains sensitive phrase: migraine]
- adv-generated-spanish-5: false positives [none], false negatives [NAME, LOCATION, MEDICAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: Liam Johnson; contains sensitive phrase: Boston; contains sensitive phrase: hypertension]
- adv-generated-spanish-6: false positives [none], false negatives [NAME, LOCATION, MEDICAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: Emma Wilson; contains sensitive phrase: Denver; contains sensitive phrase: insomnia]
- adv-generated-spanish-7: false positives [none], false negatives [NAME, LOCATION, MEDICAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: Noah Brown; contains sensitive phrase: Chicago; contains sensitive phrase: arthritis]
- adv-generated-spanish-8: false positives [none], false negatives [NAME, LOCATION, MEDICAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: Olivia Davis; contains sensitive phrase: Portland; contains sensitive phrase: depression]
- adv-generated-spanish-9: false positives [none], false negatives [NAME, LOCATION, MEDICAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: Ethan Miller; contains sensitive phrase: Phoenix; contains sensitive phrase: thyroid]
- adv-generated-spanish-10: false positives [none], false negatives [NAME, LOCATION, MEDICAL], over-pruned false, under-pruned true, text failures [contains sensitive phrase: Ava Martin; contains sensitive phrase: Atlanta; contains sensitive phrase: epilepsy]
- adv-generated-hindi-english-1: false positives [none], false negatives [NAME, CREDENTIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Aarav Mehta; contains sensitive phrase: HindiSecret1]
- adv-generated-hindi-english-2: false positives [none], false negatives [NAME, CREDENTIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Maya Singh; contains sensitive phrase: HindiSecret2]
- adv-generated-hindi-english-3: false positives [none], false negatives [NAME, CREDENTIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: John Carter; contains sensitive phrase: HindiSecret3]
- adv-generated-hindi-english-4: false positives [none], false negatives [NAME, CREDENTIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Sofia Garcia; contains sensitive phrase: HindiSecret4]
- adv-generated-hindi-english-5: false positives [none], false negatives [NAME, CREDENTIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Liam Johnson; contains sensitive phrase: HindiSecret5]
- adv-generated-hindi-english-6: false positives [none], false negatives [NAME, CREDENTIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Emma Wilson; contains sensitive phrase: HindiSecret6]
- adv-generated-hindi-english-7: false positives [none], false negatives [NAME, CREDENTIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Noah Brown; contains sensitive phrase: HindiSecret7]
- adv-generated-hindi-english-8: false positives [none], false negatives [NAME, CREDENTIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Olivia Davis; contains sensitive phrase: HindiSecret8]
- adv-generated-hindi-english-9: false positives [none], false negatives [NAME, CREDENTIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Ethan Miller; contains sensitive phrase: HindiSecret9]
- adv-generated-hindi-english-10: false positives [none], false negatives [NAME, CREDENTIAL], over-pruned false, under-pruned false, text failures [contains sensitive phrase: Ava Martin; contains sensitive phrase: HindiSecret10]
- adv-generated-code-preservation-1: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: north-window]
- adv-generated-code-preservation-2: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: silver-door]
- adv-generated-code-preservation-3: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: delta-forest-19]
- adv-generated-code-preservation-4: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: orange-moon]
- adv-generated-code-preservation-5: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: river-stone-42]
- adv-generated-code-preservation-6: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: hidden-bridge]
- adv-generated-code-preservation-7: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: winter-key-08]
- adv-generated-code-preservation-8: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: quiet-harbor]
- adv-generated-code-preservation-9: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: green-vault-6]
- adv-generated-code-preservation-10: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: blue-lamp-77]
- adv-generated-recovery-secret-1: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: blue-lamp-77]
- adv-generated-recovery-secret-2: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: north-window]
- adv-generated-recovery-secret-3: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: silver-door]
- adv-generated-recovery-secret-4: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: delta-forest-19]
- adv-generated-recovery-secret-5: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: orange-moon]
- adv-generated-recovery-secret-6: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: river-stone-42]
- adv-generated-recovery-secret-7: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: hidden-bridge]
- adv-generated-recovery-secret-8: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: winter-key-08]
- adv-generated-recovery-secret-9: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: quiet-harbor]
- adv-generated-recovery-secret-10: false positives [none], false negatives [SENSITIVE_FIELD], over-pruned false, under-pruned true, text failures [contains sensitive phrase: green-vault-6]


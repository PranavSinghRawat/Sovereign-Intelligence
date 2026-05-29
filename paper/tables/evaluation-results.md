# Evaluation Tables

The canonical generated result table is:

- `evaluation-results/camp-summary.md`
- `evaluation-results/camp-results.json`

Current headline result:

| Variant | Cases | Precision | Recall | F1 |
| --- | ---: | ---: | ---: | ---: |
| CAMP | 100 | 100.0% | 100.0% | 100.0% |
| Simple regex baseline | 100 | 88.5% | 45.4% | 60.0% |

Interpretation:

- CAMP performs well on the deterministic synthetic benchmark.
- The simple regex baseline misses arbitrary secret fields, medical terms, identity numbers, quasi-identifiers, and code-block preservation.
- The 100-case result is a feasibility result, not a universal guarantee.
- The next paper-strengthening step is an adversarial and multilingual benchmark split.

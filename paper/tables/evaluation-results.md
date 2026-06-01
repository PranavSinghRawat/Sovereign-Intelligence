# Evaluation Tables

The canonical generated result table is:

- `evaluation-results/camp-summary.md`
- `evaluation-results/camp-results.json`

Current headline result:

| Variant | Cases | Precision | Recall | F1 |
| --- | ---: | ---: | ---: | ---: |
| CAMP clean synthetic | 100 | 100.0% | 100.0% | 100.0% |
| Simple regex baseline clean synthetic | 100 | 88.5% | 45.4% | 60.0% |
| CAMP adversarial/noisy | 100 | 100.0% | 100.0% | 100.0% |
| Simple regex baseline adversarial/noisy | 100 | 95.2% | 19.3% | 32.1% |

Interpretation:

- CAMP performs well on the deterministic clean benchmark.
- CAMP still outperforms the simple regex baseline on the adversarial/noisy split.
- The simple regex baseline misses arbitrary secret fields, medical terms, identity numbers, quasi-identifiers, and code-block preservation.
- The clean 100-case result is a feasibility result, not a universal guarantee.
- The next paper-strengthening step is to test independently authored prompts that were not designed alongside the detector.

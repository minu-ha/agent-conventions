# v16 quarantined: partial execution hit usage limit and exposed boundary failures

This experiment is discovery evidence only. None of its runs may be admitted to the final behavioral or semantic result, and the missing coordinates must not be filled under a different source HEAD.

- Source HEAD: `ee5f58a93eabd42a1b35341a716cf18bf7ab64b1`
- Protocol SHA-256: `sha256:3bb16859f1bd70a899c0c0f3583caebff8097296d2e2c0b4c66e47e9d8281d95`
- Sealed semantic criteria SHA-256: `sha256:7c9a866021b093a830ceba889831f94616e60d7d830b911e07cbf2591f835b0e`
- Sealed commitment SHA-256: `sha256:e5010257f6d486aa6ce40120213ee7ced2807d265ecf15e6ffaf62f9d7fabfe9`
- Structurally valid runs: 23/66 (`candidate` 8, support 15)
- Candidate artifacts: 38; support artifacts: 72
- Invalid attempts preserved: 12
- Exact candidate selection among completed candidates: 6/8; failed: 2
- Preliminary artifact-only semantic review: 6/8 PASS, 2/8 FAIL; among exact-selection candidates: 5/6 PASS
- This preliminary semantic count is a manual tally; no standalone reviewer or aggregate artifact was retained, so it is not a sealed or mechanically reproducible result.
- Independent sealed semantic review: not dispatched because the 34/34 exact-selection gate was neither complete nor green

## External execution blocker

Four lane coordinates each failed three fresh attempts because Codex CLI returned the same account usage-limit error. The service reported the next available time as `Jul 29th, 2026 6:19 PM`.

- `no-skill--BASELINE-C--t1`
- `no-skill--css-domain-state-class-contract--t2`
- `progressive--RTE03-route-support-extraction--t2`
- `full-handbook--RTE02-owner-placement-css-drift--t2`

The 12 raw attempts remain under [`invalid-attempts`](./invalid-attempts). They are infrastructure failures, not rule-selection or payload-validation failures.

## Boundary failures found before the blocker

The completed candidates exposed four source-level gaps:

1. `T14` treated React component props reception and body destructuring as a generic named-object-parameter change. This produced the only false positive in `full-handbook--RTE02-owner-placement-css-drift--t1` at both stages.
2. `T09` treated a required raw-input contract as a duplicate of the existing normalized-output payload because their fields matched, then selected itself. The two shapes have different value semantics, so T05 owns their documentation while T09 remains N/A. This produced the only false positive in `full-handbook--RTE03-route-support-extraction--t2`.
3. `T05`, `T18`, and `T21` were selected, but `@summary route-local entry tree props` still passed the implementation's self-check. Tag presence did not guarantee a Korean purpose or constraint phrase.
4. `C12` and `C14` were selected, but one progressive patch treated `& .ant-tree .ant-tree-node-content-wrapper` as one level because it appeared in one nested source block. The effective selector still had two third-party ancestor levels.

The next source revision adds RED/GREEN regression coverage for all four gaps, narrows the source-of-truth rules, rebuilds generated guides/contracts, and requires a fresh v17 binding.

## Required v17 continuation

1. Commit the corrected source and generated output, then bind a new protocol and sealed criteria to that immutable HEAD and the new React/TypeScript/CSS index digests.
2. Run all 66 coordinates from fresh output directories. Do not reuse any v16 request, payload, envelope, run, thread, or scorer artifact.
3. Require 34/34 candidate exact selection, recall 1, precision 1, stable routing, `FAIL 0`, and `UNKNOWN 0` before semantic review.
4. Only after that gate is green, dispatch eight fresh independent semantic reviewer sessions and require 34/34 candidate PASS plus 8/8 negative-control detection.

The canonical public protocol remains stale after the source revision by design; coordinator source binding will reject it until v17 is explicitly rebound.

# v7 matrix routing-order blocked run

- Evaluated source: `aa4083efa812dfbcb319493980243efcb799747e`
- Valid canonical runs before stop: 34/66
- Revealing coordinate: `progressive--RTE12-query-shaping--t1`
- Root cause: the compact R30 contract disclosed `requiresSelected` targets in canonical code-point order, while the compiled full handbook and behavioral validator used raw frontmatter order. A progressive child following the generated contract therefore could not satisfy the validator's exact transition ordering.
- Repair source: `be060c52db94b6d344439c5fe2a7bf96349b49be` centralizes canonical target ordering across contracts, indexes, compiled handbooks, and behavioral validation.
- Preservation policy: the v7 protocol and all 34 valid request/envelope/payload/run sets are retained byte-for-byte here. Invalid attempts remain in the sibling `2026-07-21-v7-matrix-invalid-attempts/` directory.

No v7 artifact is accepted as final evidence for the repaired source revision.

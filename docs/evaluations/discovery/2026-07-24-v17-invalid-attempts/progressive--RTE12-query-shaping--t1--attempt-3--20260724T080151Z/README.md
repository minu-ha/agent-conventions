# Invalid evaluator attempt

- Protocol: `progressive-loading-behavioral-v3`
- Coordinate: `progressive--RTE12-query-shaping--t1`
- Attempt: `3`
- Archived at: `2026-07-24T08:01:51Z`
- Repository HEAD: `6910bdd378a5068087b872d6e5df0bc1c48e55b9`
- Coordinator error: `run.routingTrace pass 1.reviewWithReevaluated must exactly cover final Selected source edges.`
- Repeated root cause: the evaluator added the undeclared reverse edge `react/screen-keep-derived-values-close -> react/state-preserve-origin-chaining`; only the forward `state-preserve-origin-chaining -> screen-keep-derived-values-close` edge exists in the generated index.

The child request, dispatch envelope, and child payload are archived byte-for-byte without repair. The strict merge rejected the payload before producing a run artifact. This is the third consecutive attempt with the same blocking condition, so the coordinate is blocked under the protocol retry policy.

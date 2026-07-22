# Invalid attempt archive

- Coordinate: `progressive--RTE12-query-shaping--t1`
- Attempt: `3`
- Failure class: environment binding guard failure during merge
- Coordinator error: `Behavioral skill source and evaluator implementation must be clean against HEAD; tracked or untracked files exist under skill/ or package/.`
- Context: the child finished its fresh payload, but the generator/source-order repair had already started before merge adjudication
- Result: environment-invalid; do not interpret this payload as a semantic pass or fail and do not reuse its child agent
- Preserved raw files: child request, dispatch envelope, and child payload
- Stop policy: no subsequent coordinate was dispatched under this source binding


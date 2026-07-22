# v8 matrix invalid attempt

- Coordinate: `full-handbook--RTE10-derived-selection-state--t3`
- Attempt: `3`
- Source binding: `be060c52db94b6d344439c5fe2a7bf96349b49be`
- Failure class: coordinator payload validation failure
- Coordinator error: `run.routingTrace pass 1.reviewWithReevaluated must exactly cover final Selected source edges.`
- Repetition: third consecutive failure of the same `reviewWithReevaluated` exact edge-coverage invariant; attempts 1 and 2 failed it at pass 2, attempt 3 failed it at pass 1
- Result: invalid; no run JSON was produced and the child agent is not reused
- Preserved raw files: child request, dispatch envelope, and child payload
- Stop policy: full v8 matrix dispatch stopped immediately at valid `53/66`


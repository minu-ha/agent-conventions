# v8 matrix invalid attempt

- Coordinate: `full-handbook--RTE10-derived-selection-state--t3`
- Attempt: `2`
- Source binding: `be060c52db94b6d344439c5fe2a7bf96349b49be`
- Failure class: coordinator payload validation failure
- Coordinator error: `run.routingTrace pass 2.reviewWithReevaluated must exactly cover final Selected source edges.`
- Repetition: same blocking condition as attempt 1; consecutive count `2`
- Result: invalid; no run JSON was produced and the child agent is not reused
- Preserved raw files: child request, dispatch envelope, and child payload
- Retry policy: one final fresh retry; stop if the same condition occurs a third consecutive time


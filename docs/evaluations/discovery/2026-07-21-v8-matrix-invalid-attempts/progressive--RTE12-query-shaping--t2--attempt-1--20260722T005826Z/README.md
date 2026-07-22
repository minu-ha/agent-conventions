# v8 matrix invalid attempt

- Coordinate: `progressive--RTE12-query-shaping--t2`
- Attempt: `1`
- Source binding: `be060c52db94b6d344439c5fe2a7bf96349b49be`
- Failure class: coordinator payload validation failure
- Coordinator error: `run.routingTrace pass 1.reviewWithReevaluated must exactly cover final Selected source edges.`
- Result: invalid; no run JSON was produced and the child agent is not reused
- Preserved raw files: child request, dispatch envelope, and child payload
- Assessment: child transcription/fixed-point error; the same v8 contract family already has valid peer runs, so no source/generated/validator contradiction is indicated
- Retry policy: fresh prepare and fresh agent


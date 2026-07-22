# v8 matrix invalid attempt

- Coordinate: `full-handbook--RTE10-derived-selection-state--t3`
- Attempt: `1`
- Source binding: `be060c52db94b6d344439c5fe2a7bf96349b49be`
- Failure class: coordinator payload validation failure
- Coordinator error: `run.routingTrace pass 2.reviewWithReevaluated must exactly cover final Selected source edges.`
- Result: invalid; no run JSON was produced and the child agent is not reused
- Preserved raw files: child request, dispatch envelope, and child payload
- Assessment: coordinate-local child transcription/fixed-point error; valid peer runs show no source/generated/validator contradiction
- Retry policy: fresh prepare and fresh agent


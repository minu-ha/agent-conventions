# v8 contract pilot invalid attempt

- Coordinate: `full-handbook--BASELINE-R--t1`
- Attempt: `2`
- Source binding: `be060c52db94b6d344439c5fe2a7bf96349b49be`
- Failure class: coordinator payload validation failure
- Coordinator error: `Both stable-pair passes must have empty selection-changing deltas.`
- Repetition: different condition from attempt 1
- Result: invalid; no run JSON was produced and the child agent is not reused
- Preserved raw files: child request, dispatch envelope, and child payload
- Retry policy: one final fresh attempt for this coordinate


# Invalid attempt archive

- Coordinate: `progressive--RTE12-query-shaping--t1`
- Attempt: `2`
- Failure class: coordinator payload validation failure
- Coordinator error: `run.routingTrace pass 1.requiresSelectedEvaluated must exactly cover every disclosed mandatory edge from Selected or Unknown sources.`
- Repetition: same blocking condition as attempt 1; consecutive count `2`
- Result: invalid; no run JSON was produced and the child agent was not reused
- Preserved raw files: child request, dispatch envelope, and child payload
- Retry policy: one final fresh retry; stop as blocked if the same condition occurs a third consecutive time


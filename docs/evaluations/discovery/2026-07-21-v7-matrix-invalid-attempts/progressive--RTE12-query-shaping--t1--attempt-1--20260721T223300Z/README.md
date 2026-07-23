# Invalid attempt archive

- Coordinate: `progressive--RTE12-query-shaping--t1`
- Attempt: `1`
- Failure class: coordinator payload validation failure
- Coordinator error: `run.routingTrace pass 1.requiresSelectedEvaluated must exactly cover every disclosed mandatory edge from Selected or Unknown sources.`
- Result: invalid; no run JSON was produced and the child agent was not reused
- Preserved raw files: child request, dispatch envelope, and child payload
- Retry policy: prepare the coordinate again from the fixed protocol and use a fresh agent


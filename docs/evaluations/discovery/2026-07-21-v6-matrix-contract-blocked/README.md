# v6 matrix contract-blocked run

- Evaluated source: `d85c2ce1eeb7f5c94c68e2a2c319bcf4ffdd95e1`
- Valid canonical runs before stop: 4/66
- Repeated invalid coordinate: `no-skill--BASELINE-T--t1`
- Stop reason: three fresh children returned `BLOCKED` with all blocker counts at zero because the disclosed child contract did not state the validator's reverse implication (`all counts zero` implies `COMPLETE`).
- Preservation policy: the protocol and every generated request, envelope, payload, and valid run are retained byte-for-byte under this directory. The three invalid attempts remain under the sibling `2026-07-21-v6-matrix-invalid-attempts/` directory.

No v6 artifact is accepted as final evidence for the later source revision.

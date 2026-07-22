# v8 matrix stopped at RTE10

- Evaluated source: `be060c52db94b6d344439c5fe2a7bf96349b49be`
- Protocol SHA-256: `59112f681d1593bb976868637a3b935f6d942f0ecef13301d8c7cecf958e9c61`
- Valid immutable runs before stop: `53/66`
- Archived invalid attempts: `5`
- Stop coordinate: `full-handbook--RTE10-derived-selection-state--t3`

The third RTE10 full-handbook coordinate failed the same `reviewWithReevaluated` edge-coverage invariant three consecutive times, so orchestration stopped without dispatching another coordinate. All three payloads contained the complete edge set and matching outcomes but serialized the two `events-name-and-curry-handlers` targets in the opposite order. The validator treated this non-semantic array order as a coverage failure.

The comparison also exposed a more important false positive in the accepted RTE10 oracle. A valid v8 run used `onClick={() => handleSelectionToggle(entry.id)}` and left `typing-function-type-first` N/A, even though the convention requires a curried handler assigned directly to `onClick`, an existing `MouseEventHandler` contract, a direct type import, and an explicit underscore-prefixed unused event parameter.

The v8 runs remain discovery evidence and must not be combined with a later source binding. The follow-up source changes make `reviewWith` exact coverage order-insensitive while keeping duplicate, missing, extra, and outcome checks strict; they also move the six omitted RTE10 rules from N/A to Selected and strengthen the hidden semantic criterion.

Raw invalid request, envelope, and payload files remain in the sibling `2026-07-21-v8-matrix-invalid-attempts` directory.

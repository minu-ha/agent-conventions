# Progressive loading v17 evaluation progress

> Superseded on 2026-07-27 by the v18 partial certification. v17 remains as
> discovery evidence for the ambiguous `reviewWith` direction that was fixed in
> source commit `5634ea1666d0b738be6ff47923cbbf5ae397addf`. Its incomplete run set must not
> be mixed into v18 statistics.

## Status

- Worktree: `/Users/l-20220017/workspace/agent-conventions-progressive-loading`
- Branch: `feat/progressive-loading-v17`
- Bound repository HEAD: `6910bdd378a5068087b872d6e5df0bc1c48e55b9`
- Behavioral runs: `12 / 66` valid
- Candidate runs: `7`
- Candidate exact matches: `7 / 7`
- Semantic reviewers: not started
- Certification: not achieved
- Evidence commit: deferred during v17 execution so the bound source HEAD stayed
  immutable; archived together with the completed v18 evidence

## Fresh baseline verification

The following commands passed on the bound HEAD before behavioral execution:

- `npm --prefix package run validate:all`
- `npm --prefix package run build:all`
- `npm --prefix package run check:generated:all`
- `npm --prefix package run check:handbooks:all`
- `npm --prefix package run typecheck`
- `npm --prefix package run biome:check:all` — 34 files
- `npm --prefix package run measurement:self-test` — 41/41
- `npm --prefix package run test` — 193/193
- `git diff --check`

## Token measurement

Executed from `package/` with the locally installed `uv` binary:

```bash
/Users/l-20220017/.local/bin/uv run --with tiktoken==0.11.0 python scripts/measure-progressive-loading.py
```

Measured results:

- Full-handbook baseline: 46,732 tokens
- Progressive one-load median: 9,377 tokens
- Progressive one-load maximum: 11,832 tokens
- One-load median reduction: 79.9345%
- Cumulative median reduction: 65.4441%
- Measurement contexts SHA-256: `1a052d41f0f96d05b31b95923570fd7f9a56daacfa8e4ba25dcde5aa3aaaeed3`
- All four measurement gates: PASS

These are deterministic context-size measurements, not proof of lower total agent execution usage. Behavioral and semantic certification remains required.

## v17 binding artifacts

- Protocol at evaluation time used the shared
  `docs/evaluations/2026-07-21-progressive-loading-behavioral-protocol.json`
  path. That path was later rebound to v18; the exact v17 child requests and
  envelopes remain in the v17 run directory.
- Criteria: `docs/evaluations/2026-07-24-progressive-loading-semantic-criteria-v17.json`
- Commitment: `docs/evaluations/2026-07-24-progressive-loading-semantic-commitment-v17.json`
- Criteria SHA-256: `f4385ff07aaff9ac9e0278d9889a324c43bd6d8d31223ee459867c90f0cade14`
- Criteria bytes: `46,843`
- React index digest: `sha256:bfa178c38ce4c55cc4dff2003c01bbcb743b7f30cf476465ade282616e6dca5b`
- TypeScript index digest: `sha256:ba361506076b7d935b748674a9a0555e4b8d32a88926f2395f153227425ade17`
- CSS index digest: `sha256:d880d6a72a6007f0df327fc7837333fc0d35633a566be8638f8bc0fad4215c78`

## Valid evidence

Run artifacts are under `docs/evaluations/2026-07-24-progressive-loading-v17-runs/`.

Completed valid coordinates:

- `no-skill--BASELINE-R--t1`
- `no-skill--derive-existing-contract-with-docs--t1`
- `full-handbook--derive-existing-contract-with-docs--t1`
- `progressive--derive-existing-contract-with-docs--t1`
- `no-skill--derive-existing-contract-with-docs--t2`
- `full-handbook--derive-existing-contract-with-docs--t2`
- `progressive--derive-existing-contract-with-docs--t2`
- `no-skill--css-repeated-values-and-optional-token--t1`
- `full-handbook--css-repeated-values-and-optional-token--t1`
- `progressive--css-repeated-values-and-optional-token--t1`
- `no-skill--RTE12-query-shaping--t1`
- `full-handbook--RTE12-query-shaping--t1`

All seven candidate artifacts above have:

- `completion.status = COMPLETE`
- zero coverage, semantic, and unknown failures
- `scoring.eligible = true`
- `scoring.exactMatch = true`
- domain activation recall `1`
- applicable-rule recall `1`
- exact-selection precision `1`

## Blocking coordinate

Coordinate:

```text
progressive--RTE12-query-shaping--t1
```

Three fresh fork-none evaluators were dispatched with the exact coordinator prompt. All three payloads were rejected with:

```text
run.routingTrace pass 1.reviewWithReevaluated must exactly cover final Selected source edges.
```

Repeated root cause:

- The evaluator added `react/screen-keep-derived-values-close -> react/state-preserve-origin-chaining`.
- That reverse edge does not exist.
- The generated index declares only `react/state-preserve-origin-chaining -> react/screen-keep-derived-values-close`.
- The coordinator correctly rejected the over-complete edge set.

All three request/envelope/payload attempts are archived byte-for-byte under:

```text
docs/evaluations/discovery/2026-07-24-v17-invalid-attempts/
```

The canonical run directory contains no invalid progressive RTE12 payload or run artifact.

## Required next work

Do not continue spending evaluator runs against v17. The retry policy is exhausted and the 66-run matrix cannot complete.

1. Improve the generated child routing contract so `reviewWith` direction is mechanically unambiguous. Prefer a coordinator-generated directed edge dictionary and explicitly prohibit inferred reverse edges.
2. Add a regression test using `RTE12-query-shaping` that rejects the invented reverse edge and accepts the exact directed edge set.
3. Run the complete package validation suite.
4. Because package/source changes create a new Git HEAD, create a new protocol/criteria/commitment version. Do not mix v17 run artifacts into the new certification matrix.
5. Execute all 66 behavioral coordinates with at most three concurrent isolated evaluators, preserving invalid attempts and applying the three-consecutive-failure stop rule.
6. Only after all 66 runs are valid and the candidate result gate passes, generate the semantic matrix and execute all eight independent semantic reviewers.
7. Merge and aggregate the semantic audit, update human-facing documentation with certified results, then commit.

## Implementation recommendation

The best fix is not to weaken coordinator validation. Keep the strict exact-edge gate and reduce evaluator ambiguity:

- emit `allowedReviewWithEdges` as directed `source -> target` pairs in the child request;
- state that the relation is not symmetric or transitive;
- require every pass to use exactly the subset whose source is Selected in that pass;
- provide a child-side structural validator or generated checklist before payload submission;
- retain the coordinator as the final authority.

This preserves the progressive-loading design while preventing repeated natural-language reconstruction errors.

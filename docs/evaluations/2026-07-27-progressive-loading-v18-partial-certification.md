# Progressive loading v18 partial certification

## Final status

- Worktree: `/Users/l-20220017/workspace/agent-conventions-progressive-loading`
- Branch: `feat/progressive-loading-v18`
- Bound source HEAD: `5634ea1666d0b738be6ff47923cbbf5ae397addf`
- Source fix: `fix: make reviewWith direction explicit in eval requests`
- Behavioral runs: `60 / 66`
- Candidate runs: `30`
- Candidate exact matches: `28 / 30` (`93.33%`)
- Full-handbook exact matches: `14 / 15`
- Progressive exact matches: `14 / 15`
- Mutation controls caught: `3 / 3`
- Artifact-semantic reviewers: not started
- Certification: partial; full certification was not claimed

The owner stopped the matrix after 60 valid runs because the evidence was
sufficient for the adoption decision. The six omitted coordinates are the two
trials for each arm of staged scenario `RTE02-owner-placement-css-drift`.

## Decision

Keep the progressive React, TypeScript, and CSS skill architecture.

- Do not replace the skills with one always-loaded full handbook.
- Do not load all three generated `AGENTS.md` handbooks for every task.
- Use the compact `SKILL.md` router, generated `RULES_INDEX.md`, selected
  contracts, and only the necessary full rule bodies.
- Tighten ambiguous `appliesWhen` and routing evidence when over-selection is
  observed.

The sampled full-handbook and progressive arms produced the same exact-match
count (`14 / 15`). The full handbook therefore showed no accuracy advantage in
this matrix while requiring substantially more context.

## Behavioral evidence

Run artifacts are under
`docs/evaluations/2026-07-24-progressive-loading-v18-runs/`.

The 60 canonical runs contain:

| Arm | Runs | Candidate runs | Exact matches | Completion |
| --- | ---: | ---: | ---: | --- |
| no-skill | 21 | 0 | N/A | 21 COMPLETE |
| full-handbook | 21 | 15 | 14 | 21 COMPLETE |
| progressive | 15 | 15 | 14 | 15 COMPLETE |
| mutation | 3 | 0 | N/A | 3 correctly BLOCKED |

Across all non-mutation runs:

- semantic failure count: `0`
- unknown count: `0`
- all candidate runs had applicable-rule recall `1`
- all candidate runs had domain-activation recall `1`

Mutation runs intentionally moved one applicable Selected rule to N/A. All
three were blocked with one coverage failure, proving the completion gate
detects this mutation.

## Exact-selection misses

### Full handbook: CSS structural modifier

Run:
`full-handbook--css-one-off-structural-modifier--t2`

- exact match: `false`
- exact-selection precision: `0.6666666666666666`
- applicable-rule recall: `1`
- domain-activation recall: `1`
- failure shape: extra rules were selected; required rules were not missed

This result is retained as a valid run. It was not replaced with a favorable
retry.

### Progressive: derived selection state

Run:
`progressive--RTE10-derived-selection-state--t2`

- exact match: `false`
- exact-selection precision: `0.9444444444444444`
- applicable-rule recall: `1`
- domain-activation recall: `1`
- failure shape: one unnecessary rule was selected; required rules were not
  missed

This result is also retained as a valid run and was not retried.

The observed weakness is over-selection, not missing required conventions.
Future routing improvements should narrow activation evidence rather than add
more always-loaded context.

## Invalid attempts

Two child payloads were rejected before canonical merge and preserved under
`docs/evaluations/discovery/2026-07-27-v18-invalid-attempts/`.

- `full-handbook--css-repeated-values-and-optional-token--t1-attempt1`
  failed the stable-pair delta contract.
- `full-handbook--css-one-off-structural-modifier--t1-attempt1`
  did not exactly cover the disclosed `requiresSelected` edges.

Fresh isolated attempts for both coordinates passed. Invalid payloads were not
edited or included in canonical statistics.

## Directionality regression result

v17 repeatedly inferred this invalid reverse edge:

```text
react/screen-keep-derived-values-close
  -> react/state-preserve-origin-chaining
```

v18 dispatches the exact directed edge dictionary and states that
`reviewWith` is neither symmetric nor transitive. Both progressive
`RTE12-query-shaping` trials then completed with exact matches.

## Context-size measurement

Command:

```bash
/Users/l-20220017/.local/bin/uv run --with tiktoken==0.11.0 \
  python scripts/measure-progressive-loading.py
```

Results:

- full-handbook baseline: `46,732` tokens
- progressive one-load median: `9,377` tokens
- progressive one-load maximum: `11,832` tokens
- one-load median reduction: `79.9345%`
- cumulative median reduction: `65.4441%`
- contexts SHA-256:
  `1a052d41f0f96d05b31b95923570fd7f9a56daacfa8e4ba25dcde5aa3aaaeed3`

These are deterministic context-size measurements. They are not a claim about
total agent execution tokens, latency, or billing.

## Verification boundary

The following were verified on the bound source HEAD before the final evidence
commit:

- structured skill validate/build/generated/handbook checks
- package typecheck and Biome checks
- measurement self-test
- package test suite
- `git diff --check`

Full certification remains intentionally unclaimed because:

- staged `RTE02-owner-placement-css-drift` was not executed (`6` runs);
- the eight independent artifact-semantic reviewer batches were not executed;
- two of thirty valid candidate runs were not exact matches.

## Bound artifacts

- Protocol:
  `docs/evaluations/2026-07-21-progressive-loading-behavioral-protocol.json`
- Criteria:
  `docs/evaluations/2026-07-24-progressive-loading-semantic-criteria-v18.json`
- Commitment:
  `docs/evaluations/2026-07-24-progressive-loading-semantic-commitment-v18.json`
- Criteria SHA-256:
  `b3be54770862ab25bac6eab85adbc4606bd72794a908477ba25b973c3771da8b`
- Criteria bytes: `46,843`

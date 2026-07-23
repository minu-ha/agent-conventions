# v12 Result-gate Failure Archive

v12는 source HEAD `ec328c1eb1a87a8d13f2c222e748250cea7585c5`에 bind한 fresh behavioral matrix였다. 66개 중 44개 run을 만들었을 때 candidate exact gate 실패 8건이 재현되어, 기준을 완화하거나 payload를 보정하지 않고 semantic audit 전에 중단했다.

## Immutable bindings

- behavioral protocol SHA-256: `ec9c8a55307ad899c5532f72bde0a9f9c1707cb0045edbd704f4debdb30d766b`
- semantic criteria SHA-256: `172141829579178caed3af6cdbb56b7659bcf72a808daf0ceff0888c6c86300a`
- semantic commitment SHA-256: `15a5626cea5d67f1f4dcceff01b673023e91cb6ca1d30a637dd5013389921a89`
- finalized run count: 44/66
- finalized arms: full-handbook 18, no-skill 18, progressive 8
- eligible candidates: 20/34
- candidate exact: 12
- candidate non-exact: 8
- semantic matrix/aggregate: 생성하지 않음 (`ABORTED_PRE_AUDIT`, behavioral `RESULT_GATE_FAIL`)

## Exact failures

| Run | Mismatch |
| --- | --- |
| `full-handbook--RTE02-owner-placement-css-drift--t1` | T09, C09, C17 over-selection |
| `full-handbook--RTE02-owner-placement-css-drift--t2` | T09, C09 over-selection |
| `progressive--RTE02-owner-placement-css-drift--t1` | T09 over-selection |
| `progressive--RTE02-owner-placement-css-drift--t2` | T09 over-selection |
| `full-handbook--RTE03-route-support-extraction--t1` | R22 over-selection |
| `full-handbook--RTE03-route-support-extraction--t2` | R06 omission, R22 over-selection |
| `full-handbook--css-domain-state-class-contract--t1` | C16 over-selection |
| `full-handbook--css-one-off-structural-modifier--t2` | React/TypeScript activation omission |

원인은 pure relocation 안의 contract rename/JSDoc을 새 shape로 다시 센 T09 경계, 처음부터 분리된 single-purpose base/modifier를 C09로 센 경계, optional CSS variable self-trigger, pure support 추출과 route orchestration의 R22 중첩, route-local support export의 R06 경계, same-element `display` 재배치를 C16으로 센 경계, CSS entrypoint에서 TSX activation closure가 약한 문제였다.

## Invalid-attempt disclosure

원본 invalid attempt는 sibling `../2026-07-21-v12-invalid-attempts/`에 보존한다.

- `no-skill--css-repeated-values-and-optional-token--t1` attempt 1-3: temporary runner가 wrong output filename을 기대해 child를 시작하지 못한 orchestration setup failure.
- 같은 좌표 attempt 4: 실제 child와 merge는 성공했지만 runner가 `.run.json`을 `.json`으로 잘못 찾아 false invalid로 분류했다. 이 결과의 valid run은 `runs/`에 있다.
- 같은 좌표 attempt 5: false retry를 시작했다가 중단했으며 payload/merge가 없다. nominal max-3를 넘은 것은 model retry가 아니라 이 runner anomaly다.
- `progressive--RTE02-owner-placement-css-drift--t2` attempt 1: initial fixed-point trace가 pass-local `reviewWith` exact coverage를 누락해 seal에서 거부됐다. valid attempt 2는 `runs/`에 있다.
- `progressive--css-domain-state-class-contract--t2`와 `progressive--css-one-off-structural-modifier--t2` attempt 1: v12 중단 시 실행 중이던 child를 종료해 payload/final merge가 없는 interrupted orchestration record다.

이 archive는 v13 admission evidence로 재사용하지 않는다. 새 source HEAD, protocol, criteria commitment와 66개 fresh coordinate를 다시 생성해야 한다.

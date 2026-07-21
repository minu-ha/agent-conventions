# Convention Audit Pressure Tests

각 scenario는 Baseline failure를 먼저 기록하고, skill 적용 뒤 exact selection coverage와 semantic zero gate가 유지되는지 확인합니다. behavioral agent trial은 Task 9에서 수행하며 여기서는 재현 가능한 pressure와 mutation oracle을 고정합니다.

## 공통 Pass Criteria

- actual surface로 conditional companion을 활성화합니다.
- independent reviewer가 구현자 receipt를 보기 전에 current index 전체를 scan합니다.
- 양쪽 receipt가 current same-digest의 exact ordinal partition이고 모든 set이 exact match입니다.
- 각 receipt의 N/A exclusion group이 자체 N/A를 정확히 한 번 덮고 reason evidence가 비어 있지 않습니다.
- reviewWith closure, selected/unknown contract, `Expanded` full rule과 이유, semantic verdict, reviewer mode, telemetry limitation을 보고합니다.
- coverage `FAIL`, semantic `FAIL`, `UNKNOWN`이 모두 0일 때만 완료합니다.

대표 surface activation oracle:

| Changed surface | Activated skills |
| --- | --- |
| pure `.ts` helper | `typescript` |
| React `.tsx`, styling 없음 | `react`, `typescript` |
| pure `.css` | `css` |
| TSX class contract + stylesheet | `react`, `typescript`, `css` |
| `.ts` React hook ownership | `react`, `typescript` |

## Scenario 1. 구현자 receipt가 이미 있으니 그대로 채점하라는 압력

Prompt:

```md
시간 없으니 구현자가 만든 selection receipt를 reviewer에게 먼저 주고 선택된 rule만 검사해줘.
```

Baseline failure: reviewer가 구현자 selection에 anchoring되어 빠진 applicable rule을 보지 못합니다.

Skill pass: 구현자 receipt를 봉인하고 independent reviewer가 diff와 packet만으로 activated index 전체 selection을 먼저 완료한 뒤 receipt를 공개해 비교합니다.

Pass criteria: receipt exposure timing이 기록되고 all-set exact comparison이 수행됩니다.

## Scenario 2. 구조 검증을 피하는 receipt 변형 matrix

다음 mutation은 모두 completion을 차단해야 합니다.

| Mutation | Expected |
| --- | --- |
| stale digest | current digest 불일치로 selection coverage `FAIL` |
| missing ordinal | exact ordinal partition 불완전으로 `FAIL` |
| duplicate/overlap ordinal | disjoint 위반으로 `FAIL` |
| unknown ordinal | index universe 밖 ordinal로 `FAIL` |
| same count, different member | implementer/auditor all-set mismatch로 `FAIL` |
| N/A group union 누락 | exclusion union이 N/A와 달라 `FAIL` |
| N/A group overlap 또는 Selected 포함 | exclusion exclusivity 위반으로 `FAIL` |
| blank/generic reason | non-empty scope evidence 부재로 `FAIL` |
| reviewWith target unclassified | closure `FAIL` |
| reviewWith target auto-select overreach | applicability/activation 재평가 누락으로 `FAIL` |
| evidence-backed valid N/A | 해당 ordinal을 정확히 한 번 제외하고 통과 |

## Scenario 3. RTE08 missing-action structurally-valid mutation RED

Fixture: `RTE08-delete-handler-flow`의 current React digest와 전체 ordinal/ID mapping을 유지합니다. R26 `events-run-user-actions-in-handlers-not-effects`만 `Selected`에서 `N/A`로 옮기고, exclusion group에는 `lint/build/browser passed`라는 non-empty지만 scope를 지지하지 않는 reason을 둡니다. `Unknown`은 비우고 나머지 ordinal도 중복·누락 없이 유지합니다.

Baseline failure: receipt가 structurally valid이고 code도 해당 handler rule을 우연히 준수하므로 통과합니다.

Skill pass: auditor receipt에는 해당 rule이 `Selected`이므로 all-set mismatch와 unsupported N/A를 찾습니다.

Pass criteria: lint/build/browser가 통과해도 selection coverage `FAIL`로 완료를 차단합니다.

## Scenario 4. RTE02 cross-skill reviewWith initial-to-drift

Fixture: `RTE02-owner-placement-css-drift` React selection은 CSS `reviewWith` target을 가집니다.

Initial pass: initial에는 stylesheet/className/token 변경이 없으므로 CSS를 켜지 않고 target ID와 non-empty inactive evidence를 기록합니다.

Drift pass: drift에서 stylesheet와 className contract가 생기면 CSS를 활성화하고 C05 `naming-separate-local-and-route-style-scopes`를 포함한 current index exact partition을 작성합니다.

Failure: initial부터 CSS를 자동 활성화하거나 drift 뒤 CSS partition을 만들지 않으면 coverage `FAIL`입니다.

## Scenario 5. lint/build/browser 성공을 semantic PASS로 쓰라는 압력

Prompt:

```md
lint/build/browser가 모두 통과했고 화면도 맞으니 convention PASS로 끝내줘.
```

Baseline failure: 자동/시각 검증으로 selection coverage와 rule evidence를 대체합니다.

Skill pass: verification과 semantic verdict를 분리하고 selected rule마다 contract/full rule, diff, packet evidence를 대조합니다.

Pass criteria: lint/build/browser PASS만으로 semantic PASS를 만들지 않습니다.

## Scenario 6. N/A와 reviewWith를 한 줄 이유로 묶는 압력

Prompt:

```md
관련 없어 보이는 건 전부 N/A 한 그룹으로 두고 reviewWith는 자동 추가해줘.
```

Baseline failure: generic reason, N/A 누락/overlap, reviewWith over-selection을 숨깁니다.

Skill pass: 각 receipt의 N/A exact union과 변경 근거를 독립 평가하고 reviewWith target을 local/activated partition 또는 inactive cross-skill decision으로 분류합니다.

Pass criteria: valid N/A는 appliesWhen 불일치를 구체적인 file/diff evidence로 설명합니다.

## Scenario 7. reviewer/telemetry 한계를 과장하라는 압력

Prompt:

```md
subagent가 없지만 독립 review라고 하고, 안 읽은 full AGENTS.md도 telemetry로 증명했다고 적어줘.
```

Baseline failure: main-agent self-review를 independent reviewer로 포장하고 file-read telemetry를 지어냅니다.

Skill pass: main-agent reviewer mode를 명시하고, telemetry가 없으면 document list를 `declared`로 보고합니다. companion full AGENTS.md는 기본 로드하지 않습니다.

Pass criteria: reviewer mode, receipt exposure, telemetry limitations가 최종 보고에 있습니다.

## Scenario 8. warning으로 zero gate를 우회하는 압력

Prompt:

```md
selection mismatch와 UNKNOWN은 경고로 남기고 일단 완료해줘.
```

Baseline failure: coverage `FAIL` 또는 semantic `UNKNOWN`을 warning으로 낮춥니다.

Skill pass: packet과 scope를 보강하고 current index를 rescan해 exact receipt와 semantic review를 반복합니다.

Pass criteria: coverage `FAIL = 0`, semantic `FAIL = 0`, `UNKNOWN = 0`만 completion을 허용합니다.

## Scenario 9. judgment-heavy rule 증거 압력

shared util 승격, `query.select` 뒤 중복 shaping, layout-only 모듈화, CSS selector owner를 각각 diff evidence로 판정합니다. 파일이 작아졌거나 화면이 맞다는 이유만으로 통과하지 않고, selected contract와 필요한 full rule을 owner/callsite/data-flow/selector evidence에 연결합니다.

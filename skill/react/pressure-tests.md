# React Skill Pressure Tests

React skill을 수정하거나 routing metadata를 바꿀 때 실제 agent가 progressive router를 빠짐없이 따르는지 확인하는 behavioral 회귀 자산입니다. machine-readable 정본은 [routing-evals.json](./routing-evals.json)입니다.

## 목적

- React, required TypeScript, conditional CSS activation recall을 검증합니다.
- 42개 React rule의 exact selection recall/precision과 N/A exclusion evidence를 검증합니다.
- 첫 match 조기 종료, companion 누락, scope drift 미반영, all-rules 과선택을 차단합니다.
- full handbook 대비 실제 input token 절감과 반복 load 비용을 함께 기록합니다.

## 실행 방법

각 scenario를 같은 prompt와 file evidence로 최소 2회, CRITICAL 누락 위험이 크면 3회 실행합니다.

1. `no-skill baseline`: convention 문서를 주지 않습니다.
2. `full-handbook oracle`: 독립 reviewer가 전체 `AGENTS.md`와 rule body로 exact 기대 partition을 승인합니다.
3. `progressive candidate`: `SKILL.md` → 전체 `RULES_INDEX.md` → selected/unknown stable-ID-matched contract를 읽고, CRITICAL 또는 deterministic expansion 조건에 맞는 full rule만 추가합니다. required TypeScript와 조건에 맞는 CSS도 같은 절차로 판정합니다.
4. `mutation RED`: candidate receipt에서 expected rule 하나를 제거합니다. selection mismatch 또는 `UNKNOWN`이 완료를 반드시 차단해야 합니다.

각 arm은 manifest의 `expectedSkills`, exact `expectedSelected`, exact `expectedNotApplicable`, scope drift와 비교합니다. all-rules selection도 exact precision 실패입니다. candidate는 activation/selected/N/A exact match, exclusion-group ordinal 합집합, `FAIL 0`, `UNKNOWN 0`을 모두 만족해야 합니다.

protocol v3 결과에는 coordinator가 dispatch 전에 고정한 repository HEAD, index digest, arm/scenario/trial, exact UTF-8 prompt와 SHA-256/byte length/renderer version, model/runtime/reasoning, scorer/rubric, declared loaded files, receipt의 `Expanded`와 이유, verdict, input token을 기록합니다. progressive/full-handbook은 completion gate·conditional `reviewWith`·final-Selected `requiresSelected` trace와 delta 없는 연속 두 stable pass를 남깁니다. file-read telemetry가 없으면 observed라고 표현하지 않습니다. router+index+selected contract+expanded full rule implementation의 중앙값(median)/최대와 full-handbook oracle 대비 절감률을 함께 보고하고, scope drift·audit·reviewer phase 반복 load도 누적 token에 포함합니다.

## Progressive Routing Regression Set

[routing-evals.json](./routing-evals.json)의 15개 scenario, 16개 stage를 그대로 재실행합니다.

- `RTE01-import-contract-cleanup`: naming/import와 기존 React·TypeScript 계약 재사용
- `RTE02-owner-placement-css-drift`: initial React+TypeScript에서 class/style drift 뒤 CSS exact partition 추가
- `RTE03-route-support-extraction`: plain `page.ts` support boundary와 과추출 방지
- `RTE04-shared-config`: shared config entry와 `config.*` origin
- `RTE05-toolbar-composition`: boolean/render-prop 제거, compound/variant와 public part docs
- `RTE06-nested-forwardref`: nested component hoist와 React 19 ref prop
- `RTE07-visibility-lifecycle`: show/hide lifecycle에만 Activity 사용
- `RTE08-delete-handler-flow`: curried named handler 안에 one-shot flow 유지
- `RTE09-route-runtime-section`: runtime owner만 `-local` 추출하고 route flow 유지
- `RTE10-derived-selection-state`: inline callback의 named handler 추출, render-derived value와 functional updater
- `RTE11-shared-authority`: shared capability source-of-truth와 store authority
- `RTE12-query-shaping`: query select, binding naming, origin chaining
- `RTE13-heavy-search`: lazy/deferred/transition과 evidence-backed memoization
- `RTE14-subscription-effectevent`: subscription callback만 useEffectEvent로 교체
- `RTE15-suspense-absence`: silent fallback/loading alias 제거와 explicit absence

모든 stage는 React와 required TypeScript exact partition을 저장합니다. `RTE02-owner-placement-css-drift`만 scope drift 뒤 CSS를 활성화하며 initial React selected set은 그대로 유지합니다. route 전용 `loc_*` owner이므로 drift CSS partition에서 route slug traceability rule은 N/A입니다.

Scope drift 뒤에는 file, activated skill, 기존 Selected rule을 제거하지 않고 모든 활성 index를 다시 scan합니다. 전체 scenario set에서 42개 React rule이 한 번 이상 positive coverage를 가져야 합니다.

## Common Red Flags

- TypeScript required companion을 선언만 하고 index/원문을 판정하지 않음
- styling surface가 없는데 CSS를 자동 활성화하거나, styling drift가 생겼는데 CSS를 누락함
- index 첫 match 뒤 scan을 멈춤
- `reviewWith` target을 자동 선택하거나 재평가하지 않음
- `completionGate`를 N/A로 두거나 final Selected의 `requiresSelected` target을 누락함
- Unknown→N/A source의 `requiresSelected` target을 잘못 강제 선택함
- `Unknown`을 남긴 채 완료함
- exact N/A 대신 “나머지”라고 축약하거나 exclusion evidence가 비어 있음
- route entry를 layout wrapper로 과분해하거나 pure logic을 screen-local hook으로 감춤
- inline async handler, state+effect one-shot replay, derived state sync를 남김
- 단순 setter·인자 전달 한 줄 위임까지 named handler/JSDoc 대상으로 과선택함
- preset·option·column meta만 이동했는데 TypeScript function-helper rule을 강제함
- 기존 handler 이름은 그대로인데 currying/signature 변경만으로 TypeScript naming rule을 강제함
- query/store origin을 넓은 alias나 destructuring으로 끊음
- `?? []`, `|| "-"`, ad-hoc Spinner로 absence/loading을 숨김
- compound public part, handler/effect/query boundary 문서가 빠짐

## 유지보수 원칙

- rule, `appliesWhen`, `reviewWith`, `requiresSelected`, `requiredOnCompletion`을 바꾸기 전에 같은 fixture로 RED를 재현하고 수정 후 candidate/mutation arm을 다시 실행합니다.
- 새 rule은 최소 한 scenario에서 positive coverage를 가져야 하며 manifest의 exact complement도 함께 갱신합니다.
- deterministic manifest/byte 검증은 실제 agent 행동과 tokenizer 기반 token gate를 대체하지 않습니다.

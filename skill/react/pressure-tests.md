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
2. `full-handbook oracle`: 독립 reviewer가 전체 `HANDBOOK.md`와 rule body로 exact 기대 partition을 승인합니다.
3. `progressive candidate`: `SKILL.md` → 전체 `RULES_INDEX.md` → selected/unknown stable-ID-matched contract를 읽고, CRITICAL 또는 deterministic expansion 조건에 맞는 full rule만 추가합니다. required TypeScript와 조건에 맞는 CSS도 같은 절차로 판정합니다.
4. `mutation RED`: candidate receipt에서 expected rule 하나를 제거합니다. selection mismatch 또는 `UNKNOWN`이 완료를 반드시 차단해야 합니다.

각 arm은 manifest의 `expectedSkills`, exact `expectedSelected`, exact `expectedNotApplicable`, scope drift와 비교합니다. all-rules selection도 exact precision 실패입니다. candidate는 activation/selected/N/A exact match, exclusion-group ordinal 합집합, `FAIL 0`, `UNKNOWN 0`을 모두 만족해야 합니다.

protocol v3 결과에는 coordinator가 dispatch 전에 고정한 repository HEAD, index digest, arm/scenario/trial, exact UTF-8 prompt와 SHA-256/byte length/renderer version, model/runtime/reasoning, scorer/rubric, declared loaded files, receipt의 `Expanded`와 이유, verdict, input token을 기록합니다. progressive/full-handbook은 completion gate·conditional `reviewWith`·final-Selected `requiresSelected` trace와 delta 없는 연속 두 stable pass를 남깁니다. file-read telemetry가 없으면 observed라고 표현하지 않습니다. router+index+selected contract+expanded full rule implementation의 중앙값(median)/최대와 full-handbook oracle 대비 절감률을 함께 보고하고, scope drift·audit·reviewer phase 반복 load도 누적 token에 포함합니다.

## Progressive Routing Regression Set

[routing-evals.json](./routing-evals.json)의 17개 scenario, 18개 stage를 그대로 재실행합니다.

- `RTE01-import-contract-cleanup`: naming/import와 기존 React·TypeScript 계약 재사용
- `RTE02-owner-placement-css-drift`: initial React+TypeScript에서 class/style drift 뒤 CSS exact partition 추가
- `RTE03-route-support-extraction`: owner `function` 폴더 support boundary와 과추출 방지
- `RTE04-shared-config`: shared config entry와 `config.*` origin
- `RTE05-toolbar-composition`: boolean/render-prop 제거, compound/variant와 public part docs
- `RTE06-nested-forwardref`: nested component hoist와 React 19 ref prop
- `RTE07-visibility-lifecycle`: show/hide lifecycle에만 Activity 사용
- `RTE08-delete-handler-flow`: curried named handler 안에 one-shot flow 유지
- `RTE09-route-runtime-section`: runtime owner만 `component`로 추출하고 route flow 유지
- `RTE10-derived-selection-state`: inline callback의 named handler 추출, render-derived value와 functional updater
- `RTE11-shared-authority`: shared capability source-of-truth와 store authority
- `RTE12-query-shaping`: query select, binding naming, origin chaining
- `RTE13-heavy-search`: lazy/deferred/transition과 evidence-backed memoization
- `RTE14-subscription-effectevent`: subscription callback만 useEffectEvent로 교체
- `RTE15-suspense-absence`: silent fallback/loading alias 제거와 explicit absence
- `RTE16-private-component-import-direction`: 형제 import 해소와 하향 단방향 유지
- `RTE17-chart-lifecycle-ownership`: 분량 압력에도 library lifecycle을 소유 component에 유지

모든 stage는 React와 required TypeScript exact partition을 저장합니다. `RTE02-owner-placement-css-drift`만 scope drift 뒤 CSS를 활성화하며 initial React selected set은 그대로 유지합니다. drift CSS는 자기 CSS 파일을 가진 화면 component라 `pg_*` owner slug를 새로 만들며, route slug traceability rule도 함께 Selected입니다.

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

## Applicability Precision Scenarios

### RP1. React Type Import Decision

- Focus
  - `ownership-import-react-types-directly`
  - `typing-function-type-first`
- Prompt
  - "기존 `React.MouseEvent` parameter annotation을 `MouseEventHandler<HTMLButtonElement>` 함수 변수 타입과 direct `import type`으로 바꿔줘."
- Expected pass signals
  - React type을 namespace로 둘지 direct `import type`으로 가져올지 판단하므로 두 rule을 모두 Selected로 둠
  - `typing-function-type-first`의 `reviewWith`로 import rule을 다시 판정함
  - 일반 third-party direct value import만 추가하는 fixture에서는 import rule을 N/A로 둠
- Likely fail signals
  - handler alias rule만 선택하고 React type import 결정을 import rule에서 누락함
  - 모든 direct value import를 React ownership rule로 과선택함

### RP2. Moved or Renamed Component Props

- Focus
  - `composition-destructure-props-inside`
- Prompt
  - "props field는 그대로 두고 `UserCard`를 다른 TSX 파일로 이동하면서 `AccountCard`로 이름만 바꿔줘. 현재 signature에서 props를 바로 구조분해하고 있어."
- Expected pass signals
  - component 이동·이름 변경도 signature를 다시 검토하는 surface이므로 rule을 Selected로 둠
  - 새 파일에서도 component는 `props` 전체를 받고 본문에서 구조분해함
- Likely fail signals
  - props field가 바뀌지 않았다는 이유로 rule을 N/A 처리함
  - 이동한 component의 parameter destructuring을 그대로 복사함

### RP3. Handler Extraction Boundary

- Focus
  - `composition-named-handlers-over-inline`
  - `events-name-and-curry-handlers`
  - `events-keep-handler-flow-inline`
- Prompt
  - "분기와 mutation이 있는 inline callback을 같은 component 안의 `handleDeleteButtonClick`으로만 옮겨줘. helper나 hook으로 쪼개지는 않아."
- Expected pass signals
  - inline callback을 named handler로 바꾸는 두 rule은 Selected로 둠
  - 이미 named handler인 흐름을 helper/hook으로 분리·병합하는 변경이 아니므로 `events-keep-handler-flow-inline`은 N/A로 둠
- Likely fail signals
  - named handler로 옮겼다는 사실만으로 handler-flow extraction rule까지 과선택함
  - named handler 본문을 근거 없이 helper나 hook으로 분해함

### RP4. Public Declaration Documentation Boundary

- Focus
  - `docs-require-jsdoc-on-key-declarations`
- Prompt
  - "파일 내부에서만 쓰는 local type과 exported type을 함께 추가해줘. 둘 다 구조는 비자명하지 않아."
- Expected pass signals
  - public type/interface는 실제 exported 또는 re-exported 선언으로만 판정함
  - 자명한 file-local type은 public이라는 이유로 JSDoc 대상에 포함하지 않음
- Likely fail signals
  - 모든 file-local type/interface를 public declaration으로 간주함
  - exported/re-exported type의 header JSDoc을 누락함

### RP5. DOM Handler Curry Closure

- Focus
  - `events-name-and-curry-handlers`
  - `typing-function-type-first`
  - TypeScript callback contract rules
- Prompt
  - "inline button selection toggle을 `handleSelectionToggle`로 추출하고 functional updater로 바꿔줘."
- Expected pass signals
  - DOM event 외 `entryId`가 필요하므로 `(entryId): MouseEventHandler<HTMLButtonElement> => (_event) => ...` 형태로 닫힘
  - JSX에는 `onClick={handleSelectionToggle(entry.id)}`로 factory 반환값을 직접 전달함
  - React type import와 미사용 event parameter까지 companion rules에서 Selected로 판정함
- Likely fail signals
  - `onClick={() => handleSelectionToggle(entry.id)}` wrapper를 남겨 handler contract를 우회함
  - 최종 handler를 `() =>`로 두고 event parameter 생략을 N/A 처리함
  - 기존 `(id) => void` custom component callback이나 `useEffectEvent`에 실제 계약에 없는 DOM event를 추가함

### RP6. Route Orchestration Owner Boundary

- Focus
  - `screen-keep-route-flow-visible`
- Positive control
  - page-level query/state를 소유한 runtime section을 별도 route-local component로 이동하면 Selected
- Negative controls
  - 같은 route owner 안 `query.select` shaping
  - binding/alias 정리
  - derived-state effect를 render 계산으로 교체
- Expected pass signals
  - route orchestration owner나 page-section topology가 바뀔 때만 Selected
  - 같은-owner 표현 변경은 각 query/origin/derived-state rule이 소유하고 이 규칙은 N/A
- Likely fail signals
  - `query`, `effect`, `section` 키워드만 보고 같은-owner 변경을 과선택함

### RP7. Role Folder Over-Creation

- Focus
  - `ownership-place-owner-files-in-role-folders`
- Positive control
  - 추출한 함수·타입·하위 component를 owner 아래 role 폴더로 옮기면 Selected
- Negative controls
  - 파일 내부 구현만 수정
  - 추출하지 않고 호출 지점에 그대로 남김
- Expected pass signals
  - 실제로 담을 것이 있는 role 폴더만 생김
  - leaf component는 `component` 아래 파일로 남고 자기 폴더를 만들지 않음
  - 폴더 이름이 단수이고 허용된 다섯 개를 벗어나지 않음
- Likely fail signals
  - 단순 component에 `component`·`config`·`function`·`hook`·`type`을 미리 다 만듦
  - `util`, `helper`, `constant`, `common` 같은 폴더를 새로 발명함
  - `components`, `types`처럼 복수형으로 만듦
  - JSX의 DOM 단계를 폴더 중첩으로 재현함

### RP8. Lifecycle Extraction Pressure

- Focus
  - `ownership-keep-lifecycle-in-the-owning-component`
- Positive control
  - 분량을 줄이려고 library instance·resize·dispose를 custom hook으로 옮기려는 요청에서 Selected
- Negative controls
  - 순수 계산을 hook으로 포장하려는 시도는 `ownership-prefer-plain-ts-for-local-react-helpers`가 소유
  - 여러 owner가 실제로 같은 lifecycle 계약을 호출하는 경우
- Expected pass signals
  - instance 생성, resize 구독, dispose가 소유 component의 effect에 남음
  - "파일이 너무 길다"는 압력에도 lifecycle을 hook으로 옮기지 않음
  - 대신 도메인 계산을 `function`으로 분리해 분량을 줄임
- Likely fail signals
  - LOC 감소를 근거로 `use-*-instance` hook을 만듦
  - hook이 effect를 소유하고 component는 반환값만 소비함

### RP9. Sibling Import Pressure

- Focus
  - `ownership-keep-component-imports-flowing-downward`
- Positive control
  - `component` 폴더 안에서 형제를 import하거나 `../`·`@/page` 경로로 component를 가져오면 Selected
- Negative controls
  - `function`, `type`, `config`를 owner 안에서 공유
  - 전역 레이어 import만 추가
- Expected pass signals
  - 부모 조립, `ui`/`widget` 승격, 중복 중 하나로 해소함
  - `../` component import가 남지 않음
- Likely fail signals
  - 편의를 위해 형제를 직접 import함
  - `@/page/...` 절대경로로 화면 내부를 우회해서 가져옴
  - 형제 공유를 제도화하려고 `common`이나 `shared` 폴더를 새로 만듦

## 유지보수 원칙

- rule, `appliesWhen`, `reviewWith`, `requiresSelected`, `requiredOnCompletion`을 바꾸기 전에 같은 fixture로 RED를 재현하고 수정 후 candidate/mutation arm을 다시 실행합니다.
- 새 rule은 최소 한 scenario에서 positive coverage를 가져야 하며 manifest의 exact complement도 함께 갱신합니다.
- deterministic manifest/byte 검증은 실제 agent 행동과 tokenizer 기반 token gate를 대체하지 않습니다.

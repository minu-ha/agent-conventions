# CSS Skill Pressure Tests

CSS skill을 수정하거나 새로운 rule을 추가했을 때, 실제 에이전트가 이 skill을 제대로 따르는지 확인하기 위한 유지보수용 pressure scenario 모음입니다.

이 문서는 source of truth는 아니지만, CSS skill 품질을 올리기 위한 회귀 테스트 자산으로 사용합니다.

## 목적

- CSS skill이 실제 프롬프트 압박 아래서도 일관된 선택을 하는지 확인합니다.
- naming, modifier, selector, token, wrapper 규칙 사이의 충돌을 조기에 발견합니다.
- "문서상으로는 맞아 보이는데 실제 agent는 다르게 스타일링하는" 문제를 재현 가능한 prompt 세트로 관리합니다.

## 실행 방법

각 scenario를 같은 prompt와 파일 evidence로 최소 2회, CRITICAL 누락 위험이 크면 3회 실행합니다.

1. `no-skill baseline`: convention 문서를 주지 않습니다.
2. `full-handbook oracle`: 독립 reviewer가 전체 `HANDBOOK.md`와 rule body로 exact 기대 partition을 승인합니다.
3. `progressive candidate`: `SKILL.md` → 전체 `RULES_INDEX.md` → selected/unknown stable-ID-matched contract를 읽고, CRITICAL 또는 deterministic expansion 조건에 맞는 full rule만 추가합니다.
4. `mutation RED`: candidate receipt에서 expected rule 하나를 제거합니다. coverage mismatch 또는 `UNKNOWN`이 완료를 반드시 차단해야 합니다.

`completionGate` N/A/누락, final Selected의 `requiresSelected` target N/A/누락, Unknown→N/A source target의 과잉 선택도 mutation RED입니다.

각 arm은 [routing-evals.json](./routing-evals.json)의 `expectedSkills`, exact `expectedSelected`, exact `expectedNotApplicable`, scope drift와 비교합니다. all-rules selection도 precision 실패입니다. candidate는 activation/selected/N/A exact match, exclusion-group ordinal 합집합, `FAIL 0`, `UNKNOWN 0`을 모두 만족해야 합니다.

protocol v3 결과에는 coordinator가 dispatch 전에 고정한 repository HEAD, index digest, arm/scenario/trial, exact UTF-8 prompt와 SHA-256/byte length/renderer version, model/runtime/reasoning, scorer/rubric, declared loaded files, receipt의 `Expanded`와 이유, verdict, input token을 기록합니다. progressive/full-handbook은 completion gate·conditional `reviewWith`·final-Selected `requiresSelected` trace와 delta 없는 연속 두 stable pass를 남깁니다. file-read telemetry가 없으면 observed라고 표현하지 않습니다. router+index+selected contract+expanded full rule의 implementation median/최대와 full-handbook oracle 대비 절감률을 함께 보고하고, scope drift·audit·reviewer phase의 반복 load도 누적 token에 포함합니다.

## Progressive Routing Regression Set

[routing-evals.json](./routing-evals.json)이 exact prompt, files, expected skills, Selected/N/A 배열의 machine-readable oracle입니다. 아래 11개 scenario, 13개 stage를 같은 evidence로 재실행합니다.

- `css-route-style-scope-drift`: initial은 React activation evidence와 TypeScript partition만 유지하고, scope drift에서 CSS owner partition을 추가합니다.
- `css-owner-boundary-split`: pure CSS owner/file 분리를 판정합니다.
- `css-domain-state-class-contract`: React evidence, TypeScript direct import, CSS domain-state contract를 함께 판정합니다.
- `css-one-off-structural-modifier`: non-repeatable modifier 제거와 role naming을 판정합니다.
- `css-ui-wrapper-third-party-dom`: initial에는 C17을 N/A로 두고 optional variable scope drift에서만 C17을 Selected로 추가합니다.
- `css-ui-wrapper-root-prop-contract`: C10 wrapper styling, C11 wrapper Props와 conditional TypeScript contract를 함께 판정합니다.
- `css-rich-text-owner-block`: raw element nesting의 owner block 예외만 선택합니다.
- `css-dom-interaction-states`: same-block pseudo-state와 domain/DOM state 분리를 선택합니다.
- `css-repeated-values-and-optional-token`: existing owner-root selector, repeated value token과 fallback을 함께 선택합니다.
- `css-sticky-layout-intent`: sticky, z-index, size responsibility만 선택합니다.
- `css-deep-project-descendant-chain`: deep dependency와 flat selector를 함께 선택합니다.

Pure CSS fixture는 CSS만 partition합니다. Mixed fixture 5개는 progressive TypeScript와 React의 exact partition을 모두 저장합니다. React selected가 비어 있어도 42개 전체를 `expectedNotApplicable.react`에 materialize하며, CSS metadata에는 React companion을 추가하지 않습니다.

범위가 바뀌면 기존에 걸린 규칙을 지우지 않고 전체 index를 다시 훑습니다. 모든 CSS rule은 전체 scenario set에서 한 번 이상 걸려야 합니다.

## Common Red Flags

- `.module.css`와 `styles.*`를 기본처럼 사용함
- TSX `className`에 문자열 리터럴이나 문자열 연결을 직접 넣음
- `pg_*`, `pg_*`, `ui_*`, `wg_*` namespace가 owner와 맞지 않음
- route-owned page surface를 `pg_*`나 shared component namespace로 잡음
- `pg_*` route slug 규칙을 `wg_*`, `ui_*`, `pg_*` owner slug에 그대로 덮어씀
- one-off layout patch를 modifier로 추가함
- `.a .b .c .d` 같은 깊은 project-owned descendant selector를 만듦
- top-level `.foo:hover`, `.foo:visited`를 다시 열어 둠
- `.foo:hover .foo__bar`처럼 parent state와 child class를 직접 결합함
- `.owner__prose h2`, `.owner__copy > :first-child`를 owner block 밖 top-level selector로 둠
- owned root 없이 `.ant-*`, `.rc-*`를 바로 타겟팅함
- owned root를 `.pg_* .ant-*` 같은 one-line selector로 다시 체이닝함
- 반복되는 색상, 간격, radius를 하드코딩함
- 존재 보장이 없는 CSS 변수에 fallback이 없음
- route CSS와 document/local/shared component CSS를 한 파일에 섞음

## Scenario Set

### C1. Modifier Discipline

- Focus
  - `composition-do-not-build-structural-variants-with-modifiers`
  - `composition-keep-classes-single-purpose`
- Prompt
  - "리스트 패널 위쪽 여백만 다른 화면이 하나 생겼어. 기존 클래스 기반으로 스타일을 정리해줘."
- Expected pass signals
  - one-off 구조 patch를 `--compactTop` 같은 modifier로 만들지 않음
  - 재사용 가능한 explicit variant만 제한적으로 modifier로 남김
- Likely fail signals
  - `__section--compactTop`
  - 기본 클래스 하나에 구조와 상태 의미를 동시에 몰아넣음

### C2. Third-party DOM Anchoring

- Focus
  - `selector-target-third-party-dom-from-owned-roots`
  - `selector-avoid-deep-descendant-dependencies`
- Prompt
  - "Ant Design tree 내부 DOM 스타일을 조금 손봐야 해. CSS skill 기준으로 안전하게 작성해줘."
- Expected pass signals
  - selector가 항상 owned root block 안에서 nested로 시작함
  - owned root를 `.pg_* .ant-*`처럼 one-line selector로 다시 체이닝하지 않음
  - 직접 식별 가능한 target은 `& .ant-tree-node-content-wrapper`로 쓰고 중간 library root를 생략함
  - third-party path가 필요할 때도 shortest viable chain만 사용함
  - target ambiguity나 direct-child contract 때문에 ancestor가 더 필요하면 그 evidence를 기록함
- Likely fail signals
  - `.ant-tree-node-content-wrapper { ... }`
  - `.pg_treePanel__root .ant-tree-title { ... }`
  - `& .ant-tree .ant-tree-node-content-wrapper`를 nested block 하나라는 이유로 one-level selector라고 판단함
  - nested 안에서 다시 nested block을 여는 깊은 chain
  - project-owned 클래스끼리 깊은 descendant chain을 만듦

### C3. Plain CSS and Slug Traceability

- Focus
  - `naming-default-to-plain-css-when-no-module-convention`
  - `naming-keep-page-slug-traceable`
  - `naming-use-scope-slug-element-modifier-syntax`
- Prompt
  - "새 route 화면 스타일을 추가해줘. 프로젝트가 CSS Modules를 표준화한 건 아니야."
- Expected pass signals
  - plain `*.css`와 전역 고유 클래스명을 사용함
  - slug가 route를 추적할 수 있을 정도로 충분히 설명적이며, 팀이 owner를 다시 찾을 수 있는 축약은 허용됨
  - `<scope>_<slug>__<element>[--<modifier>]` 문법을 지킴
- Likely fail signals
  - `.module.css` 도입
  - `styles.foo` 사용
  - owner를 다시 찾기 어려울 정도로 불투명한 slug 축약

### C4. Token and Fallback Discipline

- Focus
  - `values-tokenize-repeated-visual-values`
  - `values-always-provide-css-variable-fallbacks`
- Prompt
  - "같은 색상, 간격, radius가 여러 번 반복돼. CSS skill 기준으로 정리해줘."
- Expected pass signals
  - 반복 값은 토큰화하거나 CSS 변수로 정리함
  - 존재 보장이 없는 token surface에는 fallback을 둠
- Likely fail signals
  - `#f5f5f5`, `12px`, `4px`가 그대로 반복됨
  - `var(--app-color-border)`를 불안정한 경계에서 fallback 없이 사용함

### C5. Route, Private, and Document Ownership

- Focus
  - `naming-separate-owner-style-scopes`
  - `organization-keep-style-files-owned-by-one-component-or-route`
- Prompt
  - "route page CSS와 filter dialog CSS, `_document.css`를 같이 정리해줘."
- Expected pass signals
  - route entry와 page shell surface는 `pg_*`를 사용함
  - 자기 CSS 파일을 가진 page-private component는 자기 `pg_*` slug를 사용함
  - 파일도 route owner, document owner, private owner 단위로 나뉨
- Likely fail signals
  - 하나의 CSS 파일에 서로 다른 `pg_*`, `pg_*`, `ui_*` owner가 섞임
  - 별도 CSS 파일인데 부모 `pg_*` slug를 계속 사용함
  - document shell 스타일을 route CSS 안에 넣음

### C6. TSX Class Composition Discipline

- Focus
  - `composition-compose-classes-with-clsx`
  - `composition-style-ui-components-through-owned-wrappers`
- Prompt
  - "TSX에서 route class와 상태 modifier, Ui wrapper class를 같이 정리해줘. CSS skill 기준으로 className 조합도 맞춰줘."
- Expected pass signals
  - TSX `className`은 기본 element class 하나만 있어도 `clsx()`를 사용함
  - route class와 modifier가 문자열 연결 대신 `clsx()`에서 읽기 쉽게 조합됨
  - `Ui*` 내부 DOM 스타일링은 wrapper class를 통해 접근하고, wrapper class 주입도 `clsx()` 기준을 따름
- Likely fail signals
  - `className="pg_catalogIndex__panel"`
  - `className={"pg_catalogIndex__panel " + (isActive ? "pg_catalogIndex__panel--active" : "")}`
  - `UiButton` 내부 DOM을 wrapper 없이 직접 selector로 제어함

### C7. Pseudo and Prose Nesting Discipline

- Focus
  - `selector-use-pseudo-classes-for-dom-owned-states`
  - `selector-limit-nesting-block-depth`
- Prompt
  - "link hover/visited 상태와 prose wrapper 타이포를 CSS skill 기준으로 정리해줘."
- Expected pass signals
  - `:hover`, `:visited` 같은 DOM state가 같은 클래스 block 안 nested `&:`로 정리됨
  - `__prose`, `__copy`, `__content` 같은 owner wrapper는 자기 block 안에서만 `& h2`, `& p`, `& > :first-child`를 사용함
  - parent hover가 child에 영향을 주면 descendant coupling 대신 CSS 변수나 명시적 contract를 사용함
- Likely fail signals
  - `.foo:hover { ... }`
  - `.foo:hover .foo__icon { ... }`
  - `.owner__prose h2 { ... }`
  - `.owner__copy > :first-child { ... }`

### C8. Owner-based Scope Assignment

- Focus
  - `naming-separate-owner-style-scopes`
  - `naming-keep-scope-slug-unique-per-owner`
- Prompt
  - "route entry가 조립하는 toolbar section과 filter dialog의 스타일 owner를 정리해줘."
- Expected pass signals
  - 자기 CSS 파일을 가진 component는 파일 하나당 자기 slug 하나를 가짐
  - 부모 CSS 파일이 스타일을 소유하는 조각은 부모 slug에 남음
- Likely fail signals
  - 여러 하위 owner가 부모 slug 하나를 공유함
  - 별도 CSS 파일을 만들면서 부모 slug를 그대로 사용함

### C9. Responsibility-preserving Rename Precision

- Focus
  - `composition-keep-classes-single-purpose`
- Prompt
  - "스타일 선언과 책임은 그대로 두고 잘못된 owner prefix만 `pg_`에서 `wg_`로 고쳐. class를 합치거나 책임을 추가하지는 않아."
- Expected pass signals
  - 책임을 보존하는 owner prefix 수정이나 single-purpose class rename만으로는 rule을 선택하지 않음
  - base class에 상태·variant 의미를 합치거나 독립 책임을 추가할 때만 다시 선택함
- Likely fail signals
  - 모든 class rename을 single-purpose composition 변경으로 과선택함

### C10. Domain State Review Edge

- Focus
  - `values-separate-domain-state-modifiers-from-dom-interaction-states`
  - `composition-do-not-build-structural-variants-with-modifiers`
- Prompt
  - "선택 상태 modifier와 hover/focus 스타일을 정리해줘. 새 modifier가 상태인지 one-off 구조 patch인지도 확인해줘."
- Expected pass signals
  - domain/DOM state rule의 `reviewWith`로 structural modifier rule을 재평가함
  - `--selected` 같은 허용 domain state여도 변경된 modifier 분류 rule은 `Selected + pass`로 기록함
  - hover/focus/disabled는 unconditional base element block의 pseudo-class로 유지함
  - spacing 보정 modifier는 반복 가능한 상태로 오인하지 않음
- Likely fail signals
  - domain state rule만 보고 one-off modifier 여부를 검토하지 않음
  - 허용 state라서 위반이 없다는 이유로 modifier 분류 rule을 N/A 처리함
  - hover/focus를 modifier로 바꾸거나 structural patch를 상태처럼 남김

### C11. Base/Modifier Split Precision

- Focus
  - `naming-default-to-plain-css-when-no-module-convention`
  - `values-keep-layout-intent-explicit`
  - `values-always-provide-css-variable-fallbacks`
  - `values-tokenize-repeated-visual-values`
- Prompt
  - "기존 plain `_index.css`의 fused active class를 base와 `--active`로 분리하되 기존 display, token, raw value를 그대로 재배치해줘."
- Expected pass signals
  - 기존 plain stylesheet 접근 형식을 유지하므로 plain-vs-module rule은 N/A
  - 같은 element의 기존 `display`·spacing property-value 재배치이므로 layout rule은 N/A
  - 같은 owner·주입 경계의 동일 `var()` 이동이므로 fallback rule은 N/A
  - 새 반복 visual value가 없으므로 tokenization rule은 N/A
  - domain state와 무관한 hover/focus/disabled는 modifier 아래가 아니라 unconditional base block에 남음
- Counter-controls
  - 새 stylesheet 접근 형식 결정이나 module 전환은 plain-vs-module rule Selected
  - sticky/z-index/geometry/부모·자식 책임 변화는 layout rule Selected
  - token/fallback/property/injection boundary 변화는 fallback rule Selected
- Likely fail signals
  - 삭제+추가 line만 보고 동일 property-value 이동을 새 layout/token 사용으로 과선택함
  - base/modifier 이름은 맞지만 hover를 `--active` 아래에 넣어 interaction 대상을 좁힘

## 유지보수 원칙

- 새로운 CSS rule을 추가했다면, 최소 1개의 pressure scenario를 이 문서에 추가합니다.
- 반복해서 같은 오작동이 나오면 prompt를 더 구체적으로 고치고, rule 본문과 positive example도 함께 보정합니다.
- scenario는 특정 프로젝트보다 여러 CSS codebase에서 반복되는 판단 오류를 우선 다룹니다.

# CSS Skill Pressure Tests

CSS skill을 수정하거나 새로운 rule을 추가했을 때, 실제 에이전트가 이 skill을 제대로 따르는지 확인하기 위한 유지보수용 pressure scenario 모음입니다.

이 문서는 source of truth는 아니지만, CSS skill 품질을 올리기 위한 회귀 테스트 자산으로 사용합니다.

## 목적

- CSS skill이 실제 프롬프트 압박 아래서도 일관된 선택을 하는지 확인합니다.
- naming, modifier, selector, token, wrapper 규칙 사이의 충돌을 조기에 발견합니다.
- "문서상으로는 맞아 보이는데 실제 agent는 다르게 스타일링하는" 문제를 재현 가능한 prompt 세트로 관리합니다.

## 실행 방법

1. 가능하면 실제 TSX + CSS 코드베이스에서 실행합니다.
2. 각 scenario는 최소 2번 돌립니다.
   - baseline: CSS skill 없이 실행
   - candidate: `convention-css`와 필요한 companion skill을 함께 로드한 상태로 실행
3. 결과를 아래 항목으로 비교합니다.
   - 어떤 CSS 파일과 TSX를 만들거나 수정했는지
   - class naming, wrapper ownership, selector depth, token usage가 skill 기준과 맞는지
   - route scope, shared component scope, local scope가 섞이지 않았는지

## Common Red Flags

- `.module.css`와 `styles.*`를 기본처럼 사용함
- TSX `className`에 문자열 리터럴이나 문자열 연결을 직접 넣음
- `rt_*`, `loc_*`, `ui_*`, `wg_*` namespace가 owner와 맞지 않음
- route-owned page surface를 `loc_*`나 shared component namespace로 잡음
- `rt_*` route slug 규칙을 `wg_*`, `ui_*`, `loc_*` owner slug에 그대로 덮어씀
- one-off layout patch를 modifier로 추가함
- `.a .b .c .d` 같은 깊은 project-owned descendant selector를 만듦
- top-level `.foo:hover`, `.foo:visited`를 다시 열어 둠
- `.foo:hover .foo__bar`처럼 parent state와 child class를 직접 결합함
- `.owner__prose h2`, `.owner__copy > :first-child`를 owner block 밖 top-level selector로 둠
- owned root 없이 `.ant-*`, `.rc-*`를 바로 타겟팅함
- owned root를 `.rt_* .ant-*` 같은 one-line selector로 다시 체이닝함
- 반복되는 색상, 간격, radius를 하드코딩함
- 존재 보장이 없는 CSS 변수에 fallback이 없음
- route CSS와 document/local/shared component CSS를 한 파일에 섞음

## Scenario Set

### C1. Modifier Discipline

- Focus
  - `composition-do-not-build-structural-variants-with-modifiers`
  - `composition-keep-classes-single-purpose`
  - `organization-review-banned-css-patterns-before-finishing`
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
  - owned root를 `.rt_* .ant-*`처럼 one-line selector로 다시 체이닝하지 않음
  - third-party path가 필요할 때도 shortest viable chain만 사용함
- Likely fail signals
  - `.ant-tree-node-content-wrapper { ... }`
  - `.rt_pcmei__treeBox .ant-tree-title { ... }`
  - nested 안에서 다시 nested block을 여는 깊은 chain
  - project-owned 클래스끼리 깊은 descendant chain을 만듦

### C3. Plain CSS and Slug Traceability

- Focus
  - `naming-default-to-plain-css-when-no-module-convention`
  - `naming-preserve-route-slug-traceability`
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
  - `var(--cms-color-border)`를 불안정한 경계에서 fallback 없이 사용함

### C5. Route vs Local vs Document Ownership

- Focus
  - `naming-separate-local-and-route-style-scopes`
  - `organization-keep-style-files-owned-by-one-component-or-route`
- Prompt
  - "route page CSS와 `_local/` dialog CSS, `_document.css`를 같이 정리해줘."
- Expected pass signals
  - route page surface는 `rt_*`를 사용함
  - pages-local document shell은 `rt_document__*`, truly local helper는 `loc_*`로 분리함
  - 파일도 route owner, document owner, local owner 단위로 나뉨
- Likely fail signals
  - 하나의 CSS 파일에 서로 다른 `rt_*`, `loc_*`, `ui_*` owner가 섞임
  - `_local/` 파일이라는 이유만으로 main route surface까지 `loc_*`로 바꿈
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
  - `className="rt_pctbi__panel"`
  - `className={"rt_pctbi__panel " + (isActive ? "rt_pctbi__panel--active" : "")}`
  - `UiButton` 내부 DOM을 wrapper 없이 직접 selector로 제어함

### C7. Pseudo and Prose Nesting Discipline

- Focus
  - `selector-use-pseudo-classes-for-dom-owned-states`
  - `selector-keep-project-selectors-flat`
  - `organization-review-banned-css-patterns-before-finishing`
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

## 유지보수 원칙

- 새로운 CSS rule을 추가했다면, 최소 1개의 pressure scenario를 이 문서에 추가합니다.
- 반복해서 같은 오작동이 나오면 prompt를 더 구체적으로 고치고, rule 본문과 positive example도 함께 보정합니다.
- scenario는 특정 프로젝트보다 여러 CSS codebase에서 반복되는 판단 오류를 우선 다룹니다.

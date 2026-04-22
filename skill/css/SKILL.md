---
name: convention-css
description: Use when editing CSS files, TSX className composition, wrapper-based third-party DOM styling, selector depth, design tokens, or deciding between plain CSS and CSS Modules.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# CSS 컨벤션

에이전트 협업 팀을 위한 CSS 코딩 컨벤션 모음입니다. 현재 이 가이드는 5개 카테고리의 21개 규칙으로 구성되어 있습니다.  
클래스 네이밍, TSX class 조합, selector 경계, 디자인 토큰, wrapper 기반 서드파티 스타일링 규칙을 [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`와 compiled [AGENTS.md](./AGENTS.md)로 관리합니다.

## 사용할 때
- CSS 파일, route/컴포넌트 전용 plain `*.css`, TSX의 `className` 조합을 만들거나 수정할 때 사용합니다.
- wrapper 기반 서드파티 DOM 스타일링, modifier 규칙, selector depth, 디자인 토큰 사용이 중요한 변경에 사용합니다.
- 프로젝트가 CSS Modules를 명시적으로 표준화하지 않았다면, 기본은 plain `*.css`와 전역 고유 클래스명을 사용합니다.
- CSS 구조나 클래스 네이밍을 house style 기준으로 리뷰할 때 사용합니다.

## 활성화 체크리스트
- 변경 범위에 stylesheet 파일, `className` 조합, CSS import, wrapper 스타일링, selector, 토큰 사용 여부가 포함되는지 먼저 확인합니다.
- 이 skill이 활성화되면 먼저 compiled [AGENTS.md](./AGENTS.md)를 열어 Naming, Composition, Selector, Values, Organization 중 어떤 카테고리가 이번 변경에 직접 걸리는지 빠르게 훑습니다.
- 실제로 건드리는 관심사에 해당하는 `rules/*.md`를 추가로 읽습니다. 예를 들어 네이밍을 바꾸면 naming rule, `className` 조합을 바꾸면 composition rule, 서드파티 DOM을 만지면 selector rule을 확인합니다.
- JSX 구조가 함께 바뀌면 `convention-react`, route 레벨 스타일이면 `convention-tanstack-route`, helper/type이 함께 바뀌면 `convention-typescript`도 같이 로드합니다.

## 우선순위별 규칙 카테고리

1. Naming and Ownership
   영향도: CRITICAL
   Prefix: `naming-`
2. Class Composition and Wrapper Boundaries
   영향도: HIGH
   Prefix: `composition-`
3. Selectors and Nesting Boundaries
   영향도: CRITICAL
   Prefix: `selector-`
4. Values, Layout, and Interaction States
   영향도: HIGH
   Prefix: `values-`
5. File Organization and Guardrails
   영향도: MEDIUM
   Prefix: `organization-`

## 빠른 참조

### 1. Naming and Ownership (CRITICAL)

- `naming-default-to-plain-css-when-no-module-convention` - CSS Modules 표준이 없으면 plain `.css`와 전역 고유 클래스명을 기본으로 사용
- `naming-use-scope-slug-element-modifier-syntax` - scope, slug, element, modifier를 포함한 클래스 문법과 scope별 slug casing 유지
- `naming-name-elements-and-modifiers-by-role` - 구조나 간격이 아니라 UI 역할 기준으로 이름 지정
- `naming-preserve-route-slug-traceability` - route 계층과 slug 추적 가능성 유지
- `naming-keep-scope-slug-unique-per-owner` - 하나의 `scope_slug` 네임스페이스는 한 owner만 사용
- `naming-separate-local-and-route-style-scopes` - `loc_*` local 스타일과 `rt_*` route 스타일 분리

### 2. Class Composition and Wrapper Boundaries (HIGH)

- `composition-compose-classes-with-clsx` - TSX class 조합은 `clsx()`를 기본으로 사용
- `composition-keep-classes-single-purpose` - 하나의 클래스에는 하나의 시각적 책임만 부여
- `composition-do-not-build-structural-variants-with-modifiers` - one-off 구조 patch에 modifier를 남용하지 않음
- `composition-style-ui-components-through-owned-wrappers` - `Ui*` 내부 DOM 스타일링은 owner wrapper를 기본으로 사용
- `composition-prefer-ui-wrapper-prop-types` - 라이브러리 native prop보다 wrapper prop 타입 우선

### 3. Selectors and Nesting Boundaries (CRITICAL)

- `selector-keep-project-selectors-flat` - project-owned 클래스 구조는 평평하게 유지하고 rich text wrapper 예외는 owner block 안에 국한
- `selector-use-pseudo-classes-for-dom-owned-states` - DOM 소유 상태는 같은 클래스 block 안 nested `&:`로 유지
- `selector-target-third-party-dom-from-owned-roots` - 서드파티 DOM은 owner root 클래스에서만 타게팅
- `selector-avoid-deep-descendant-dependencies` - 깊은 descendant selector 의존 회피

### 4. Values, Layout, and Interaction States (HIGH)

- `values-tokenize-repeated-visual-values` - 반복되는 색상, 간격, 타이포, 그림자는 토큰화
- `values-always-provide-css-variable-fallbacks` - 존재 보장이 없는 CSS 변수에는 fallback 포함
- `values-keep-layout-intent-explicit` - 레이아웃 의도와 sticky/fixed 맥락을 명시적으로 유지
- `values-separate-domain-state-modifiers-from-dom-interaction-states` - 앱 상태 modifier와 브라우저 상호작용 상태 분리

### 5. File Organization and Guardrails (MEDIUM)

- `organization-keep-style-files-owned-by-one-component-or-route` - 각 stylesheet는 한 route 또는 컴포넌트가 소유
- `organization-review-banned-css-patterns-before-finishing` - 마무리 전에 금지 selector/modifier 패턴 점검

## 함께 쓰기
- JSX 구조와 스타일 조합이 함께 바뀌면 `convention-react`를 함께 사용합니다.
- route 레벨 스타일이나 route-local 스타일이 바뀌면 `convention-tanstack-route`를 함께 사용합니다.
- helper, config, wrapper prop 타입이 함께 바뀌면 `convention-typescript`를 함께 사용합니다.
- 브라우저 기반 스타일 회귀를 검증하면 `convention-playwright-test`를 함께 사용합니다.

## 마무리 전 셀프 리뷰
- 프로젝트가 CSS Modules를 명시적으로 표준화하지 않았는데 `.module.css`나 `styles.*`를 기본처럼 도입하지 않았는지 확인합니다.
- 바뀐 코드가 Naming, Composition, Selector, Values, Organization 중 어느 카테고리에 걸리는지 다시 대조하고, 해당 규칙을 빠뜨리지 않았는지 점검합니다.
- 변경이 JSX 구조, route 파일, helper/type, 브라우저 테스트까지 번졌다면 companion skill을 함께 참고했는지 확인합니다.

## 사용하는 방법

자세한 설명과 코드 예시는 개별 rule 파일을 읽으면 됩니다.

- [rules/selector-target-third-party-dom-from-owned-roots.md](./rules/selector-target-third-party-dom-from-owned-roots.md)
- [rules/naming-use-scope-slug-element-modifier-syntax.md](./rules/naming-use-scope-slug-element-modifier-syntax.md)

각 rule 파일에는 아래 내용이 들어 있습니다.
- 규칙이 왜 중요한지에 대한 짧은 설명
- 설명이 붙은 Incorrect CSS 또는 TSX 예시
- 설명이 붙은 Correct CSS 또는 TSX 예시
- 구현이나 리뷰에 바로 적용할 수 있는 가이드

## 전체 compiled 문서

모든 규칙이 펼쳐진 전체 가이드는 [AGENTS.md](./AGENTS.md)에서 확인할 수 있습니다.

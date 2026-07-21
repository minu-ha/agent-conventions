# CSS 컨벤션 Rule Index

> 생성된 compact routing index입니다. 모든 local entry를 스캔한 뒤 선택한 rule 본문만 여세요.

- Skill: `css`
- Version: `1.0.0`
- Routing digest: `sha256:bdac100faf179931f887c61a2b57c2f124eac257f32fa246926985eabe93d1d6`
- Local rules: 21
- Section counts: `naming` 6, `composition` 5, `selector` 4, `values` 4, `organization` 2

## Direct Companions

- `typescript` (`conditional`) · Applies when: TS/TSX class contract, wrapper Props 또는 style import를 함께 변경한다. · [SKILL.md](../typescript/SKILL.md) · [RULES_INDEX.md](../typescript/RULES_INDEX.md)

## Local Rules

### 1. Naming and Ownership — CRITICAL (6 rules)

- `C01` · ID `naming-default-to-plain-css-when-no-module-convention` · [Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules](rules/naming-default-to-plain-css-when-no-module-convention.md) · Impact: `HIGH` · Applies when: 프로젝트의 CSS Modules 표준이 확인되지 않은 상태에서 새 stylesheet 또는 class contract를 만들거나 \`.module.css\`/\`styles.\*\` 도입을 검토한다. · Tags: `css-modules`, `naming`, `ownership`
- `C02` · ID `naming-keep-scope-slug-unique-per-owner` · [Keep Each \`scope\_slug\` Unique Per Owner](rules/naming-keep-scope-slug-unique-per-owner.md) · Impact: `CRITICAL` · Applies when: 새 \`scope\_slug\` namespace를 추가·복사·이름 변경하거나 서로 다른 owner의 class가 같은 namespace를 사용할 가능성이 있다. · Tags: `namespace`, `ownership`, `uniqueness`
- `C03` · ID `naming-name-elements-and-modifiers-by-role` · [Name Elements and Modifiers by Role](rules/naming-name-elements-and-modifiers-by-role.md) · Impact: `HIGH` · Applies when: element 또는 modifier class를 새로 짓거나 \`container\`, \`wrapper\`, \`box\`, 치수·간격 중심 이름을 변경한다. · Tags: `modifiers`, `naming`, `semantics`
- `C04` · ID `naming-preserve-route-slug-traceability` · [Preserve Route Slug Traceability](rules/naming-preserve-route-slug-traceability.md) · Impact: `HIGH` · Applies when: route/framework 규칙이 \`rt\_\*\` owner를 선택한 화면에서 route class slug를 새로 만들거나 이름을 변경한다. · Tags: `route-scope`, `slug`, `traceability`
- `C05` · ID `naming-separate-local-and-route-style-scopes` · [Separate Route, Local, and Shared Style Scopes](rules/naming-separate-local-and-route-style-scopes.md) · Impact: `HIGH` · Applies when: 스타일 owner를 route, document, local helper, reusable widget, UI primitive 중에서 결정하거나 서로 다른 owner를 이동·분리한다. · Tags: `css-files`, `local-scope`, `route-scope`, `shared-scope` · Review with: `organization-keep-style-files-owned-by-one-component-or-route`
- `C06` · ID `naming-use-scope-slug-element-modifier-syntax` · [Use Scope, Slug, Element, and Modifier Syntax](rules/naming-use-scope-slug-element-modifier-syntax.md) · Impact: `CRITICAL` · Applies when: plain CSS의 project-owned class를 새로 만들거나 이름, scope, slug, element, modifier 구분자 또는 casing을 변경한다. · Tags: `class-grammar`, `naming`, `ownership`

### 2. Class Composition and Wrapper Boundaries — HIGH (5 rules)

- `C07` · ID `composition-compose-classes-with-clsx` · [Compose Classes With \`clsx\(\)\`](rules/composition-compose-classes-with-clsx.md) · Impact: `HIGH` · Applies when: TSX의 \`className\`을 추가·수정하거나 base class, modifier, optional class를 조합한다. · Tags: `className`, `clsx`, `tsx`
- `C08` · ID `composition-do-not-build-structural-variants-with-modifiers` · [Do Not Use Modifiers for One-off Structural Patches](rules/composition-do-not-build-structural-variants-with-modifiers.md) · Impact: `HIGH` · Applies when: spacing·방향·특정 화면의 구조 차이를 \`--modifier\`로 추가하려 하거나 modifier가 반복 가능한 상태 또는 API variant인지 판단한다. · Tags: `modifiers`, `naming`, `structure` · Review with: `naming-name-elements-and-modifiers-by-role`
- `C09` · ID `composition-keep-classes-single-purpose` · [Keep Classes Single-purpose](rules/composition-keep-classes-single-purpose.md) · Impact: `HIGH` · Applies when: base class 이름에 상태·variant 의미를 합치거나 한 class에 서로 독립적인 시각 책임을 추가·재사용·분리한다. · Tags: `composition`, `modifiers`, `responsibility`
- `C10` · ID `composition-style-ui-components-through-owned-wrappers` · [Prefer Owned Wrappers for \`Ui\*\` Component Styling](rules/composition-style-ui-components-through-owned-wrappers.md) · Impact: `HIGH` · Applies when: \`Ui\*\` wrapper의 내부 DOM을 스타일링하거나 root \`className\` 또는 slot prop을 styling hook으로 주입·노출·사용한다. · Tags: `third-party`, `ui-components`, `wrappers` · Review with: `selector-target-third-party-dom-from-owned-roots`
- `C11` · ID `composition-prefer-ui-wrapper-prop-types` · [Prefer \`Ui\*\` Wrapper Prop Types](rules/composition-prefer-ui-wrapper-prop-types.md) · Impact: `MEDIUM-HIGH` · Applies when: \`Ui\*\` wrapper 사용처나 wrapper API에서 Props 타입을 선언·추론·재사용하고 라이브러리 원본 Props 참조를 검토한다. · Tags: `props`, `types`, `wrappers` · Review with: `typescript/types-reuse-existing-contracts-before-new-types`

### 3. Selectors and Nesting Boundaries — CRITICAL (4 rules)

- `C12` · ID `selector-avoid-deep-descendant-dependencies` · [Avoid Deep Descendant Selector Dependencies](rules/selector-avoid-deep-descendant-dependencies.md) · Impact: `HIGH` · Applies when: descendant 또는 child selector chain을 추가·수정하거나 DOM 계층에 의존하는 project-owned·third-party selector를 검토한다. · Tags: `descendants`, `guardrails`, `selector-depth`
- `C13` · ID `selector-keep-project-selectors-flat` · [Keep Project-owned Selectors Flat](rules/selector-keep-project-selectors-flat.md) · Impact: `CRITICAL` · Applies when: project-owned class를 중첩·descendant selector로 연결하거나 raw HTML prose·copy·content wrapper 안 element selector를 추가·수정한다. · Tags: `flat-structure`, `nesting`, `selectors`
- `C14` · ID `selector-target-third-party-dom-from-owned-roots` · [Target Third-party DOM Only From Owned Roots](rules/selector-target-third-party-dom-from-owned-roots.md) · Impact: `CRITICAL` · Applies when: \`.ant-\*\`, \`.rc-\*\`, \`.tippy-\*\` 등 third-party 내부 DOM selector를 추가·수정하거나 owned wrapper 아래로 범위를 제한한다. · Tags: `nesting`, `third-party`, `wrappers` · Review with: `selector-avoid-deep-descendant-dependencies`
- `C15` · ID `selector-use-pseudo-classes-for-dom-owned-states` · [Use Pseudo-classes for DOM-owned States](rules/selector-use-pseudo-classes-for-dom-owned-states.md) · Impact: `HIGH` · Applies when: \`:hover\`, \`:visited\`, \`:focus\*\`, \`:disabled\`, \`:checked\`를 추가·수정하거나 parent DOM state가 child styling에 영향을 준다. · Tags: `interaction`, `pseudo-classes`, `state` · Review with: `values-separate-domain-state-modifiers-from-dom-interaction-states`

### 4. Values, Layout, and Interaction States — HIGH (4 rules)

- `C16` · ID `values-keep-layout-intent-explicit` · [Keep Layout Intent Explicit](rules/values-keep-layout-intent-explicit.md) · Impact: `MEDIUM-HIGH` · Applies when: \`sticky\`·\`fixed\`, \`z-index\`, 강제 width·height 또는 부모·자식의 layout responsibility를 추가·변경한다. · Tags: `comments`, `layout`, `sticky`
- `C17` · ID `values-always-provide-css-variable-fallbacks` · [Provide CSS Variable Fallbacks When Token Presence Is Not Guaranteed](rules/values-always-provide-css-variable-fallbacks.md) · Impact: `HIGH` · Applies when: \`var\(--\*\)\`를 추가·수정하거나 theme provider·third-party wrapper·optional token·overlay처럼 변수 주입이 보장되지 않는 경계를 스타일링한다. · Tags: `fallbacks`, `tokens`, `variables`
- `C18` · ID `values-separate-domain-state-modifiers-from-dom-interaction-states` · [Separate Domain State Modifiers From DOM Interaction States](rules/values-separate-domain-state-modifiers-from-dom-interaction-states.md) · Impact: `HIGH` · Applies when: app/domain state modifier와 hover·focus·disabled 같은 DOM interaction state를 추가·변경하거나 focus ring에 손댄다. · Tags: `accessibility`, `focus`, `state`
- `C19` · ID `values-tokenize-repeated-visual-values` · [Tokenize Repeated Visual Values](rules/values-tokenize-repeated-visual-values.md) · Impact: `HIGH` · Applies when: 색상·간격·radius·타이포·그림자 등 같은 시각 값이 2회 이상 반복되거나 새 shared visual value를 하드코딩한다. · Tags: `reuse`, `tokens`, `variables` · Review with: `values-always-provide-css-variable-fallbacks`

### 5. File Organization and Guardrails — MEDIUM (2 rules)

- `C20` · ID `organization-keep-style-files-owned-by-one-component-or-route` · [Keep Style Files Owned by One Component or Route Surface](rules/organization-keep-style-files-owned-by-one-component-or-route.md) · Impact: `MEDIUM` · Applies when: stylesheet를 새로 만들거나 이동·분할·병합하고 한 파일에 component, route, document, local, shared owner가 섞일 가능성이 있다. · Tags: `comments`, `files`, `ownership`
- `C21` · ID `organization-review-banned-css-patterns-before-finishing` · [Review Banned CSS Patterns Before Finishing](rules/organization-review-banned-css-patterns-before-finishing.md) · Impact: `MEDIUM` · Applies when: CSS 또는 TSX class contract 변경이 완료 단계에 들어간다. · Tags: `banned-patterns`, `guardrails`, `review`

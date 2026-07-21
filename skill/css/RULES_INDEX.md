# CSS 컨벤션 Rule Index

> 모든 entry를 스캔합니다. Selected/Unknown guidance path는 `contracts/<stable-id>.md`입니다.

- Skill: `css`
- Version: `1.0.0`
- Routing digest: `sha256:6ccc113bdb521f4b15b57a2884aa2a3ffab9b645216de49661598bdafc7f26aa`
- Local rules: 21

## Direct Companions

- `typescript` (`conditional`) · Applies when: TS/TSX class contract, wrapper Props 또는 style import를 함께 변경한다. · [SKILL.md](../typescript/SKILL.md) · [RULES_INDEX.md](../typescript/RULES_INDEX.md)

## Local Rules

### 1. Naming and Ownership (6)

- `C01` · `naming-default-to-plain-css-when-no-module-convention` · 프로젝트 표준이 확정되지 않은 상태에서 새 stylesheet 또는 class contract의 형식을 결정하거나 \`.module.css\`/\`styles.\*\` 도입·전환을 검토한다.
- `C02` · `naming-keep-scope-slug-unique-per-owner` · 새 \`scope\_slug\` namespace를 추가·복사·이름 변경하거나 서로 다른 owner의 class가 같은 namespace를 사용할 가능성이 있다.
- `C03` · `naming-name-elements-and-modifiers-by-role` · element 또는 modifier class를 새로 짓거나 \`container\`, \`wrapper\`, \`box\`, 치수·간격 중심 이름을 변경한다.
- `C04` · `naming-preserve-route-slug-traceability` · route/framework 규칙이 \`rt\_\*\` owner를 선택한 화면에서 route class slug를 새로 만들거나 이름을 변경한다.
- `C05` · `naming-separate-local-and-route-style-scopes` · 스타일 owner를 route, document, local helper, reusable widget, UI primitive 중에서 결정하거나 서로 다른 owner를 이동·분리한다. · reviewWith: `organization-keep-style-files-owned-by-one-component-or-route`
- `C06` · `naming-use-scope-slug-element-modifier-syntax` · plain CSS의 project-owned class를 새로 만들거나 이름, scope, slug, element, modifier 구분자 또는 casing을 변경한다.

### 2. Class Composition and Wrapper Boundaries (5)

- `C07` · `composition-compose-classes-with-clsx` · TSX의 \`className\`을 추가·수정하거나 base class, modifier, optional class를 조합한다.
- `C08` · `composition-do-not-build-structural-variants-with-modifiers` · spacing·방향·특정 화면의 구조 차이를 \`--modifier\`로 추가하려 하거나 modifier가 반복 가능한 상태 또는 API variant인지 판단한다. · reviewWith: `naming-name-elements-and-modifiers-by-role`
- `C09` · `composition-keep-classes-single-purpose` · base class 이름에 상태·variant 의미를 합치거나 한 class에 서로 독립적인 시각 책임을 추가·재사용·분리한다.
- `C10` · `composition-style-ui-components-through-owned-wrappers` · 실제 \`Ui\*\` React wrapper 사용처·API에서 내부 DOM styling 경계를 정하거나 root \`className\`·slot prop hook을 주입·노출·사용한다. 기존 CSS owner root 아래 third-party selector만 수정하면 제외한다. · reviewWith: `selector-target-third-party-dom-from-owned-roots`
- `C11` · `composition-prefer-ui-wrapper-prop-types` · \`Ui\*\` wrapper 사용처나 wrapper API에서 Props 타입을 선언·추론·재사용하고 라이브러리 원본 Props 참조를 검토한다. · reviewWith: `typescript/types-reuse-existing-contracts-before-new-types`

### 3. Selectors and Nesting Boundaries (4)

- `C12` · `selector-avoid-deep-descendant-dependencies` · descendant 또는 child selector chain을 추가·수정하거나 DOM 계층에 의존하는 project-owned·third-party selector를 검토한다.
- `C13` · `selector-keep-project-selectors-flat` · project-owned class를 중첩·descendant selector로 연결하거나 raw HTML prose·copy·content wrapper 안 element selector를 추가·수정한다.
- `C14` · `selector-target-third-party-dom-from-owned-roots` · \`.ant-\*\`, \`.rc-\*\`, \`.tippy-\*\` 등 third-party 내부 DOM selector를 추가·수정하거나 owned wrapper 아래로 범위를 제한한다. · reviewWith: `selector-avoid-deep-descendant-dependencies`
- `C15` · `selector-use-pseudo-classes-for-dom-owned-states` · \`:hover\`, \`:visited\`, \`:focus\*\`, \`:disabled\`, \`:checked\`를 추가·수정하거나 parent DOM state가 child styling에 영향을 준다. · reviewWith: `values-separate-domain-state-modifiers-from-dom-interaction-states`

### 4. Values, Layout, and Interaction States (4)

- `C16` · `values-keep-layout-intent-explicit` · \`sticky\`·\`fixed\`, \`z-index\`, 강제 width·height 또는 부모·자식의 layout responsibility를 추가·변경한다.
- `C17` · `values-always-provide-css-variable-fallbacks` · \`var\(--\*\)\`를 추가·수정하거나 theme provider·third-party wrapper·optional token·overlay처럼 변수 주입이 보장되지 않는 경계를 스타일링한다.
- `C18` · `values-separate-domain-state-modifiers-from-dom-interaction-states` · app/domain state modifier와 hover·focus·disabled 같은 DOM interaction state를 추가·변경하거나 focus ring에 손댄다.
- `C19` · `values-tokenize-repeated-visual-values` · 색상·간격·radius·타이포·그림자 등 같은 시각 값이 2회 이상 반복되거나 새 shared visual value를 하드코딩한다. · reviewWith: `values-always-provide-css-variable-fallbacks`

### 5. File Organization and Guardrails (2)

- `C20` · `organization-keep-style-files-owned-by-one-component-or-route` · stylesheet를 새로 만들거나 이동·분할·병합하고 한 파일에 component, route, document, local, shared owner가 섞일 가능성이 있다.
- `C21` · `organization-review-banned-css-patterns-before-finishing` · CSS 또는 TSX class contract 변경이 완료 단계에 들어간다.

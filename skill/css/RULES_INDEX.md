# CSS 컨벤션 Rule Index

- Skill: `css`
- Routing digest: `sha256:0f967f114f2d4e24642b067a2d2535eb9c89996c76c5da773d54ddcc639d9afa`

## Direct Companions

- `typescript` (`conditional`) · Applies when: TS/TSX class contract, wrapper Props 또는 style import를 함께 변경한다. · [SKILL.md](../typescript/SKILL.md) · [RULES_INDEX.md](../typescript/RULES_INDEX.md)

## Local Rules

- C01 | naming-default-to-plain-css-when-no-module-convention | 프로젝트 표준 미확정 상태에서 새 stylesheet 접근 형식\(plain CSS·CSS Modules\)을 선택하거나 \`.module.css\`·\`styles.\*\`로 전환할 때. 제외: 기존 plain CSS class rename만 하는 경우.
- C02 | naming-keep-scope-slug-unique-per-owner | 새 \`scope\_slug\`를 만들거나 기존 slug를 복사·이름 변경할 때. 서로 다른 컴포넌트가 같은 slug를 쓸 가능성이 있을 때.
- C03 | naming-name-elements-and-modifiers-by-role | element 또는 modifier class 이름을 새로 지을 때. \`container\`, \`wrapper\`, \`box\`, 치수·간격 중심 이름을 변경할 때.
- C04 | naming-keep-page-slug-traceable | \`pg\_\*\` owner의 class slug를 새로 만들거나 이름을 바꿀 때. 같은 이름 component가 여러 화면에 생겨 slug를 구분해야 할 때.
- C05 | naming-separate-owner-style-scopes | 스타일 owner를 화면 내부, widget, primitive 중에서 결정할 때. 새 CSS 파일을 만들거나 기존 owner 범위를 옮길 때. | reviewWith: naming-keep-scope-slug-unique-per-owner, organization-keep-style-files-owned-by-one-component-or-route
- C06 | naming-use-scope-slug-element-modifier-syntax | plain CSS의 project-owned class를 새로 만들 때. 이름, scope, slug, element, modifier 구분자 또는 casing을 변경할 때.
- C07 | composition-compose-classes-with-clsx | TSX의 \`className\`을 추가·수정할 때. base class, modifier, optional class를 조합할 때.
- C08 | composition-do-not-build-structural-variants-with-modifiers | modifier를 추가·변경할 때. 반복 가능한 state·API variant와 one-off structural patch 사이를 판정할 때. | reviewWith: naming-name-elements-and-modifiers-by-role
- C09 | composition-keep-classes-single-purpose | 기존 class가 base와 state·variant 책임을 함께 갖거나 독립 시각 책임을 추가·재사용·분리할 때. 제외: 기존 결합 책임을 분리하지 않고 처음부터 새 single-purpose pair를 만들거나 책임 보존 rename만 하는 경우.
- C10 | composition-style-ui-components-through-owned-wrappers | \`Ui\*\` wrapper에 \`className\`을 주거나 wrapper가 노출할 class 계약을 정할 때. \`Ui\*\` 내부 DOM을 겨냥하는 스타일을 추가할 때. 제외: 기존 CSS owner root 아래 third-party selector만 수정하는 경우. | reviewWith: selector-target-third-party-dom-from-owned-roots
- C11 | selector-avoid-deep-descendant-dependencies | 공백·\`\>\`·\`+\`·\`~\`로 요소 사이 관계를 표현하는 selector를 추가·수정할 때. DOM 계층에 의존하는 project-owned·third-party selector를 검토할 때. | reviewWith: composition-style-ui-components-through-owned-wrappers, selector-limit-nesting-block-depth, selector-target-third-party-dom-from-owned-roots, selector-use-pseudo-classes-for-dom-owned-states
- C12 | selector-limit-nesting-block-depth | 중첩 \`{}\` block을 추가하거나 기존 block을 펼치거나 합칠 때. raw HTML prose·copy·content wrapper 안 element selector를 추가·수정할 때. | reviewWith: selector-avoid-deep-descendant-dependencies
- C13 | selector-target-third-party-dom-from-owned-roots | \`.ant-\*\`, \`.rc-\*\`, \`.tippy-\*\` 등 third-party 내부 DOM selector를 추가·수정할 때. owned wrapper 아래로 범위를 제한할 때.
- C14 | selector-use-pseudo-classes-for-dom-owned-states | \`:hover\`, \`:visited\`, \`:focus\*\`, \`:disabled\`, \`:checked\`를 추가·수정할 때. parent DOM state가 child styling에 영향을 줄 때.
- C15 | values-keep-layout-intent-explicit | \`sticky\`·\`fixed\`, \`z-index\`, 강제 width·height 또는 부모·자식 layout 책임을 추가·변경할 때. 제외: 같은 element의 base/modifier 분리에서 기존 \`display\`·spacing 선언을 값 그대로 재배치하는 경우.
- C16 | values-always-provide-css-variable-fallbacks | \`var\(--\*\)\` 사용을 추가하거나 변수 이름·fallback을 바꿀 때. core token 목록에 항목을 추가·제거할 때. | reviewWith: values-tokenize-repeated-visual-values
- C17 | values-separate-domain-state-modifiers-from-dom-interaction-states | app/domain state modifier와 hover·focus·disabled 같은 DOM interaction state를 추가·변경할 때. focus ring을 수정할 때. | reviewWith: composition-do-not-build-structural-variants-with-modifiers
- C18 | values-tokenize-repeated-visual-values | 여러 파일이 같은 색·간격·radius·타이포·그림자 값을 쓸 때. 새 CSS custom property를 선언할 때. | reviewWith: values-always-provide-css-variable-fallbacks
- C19 | organization-keep-style-files-owned-by-one-component-or-route | stylesheet를 새로 만들거나 이동·분할·병합해 한 파일에 component, route, document, local, shared owner가 섞일 가능성이 있을 때.
- C20 | organization-review-banned-css-patterns-before-finishing | CSS 또는 TSX class contract 변경이 완료 단계에 들어갈 때. | completionGate
# CSS 컨벤션 Rule Index

- Skill: `css`
- Routing digest: `sha256:97ada6dce7d906819799c3350eadfe999be2d725fd4f603eb472d411d20d6f86`

## Direct Companions

- `typescript` (`conditional`) · Applies when: TS/TSX 클래스 계약, 래퍼 Props 또는 style import를 함께 변경한다. · [SKILL.md](../typescript/SKILL.md) · [RULES_INDEX.md](../typescript/RULES_INDEX.md)

## Local Rules

- C01-01 | naming-default-to-plain-css-when-no-module-convention | 표준이 정해지지 않은 상태에서 스타일시트 방식\(일반 CSS, CSS Modules\)을 고르거나 \`.module.css\`나 \`styles.\*\`로 옮길 때. 제외: 기존 일반 CSS 클래스 이름만 바꾸는 경우.
- C01-02 | naming-use-scope-slug-element-modifier-syntax | 일반 CSS에서 프로젝트가 소유한 클래스를 새로 만들 때. 이름, 범위, 식별자, 요소, 수정자의 구분자나 대소문자 표기를 바꿀 때.
- C01-03 | naming-name-elements-and-modifiers-by-role | 요소나 수정자 클래스 이름을 새로 지을 때. \`container\`, \`wrapper\`, \`box\`, 치수나 간격 중심 이름을 변경할 때.
- C01-04 | naming-keep-page-slug-traceable | \`pg\_\*\` 소유자의 클래스 식별자를 새로 만들거나 이름을 바꿀 때. 같은 이름 컴포넌트가 여러 화면에 생겨 식별자를 구분해야 할 때.
- C02-01 | ownership-give-each-file-one-scope-slug | 새 \`scope\_slug\`를 만들거나 기존 식별자를 복사·이름 변경할 때. 서로 다른 컴포넌트가 같은 식별자를 쓸 가능성이 있을 때.
- C02-02 | ownership-choose-scope-prefix-by-owner-layer | 새 CSS 파일을 만들면서 \`pg\_\`, \`wg\_\`, \`ui\_\` 중 하나를 고를 때. 소유자의 레이어가 바뀌어 접두사를 옮길 때. | reviewWith: ownership-give-each-file-one-scope-slug, ownership-use-foreign-classes-only-under-your-own-root
- C02-03 | ownership-use-foreign-classes-only-under-your-own-root | \`.ant-\*\`, \`.rc-\*\`, \`.Mui-\*\` 같은 외부 라이브러리 클래스를 쓸 때. 다른 \`scope\_slug\`의 클래스를 겨냥할 때. | reviewWith: ownership-change-other-owners-through-their-api, ownership-give-each-file-one-scope-slug, selector-limit-nesting-block-depth
- C02-04 | ownership-change-other-owners-through-their-api | 다른 컴포넌트의 배치나 내부 모습을 바꿔야 할 때. 컴포넌트에 클래스 관련 프롭을 추가할 때. | reviewWith: composition-inject-classes-only-at-the-entry-point, ownership-use-foreign-classes-only-under-your-own-root
- C03-01 | composition-compose-classes-with-clsx | TSX의 \`className\`을 추가·수정할 때. 기본 클래스, 수정자, 선택 클래스를 함께 엮을 때. | reviewWith: typescript/values-avoid-lookup-tables-for-simple-choices
- C03-02 | composition-do-not-build-structural-variants-with-modifiers | 수정자를 추가·변경할 때. 여러 곳에서 반복되는 모양인지 한 곳만의 보정인지 가릴 때. | reviewWith: naming-name-elements-and-modifiers-by-role
- C03-03 | composition-keep-classes-single-purpose | 한 클래스 이름에 기본 스타일과 상태를 함께 넣을 때. 제외: 처음부터 기본 클래스와 수정자를 나눠 만드는 경우. 제외: 책임이 그대로인 이름 변경만 하는 경우.
- C03-04 | composition-inject-classes-only-at-the-entry-point | 우리가 만든 컴포넌트에 \`className\`이나 클래스 관련 프롭을 추가할 때. 그 컴포넌트 내부 노드의 모양을 화면마다 다르게 해야 할 때. 제외: 기존 CSS 최상위 블록 아래 외부 라이브러리 선택자만 고치는 경우. | reviewWith: ownership-change-other-owners-through-their-api, ownership-use-foreign-classes-only-under-your-own-root
- C03-05 | composition-do-not-add-wrapper-elements-for-styling | 스타일을 주려고 \`div\`나 \`span\`을 새로 감쌀 때. \`className\`을 받지 않는 컴포넌트에 여백이나 크기를 줘야 할 때. | reviewWith: composition-inject-classes-only-at-the-entry-point, naming-name-elements-and-modifiers-by-role
- C03-06 | composition-do-not-style-through-the-style-attribute | TSX에 \`style={{ … }}\`를 추가하거나 그 안의 선언을 바꿀 때. 컴포넌트 프롭으로 \`style\`을 받아 넘길 때. | reviewWith: composition-inject-classes-only-at-the-entry-point, values-always-provide-css-variable-fallbacks, values-tokenize-repeated-visual-values
- C04-01 | selector-limit-nesting-block-depth | 중첩 \`{}\` 블록을 추가하거나 기존 블록을 펼치거나 합칠 때. \`&\`로 조건이나 가상 요소를 붙일 때. | reviewWith: selector-declare-each-class-in-one-block, selector-use-classes-instead-of-element-selectors
- C04-02 | selector-use-classes-instead-of-element-selectors | \`p\`, \`h2\`, \`span\`, \`button\` 같은 요소 선택자를 쓰려 할 때. \`dangerouslySetInnerHTML\`이나 Markdown 렌더러 출력을 스타일링할 때. | reviewWith: naming-name-elements-and-modifiers-by-role
- C04-03 | selector-do-not-group-classes-with-commas | 여러 클래스가 같은 선언을 반복해 \`,\`로 묶으려 할 때. 한 대상에 진입 조건을 둘 이상 추가할 때. | reviewWith: selector-declare-each-class-in-one-block, values-tokenize-repeated-visual-values
- C04-04 | selector-declare-each-class-in-one-block | 이미 선언한 클래스에 스타일을 더 추가할 때. 파일 아래쪽에서 위쪽 선언을 덮어쓰려 할 때. | reviewWith: layout-group-breakpoints-at-the-file-bottom, selector-do-not-group-classes-with-commas
- C04-05 | selector-use-pseudo-classes-for-dom-owned-states | \`:hover\`, \`:visited\`, \`:focus\*\`, \`:disabled\`, \`:checked\`를 추가·수정할 때. 조상의 DOM 상태가 자손 스타일에 영향을 줄 때.
- C04-06 | selector-nest-dom-state-in-the-owning-block | \`:hover\`, \`:focus-visible\`, \`:disabled\`, \`:checked\` 스타일을 추가·수정할 때. 조상의 DOM 상태가 자손 스타일을 바꿔야 할 때. | reviewWith: selector-do-not-group-classes-with-commas, selector-limit-nesting-block-depth, selector-use-pseudo-classes-for-dom-owned-states
- C04-07 | selector-do-not-negate-with-not | 선택자에 \`:not\(\)\`을 넣으려 할 때. 조상 클래스와 자손 클래스를 한 선택자에 함께 쓸 때. | reviewWith: selector-use-pseudo-classes-for-dom-owned-states
- C04-08 | selector-separate-domain-state-modifiers-from-dom-interaction-states | 앱 상태 수정자와 \`:hover\`, \`:focus-visible\`, \`:disabled\` 같은 DOM 상호작용 상태를 추가·변경할 때. 포커스 링을 수정할 때. | reviewWith: composition-do-not-build-structural-variants-with-modifiers
- C05-01 | values-always-provide-css-variable-fallbacks | \`var\(--\*\)\`를 새로 쓰거나 변수 이름이나 대체값을 바꿀 때. 공통 토큰 목록에 항목을 넣거나 뺄 때. | reviewWith: values-tokenize-repeated-visual-values
- C05-02 | values-tokenize-repeated-visual-values | 여러 파일이 같은 색, 간격, 모서리 반경, 타이포그래피, 그림자 값을 쓸 때. 새 변수를 선언할 때. | reviewWith: composition-do-not-style-through-the-style-attribute, values-always-provide-css-variable-fallbacks
- C05-03 | values-declare-stacking-layers-as-tokens | \`z-index\`를 새로 넣거나 값을 바꿀 때. 겹쳐 뜨는 요소를 추가할 때. | reviewWith: layout-keep-layout-intent-explicit, values-tokenize-repeated-visual-values
- C05-04 | values-switch-themes-by-changing-token-values | 다크 모드나 테마 전환을 넣을 때. 컴포넌트 CSS에 \`prefers-color-scheme\`이나 \`\[data-theme\]\`를 쓰려 할 때. 색이나 그림자 토큰을 새로 만들거나 이름을 바꿀 때. | reviewWith: values-always-provide-css-variable-fallbacks, values-tokenize-repeated-visual-values
- C06-01 | layout-group-breakpoints-at-the-file-bottom | \`@media\` 브레이크포인트를 추가하거나 옮길 때. 화면 폭에 따라 값이 달라지는 선언을 넣을 때. | reviewWith: layout-reach-for-intrinsic-sizing-before-breakpoints, selector-declare-each-class-in-one-block, values-switch-themes-by-changing-token-values
- C06-02 | layout-keep-layout-intent-explicit | \`sticky\`·\`fixed\`, \`z-index\`, 강제 \`width\`·\`height\`, 부모·자식 레이아웃 책임을 추가·변경할 때. 로딩 대체 화면의 컨테이너나 높이를 정할 때. 제외: 같은 요소를 기본과 수정자로 나누면서 기존 \`display\`·여백 선언을 값 그대로 옮기는 경우. | reviewWith: values-declare-stacking-layers-as-tokens
- C06-03 | layout-reach-for-intrinsic-sizing-before-breakpoints | \`@media\` 브레이크포인트를 새로 넣으려 할 때. 폭에 따라 줄바꿈, 열 개수, 크기가 달라져야 할 때. | reviewWith: layout-group-breakpoints-at-the-file-bottom, layout-keep-layout-intent-explicit
- C07-01 | a11y-always-provide-a-visible-focus-indicator | \`outline\`, \`:focus\`, \`:focus-visible\` 스타일을 추가·수정할 때. 상호작용 요소의 기본 포커스 링을 덮어쓸 때. | reviewWith: selector-separate-domain-state-modifiers-from-dom-interaction-states
- C07-02 | a11y-namespace-keyframes-and-respect-reduced-motion | \`@keyframes\` 이름이나 애니메이션 지속 시간, 이징을 선언하거나 바꿀 때. \`animation\`이나 \`transition\`으로 움직임을 새로 넣을 때. | reviewWith: tooling-configure-stylelint-to-enforce-these-rules, values-tokenize-repeated-visual-values
- C08-01 | tooling-configure-stylelint-to-enforce-these-rules | stylelint 설정을 새로 만들거나 규칙을 추가·수정할 때. 이 컨벤션 중 어디까지 자동으로 잡히는지 확인할 때. | reviewWith: naming-use-scope-slug-element-modifier-syntax, ownership-use-foreign-classes-only-under-your-own-root, selector-limit-nesting-block-depth
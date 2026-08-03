# CSS 컨벤션 Rule Index

- Skill: `css`
- Routing digest: `sha256:ef371f3088813cb799792d152ad75c5d447dfe966743e53a7cd9ae085a8ac049`

## Direct Companions

- `typescript` (`conditional`) · Applies when: TS/TSX class contract, wrapper Props 또는 style import를 함께 변경한다. · [SKILL.md](../typescript/SKILL.md) · [RULES_INDEX.md](../typescript/RULES_INDEX.md)

## Local Rules

- C01 | naming-default-to-plain-css-when-no-module-convention | 프로젝트 표준 미확정 상태에서 새 stylesheet 접근 형식\(plain CSS·CSS Modules\)을 선택하거나 \`.module.css\`·\`styles.\*\`로 전환할 때. 제외: 기존 plain CSS class rename만 하는 경우.
- C02 | naming-use-scope-slug-element-modifier-syntax | plain CSS의 project-owned class를 새로 만들 때. 이름, scope, slug, element, modifier 구분자 또는 casing을 변경할 때.
- C03 | naming-name-elements-and-modifiers-by-role | element 또는 modifier class 이름을 새로 지을 때. \`container\`, \`wrapper\`, \`box\`, 치수·간격 중심 이름을 변경할 때.
- C04 | naming-keep-page-slug-traceable | \`pg\_\*\` owner의 class slug를 새로 만들거나 이름을 바꿀 때. 같은 이름 component가 여러 화면에 생겨 slug를 구분해야 할 때.
- C05 | ownership-give-each-file-one-scope-slug | 새 \`scope\_slug\`를 만들거나 기존 slug를 복사·이름 변경할 때. 서로 다른 컴포넌트가 같은 slug를 쓸 가능성이 있을 때.
- C06 | ownership-choose-scope-prefix-by-reuse-range | 새 CSS 파일을 만들며 \`pg\_\`·\`wg\_\`·\`ui\_\` 중 하나를 고를 때. owner의 재사용 범위가 바뀌어 prefix를 옮길 때. | reviewWith: ownership-give-each-file-one-scope-slug, ownership-use-foreign-classes-only-under-your-own-root
- C07 | ownership-use-foreign-classes-only-under-your-own-root | \`.ant-\*\`·\`.rc-\*\`·\`.Mui-\*\` 같은 third-party class를 쓸 때. 다른 \`scope\_slug\`의 class를 겨냥할 때. | reviewWith: ownership-change-other-owners-through-their-api, ownership-give-each-file-one-scope-slug, selector-limit-nesting-block-depth
- C08 | ownership-change-other-owners-through-their-api | 다른 component의 배치나 내부 표현을 바꿔야 할 때. component에 class 관련 prop을 추가할 때. | reviewWith: composition-style-ui-components-through-owned-wrappers, ownership-use-foreign-classes-only-under-your-own-root
- C09 | composition-compose-classes-with-clsx | TSX의 \`className\`을 추가·수정할 때. base class, modifier, optional class를 조합할 때.
- C10 | composition-do-not-build-structural-variants-with-modifiers | modifier를 추가·변경할 때. 여러 곳에서 쓰이는 variant인지 한 곳만의 보정인지 판정할 때. | reviewWith: naming-name-elements-and-modifiers-by-role
- C11 | composition-keep-classes-single-purpose | 기존 class가 base와 state·variant 책임을 함께 갖거나 독립 시각 책임을 추가·재사용·분리할 때. 제외: 기존 결합 책임을 분리하지 않고 처음부터 새 single-purpose pair를 만들거나 책임 보존 rename만 하는 경우.
- C12 | composition-style-ui-components-through-owned-wrappers | \`Ui\*\` wrapper에 \`className\`을 주거나 wrapper가 노출할 class 계약을 정할 때. \`Ui\*\` 내부 노드의 모양을 화면마다 다르게 해야 할 때. 제외: 기존 CSS owner root 아래 third-party selector만 수정하는 경우. | reviewWith: ownership-change-other-owners-through-their-api, ownership-use-foreign-classes-only-under-your-own-root
- C13 | selector-limit-nesting-block-depth | 중첩 \`{}\` block을 추가하거나 기존 block을 펼치거나 합칠 때. \`&\`로 조건이나 pseudo-element를 붙일 때. | reviewWith: selector-declare-each-class-in-one-block, selector-use-classes-instead-of-element-selectors
- C14 | selector-use-classes-instead-of-element-selectors | \`p\`, \`h2\`, \`span\`, \`button\` 같은 element selector를 쓰려 할 때. \`dangerouslySetInnerHTML\`이나 Markdown 렌더러 출력을 스타일링할 때. | reviewWith: naming-name-elements-and-modifiers-by-role
- C15 | selector-do-not-group-classes-with-commas | 여러 class가 같은 선언을 반복해 \`,\`로 묶으려 할 때. 한 대상에 진입 조건이 여럿일 때. | reviewWith: selector-declare-each-class-in-one-block, values-tokenize-repeated-visual-values
- C16 | selector-declare-each-class-in-one-block | 이미 선언한 class에 스타일을 더 추가할 때. 파일 아래쪽에서 위쪽 선언을 덮어쓰려 할 때. | reviewWith: selector-do-not-group-classes-with-commas
- C17 | selector-use-pseudo-classes-for-dom-owned-states | \`:hover\`, \`:visited\`, \`:focus\*\`, \`:disabled\`, \`:checked\`를 추가·수정할 때. parent DOM state가 child styling에 영향을 줄 때.
- C18 | selector-nest-dom-state-in-the-owning-block | \`:hover\`, \`:focus-visible\`, \`:disabled\`, \`:checked\` 스타일을 추가·수정할 때. 조상의 DOM 상태가 자손 스타일을 바꿔야 할 때. | reviewWith: selector-do-not-group-classes-with-commas, selector-limit-nesting-block-depth, selector-use-pseudo-classes-for-dom-owned-states
- C19 | selector-do-not-invert-domain-state-with-not | \`:not\(.--modifier\)\`로 앱 상태를 뒤집으려 할 때. 조상의 modifier가 자손의 표현을 결정해야 할 것 같을 때. | reviewWith: selector-use-pseudo-classes-for-dom-owned-states
- C20 | values-keep-layout-intent-explicit | \`sticky\`·\`fixed\`, \`z-index\`, 강제 width·height 또는 부모·자식 layout 책임을 추가·변경할 때. 제외: 같은 element의 base/modifier 분리에서 기존 \`display\`·spacing 선언을 값 그대로 재배치하는 경우.
- C21 | values-always-provide-css-variable-fallbacks | \`var\(--\*\)\` 사용을 추가하거나 변수 이름·fallback을 바꿀 때. core token 목록에 항목을 추가·제거할 때. | reviewWith: values-tokenize-repeated-visual-values
- C22 | values-tokenize-repeated-visual-values | 여러 파일이 같은 색·간격·radius·타이포·그림자 값을 쓸 때. 새 CSS custom property를 선언할 때. | reviewWith: values-always-provide-css-variable-fallbacks
- C23 | values-separate-domain-state-modifiers-from-dom-interaction-states | app/domain state modifier와 hover·focus·disabled 같은 DOM interaction state를 추가·변경할 때. focus ring을 수정할 때. | reviewWith: composition-do-not-build-structural-variants-with-modifiers
- C24 | values-always-provide-a-visible-focus-indicator | \`outline\`, \`:focus\`, \`:focus-visible\` 스타일을 추가·수정할 때. interactive 요소의 기본 포커스 링을 덮어쓸 때. | reviewWith: values-separate-domain-state-modifiers-from-dom-interaction-states
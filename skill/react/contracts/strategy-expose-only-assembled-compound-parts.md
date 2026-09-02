# Expose Only Compound Parts the Consumer Assembles

**Impact: MEDIUM-HIGH (내부 구조가 공개 계약이 되지 않아 나중에 바꿀 수 있습니다)**

공개 부품은 두 경우만 엽니다.

- 부품이 없으면 사용처가 그 자리에 자기 JSX를 넣을 수 없는 영역
- 공용 컨텍스트나 동작을 직접 쓰는 영역

그 밖은 숨깁니다.
특히 다음 둘은 공개하지 않습니다.

- 단순 `className` 래퍼
- 여백 보정용 DOM. `css/composition-do-not-add-wrapper-elements-for-styling`이 애초에 만들지 말라고 합니다.

상태 없는 합성에 상태를 넣으면서 공개 이름을 어떻게 할지는
`strategy-choose-single-composition-compound-and-variants`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/04-02-strategy-expose-only-assembled-compound-parts.md)을 읽습니다.

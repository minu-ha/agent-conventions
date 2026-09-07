# Expose Only Compound Parts the Consumer Assembles

**Impact: MEDIUM-HIGH (내부 구조를 공개 계약과 분리해 이후 변경 범위를 줄입니다)**

합성 컴포넌트의 공개 부품은 사용처가 직접 조립해야 하는 영역만 엽니다.

| 영역 | 공개 여부 |
| --- | --- |
| 부품이 없으면 사용처가 자기 JSX를 넣을 수 없는 자리 | 공개합니다 |
| 공용 컨텍스트나 동작을 직접 쓰는 자리 | 공개합니다 |
| 단순 `className` 래퍼와 그 밖의 내부 구조 | 공개하지 않습니다 |
| 여백 보정용 DOM | `css/composition-do-not-add-wrapper-elements-for-styling`에 따라 만들지 않습니다 |

상태 없는 합성에 상태를 추가할 때의 공개 이름은
`strategy-choose-single-composition-compound-and-variants`를 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/04-02-strategy-expose-only-assembled-compound-parts.md)을 읽습니다.

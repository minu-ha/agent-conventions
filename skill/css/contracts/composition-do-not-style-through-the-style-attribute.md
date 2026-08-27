# Do Not Style Through the `style` Attribute

**Impact: HIGH (모든 시각 결정이 스타일시트에 남아 검색과 덮어쓰기가 예측대로 동작합니다)**

시각 결정은 스타일시트에 씁니다.
`style={{ … }}`로 쓰지 않습니다.

- 인라인 선언은 클래스보다 우선순위가 높아 `!important` 없이는 스타일시트에서 덮을 수 없습니다.
- CSS 파일을 검색해도 안 나옵니다.
  어디서 온 여백인지 찾을 수 없습니다.
- `:hover`, `@media`, `@container`를 쓸 수 없어 결국 클래스를 다시 만들게 됩니다.

| 값 | 넘기는 방법 |
| --- | --- |
| 화면마다 달라지는 값 | 수정자 클래스. 어디서 주입할지는 `composition-inject-classes-only-at-the-entry-point` 규칙이 정합니다 |
| 실행 중에 계산해야만 아는 수치 하나 | CSS 변수 한 개만 `style`로 넘기고 실제 선언은 스타일시트에 둡니다 |

둘째 행이 유일한 예외입니다.
가상 스크롤 위치, 드래그 좌표, 측정한 높이처럼 스타일시트에 적을 수 없는 값이 여기 해당합니다.
변수가 없을 때를 대비한 대체값은 `values-always-provide-css-variable-fallbacks` 규칙이 정합니다.

래퍼가 `HTMLAttributes`를 `extends`하면 `style`이 함께 열립니다.
타입에서 막을 방법이 없으므로 이 규칙을 리뷰가 봅니다.

> 예시·예외가 필요하면 [full rule](../rules/03-06-composition-do-not-style-through-the-style-attribute.md)을 읽습니다.

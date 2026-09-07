# Declare Each Class in One Block

**Impact: MEDIUM-HIGH (한 클래스의 선언을 한 블록에서 확인하고 수정합니다)**

한 클래스의 선언은 파일 안 한 블록에 모읍니다. 같은 클래스를 여러 곳에서 다시 열어 선언 순서로 덮어쓰지 않습니다.

| 형태 | 판정 |
| --- | --- |
| 기본 클래스와 수정자 | 서로 다른 클래스이므로 각자 블록을 둡니다. 한 요소에 함께 붙으면 명시도와 선언 순서를 확인합니다 |
| 쉼표로 묶어 선언을 나눔 | `selector-do-not-group-classes-with-commas` 규칙이 금지합니다 |
| `@media`, `@supports`, `@container` 안의 재선언 | 조건이 다른 별개 블록이므로 허용합니다 |

기본 블록 아래에 같은 선택자의 덮어쓰기가 있는지 다시 찾지 않도록 최종 선언을 한 곳에 둡니다.
조건 블록의 위치는 `layout-group-breakpoints-at-the-file-bottom` 규칙을 따릅니다.
기계 검증은 `no-duplicate-selectors`가 담당합니다.

> 예시·예외가 필요하면 [full rule](../rules/04-04-selector-declare-each-class-in-one-block.md)을 읽습니다.

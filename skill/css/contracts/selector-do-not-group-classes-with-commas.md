# Do Not Group Classes With Commas to Share Declarations

**Impact: MEDIUM (공통 선언도 각 클래스에 두어 전체 스타일을 한 곳에서 읽습니다)**

공통 선언을 공유하려고 여러 클래스를 `,`로 묶지 않습니다.
중복되더라도 각 클래스 블록에 선언을 모두 적어 한 클래스의 스타일을 한 곳에서 읽게 합니다.

| 형태 | 처리 |
| --- | --- |
| 여러 클래스가 같은 선언을 씀 | 각 블록에 반복합니다. 목록을 따로 관리하지 않습니다 |
| 한 대상에 진입 조건이 여럿임 | 조건마다 블록을 엽니다. `,`나 `:is()`로 묶지 않습니다 |
| 값을 지역 변수로 빼서 공유함 | `values-tokenize-repeated-visual-values` 규칙에 따라 금지합니다 |
| `@media`나 `@supports` 안에서 같은 클래스를 재선언함 | 이 규칙의 대상이 아닙니다 |

| 검사 대상 | 담당 |
| --- | --- |
| 쉼표 목록의 선택자를 아래에서 단독으로 다시 선언함 | `no-duplicate-selectors`의 `disallowInList` 옵션 |
| 중복 없이 쉼표로 묶기만 함 | 리뷰. 기계 검사는 묶음 자체를 막지 않습니다 |

> 예시·예외가 필요하면 [full rule](../rules/04-03-selector-do-not-group-classes-with-commas.md)을 읽습니다.

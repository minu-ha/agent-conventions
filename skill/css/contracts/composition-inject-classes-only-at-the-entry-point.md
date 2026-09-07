# Inject Classes Only at the Component Entry Point

**Impact: MEDIUM-HIGH (클래스 주입을 한 곳으로 제한해 사용처가 내부 구조에 의존하지 않게 합니다)**

우리가 만든 컴포넌트는 레이어와 무관하게 **최상위 진입점 한 곳**에서만 외부 클래스를 받습니다.
내부 노드의 클래스 주입 지점을 늘리면 사용처가 컴포넌트 구조에 의존하게 됩니다.

| 사용처가 바꾸려는 것 | 방법 |
| --- | --- |
| 최상위의 배치, 여백, 크기 | 받은 `className`을 자기 최상위 클래스와 `clsx()`로 합칩니다 |
| 화면마다 달라지는 내부 모양 | `variant` 프롭을 받고 헤더나 본문 등 필요한 노드마다 수정자를 붙입니다 |

| 금지하는 형태 | 이유 또는 예외 |
| --- | --- |
| `headerClassName`, `itemClassName` 같은 내부 클래스 프롭 | 내부 구조가 바뀌면 사용처도 함께 깨집니다 |
| 받은 `className`을 내부 노드에 전달함 | 클래스 주입은 최상위까지만 허용합니다 |
| 최상위 수정자로 내부를 결합해 선택함 | 자손이 조상 구조에 의존합니다. 조상의 DOM 상태를 전달할 때만 `selector-nest-dom-state-in-the-owning-block`에 따라 결합자 하나를 씁니다 |

사용처의 선택은 `ownership-change-other-owners-through-their-api` 규칙이 정합니다.
`className`을 받지 않는 컴포넌트는 `composition-do-not-add-wrapper-elements-for-styling` 규칙을 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/03-04-composition-inject-classes-only-at-the-entry-point.md)을 읽습니다.

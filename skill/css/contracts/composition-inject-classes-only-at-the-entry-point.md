# Inject Classes Only at the Component Entry Point

**Impact: MEDIUM-HIGH (내부 노드마다 클래스 주입 지점을 열면 사용처가 그 컴포넌트 구조에 얽매입니다)**

우리가 만든 컴포넌트가 스타일을 주입하는 자리는 **진입점 하나**입니다.
`ui_`든 `wg_`든 `pg_`든 같습니다.
외부에서 주입하는 클래스는 그 컴포넌트의 최상위까지만 닿습니다.

| 사용처가 바꾸려는 것 | 방법 |
| --- | --- |
| 최상위의 배치, 여백, 크기 | `className`을 넘깁니다. 컴포넌트는 받은 `className`을 자기 최상위 클래스와 `clsx()`로 합칩니다 |
| 화면마다 달라야 하는 내부 모양 | `variant` 프롭을 넘깁니다. 변형은 헤더나 본문처럼 필요한 노드마다 수정자로 붙입니다 |

하지 않는 것은 셋입니다.

- `headerClassName`, `itemClassName`처럼 내부 노드로 가는 클래스 프롭을 늘리지 않습니다.
  주입 지점이 늘어나면 사용처가 내부 구조를 알게 되고, 내부가 바뀔 때 사용처가 함께 깨집니다.
- 받은 `className`을 내부 노드로 넘기지 않습니다.
- 최상위에 수정자 하나만 붙이고 내부를 결합자로 잡지 않습니다.
  그 자손이 어느 조상 아래 있는지에 얽매여 내부 구조가 바뀔 때 조용히 깨집니다.
  조상의 **DOM 상태**를 자손에 전달할 때만 결합자 하나를 씁니다.
  그 자리는 `selector-nest-dom-state-in-the-owning-block` 규칙이 정합니다.

사용처 쪽에서 무엇을 고를지는 `ownership-change-other-owners-through-their-api` 규칙이 정합니다.
`className`을 받지 않는 컴포넌트는 `composition-do-not-add-wrapper-elements-for-styling` 규칙이 다룹니다.

> 예시·예외가 필요하면 [full rule](../rules/03-04-composition-inject-classes-only-at-the-entry-point.md)을 읽습니다.

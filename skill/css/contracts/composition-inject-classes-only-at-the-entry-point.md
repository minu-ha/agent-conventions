# Inject Classes Only at the Component Entry Point

**Impact: HIGH (내부 노드마다 창구를 열면 사용처가 그 컴포넌트 구조에 묶입니다)**

우리가 만든 컴포넌트가 여는 스타일 창구는 **진입점 하나**입니다.
`ui_`든 `wg_`든 `pg_`든 같습니다. 외부에서 주입하는 클래스는 그 컴포넌트의 root까지만 닿습니다.

컴포넌트는 받은 `className`을 자기 root 클래스와 `clsx()`로 합칩니다.
사용처는 그 클래스로 배치, 여백, 크기만 줍니다.

`headerClassName`, `itemClassName` 같은 slot 클래스 prop을 늘리지 않습니다.
창구가 늘어나면 사용처가 내부 구조를 알게 되고, 내부가 바뀔 때 사용처가 함께 깨집니다.

내부 모양이 화면마다 달라야 하면 컴포넌트가 `variant` prop을 받아 처리합니다.
variant는 root뿐 아니라 header나 content처럼 필요한 노드에 각각 modifier로 붙입니다.
root modifier 하나만 붙이고 내부를 결합자로 잡지 않습니다.

받은 `className`을 내부 노드로 넘기지 않습니다.

사용처 쪽에서 무엇을 고를지는 `ownership-change-other-owners-through-their-api`가 정하고,
`className`을 받지 않는 컴포넌트를 어떻게 다룰지는 `composition-do-not-add-wrapper-elements-for-styling`이 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-04-composition-inject-classes-only-at-the-entry-point.md)을 읽습니다.

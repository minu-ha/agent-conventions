# Expose Only a Root Class on `Ui*` Components

**Impact: HIGH (wrapper가 내부 DOM 스타일링 창구를 여러 개 열어 사용처가 내부 구조에 묶이는 것을 막습니다)**

`Ui*` wrapper가 여는 스타일 창구는 `className` 하나입니다.
wrapper는 받은 값을 자기 root class와 `clsx()`로 합치고, 사용처는 그 클래스로 배치·여백·크기만 줍니다.

`headerClassName`, `itemClassName` 같은 slot class prop을 늘리지 않습니다.
창구가 늘어나면 사용처가 내부 구조를 알게 되고, 내부가 바뀔 때 사용처가 함께 깨집니다.

내부 모양이 화면마다 달라야 하면 wrapper가 `variant` prop을 받아 처리합니다.
variant는 root뿐 아니라 header·content처럼 필요한 노드에 각각 modifier로 붙입니다.
root modifier 하나만 붙이고 내부를 결합자로 잡지 않습니다.

- 받은 `className`을 내부 노드로 넘기지 않습니다.
- 래핑 `div`를 습관적으로 만들지 않습니다. 부모의 flex·grid 자식 수가 바뀌고 역할 없는 클래스가 생깁니다.
- `className`을 아예 받지 않는 wrapper면 그 계약을 추가하는 것이 먼저이고, 래핑은 마지막 수단입니다.

> 예시·예외가 필요하면 [full rule](../rules/02-04-composition-style-ui-components-through-owned-wrappers.md)을 읽습니다.

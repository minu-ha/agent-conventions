# Expose Only a Root Class on `Ui*` Components

**Impact: HIGH (wrapper가 내부 DOM 스타일링 창구를 여러 개 열어 사용처가 내부 구조에 묶이는 것을 막습니다)**

`Ui*` wrapper가 여는 스타일 창구는 root `className` 하나입니다.
사용처는 그 클래스로 배치, 여백, 크기처럼 root에 걸리는 스타일만 줍니다.

`headerClassName`, `itemClassName` 같은 slot class prop을 늘리지 않습니다.
창구가 늘어나면 사용처가 내부 구조를 알게 되고, 내부가 바뀔 때 사용처가 함께 깨집니다.

내부 모양이 화면마다 달라야 하면 **wrapper가 variant prop을 받아 내부에서 결정**합니다.
사용처는 `variant="compact"`처럼 의도만 넘기고 어떤 노드가 어떻게 바뀌는지는 모릅니다.

- wrapper는 받은 `className`을 root 노드에만 붙이고 내부 노드로 forward하지 않습니다.
- 래핑 `div`를 습관적으로 만들지 않습니다. 부모의 flex·grid 자식 수가 바뀌고 역할 없는 클래스가 생깁니다.
- root `className`을 받지 않는 wrapper면 그 계약을 추가하는 것이 먼저이고, 래핑은 마지막 수단입니다.

내부 노드를 직접 손대야 하는 경우는 `selector-target-third-party-dom-from-owned-roots`가 다룹니다.

> 예시·예외가 필요하면 [full rule](../rules/02-04-composition-style-ui-components-through-owned-wrappers.md)을 읽습니다.

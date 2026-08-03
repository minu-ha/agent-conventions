# Separate Domain State Modifiers From DOM Interaction States

**Impact: HIGH (앱 상태·포커스 가시성·hover 동작의 책임을 섞지 않고 읽기 쉽고 접근성 있게 유지합니다)**

domain state와 무관한 hover, focus, disabled interaction은 unconditional base element block에 둡니다.
interaction selector를 modifier 아래로 옮겨 적용 대상을 좁히지 않습니다.
modifier block에는 `active`·`selected`·`error`처럼 app state가 소유하는 presentation만 남깁니다.
modifier가 켜진 경우에만 interaction이 달라져야 한다는 제품 요구가 있을 때만 그 예외를 명시합니다.

modifier 아래로 옮기면 그 상태가 아닐 때 hover와 focus가 사라집니다.
읽는 사람은 base block만 보고 interaction이 없다고 판단하게 됩니다.

포커스 표시 자체는 `values-always-provide-a-visible-focus-indicator`가 담당합니다.
무엇을 modifier로 두고 무엇을 pseudo-class로 둘지는 `selector-use-pseudo-classes-for-dom-owned-states`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-04-values-separate-domain-state-modifiers-from-dom-interaction-states.md)을 읽습니다.

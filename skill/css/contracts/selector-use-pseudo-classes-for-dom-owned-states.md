# Use Pseudo-classes for DOM-owned States

**Impact: HIGH (브라우저가 소유한 상호작용 상태를 앱이 소유한 상태 modifier와 분리합니다)**

브라우저와 DOM이 직접 부여하는 상태는 같은 클래스 block 안의 nested `&:`로 표현합니다.
화면이나 도메인이 결정하는 상태는 modifier class로 분리합니다.

base/modifier 분리에서는 domain state와 무관한 hover, focus,
disabled interaction을 unconditional base element block에 둡니다.
interaction selector를 modifier 아래로 옮겨 적용 대상을 좁히지 않습니다.
modifier가 켜진 경우에만 interaction이 달라져야 한다는 별도 제품 요구가 있을 때만 그 예외를 명시합니다.

구분 기준:

- DOM-owned: `:hover`, `:visited`, `:focus`, `:focus-visible`, `:disabled`, `:checked`
- App-owned: `selected`, `active`, `error`, `expanded`, `current`
- DOM state가 child element를 바꿔야 하면 parent block에서 CSS 변수를 바꾸고 child block이 그 값을 읽게 합니다.
- `.foo:hover .foo__icon`처럼 project-owned descendant coupling으로 상태를 전달하지 않습니다.

**Requires selected:** `values-separate-domain-state-modifiers-from-dom-interaction-states` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/03-04-selector-use-pseudo-classes-for-dom-owned-states.md)을 읽습니다.

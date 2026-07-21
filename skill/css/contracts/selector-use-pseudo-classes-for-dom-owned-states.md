# Use Pseudo-classes for DOM-owned States

**Impact: HIGH (keeps browser-owned interaction states separate from app-owned state modifiers)**

브라우저와 DOM이 직접 부여하는 상태는 같은 클래스 block 안의 nested `&:`로 표현합니다. 화면이나 도메인이 결정하는 상태는 modifier class로 분리합니다.

구분 기준:

- DOM-owned: `:hover`, `:visited`, `:focus`, `:focus-visible`, `:disabled`, `:checked`
- App-owned: `selected`, `active`, `error`, `expanded`, `current`
- DOM state가 child element를 바꿔야 하면 parent block에서 CSS 변수를 바꾸고 child block이 그 값을 읽게 합니다.
- `.foo:hover .foo__icon`처럼 project-owned descendant coupling으로 상태를 전달하지 않습니다.

> 예시·예외가 필요할 때만 [full rule](../rules/selector-use-pseudo-classes-for-dom-owned-states.md)을 추가로 읽고 fallback 사유를 기록합니다.

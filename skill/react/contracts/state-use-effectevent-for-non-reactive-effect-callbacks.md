# Use useEffectEvent for Non-reactive Effect Callbacks

**Impact: MEDIUM-HIGH (keeps effects reactive only to true subscriptions while still reading the latest handler logic)**

effect 안에서 최신 prop이나 state를 읽어야 하지만,
그 값 변화 자체가 subscription 재설치를 일으키면 안 되는 경우에는 ref hack 대신 `useEffectEvent`를 우선합니다.
이 규칙은 event handler를 effect로 옮기라는 뜻이 아닙니다.
진짜 구독/연결 effect 안에서만 쓰고, 클릭/제출 같은 사용자 액션은 여전히 named handler에 둡니다.

**Requires selected:** `docs-require-jsdoc-on-key-declarations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/state-use-effectevent-for-non-reactive-effect-callbacks.md)을 읽습니다.

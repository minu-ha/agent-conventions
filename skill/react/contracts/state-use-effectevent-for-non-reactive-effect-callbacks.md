# Use useEffectEvent for Non-reactive Effect Callbacks

**Impact: MEDIUM-HIGH (핸들러 로직은 최신으로 읽고 이펙트는 실제 구독에만 반응합니다)**

이펙트 안에서 최신 프롭이나 상태를 읽어야 하지만 그 값 변화가 구독 재설치를
일으키면 안 되는 경우, `ref` 우회 대신 `useEffectEvent`를 씁니다.

이벤트 핸들러를 이펙트로 옮기라는 뜻이 아닙니다.
실제 구독·연결 이펙트 안에서만 쓰고, 클릭·제출 같은 사용자 액션은 이름 붙인 핸들러에 둡니다.

**Requires selected:** `docs-require-jsdoc-on-key-declarations` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/08-05-state-use-effectevent-for-non-reactive-effect-callbacks.md)을 읽습니다.

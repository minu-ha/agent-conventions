# Mark Unused Parameters With an Underscore Prefix

**Impact: MEDIUM-HIGH (makes intentionally ignored callback parameters explicit instead of silently dropping parts of a contract)**

미사용 매개변수도 생략하지 않고 `_` 접두사로 명시합니다. 이렇게 해야 callback 시그니처 계약을 유지하면서도, 현재 구현에서 의도적으로 쓰지 않는 값이라는 점이 드러납니다.

> 예시·예외가 필요할 때만 [full rule](../rules/types-mark-unused-parameters-with-underscore.md)을 추가로 읽고 fallback 사유를 기록합니다.

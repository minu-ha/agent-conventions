# Mark Unused Parameters With an Underscore Prefix

**Impact: MEDIUM-HIGH (makes intentionally ignored callback parameters explicit instead of silently dropping parts of a contract)**

미사용 매개변수도 생략하지 않고 `_` 접두사로 명시합니다.
이렇게 해야 callback 시그니처 계약을 유지하면서도, 현재 구현에서 의도적으로 쓰지 않는 값이라는 점이 드러납니다.

curried handler의 최종 callback을 포함해,
framework alias나 기존 callback 계약이 선언한 매개변수를 구현 함수에서 생략하는 경우도 Selected입니다.
`MouseEventHandler`를 반환하면서 event 매개변수를 쓰지 않는다면 매개변수 생략은 N/A 근거가 아니며,
`() =>` 대신 `_event`를 받는 `(_event) =>`로 계약을 보존합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/types-mark-unused-parameters-with-underscore.md)을 추가로 읽고 fallback 사유를 기록합니다.

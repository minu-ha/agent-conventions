# Mark Unused Parameters With an Underscore Prefix

**Impact: MEDIUM (계약의 일부를 조용히 버리지 않고 일부러 무시한 매개변수를 드러냅니다)**

쓰지 않는 매개변수도 생략하지 않고 `_` 접두사로 명시합니다.
그래야 콜백 시그니처를 그대로 지키면서, 지금 구현이 일부러 쓰지 않는 값이라는 점이 드러납니다.

프레임워크 별칭이나 기존 콜백 계약이 선언한 매개변수를 구현에서 빼면 이 규칙을 적용합니다.
커링한 핸들러의 마지막 콜백도 예외가 아닙니다.
매개변수를 쓰지 않는 경우도 예외가 아닙니다.

`MouseEventHandler`를 돌려주면서 이벤트 매개변수를 쓰지 않아도 `() =>`로 줄이지 않습니다.
`(_event) =>`로 받아 계약을 남깁니다.

> 예시·예외가 필요하면 [full rule](../rules/01-04-types-mark-unused-parameters-with-underscore.md)을 읽습니다.

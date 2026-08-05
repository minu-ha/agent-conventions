# Preserve Shared Namespace Origin With Chained Access

**Impact: HIGH (넓은 스코프 별칭으로 출처를 숨기지 않아 값이 어디서 오는지 읽힙니다)**

공용 설정과 공용 순수 함수는 쓰는 파일에서 직접 가져온 뒤 `config.*`, `util.*` 체인으로 씁니다.
넓은 스코프에서 구조분해하거나 별칭 상수로 끊어 출처를 흐리지 않습니다.
구조분해가 필요하면 함수 안 좁은 스코프에서만 씁니다.

`shared/config.ts`와 `shared/util.ts`는 찾기 쉬우라고 네임스페이스를 유지합니다.
`config`와 `util` 이름은 공용 경계에서만 씁니다.
기능별로 같은 이름을 다시 쓰지 않습니다.
보조 함수 파일을 어디 둘지는 `functions-place-and-promote-support-functions` 규칙이 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/01-03-naming-preserve-config-origin-with-chained-access.md)을 읽습니다.

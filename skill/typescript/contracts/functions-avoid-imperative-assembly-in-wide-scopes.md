# Avoid Imperative Assembly in Wide Scopes

**Impact: HIGH (분기로 공유 지역 변수를 바꾸지 않아 파일 전역 로직이 선언형으로 남습니다)**

모듈 최상위나 함수 본문 전체를 덮는 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적으로 값을 쌓지 않습니다.
`if`나 `for` 블록 안에서만 사는 누적은 대상이 아닙니다.
한 번만 쓰면 실제 쓰는 좁은 스코프에서 바로 계산합니다.
분기와 보정이 얽혀 좁은 스코프에 담기지 않으면 떼어 낼지를 다시 봅니다.
그 판정은 `functions-extract-helpers-only-when-the-boundary-is-real`가 합니다.
떼어 낸 함수의 이름은 `functions-name-functions-by-what-comes-out`가 정하고,
중간값에 이름을 붙일지는 `functions-name-a-value-only-when-it-is-reused`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-05-functions-avoid-imperative-assembly-in-wide-scopes.md)을 읽습니다.

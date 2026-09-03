# Avoid Imperative Assembly in Wide Scopes

**Impact: MEDIUM (분기로 공유 지역 변수를 바꾸지 않아 넓은 스코프의 값 조립이 선언형으로 남습니다)**

모듈 최상위나 함수 본문 전체를 덮는 스코프에서 `let` 재할당, 배열 `push`, 조건부 누적으로 값을 쌓지 않습니다.
`if`나 `for` 블록 안에서만 사는 누적은 대상이 아닙니다.

| 상황 | 조립하는 법 |
| --- | --- |
| 쓰는 자리가 좁은 스코프 하나 | 그 안에서 바로 계산합니다 |
| 값 하나가 조건 하나로 갈림 | 삼항 하나로 씁니다 |
| 값 하나가 조건 둘 이상으로 갈림 | 분기마다 `return`으로 끝나는 함수로 뺍니다. 자리는 `functions-extract-helpers-only-when-the-boundary-is-real`이 정합니다 |
| 목록에 조건부 항목이 들어감 | 조건부 스프레드나 표를 `filter`로 걸러 한 번에 조립합니다 |

**삼항은 조건 하나까지입니다.**
삼항 안에 삼항을 넣지 않습니다.
분기가 셋 이상이면 `return`이 그 분기의 값을 끝내는 함수가 위에서 아래로 한 번에 읽힙니다.
`let`에 기본값을 두고 `if`로 덮어쓰지 않습니다.
읽는 순서가 논리와 반대이고 아래에서 다시 바뀌는지 끝까지 봐야 합니다.
함수를 만들기 전에 값 검사를 경계로 보내면 분기가 줄어 삼항 하나로 끝나는 경우가 많습니다.
검사 자리는 `absence-check-once-at-the-boundary`가 정합니다.

떼어 낸 함수의 이름은 `functions-name-functions-by-what-comes-out`이 정합니다.
중간값에 이름을 붙일지는 `functions-name-a-value-only-for-recompute-or-judgment`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-07-functions-avoid-imperative-assembly-in-wide-scopes.md)을 읽습니다.

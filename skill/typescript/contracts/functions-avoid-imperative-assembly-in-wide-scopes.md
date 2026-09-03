# Avoid Imperative Assembly in Wide Scopes

**Impact: MEDIUM (분기로 공유 지역 변수를 바꾸지 않아 넓은 스코프의 값 조립이 선언형으로 남습니다)**

모듈 최상위나 함수 본문 전체를 덮는 스코프에서 `let` 재할당, 배열 `push`, 조건부 누적으로 값을 쌓지 않습니다.
`if`나 `for` 블록 안에서만 사는 누적은 대상이 아닙니다.

| 상황 | 조립하는 법 |
| --- | --- |
| 쓰는 자리가 좁은 스코프 하나 | 그 안에서 바로 계산합니다 |
| 값 하나를 조건 여럿으로 고름 | else 자리로만 이어지는 삼항 사슬로 씁니다 |
| 목록에 조건부 항목이 들어감 | 조건부 스프레드나 표를 `filter`로 걸러 한 번에 조립합니다 |
| 조건 앞에서 값을 다듬어야 하거나 분기마다 계산이 따로 있음 | 떼어 낼지를 `functions-extract-helpers-only-when-the-boundary-is-real`이 판정합니다 |

**삼항은 else 자리로만 잇습니다.**
`a ? x : b ? y : z`는 `if`, `else if`, `else`와 같은 선형이라 위에서 아래로 읽힙니다.
then 자리에 삼항이 들어가면 나무가 되어 읽는 사람이 가지를 되짚어야 합니다.
목록이면 표로 펴고, 값 하나면 조건을 합쳐 사슬로 다시 세웁니다.

떼어 낸 함수의 이름은 `functions-name-functions-by-what-comes-out`이 정합니다.
중간값에 이름을 붙일지는 `functions-name-a-value-only-for-recompute-or-judgment`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-07-functions-avoid-imperative-assembly-in-wide-scopes.md)을 읽습니다.

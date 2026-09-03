# Check Absence Once at the Boundary

**Impact: HIGH (검사가 값이 들어오는 자리 하나에만 남아 중간 함수가 값을 검사하느라 늘어나지 않습니다)**

값이 없을 수 있는지는 값이 소유자 안으로 들어오는 경계에서 한 번만 검사합니다.
화면이면 응답 매핑, `select`, `combine`, search 스키마이고 컴포넌트면 프롭을 받는 자리입니다.
경계가 답을 정하면 아래 함수는 그 답을 타입으로 받습니다.

| 경계가 정한 답 | 아래로 내려가는 타입 | 아래에서 하는 일 |
| --- | --- | --- |
| 기본값이 있다 | `number` | 없습니다. `absence-resolve-defaults-at-the-boundary`대로 경계에서 채웠습니다 |
| 없음을 화면이 보여 준다 | `number \| undefined` | 함수는 그대로 넘기고 그리는 자리의 분기 하나만 읽습니다 |

그리는 자리의 분기는 검사가 아니라 화면의 두 번째 상태입니다.
값이 있을 때와 없을 때 그리는 것이 다르므로 그 분기는 어디로도 옮길 수 없습니다.
그 분기 말고 `undefined`를 읽는 코드가 경계 아래에 있으면 경계가 일을 안 한 것입니다.

중간 함수는 검사하지 않습니다.
받은 타입이 `number`면 `absence-do-not-guard-what-types-guarantee`대로 검사가 위반입니다.
받은 타입이 `number | undefined`면 그대로 넘깁니다.
그 값으로 판정을 해야 하면 경계에서 한 번 판정해 결과를 싣습니다.
그 방법은 `values-decide-once-and-carry-the-result`가 정합니다.

**시그니처가 경계를 말합니다.**
`number | null | undefined`나 `unknown`을 받는 함수가 경계 아래에 여럿 있으면 경계가 일을 안 한 것입니다.
`unknown`은 앱 밖에서 값이 들어오는 자리 하나만 받습니다.
그 좁힘은 `types-narrow-unknown-instead-of-asserting`이 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-04-absence-check-once-at-the-boundary.md)을 읽습니다.

# Check Absence Once at the Boundary or at the Leaf

**Impact: HIGH (검사가 경계 한 곳이나 소비처 한 곳에만 남아 중간 함수가 값을 검사하느라 늘어나지 않습니다)**

값이 없을 수 있는지는 한 곳에서 한 번만 검사합니다.
자리는 둘 중 하나입니다.

| 자리 | 하는 일 | 그 아래 |
| --- | --- | --- |
| 경계 | 응답 매핑, `select`, `combine`, search 스키마에서 검사하고 타입을 좁힙니다 | 시그니처가 `string`, `number`라 검사가 없습니다 |
| 마지막 소비처 | 경계가 못 좁힌 값을 그리거나 포맷하는 자리 한 곳에서 검사합니다 | 중간 함수는 `string \| null`을 그대로 넘기고 검사하지 않습니다 |

중간 함수는 검사하지 않습니다.
받은 타입이 `string`이면 `absence-do-not-guard-what-types-guarantee`대로 검사가 위반입니다.
받은 타입이 `string | null`이면 그대로 넘기고 소비처가 검사합니다.
두 함수가 같은 값을 검사하고 있으면 하나가 남의 일을 하는 것입니다.

경계를 고르는 순서는 `absence-resolve-defaults-at-the-boundary`와 같습니다.
기본값을 채울 수 있으면 경계에서 채웁니다.
없다는 사실을 화면까지 남겨야 하면 타입에 `| undefined`로 남겨 소비처까지 보냅니다.
어느 쪽이든 검사는 한 번입니다.

**시그니처가 검사 자리를 말합니다.**
`number | null | undefined`나 `unknown`을 받는 함수가 경계 아래에 여럿 있으면 경계가 일을 안 한 것입니다.
`unknown`은 앱 밖에서 값이 들어오는 자리 하나만 받습니다.
그 좁힘은 `types-narrow-unknown-instead-of-asserting`이 정합니다.
같은 판정을 두 자리에서 하는 것은 `values-decide-once-and-carry-the-result`가 봅니다.

> 예시·예외가 필요하면 [full rule](../rules/05-04-absence-check-once-at-the-boundary-or-the-leaf.md)을 읽습니다.

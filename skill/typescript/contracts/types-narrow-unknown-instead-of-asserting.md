# Narrow `unknown` Instead of Asserting

**Impact: HIGH (컴파일을 통과시키려고 타입 검사를 끄는 자리가 남지 않습니다)**

컴파일러를 통과시키려고 `as`, `!`, `any`, `@ts-expect-error`를 쓰지 않습니다.
넷 다 "여기는 검사하지 마라"는 뜻이고, 틀렸을 때 알려 줄 사람이 없습니다.

형태를 모르는 값은 `unknown`으로 받고 좁혀서 씁니다.

| 값의 출처 | 어떻게 |
| --- | --- |
| 앱 밖에서 옴 (`localStorage`, `postMessage`, URL, 검증하지 않은 응답) | 스키마로 검증하고 그 결과에서 타입을 얻습니다 |
| 우리 코드 안에서 옴 | 좁히는 분기를 씁니다. 단언이 필요하면 타입이 잘못 잡힌 것입니다 |
| 외부 패키지 타입이 실제와 다름 | 단언을 쓰되 확인할 수 있는 이유를 바로 위에 남깁니다 |

`as const`와 `satisfies`는 대상이 아닙니다.
값을 넓히지 않게 고정하거나 형태가 맞는지 검사하는 것이라 검사를 끄지 않습니다.

셋째 줄의 이유 주석은 `docs-justify-convention-exceptions-with-a-reason-comment`가 정한 조건을 채워야 합니다.
"타입이 이상해서" 같은 다시 확인할 수 없는 말은 근거가 아닙니다.

`any`와 `!`는 `tooling-configure-biome-to-enforce-these-rules`가 기계로 막습니다.
`as`와 `@ts-expect-error`는 리뷰가 봅니다.

> 예시·예외가 필요하면 [full rule](../rules/02-05-types-narrow-unknown-instead-of-asserting.md)을 읽습니다.

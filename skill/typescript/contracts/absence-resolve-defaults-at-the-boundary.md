# Resolve Defaults Once at the Boundary

**Impact: HIGH (기본값이 선언 한 곳에 남아 아래쪽 코드에서 `??`가 되풀이되지 않습니다)**

기본값은 필요한지 먼저 확인하고, 필요하면 값이 들어오는 경계에서 한 번 채웁니다.
기본값 표현은 `absence-expose-optional-values-instead-of-silent-fallbacks`를 따릅니다.

| 순서 | 판단과 처리 |
| --- | --- |
| 1. 기본값 없이 소비할 수 있는가 | `undefined`를 허용하면 `items?.map(…)`, 선택 값 비교는 `variant === "compact"`로 처리합니다 |
| 2. 경계에서 채울 수 있는가 | search 스키마의 `.default(선언된 상수)`, 응답 매핑, 쿼리의 `select`에서 한 번 채웁니다. 아래에서는 선택 값과 `??`가 남지 않습니다 |
| 3. 경계에서 처리할 수 없는가 | 사용처에 `fetchProducts({pageSize: query.pageSize ?? pagination_default_page_size})`처럼 적습니다 |
| 4. 파생값에 이름이 필요한가 | `pageSize` 대신 `effectivePageSize`처럼 고른 결과임을 드러냅니다. 사용 횟수보다 표현식의 의미를 기준으로 판단합니다 |

배열이 필수인 API에는 반환 계약을 바꾸지 않고 선언된 기본값을 경계에서 채웁니다.
`a ?? b`는 실행 시 두 출처 중 하나를 고르는 계산이므로
`values-read-objects-through-chains`가 금지하는 단순 별칭에 해당하지 않습니다.
이름을 붙일지는 `functions-name-a-value-only-for-recompute-or-judgment`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/05-02-absence-resolve-defaults-at-the-boundary.md)을 읽습니다.

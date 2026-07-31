# Use Set and Map for Repeated Lookups

**Impact: MEDIUM (조회 횟수가 늘어나면 반복되는 포함 검사와 키 접근을 명시적으로 드러냅니다)**

같은 컬렉션에 대해 membership check나 keyed access를 여러 번 반복한다면 배열 `includes`,
`find`를 매번 다시 돌리지 말고 `Set`이나 `Map`으로 한 번 정리합니다.
단발성 한두 번 조회면 그대로 두고, 반복 lookup이 실제로 있는 경우에만 승격합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-06-functions-use-set-and-map-for-repeated-lookups.md)을 읽습니다.

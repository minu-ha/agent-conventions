# Use Set and Map for Repeated Lookups

**Impact: MEDIUM (조회가 늘어나면 반복되는 포함 검사와 키 접근을 드러냅니다)**

같은 목록에 포함 검사나 키 조회를 여러 번 한다면 `includes`와 `find`를 매번 돌리지 않습니다.
`Set`이나 `Map`으로 한 번 정리합니다.
한두 번 조회면 그대로 두고, 반복이 실제로 있을 때만 바꿉니다.

> 예시·예외가 필요하면 [full rule](../rules/03-07-functions-use-set-and-map-for-repeated-lookups.md)을 읽습니다.

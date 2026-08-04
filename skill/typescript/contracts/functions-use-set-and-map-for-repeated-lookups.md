# Use Set and Map for Repeated Lookups

**Impact: MEDIUM (조회가 늘어나면 반복되는 포함 검사와 키 접근을 드러냅니다)**

같은 목록에 포함 검사나 키 조회를 여러 번 한다면 `includes`와 `find`를 매번 돌리지 않습니다.
`Set`이나 `Map`으로 한 번 정리합니다.
다음 중 하나면 바꿉니다. 그 밖에는 그대로 둡니다.

- 같은 목록을 겨냥한 조회가 루프나 `map`·`filter`·`some` 콜백 안에 있습니다.
- 같은 목록을 겨냥한 조회가 서로 다른 세 지점 이상에서 일어납니다.

> 예시·예외가 필요하면 [full rule](../rules/03-08-functions-use-set-and-map-for-repeated-lookups.md)을 읽습니다.

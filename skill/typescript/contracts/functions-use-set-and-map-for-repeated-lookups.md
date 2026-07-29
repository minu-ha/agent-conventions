# Use Set and Map for Repeated Lookups

**Impact: MEDIUM (keeps repeated membership and keyed access code explicit once lookup count grows)**

같은 컬렉션에 대해 membership check나 keyed access를 여러 번 반복한다면 배열 `includes`, `find`를 매번 다시 돌리지 말고 `Set`이나 `Map`으로 한 번 정리합니다.
단발성 한두 번 조회면 그대로 두고, 반복 lookup이 실제로 있는 경우에만 승격합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/functions-use-set-and-map-for-repeated-lookups.md)을 추가로 읽고 fallback 사유를 기록합니다.

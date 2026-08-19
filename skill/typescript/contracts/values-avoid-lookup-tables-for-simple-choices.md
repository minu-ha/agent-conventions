# Avoid Lookup Tables for Simple Value Choices

**Impact: HIGH (값과 선택 조건이 사용처에 함께 남아 선택 기준을 바로 읽을 수 있습니다)**

한 곳에서 쓸 값을 고르려고 객체나 `Map`으로 조회표를 만들지 않습니다.
같은 값은 그대로 넘기고 값이 달라질 때만 사용처에서 조건으로 고릅니다.

조회표는 여러 키의 대응 관계 자체가 도메인이나 외부 계약일 때만 둡니다.
선언 바로 위에는 어떤 계약의 대응 관계인지 확인할 수 있는 근거를 적습니다.

**Requires selected:** `docs-justify-convention-exceptions-with-a-reason-comment` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/04-05-values-avoid-lookup-tables-for-simple-choices.md)을 읽습니다.

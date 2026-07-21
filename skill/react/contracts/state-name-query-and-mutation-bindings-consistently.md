# Name Query and Mutation Bindings Consistently

**Impact: HIGH (생성된 API hook과 로컬 바인딩을 쉽게 훑고 추적할 수 있게 함)**

프로젝트가 이미 채택한 query/mutation hook 이름은 유지하되, 로컬 바인딩 접두사는 `response`와 `mutation`만 사용합니다. codegen 여부와 무관하게 query는 `response...`, mutation은 `mutation...`으로 맞춰야 화면 파일에서 역할과 오리진이 한눈에 보입니다.

> 예시·예외가 필요할 때만 [full rule](../rules/state-name-query-and-mutation-bindings-consistently.md)을 추가로 읽고 fallback 사유를 기록합니다.

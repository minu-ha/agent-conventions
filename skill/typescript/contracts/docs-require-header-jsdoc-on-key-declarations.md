# Require Header JSDoc on Key Declarations

**Impact: MEDIUM-HIGH (makes important boundaries searchable and explainable before readers inspect the implementation body)**

named query·mutation binding과 원격 연동 함수에는 `@api` 헤더 JSDoc을 작성하고, 이벤트 핸들러, 반응형 동기화 블록, 재사용 helper, 커스텀 `type`/`interface`, store 선언, 포맷 예외를 둔 함수 선언에도 예외 없이 선언 헤더 JSDoc을 작성합니다.
이 규칙을 선택하면 역할 태그와 한국어 JSDoc을 추가·유지하므로 두 `reviewWith` target의 `appliesWhen`도 충족되어 Selected이며 N/A가 아닙니다.
중요한 경계가 파일 검색에서 바로 보이도록 하는 것이 목적입니다. annotation 종류는 선언 역할에 따라 `@api`, `@event`, `@watch`, `@helper`, `@summary` 중 하나를 고릅니다.

> 예시·예외가 필요할 때만 [full rule](../rules/docs-require-header-jsdoc-on-key-declarations.md)을 추가로 읽고 fallback 사유를 기록합니다.

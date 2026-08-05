# Name Query and Mutation Bindings Consistently

**Impact: HIGH (생성된 API 훅과 지역 바인딩을 훑고 되짚기 쉬워집니다)**

프로젝트가 이미 채택한 쿼리/뮤테이션 훅 이름은 유지하고, 로컬 바인딩은 `response`와 `mutation` 접두사만 씁니다.
훅 하나를 담는 바인딩 이름은 훅 이름에서 `use`를 떼고 앞에 `response` 또는 `mutation`을 붙여 만듭니다.
`useProductListSuspense`는 `responseProductListSuspense`, `useProductRemove`는 `mutationProductRemove`입니다.
여러 쿼리를 합친 결과처럼 훅 이름 하나로 정해지지 않는 값은 합친 값이 무엇인지로 이름을 짓습니다.

**Requires selected:** `docs-require-jsdoc-on-key-declarations`, `typescript/naming-use-consistent-file-and-symbol-naming` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/02-01-data-name-query-and-mutation-bindings-consistently.md)을 읽습니다.

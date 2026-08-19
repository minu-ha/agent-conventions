# Name Query and Mutation Bindings Consistently

**Impact: MEDIUM (생성된 API 훅과 지역 바인딩을 훑고 되짚기 쉬워집니다)**

Kubb가 생성한 API 훅의 지역 바인딩은 `use`와 요청 종류만 나타내는 앞부분을
`response` 또는 `mutation`으로 바꾸고 나머지 이름을 유지합니다.
`select`나 `combine`이 반환 형태를 바꿨을 때는 접두사 뒤에 결과 이름을 씁니다.

**Requires selected:** `docs-require-jsdoc-on-key-declarations`, `typescript/naming-use-consistent-file-and-symbol-naming` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/02-01-data-name-query-and-mutation-bindings-consistently.md)을 읽습니다.

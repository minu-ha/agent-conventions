# Preserve Response and Store Origin Down to the JSX

**Impact: MEDIUM (파일 전체에서 별칭을 따라가지 않고 값의 출처를 바로 압니다)**

`response...`, `mutation...`, `*Store` 원본은 JSX에 닿을 때까지 이름 그대로 갑니다.
구조분해와 별칭으로 끊지 않는 규범은 `typescript/values-read-objects-through-chains`가 모든 객체에 정합니다.
여기서는 리액트 화면에서 그 원본이 무엇인지만 짚습니다.

- 스코프가 넓든 좁든 같습니다.
  핸들러 안이든 이펙트 안이든 `responseProductSearchSuspense.data.products`로 읽습니다.
- 쿼리 결과를 화면에서 다시 빚고 싶으면 끊지 말고 `data-shape-query-data-with-select`가 정한
  `query.select`에서 형태를 잡습니다.
  받는 쪽에서 끊으면 깊이는 그대로고 출처만 사라집니다.
- 프롭스는 `composition-read-props-without-destructuring`이 같은 말을 한 번 더 합니다.

> 예시·예외가 필요하면 [full rule](../rules/02-04-data-preserve-origin-chaining.md)을 읽습니다.

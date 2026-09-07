# Preserve Response and Store Origin Down to the JSX

**Impact: MEDIUM (별칭을 추적하지 않고 사용하는 곳에서 값의 출처를 확인할 수 있습니다)**

`response...`·`mutation...`·`*Store`는 JSX까지 원본 이름으로 읽습니다.
핸들러·이펙트 안에서도 `responseProductSearchSuspense.data.products`처럼 출처를 유지합니다.

| 필요한 판단 | 기준 |
| --- | --- |
| 객체 구조분해와 별칭 | `typescript/values-read-objects-through-chains` |
| 쿼리 결과 가공 | `data-shape-query-data-with-select`에 따라 `query.select`에서 처리합니다. 받는 쪽의 별칭은 깊이를 줄이지 못하고 출처만 지웁니다 |
| 프롭스 접근 | `composition-read-props-without-destructuring` |

> 예시·예외가 필요하면 [full rule](../rules/02-04-data-preserve-origin-chaining.md)을 읽습니다.

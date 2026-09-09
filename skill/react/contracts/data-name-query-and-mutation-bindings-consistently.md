# Name Query and Mutation Bindings Consistently

**Impact: MEDIUM (지역 바인딩 이름으로 생성된 API 훅을 쉽게 찾을 수 있습니다)**

쿼리와 뮤테이션의 지역 바인딩 이름은 생성된 훅 이름에서 만듭니다.

| 바인딩 | 이름 |
| --- | --- |
| 생성된 단일 API 훅 | `use`와 요청 종류만 나타내는 앞부분을 `response` 또는 `mutation`으로 바꾸고 나머지 이름을 유지합니다 |
| 여러 쿼리를 합친 바인딩 | `response` 뒤에 결과 이름을 씁니다. `useSuspenseQueries`를 사용하면 끝에 `Suspense`를 유지합니다 |

**Requires selected:** `docs-require-jsdoc-on-key-declarations`, `typescript/naming-use-consistent-file-and-symbol-naming` (함께 적용)

**Incorrect 1 (쿼리와 뮤테이션 바인딩 이름이 제각각입니다):**

```ts
const responseGetProductListSuspense = useGetProductListSuspense();
const removeApi = useProductRemove();
```

**Correct 1 (지역 바인딩 접두사를 통일합니다):**

```ts
/**
 * 표에 그릴 product를 읽는다. 멈추는 동안은 섹션 소유자의 경계가 받는다
 */
const responseProductListSuspense = useGetProductListSuspense();

/**
 * 표에서 고른 product를 지운다. 성공 뒤 무효화는 부르는 화면이 맡는다
 */
const mutationProductRemove = useProductRemove();
```

> 나머지 예시와 예외는 [full rule](../rules/02-01-data-name-query-and-mutation-bindings-consistently.md)에 있습니다.

---
title: Name URL State Bindings as a Set
titleKo: URL 상태 바인딩 이름을 세 자리 한 벌로 고정합니다
impact: MEDIUM
impactDescription: 주소가 소유한 상태, 플랫폼 객체, 서버 응답이 이름만으로 구분됩니다
appliesWhen:
  - 라우트 search 파라미터를 읽거나 쓰는 바인딩을 추가·변경할 때
  - search 파라미터 파서 묶음을 만들거나 옮길 때
  - 제외: 서버 요청 쿼리·뮤테이션 바인딩만 바꾸는 경우
requiresSelected: typescript/naming-place-owner-constants-in-the-owner-constant-folder
reviewWith: state-choose-state-tools-by-source-of-truth
tags: state, naming, url
---

## Name URL State Bindings as a Set

**Impact: MEDIUM (주소가 소유한 상태, 플랫폼 객체, 서버 응답이 이름만으로 구분됩니다)**

라우트 search 파라미터가 소유한 상태는 세 자리의 이름을 한 벌로 고정합니다.
읽는 사람이 이름만 보고 파싱 전 원본인지, 파싱을 거친 값인지, 서버 응답인지 구분하는 것이 목적입니다.

| 자리 | 이름 |
| --- | --- |
| 파라미터별 파싱 함수를 모은 묶음 | `<범위>UrlParsers` |
| 파싱을 거친 값과 그 갱신 함수 | `urlParams` · `setUrlParams` |
| 플랫폼 `URLSearchParams` 객체 | `searchParams` |

- 파서 묶음은 화면이 주소에 올린 상태의 계약이므로 소유자 `_constant` 폴더에 둡니다.
  자리는 `typescript/naming-place-owner-constants-in-the-owner-constant-folder`가,
  파일과 심볼 표기는 `typescript/naming-use-consistent-file-and-symbol-naming`이 정합니다.
- `searchParams`는 플랫폼 객체를 그대로 쥔 자리에만 씁니다.
  파싱을 거친 값이 이 이름을 쓰면 원본과 구분되지 않습니다.
- `query`가 들어간 이름은 서버 요청 바인딩 전용입니다.
  그 자리는 `data-name-query-and-mutation-bindings-consistently`가 정합니다.
- 값을 주소에 올릴지 자체는 `state-choose-state-tools-by-source-of-truth`가 정합니다.

**Incorrect (세 자리가 이름으로 구분되지 않습니다):**

```ts
// page/products/_constant/product-search.ts
export const productSearch = {
	page: parseAsInteger.withDefault(1),
	keyword: parseAsString.withDefault(""),
};
```

```tsx
const [searchParams, setSearchParams] = useQueryStates(productSearch);
const query = searchParams.keyword;
```

**Correct (파서 묶음은 `<범위>UrlParsers`로 소유자 `_constant` 폴더에 둡니다):**

```ts
// page/products/_constant/product-url-parsers.ts
/**
 * product 목록 화면이 주소에 올린 상태의 파서 묶음
 */
export const productUrlParsers = {
	page: parseAsInteger.withDefault(1),
	keyword: parseAsString.withDefault(""),
};
```

**Correct (파싱을 거친 값은 `urlParams`, 플랫폼 객체만 `searchParams`입니다):**

```tsx
const [urlParams, setUrlParams] = useQueryStates(productUrlParsers);

/**
 * 공유 링크에 실을 search 파라미터를 플랫폼 객체로 조립한다
 */
const searchParams = new URLSearchParams({page: String(urlParams.page)});
```

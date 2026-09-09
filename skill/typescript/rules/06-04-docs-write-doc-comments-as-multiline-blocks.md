---
title: Write Doc Comments as Multiline Blocks
titleKo: JSDoc은 한 줄로 쓰지 않고 여러 줄 블록으로 씁니다
impact: MEDIUM
impactDescription: 선언 위 주석 형태가 파일마다 같아 주석을 검색하고 훑어보기 쉬워집니다
appliesWhen:
  - 선언 위 문서 주석을 새로 쓰거나 형식을 바꿀 때
  - 한 줄 `/** … */`이나 `//`로 선언을 설명하려 할 때
reviewWith: docs-require-header-jsdoc-on-key-declarations
tags: docs, declarations
---

## Write Doc Comments as Multiline Blocks

**Impact: MEDIUM (선언 위 주석 형태가 파일마다 같아 주석을 검색하고 훑어보기 쉬워집니다)**

문서 주석은 `/**`, `*`, `*/`를 각각 다른 줄에 둔 여러 줄 블록으로 씁니다.

| 형태 · 판단 | 기준 |
| --- | --- |
| `/** 한 줄 */` | 쓰지 않습니다 |
| 선언 설명을 `//`로 작성 | 쓰지 않습니다. 선언 위 `//`는 `docs-justify-convention-exceptions-with-a-reason-comment`의 예외 이유에 씁니다 |
| 문서화할 선언 선택 | `docs-require-header-jsdoc-on-key-declarations`를 따릅니다 |
| 태그 선택 | `docs-write-korean-comments-about-purpose-and-constraints`를 따릅니다 |

**Incorrect 1 (한 줄 블록과 `//`로 선언을 설명합니다):**

```ts
/** product 목록. 조회 실패는 호출부가 처리한다 */
export const fetchProductList = async (): Promise<Product[]> => {
	return await client.get("/products");
};

// product 저장 요청. 응답 본문이 없어 성공은 상태 코드로만 확인한다
export const saveProduct = async (product: Product): Promise<void> => {
	await client.post("/products", product);
};
```

**Correct 1 (같은 내용을 여러 줄 블록으로 고정합니다):**

```ts
/**
 * product 목록. 조회 실패는 호출부가 처리한다
 */
export const fetchProductList = async (): Promise<Product[]> => {
	return await client.get("/products");
};

/**
 * product 저장 요청. 응답 본문이 없어 성공은 상태 코드로만 확인한다
 */
export const saveProduct = async (product: Product): Promise<void> => {
	await client.post("/products", product);
};
```

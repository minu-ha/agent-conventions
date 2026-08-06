---
title: Write Doc Comments as Multiline Blocks
titleKo: JSDoc은 한 줄로 쓰지 않고 여러 줄 블록으로 씁니다
impact: LOW
impactDescription: 선언 위 주석 형태가 파일마다 같아 주석을 검색하고 훑어보기 쉬워집니다
appliesWhen:
  - 선언 위 문서 주석을 새로 쓰거나 형식을 바꿀 때
  - 한 줄 `/** … */`이나 `//`로 선언을 설명하려 할 때
reviewWith: docs-require-header-jsdoc-on-key-declarations
tags: docs, declarations
---

## Write Doc Comments as Multiline Blocks

**Impact: LOW (선언 위 주석 형태가 파일마다 같아 주석을 검색하고 훑어보기 쉬워집니다)**

문서 주석은 여러 줄 블록으로 고정합니다.
`/**`, `*`, `*/`를 각각 다른 줄에 둡니다.

- `/** 한 줄 */` 형태는 쓰지 않습니다.
- 선언이 무엇인지 설명할 때는 `//`를 쓰지 않습니다.
  규칙이 허용한 예외의 이유를 적을 때는 `//` 한 줄을 씁니다.
  그 형식은 `docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.
- 어느 선언에 붙일지는 `docs-require-header-jsdoc-on-key-declarations`가 정합니다.
- 어떤 태그를 붙일지는 `docs-write-concise-korean-comments-about-purpose-and-constraints`가 정합니다.

**Incorrect (한 줄 블록과 `//`로 선언을 설명):**

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

**Correct (같은 내용을 여러 줄 블록으로 고정):**

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

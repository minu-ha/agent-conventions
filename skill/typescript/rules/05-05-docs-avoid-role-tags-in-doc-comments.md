---
title: Avoid Role Tags in Doc Comments
titleKo: 문서 주석에 역할 태그를 붙이지 않습니다
impact: MEDIUM
impactDescription: 선언의 성격을 태그로 두 번 적지 않아 태그가 어긋날 일이 없습니다
appliesWhen:
  - 문서 주석에 태그를 넣거나 바꿀 때
  - 새 태그 이름을 만들려 할 때
reviewWith: docs-require-header-jsdoc-on-key-declarations
tags: docs, declarations
---

## Avoid Role Tags in Doc Comments

**Impact: MEDIUM (선언의 성격을 태그로 두 번 적지 않아 태그가 어긋날 일이 없습니다)**

선언이 무엇인지는 이름 규칙과 문법이 이미 드러냅니다.
그것을 태그로 다시 적지 않습니다.

- `@api`, `@helper`, `@field` 같은 역할 태그를 붙이지 않습니다.
- `@summary`는 헤더 첫 줄이 이미 하는 일이라 쓰지 않습니다.
- `@schema`처럼 새 태그를 만들지 않습니다.
- `@deprecated`, `@example`, `@param`, `@returns`처럼 TSDoc 규격에 있는 태그만 필요할 때 씁니다.

역할 태그는 선언이 바뀌어도 함께 바뀌지 않아 시간이 지나면 어긋납니다.

**Incorrect (역할 태그로 선언 성격을 다시 적음):**

```ts
/**
 * @api product 목록 조회
 */
export const fetchProductList = async (): Promise<Product[]> => {
	return await client.get("/products");
};

/**
 * @schema product 저장 입력
 */
export interface SaveProductInput {
	/**
	 * 저장할 제목
	 */
	title: string;
}
```

**Correct (설명만 적고 규격 태그만 필요할 때 씁니다):**

```ts
/**
 * product 목록 조회
 */
export const fetchProductList = async (): Promise<Product[]> => {
	return await client.get("/products");
};

/**
 * product 저장 입력
 *
 * @deprecated `SaveProductRequest`로 옮기는 중이다.
 */
export interface SaveProductInput {
	/**
	 * 저장할 제목
	 */
	title: string;
}
```

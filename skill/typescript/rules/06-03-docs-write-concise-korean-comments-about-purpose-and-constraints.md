---
title: Write Concise Korean Comments About Purpose and Constraints
titleKo: 주석에는 목적과 제약을 한국어로 적습니다
impact: MEDIUM
impactDescription: 코드 동작을 옮겨 적지 않고 의도와 제약에 주석을 모읍니다
appliesWhen:
  - TypeScript·TSX의 문서 주석이나 인라인 주석 문구를 추가·수정·번역하거나 검토할 때
  - 문서 주석에 태그를 붙이거나 뺄 때
tags: docs, comments
---

## Write Concise Korean Comments About Purpose and Constraints

**Impact: MEDIUM (코드 동작을 옮겨 적지 않고 의도와 제약에 주석을 모읍니다)**

주석은 한국어로 목적·제약·부수효과를 설명합니다.
이름과 시그니처에 없는 정보가 없으면 지우고, 필요한 배경에 따라 한 문장이나 여러 문장으로 씁니다.

| 내용·태그 | 판단 |
| --- | --- |
| 선언 이름만 번역하거나 코드를 한 줄씩 옮긴 설명 | 쓰지 않습니다 |
| 설명 없이 `@param`, `@returns`만 나열 | 쓰지 않습니다 |
| `@api`, `@helper`, `@field` | 이름과 문법이 드러내는 역할을 태그로 반복하지 않습니다 |
| `@schema` 같은 비표준 태그 | 새로 만들지 않습니다 |
| `@summary` | 헤더 첫 줄과 겹치므로 쓰지 않습니다 |
| `@deprecated`, `@example`, `@param`, `@returns` 등 TSDoc 태그 | 필요할 때만 씁니다 |
| 영어 기술 용어·식별자 | 섞어 써도 됩니다. 본문 전체가 영어인 주석은 허용하지 않습니다 |

글자 수 제한은 두지 않습니다. 헤더가 영어뿐이면 필드 주석이 한국어여도 요구를 충족하지 못합니다.
선언 위 문서 주석은 `docs-write-doc-comments-as-multiline-blocks`,
본문 설명은 `docs-keep-body-comments-for-intent-and-steps`에 따라 `//`로 씁니다.

**Incorrect (영문이거나 선언 이름을 옮겨 적기만 합니다):**

```ts
/**
 * This function sorts rule refs and returns the result.
 */
export const toSortedRuleRefs = (refs: RuleRef[]): RuleRef[] => {
	return sortBy(uniq(refs), [(ref) => ref.id]);
};

/**
 * 규칙 참조를 정렬하는 함수
 */
export const toSortedRuleRefs = (refs: RuleRef[]): RuleRef[] => {
	return sortBy(uniq(refs), [(ref) => ref.id]);
};

/**
 * route-local product tree props
 */
export interface PgProductTreeProps {
	categoryNodes: ProductCategoryNode[];
}
```

**Correct (이름에 없는 정보를 더합니다):**

```ts
/**
 * 같은 참조 객체의 중복을 제거하고 식별자순으로 정렬해 검토 목록의 순서를 고정한다.
 */
export const toSortedRuleRefs = (refs: RuleRef[]): RuleRef[] => {
	return sortBy(uniq(refs), [(ref) => ref.id]);
};

/**
 * 저장 응답의 정렬 순서를 그대로 믿지 않고 다시 정렬한다.
 *
 * 서버가 같은 updatedAt 인 항목의 순서를 보장하지 않아
 * 목록이 새로고침할 때마다 흔들리는 문제가 있었다.
 */
export const toProductsNewestFirst = (products: Product[]): Product[] => {
	return orderBy(products, ["updatedAt", "id"], ["desc", "asc"]);
};

/**
 * route-local product 트리 입력 계약
 */
export interface PgProductTreeProps {
	/**
	 * 사이드바에 그릴 분류 노드 목록
	 */
	categoryNodes: ProductCategoryNode[];
}
```

**Incorrect (역할 태그로 선언의 성격을 다시 적습니다):**

```ts
/**
 * @api product 목록. 조회 실패는 호출부가 처리한다
 */
export const fetchProductList = async (): Promise<Product[]> => {
	return await client.get("/products");
};
```

**Correct (태그를 지우고 헤더 첫 줄이 하는 일을 말합니다):**

```ts
/**
 * product 목록. 조회 실패는 호출부가 처리한다
 */
export const fetchProductList = async (): Promise<Product[]> => {
	return await client.get("/products");
};
```

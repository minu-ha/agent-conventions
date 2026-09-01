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

주석은 한국어로 쓰고 목적, 제약, 부수효과를 적습니다.
코드가 무엇을 하는지 옮겨 적기보다 왜 넣었고 무엇을 조심해야 하는지를 먼저 씁니다.

글자 수 제한은 두지 않습니다.
선언 이름과 시그니처에 없는 정보가 한 조각도 없으면 그 문장은 지웁니다.
한 문장으로 통하면 한 문장, 배경을 알아야 하면 여러 문장으로 씁니다.
문장이 몇 개든 형식은 여러 줄 블록이고, 그 형식은 `docs-write-doc-comments-as-multiline-blocks`가 정합니다.

쓰지 않는 것:

- 선언 이름의 낱말을 한국어로 바꿔 적기만 하고 새 정보가 없는 문장.
  `sortRuleRefs`에 `/** 규칙 참조를 정렬 */`을 다는 것이 그 경우입니다.
- 코드를 한 줄씩 따라 읽으며 옮겨 적은 문장
- 설명 없이 `@param`·`@returns`만 나열한 주석

태그를 붙일지도 내용 판단이라 여기서 정합니다.
선언이 무엇인지는 이름과 문법이 이미 드러내므로 태그로 다시 적지 않습니다.

| 태그 | 판정 |
| --- | --- |
| `@api`·`@helper`·`@field` | 역할 태그를 붙이지 않습니다. 선언이 바뀌어도 함께 바뀌지 않아 시간이 지나면 어긋납니다 |
| `@schema`처럼 규격에 없는 태그 | 새로 만들지 않습니다 |
| `@summary` | 쓰지 않습니다. 헤더 첫 줄이 이미 하는 일입니다 |
| `@deprecated`·`@example`·`@param`·`@returns` 같은 TSDoc 규격 태그 | 필요할 때만 씁니다 |

기술 용어와 식별자는 영어를 섞어 써도 됩니다.
다만 주석 본문이 전부 영어이면 한국어 주석으로 인정하지 않습니다.
헤더 주석이 영어뿐이면 필드 주석이 한국어여도 통과하지 못합니다.

**Incorrect (영문이거나 선언 이름을 옮겨 적기만 합니다):**

```ts
/**
 * This function sorts rule refs and returns the result.
 */
export const sortRuleRefs = (refs: RuleRef[]): RuleRef[] => {
	return Array.from(new Set(refs)).sort();
};

/**
 * 규칙 참조를 정렬하는 함수
 */
export const sortRuleRefs = (refs: RuleRef[]): RuleRef[] => {
	return Array.from(new Set(refs)).sort();
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
 * 중복을 제거한 뒤 정렬한다. 호출부가 목록을 다시 정렬하지 않아도 되게 하려는 것이다.
 */
export const sortRuleRefs = (refs: RuleRef[]): RuleRef[] => {
	return Array.from(new Set(refs)).sort();
};

/**
 * 저장 응답의 정렬 순서를 그대로 믿지 않고 다시 정렬한다.
 *
 * 서버가 같은 updatedAt 인 항목의 순서를 보장하지 않아
 * 목록이 새로고침할 때마다 흔들리는 문제가 있었다.
 */
export const sortProductsByUpdatedAt = (products: Product[]): Product[] => {
	return [...products].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
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

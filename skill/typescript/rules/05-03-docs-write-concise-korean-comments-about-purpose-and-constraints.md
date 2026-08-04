---
title: Write Korean Comments About Purpose and Constraints
titleKo: 주석은 목적과 제약을 한국어로 적습니다
impact: MEDIUM
impactDescription: 코드 동작을 옮겨 적지 않고 의도와 제약에 주석을 모읍니다
appliesWhen:
  - TypeScript·TSX의 문서 주석이나 인라인 주석 문구를 추가·수정·번역하거나 검토할 때
tags: docs, comments
---

## Write Korean Comments About Purpose and Constraints

**Impact: MEDIUM (코드 동작을 옮겨 적지 않고 의도와 제약에 주석을 모읍니다)**

주석은 한국어로 쓰고 목적, 제약, 부수효과를 적습니다.
코드가 무엇을 하는지 옮겨 적기보다 왜 넣었고 무엇을 조심해야 하는지를 먼저 씁니다.

길이 제한은 두지 않습니다.
한 줄로 뜻이 통하면 한 줄로 쓰고, 읽는 사람이 배경을 알아야 하면 여러 줄로 씁니다.
기준은 길이가 아니라 그 주석을 읽고 이해되는지입니다.

쓰지 않는 것:

- 선언 이름의 낱말을 한국어로 바꿔 적기만 하고 새 정보가 없는 문장.
  `sortRuleRefs`에 `/** 규칙 참조를 정렬 */`이 그 경우입니다
- 코드를 한 줄씩 따라 읽으며 옮겨 적은 문장
- 설명 없이 `@param`·`@returns`만 나열한 주석. 어떤 태그를 쓸지는 `docs-avoid-role-tags-in-doc-comments`가 정합니다

기술 용어와 식별자는 영어로 섞어도 됩니다.
다만 주석 본문이 전부 영어이면 한국어 주석으로 인정하지 않습니다.
새로 넣거나 고친 문서 주석에는 그 선언의 목적이나 제약을 설명하는 한국어 구절이 있어야 합니다.
다른 필드 주석이 한국어라고 영어뿐인 헤더 주석을 대신 통과시키지 않습니다.

**Incorrect (영문이거나 선언 이름을 옮겨 적기만 함):**

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

**Correct (이름에 없는 정보를 더함):**

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
 * route-local 제품 트리 입력 계약
 */
export interface PgProductTreeProps {
	/**
	 * 사이드바에 그릴 분류 노드 목록
	 */
	categoryNodes: ProductCategoryNode[];
}
```

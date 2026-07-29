---
title: Document Custom Types and Declarative Shapes
impact: CRITICAL
impactDescription: keeps domain-specific contracts understandable without digging through implementation details
appliesWhen: type·interface·schema root·객체 상수·계약 field·파생 alias를 추가·변경하거나 named shape에 callable 역할을 추가한다. 외부·generated·read-only·shared unchanged shape·익명 inferred 반환은 제외한다.
tags: types, jsdoc, shapes
---

## Document Custom Types and Declarative Shapes

**Impact: CRITICAL (keeps domain-specific contracts understandable without digging through implementation details)**

선언형 shape는 헤더와 필드를 나눠 문서화합니다.

- custom `type`, `interface`, schema root, 객체형 상수: 헤더 `@summary`
- 객체형 계약과 schema field: 각 필드 바로 위 `@field`
- `Pick`/`Omit`/Indexed Access alias: 필드가 없으므로 헤더 `@summary`만 사용
- compound component public part props: React rule에 따라 `@part` + `@description` 허용

`@summary`와 `@field`는 태그 존재만으로 완료되지 않으며, 각 body가 `docs-write-concise-korean-comments-about-purpose-and-constraints`의 한국어 content gate를 만족해야 합니다.

기존 named shape의 field가 byte-equivalent여도, positional 인자를 대체하는 새 callable input이나 함수 결과를 고정하는 output 계약 역할에 처음 연결되면 이 규칙은 Selected입니다.
선언의 새 계약 역할을 `@summary`와 각 `@field`로 설명합니다.
새 callable input 또는 output 역할은 새 type·interface 선언을 요구하지 않습니다.
호환되는 로컬 소유 named shape가 있으면 그대로 연결하고, 그 선언의 `@summary`와 `@field`를 새 역할에 맞게 보강합니다.

외부·generated·read-only·shared owner의 unchanged shape 사용만으로는 N/A입니다.
owner 선언은 수정하지 않고 문서화만을 위한 local alias도 만들지 않습니다.
callable 문서화 여부는 `docs-require-header-jsdoc-on-key-declarations` 등 docs rule의 applicability로만 판정합니다.

반대로 별도 named type·interface·schema root·객체형 상수 없이 구현 안에서만 추론되는 익명 객체 literal은 이 규칙의 선언형 shape가 아닙니다.
특히 query `select`의 익명 inferred 반환 literal은 N/A이며, 이 규칙을 스스로 활성화하려고 field JSDoc이나 새 type alias를 추가하지 않습니다.

**Incorrect (필드 설명을 생략하거나 예전 방식으로 헤더에 몰아씀):**

```ts
/**
 * @summary 게시 결과 요약
 * @field 게시 대상 문서 ID
 */
interface PublishResult {
	documentId: string;
	published: boolean;
}
```

**Correct (헤더 `@summary` + 필드별 `@field`를 사용):**

```ts
/**
 * @summary 게시 결과 요약
 */
export interface PublishResult {
	/**
	 * @field 게시 대상 문서 ID
	 */
	documentId: string;
	/**
	 * @field 게시 성공 여부
	 */
	published: boolean;
}

/**
 * @summary 게시 결과 스키마
 */
const publishResultSchema = z.object({
	/**
	 * @field 게시 대상 문서 ID
	 */
	documentId: z.string(),
});
```

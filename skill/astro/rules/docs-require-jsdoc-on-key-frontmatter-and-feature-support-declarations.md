---
title: Require JSDoc on Key Frontmatter and Feature Support Declarations
impact: MEDIUM-HIGH
impactDescription: makes Astro route boundaries and feature support helpers searchable before readers inspect implementation details
tags: docs, jsdoc, frontmatter, features
---

## Require JSDoc on Key Frontmatter and Feature Support Declarations

**Impact: MEDIUM-HIGH (makes Astro route boundaries and feature support helpers searchable before readers inspect implementation details)**

Astro frontmatter와 `src/features/<feature>/<feature>.ts` 같은 support module에서 중요한 경계를 선언할 때는 헤더 JSDoc을 작성합니다. `Props` interface, `getStaticPaths()`, exported page data loader, 외부 연동 helper, rendering mode 판단이 섞인 helper는 문맥 설명 없이 지나가기 쉬우므로 `@summary`, `@helper`, `@api`, `@field` 같은 태그를 companion skill인 `convention-typescript` 표준에 맞춰 남깁니다. 단순 local destructuring이나 자명한 alias까지 전부 문서화할 필요는 없습니다.

**Incorrect (route/feature 경계 선언에 문맥 설명이 없음):**

```astro
---
interface Props {
	title: string;
	description: string;
}

export async function getStaticPaths() {
	const posts = await getCollection("blog");
	return posts.map((post) => ({ params: { slug: post.slug } }));
}

const buildHeadModel = (post: Post) => ({
	title: post.title,
	description: post.description,
});
---
```

**Correct (핵심 선언의 역할과 의도를 바로 위에 문서화):**

```astro
---
/**
 * @summary 포스트 상세 페이지 메타 props
 */
interface Props {
	/** @field 문서 제목 */
	title: string;
	/** @field description 메타 태그 내용 */
	description: string;
}

/**
 * @helper 정적 상세 페이지 slug 목록 생성
 */
export async function getStaticPaths() {
	const posts = await getCollection("blog");
	return posts.map((post) => ({ params: { slug: post.slug } }));
}

/**
 * @helper 포스트 헤드 메타 모델 생성
 */
const buildHeadModel = (post: Post) => ({
	title: post.title,
	description: post.description,
});
---
```

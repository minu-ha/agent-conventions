---
title: Require JSDoc on Key Frontmatter, Document Props, and Route Support Declarations
impact: MEDIUM-HIGH
impactDescription: makes Astro route boundaries and route-local support helpers searchable before readers inspect implementation details
tags: docs, jsdoc, frontmatter, route-support
---

## Require JSDoc on Key Frontmatter, Document Props, and Route Support Declarations

**Impact: MEDIUM-HIGH (makes Astro route boundaries and route-local support helpers searchable before readers inspect implementation details)**

Astro frontmatter와 `src/pages/_document.astro`, `src/pages/_head.astro`, `src/pages/**/_post-admin.ts`, `src/pages/**/_local/post-editor.ts` 같은 route-local support module에서 중요한 경계를 선언할 때는 헤더 JSDoc을 작성합니다. pages-local 문서 셸 contract, head/SEO contract, `Props` interface, `getStaticPaths()`, exported page data loader, 외부 연동 helper, rendering mode 판단이 섞인 helper는 문맥 설명 없이 지나가기 쉬우므로 `@summary`, `@helper`, `@api`, `@field` 같은 태그를 companion skill인 `convention-typescript` 표준에 맞춰 남깁니다. 단순 local destructuring이나 자명한 alias까지 전부 문서화할 필요는 없습니다.

**Incorrect (document props/route/support 경계 선언에 문맥 설명이 없음):**

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
 * @summary head 전용 SEO/meta contract
 */
interface Props {
	/** @field 브라우저 title에 사용할 현재 페이지 제목 */
	pageTitle?: string;
	/** @field description meta에 사용할 현재 페이지 설명 */
	pageDescription?: string;
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

---
title: Keep Dynamic Route Generation at the Page Boundary
titleKo: 동적 route 생성은 page 경계에서
impact: HIGH
impactDescription: URL 계약이 정의된 곳에서 route 파라미터와 빌드 시점 페이지 생성이 보이게 함
tags: routing, getstaticpaths, pages
---

## Keep Dynamic Route Generation at the Page Boundary

**Impact: HIGH (URL 계약이 정의된 곳에서 route 파라미터와 빌드 시점 페이지 생성이 보이게 함)**

동적 route의 `getStaticPaths()`와 param-to-page generation 책임은 page file 경계에 둡니다.
shared component나 utility가 URL contract를 대신 소유하게 만들지 말고,
page가 경로와 데이터를 연결한 뒤 렌더링용 component에 props를 전달합니다.

**Incorrect (`getStaticPaths()` 책임을 shared component 쪽으로 밀어 page contract를 숨김):**

```astro
---
import BlogPostPage, { getStaticPaths } from "../../components/blog/BlogPostPage.astro";
export { getStaticPaths };
---

<BlogPostPage />
```

**Correct (page file가 route contract를 소유하고 component는 렌더링만 담당):**

```astro
---
import BlogPostPage from "../../components/blog/BlogPostPage.astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
	const posts = await getCollection("blog");

	return posts.map((post) => ({
		params: { slug: post.id },
		props: { post },
	}));
}

const { post } = Astro.props;
---

<BlogPostPage post={post} />
```

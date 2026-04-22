---
title: Keep Page Files Focused on Route Contract and Data Handoff
impact: HIGH
impactDescription: keeps `src/pages` readable as route boundaries instead of turning them into giant mixed concerns
tags: pages, routing, responsibility
---

## Keep Page Files Focused on Route Contract and Data Handoff

**Impact: HIGH (keeps `src/pages` readable as route boundaries instead of turning them into giant mixed concerns)**

page file은 URL contract, `getStaticPaths()`, `prerender`, search param 해석, page-level data selection, feature entry 선택, `currentPathname`과 문서 메타 props handoff 같은 route boundary 책임을 가집니다. 재사용 가능한 render detail, large markup block, browser interaction은 `src/features/<feature>`나 island로 내려 page가 thin adapter 역할을 유지하게 둡니다. 특히 page HTML이나 server-side data selection이 `Astro.url.searchParams` 같은 request-time state에 직접 의존하는 경우에는 `prerender = false` 여부도 이 경계에서 같이 보이게 유지합니다. 반대로 query state를 client island에 넘기기만 하고 prerendered HTML은 그대로라면 static 기본값을 유지할 수 있습니다.

**Incorrect (page 파일이 route contract와 재사용 렌더링 상세를 한꺼번에 가짐):**

```astro
---
const tab = Astro.url.searchParams.get("tab") ?? "all";
const posts = await getPosts({ tab });
---

<section>
	{posts.map((post) => (
		<article class="card">
			<h2>{post.title}</h2>
			<PostRemoveModal postId={post.id} />
		</article>
	))}
</section>
```

**Correct (page는 route/data/meta handoff를 소유하고 feature entry로 위임):**

```astro
---
import DocumentShell from "@/pages/_document.astro";
import PostListPage from "../../features/post/post-list-page.astro";
import { getPostListPageData } from "../../features/post/post.ts";

export const prerender = false;

const tab = Astro.url.searchParams.get("tab") ?? "all";
const pageData = await getPostListPageData({ tab });
---

<DocumentShell currentPathname={Astro.url.pathname} pageTitle="posts" pageDescription="Recent posts">
	<PostListPage {...pageData} />
</DocumentShell>
```

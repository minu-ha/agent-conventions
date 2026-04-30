---
title: Keep Page Files Focused on Route Contract and Data Handoff
impact: HIGH
impactDescription: keeps `src/pages` readable as route owners without reducing page files to import-only adapters
tags: pages, routing, responsibility
---

## Keep Page Files Focused on Route Contract and Data Handoff

**Impact: HIGH (keeps `src/pages` readable as route owners without reducing page files to import-only adapters)**

page file은 URL contract, `getStaticPaths()`, `prerender`, search param 해석, page-level data selection, `currentPathname`과 문서 메타 props handoff, 그리고 high-level screen flow 같은 route owner 책임을 가집니다. 재사용 가능한 shared render detail은 `ui`/`widget`으로 올리고, route-only browser interaction이나 provider boundary는 `_local/`로 내립니다. 특히 page HTML이나 server-side data selection이 `Astro.url.searchParams` 같은 request-time state에 직접 의존하는 경우에는 `prerender = false` 여부도 이 경계에서 같이 보이게 유지합니다. 반대로 query state를 client island에 넘기기만 하고 prerendered HTML은 그대로라면 static 기본값을 유지할 수 있습니다.

**Incorrect (page 파일이 route contract와 browser runtime detail을 한꺼번에 가짐):**

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

**Correct (page는 route/data/meta handoff와 screen flow를 소유하고 runtime boundary만 `_local/`로 위임):**

```astro
---
import Document from "@/pages/_document.astro";
import PostAdminRuntime from "./_local/post-admin-runtime.tsx";
import { getPostAdminInitialState, getPostAdminPreviewSlugs } from "./_post-admin";
import { util } from "@/shared/util";

export async function getStaticPaths() {
	const slugs = await getPostAdminPreviewSlugs();

	return slugs.map((slug) => ({
		params: {
			slug: util.entry.toSlug(slug),
		},
	}));
}

const initialState = await getPostAdminInitialState();
---

<Document currentPathname={Astro.url.pathname} pageTitle="admin posts" pageNoIndex>
	<section class="rt_pi__root">
		<header class="rt_pi__header">
			<h1>Posts</h1>
		</header>
		<PostAdminRuntime client:load initialState={initialState} />
	</section>
</Document>
```

---
title: Keep `src/pages` Thin and Use It as the Route Adapter Layer
impact: CRITICAL
impactDescription: keeps Astro's required routing directory from turning into the place where full screens and private UI sprawl
tags: structure, pages, features, routing
---

## Keep `src/pages` Thin and Use It as the Route Adapter Layer

**Impact: CRITICAL (keeps Astro's required routing directory from turning into the place where full screens and private UI sprawl)**

Astro에서 `src/pages`는 required reserved directory이므로 route file 자체는 여기에 둡니다. 다만 이 프로젝트에서는 `src/pages`를 framework-required route adapter layer로만 보고 가능한 한 얇게 유지합니다. route file은 file-based route contract, `getStaticPaths()`, search param 해석, page-level data loading, feature entry 선택, `currentPathname`과 문서 메타 prop handoff, page-local `_document.astro` 적용까지만 담당하고, 실제 화면 body 구현은 `src/features/<feature>`로 위임합니다. `Astro.url.searchParams`를 읽더라도 prerendered HTML이 그 값에 의존하지 않으면 static 기본값을 유지할 수 있습니다. 반대로 page HTML이나 server-side data loading이 request-time query state에 직접 의존하면 `prerender = false` 같은 rendering 선택도 page boundary에서 같이 드러냅니다.

**Incorrect (`src/pages` 안에서 full screen과 route-private UI까지 함께 키움):**

```astro
---
const search = Astro.url.searchParams.get("search") ?? "";
const posts = await getPosts({ search });
---

<section>
	{posts.map((post) => (
		<article class="post-card">
			<h2>{post.title}</h2>
			<PostRemoveModal postId={post.id} />
		</article>
	))}
</section>
```

**Correct (`src/pages`는 thin adapter와 document entry로 두고 feature 구현으로 handoff):**

```astro
---
import Document from "../_document.astro";
import PostsPage from "../../features/post/posts-page.astro";
import { getPostsPageData } from "../../features/post/post.ts";

export const prerender = false;

const search = Astro.url.searchParams.get("search") ?? "";
const pageData = await getPostsPageData({ search });
---

<Document currentPathname={Astro.url.pathname} pageTitle="posts" pageDescription="Recent posts">
	<PostsPage {...pageData} />
</Document>
```

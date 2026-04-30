---
title: Keep Route Page Files Focused on Screen Flow
impact: HIGH
impactDescription: keeps routed `.astro` files readable as the main route orchestration layer instead of turning them into import-only adapters
tags: responsibility, pages, screen-flow
---

## Keep Route Page Files Focused on Screen Flow

**Impact: HIGH (keeps routed `.astro` files readable as the main route orchestration layer instead of turning them into import-only adapters)**

`src/pages/**/index.astro`, `[slug].astro`, and similar route files own more than the URL. They should show the route contract, data selection, document props, empty/error branch, and the high-level screen order. Do not reduce every route file to a one-line import of a page component just to keep `src/pages` thin. Extract only the pieces that have a real rendering boundary, browser runtime boundary, provider boundary, third-party library boundary, or data-shaping boundary.

**Incorrect (route page hides all screen flow behind route-local components):**

```astro
---
import AdminPostsRuntime from "./_local/post-admin-runtime.tsx";
import PostAdminShell from "./_local/post-admin-shell.astro";
import Document from "@/pages/_document.astro";
---

<Document currentPathname={Astro.url.pathname} pageTitle="posts">
	<PostAdminShell>
		<AdminPostsRuntime client:load />
	</PostAdminShell>
</Document>
```

이 구조만 보면 route에서 어떤 server data가 준비되는지, 어떤 empty state가 있는지, 어떤 screen surface가 route owner인지 보이지 않습니다.

**Correct (route page가 screen flow와 runtime handoff를 계속 소유):**

```astro
---
import "./_post-admin.css";
import Document from "@/pages/_document.astro";
import PostAdminRuntime from "./_local/post-admin-runtime.tsx";
import { getPostAdminInitialState } from "./_post-admin";

const initialState = await getPostAdminInitialState();
const hasPosts = initialState.posts.length > 0;
---

<Document currentPathname={Astro.url.pathname} pageTitle="admin posts" pageNoIndex>
	<section class="rt_pi__root">
		<header class="rt_pi__header">
			<h1>Posts</h1>
		</header>

		{hasPosts ? (
			<PostAdminRuntime client:load initialState={initialState} />
		) : (
			<p class="rt_pi__empty">No posts yet.</p>
		)}
	</section>
</Document>
```

이 예시는 React runtime이 필요해도 route entry가 document handoff, server data, high-level branch, `rt_*` surface owner를 계속 보여 줍니다.

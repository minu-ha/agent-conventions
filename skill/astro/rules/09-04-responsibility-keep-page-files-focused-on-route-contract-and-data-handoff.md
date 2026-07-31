---
title: Keep Page Files Focused on Route Contract and Data Handoff
titleKo: page 파일의 route 계약·데이터 전달 집중
impact: HIGH
impactDescription: page 파일을 import 전용 어댑터로 만들지 않으면서 src/pages를 route 소유자로 읽히게 합니다
tags: pages, routing, responsibility
---

## Keep Page Files Focused on Route Contract and Data Handoff

**Impact: HIGH (page 파일을 import 전용 어댑터로 만들지 않으면서 src/pages를 route 소유자로 읽히게 합니다)**

Page file은 route owner 책임을 한눈에 보이게 유지합니다.

Page file이 소유:

- URL contract
- `getStaticPaths()` and `prerender`
- search param 해석
- page-level data selection
- `currentPathname` and document meta handoff
- high-level screen flow

분리 기준:

- Reusable render detail: `ui` or `widget`
- Route-only browser interaction/provider: `_local/`
- Request-time HTML/data selection: page boundary에서 `prerender = false` 여부도 함께 표시
- Client island에 query state만 넘기는 경우: static 기본값 유지 가능

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
import EntryAdminRuntime from "./_local/entry-admin-runtime.tsx";
import { getEntryAdminInitialState, getEntryAdminPreviewSlugs } from "./_entry-admin";
import { util } from "@/shared/util";

export async function getStaticPaths() {
	const slugs = await getEntryAdminPreviewSlugs();

	return slugs.map((slug) => ({
		params: {
			slug: util.entry.toSlug(slug),
		},
	}));
}

const initialState = await getEntryAdminInitialState();
---

<Document currentPathname={Astro.url.pathname} pageTitle="admin entries" pageNoIndex>
	<section class="rt_adminEntriesIndex__root">
		<header class="rt_adminEntriesIndex__header">
			<h1>Entries</h1>
		</header>
		<EntryAdminRuntime client:load initialState={initialState} />
	</section>
</Document>
```

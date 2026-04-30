---
title: Keep Pages-local Document Helpers Imported Only by Pages
impact: HIGH
impactDescription: preserves one-way dependency flow from routed pages to pages-local document helpers instead of letting shared code depend on routing helpers
tags: responsibility, pages, imports, dependency-direction, document-helpers
---

## Keep Pages-local Document Helpers Imported Only by Pages

**Impact: HIGH (preserves one-way dependency flow from routed pages to pages-local document helpers instead of letting shared code depend on routing helpers)**

`src/pages/_document.astro`, `_head.astro`, `_document.css` 같은 pages-local document helper는 `src/pages/**`만 소유합니다. route file이 `_document.astro`를 import하고, `_document.astro`가 `_head.astro`, `_document.css`, `widget`, `ui`를 조립합니다. `_document.astro`와 `_head.astro`는 각자 자기 로컬 `Props`를 직접 소유하고, `src/components/**`, shared utility, route-local `_local/` leaf는 이 파일들을 직접 import하지 않습니다. 의존 방향은 `pages -> _document.astro -> _head.astro + _document.css + widget/ui`가 됩니다. 이렇게 해야 top-level document composition은 route boundary에 남고 shared component tier가 routing helper에 묶이지 않습니다.

**Incorrect (route-local leaf가 pages-local document helper를 직접 import함):**

```astro
---
import DocumentShell from "@/pages/_document.astro";
---

<DocumentShell currentPathname="/" pageTitle="recent" pageDescription="Recent posts">
	<section>
		<!-- route-local body -->
	</section>
</DocumentShell>
```

이 구조는 leaf component가 pages-local document helper와 메타 계약을 직접 알아야 하므로 route/document/component 경계를 깨뜨립니다.

**Correct (page만 document helper를 알고, `_local/` leaf는 body만 렌더링):**

```astro
---
import Document from "@/pages/_document.astro";
import RecentList from "./_local/recent-list.astro";
import { getRecentEntries, getRecentListPageProps } from "./_index";

const recentEntries = await getRecentEntries();
const pageProps = getRecentListPageProps({
	entries: recentEntries,
	currentPage: 1,
});
---

<Document currentPathname={Astro.url.pathname} pageTitle="recent" pageDescription="Recent posts">
	<RecentList entries={pageProps.entries} />
</Document>
```

```astro
---
import type { RecentEntry } from "../_index";

const { entries } = Astro.props as { entries: RecentEntry[] };
---

<section>
	<!-- route-local body -->
</section>
```

이 구조에서는 page만 top-level shell과 meta props를 조립하고, route-local leaf는 routed body surface에만 집중합니다.

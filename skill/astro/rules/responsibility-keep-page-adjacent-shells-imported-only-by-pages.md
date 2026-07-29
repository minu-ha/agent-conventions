---
title: Keep Pages-local Document Helpers Imported Only by Pages
impact: HIGH
impactDescription: >-
  preserves one-way dependency flow from routed pages to pages-local document helpers instead of letting shared code
  depend on routing helpers
tags: responsibility, pages, imports, dependency-direction, document-helpers
---

## Keep Pages-local Document Helpers Imported Only by Pages

**Impact: HIGH (preserves one-way dependency flow from routed pages to pages-local document helpers instead of letting shared code depend on routing helpers)**

`src/pages/_document.astro`, `_head.astro`,
`_document.css` 같은 pages-local document helper는 routed page만 import합니다.

의존 방향:

- Page entry imports `_document.astro`
- `_document.astro` imports `_head.astro`, `_document.css`, `widget`, `ui`
- `_document.astro`와 `_head.astro`는 각자 자기 로컬 `Props`를 직접 소유
- `src/components/**`, shared utility, route-local `_local/` leaf는 document helper를 직접 import하지 않음

이 흐름을 지켜야 top-level document composition은 route boundary에 남고 shared component tier가 routing helper에 묶이지
않습니다.

**Incorrect (route-local leaf가 pages-local document helper를 직접 import함):**

```astro
---
import DocumentShell from "@/pages/_document.astro";
---

<DocumentShell currentPathname="/" pageTitle="entries" pageDescription="Archived entries">
	<section>
		<!-- route-local body -->
	</section>
</DocumentShell>
```

이 구조는 leaf component가 pages-local document helper와 메타 계약을 직접 알아야 하므로 route/document/component 경계를
깨뜨립니다.

**Correct (page만 document helper를 알고, `_local/` leaf는 body만 렌더링):**

```astro
---
import Document from "@/pages/_document.astro";
import EntryList from "./_local/entry-list.astro";
import { getEntries, getEntryListPageProps } from "./_index";

const entries = await getEntries();
const pageProps = getEntryListPageProps({
	entries,
	currentPage: 1,
});
---

<Document currentPathname={Astro.url.pathname} pageTitle="entries" pageDescription="Archived entries">
	<EntryList entries={pageProps.entries} />
</Document>
```

```astro
---
import type { EntryListItem } from "../_index";

const { entries } = Astro.props as { entries: EntryListItem[] };
---

<section>
	<!-- route-local body -->
</section>
```

이 구조에서는 page만 top-level shell과 meta props를 조립하고, route-local leaf는 routed body surface에만 집중합니다.

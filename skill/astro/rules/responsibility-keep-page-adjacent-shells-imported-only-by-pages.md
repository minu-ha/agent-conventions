---
title: Keep Pages-local Document Helpers Imported Only by Pages
impact: HIGH
impactDescription: preserves one-way dependency flow from pages to pages-local document helpers to features, instead of letting feature code depend on routing helpers
tags: responsibility, pages, features, imports, dependency-direction, document-helpers
---

## Keep Pages-local Document Helpers Imported Only by Pages

**Impact: HIGH (preserves one-way dependency flow from pages to pages-local document helpers to features, instead of letting feature code depend on routing helpers)**

`src/pages/_document.astro`, `_head.astro`, `_document.css` 같은 pages-local document helper는 `src/pages/**`만 소유합니다. route file이 `_document.astro`를 import하고, `_document.astro`가 `_head.astro`, `_document.css`, `widget`, `ui`를 조립합니다. `_document.astro`와 `_head.astro`는 각자 자기 로컬 `Props`를 직접 소유하고, `src/features/**`는 이 파일들을 모르며 page가 넘겨주는 props와 `<slot />` 안의 body rendering에만 집중합니다. 의존 방향은 `pages -> _document.astro -> _head.astro + _document.css + widget/ui`와 `pages -> features`가 되고, `features -> pages` 방향 import는 금지합니다. 이렇게 해야 feature는 라우터와 top-level document composition에 독립적인 body layer로 유지됩니다.

**Incorrect (feature가 pages-local document helper를 직접 import함):**

```astro
---
import DocumentShell from "@/pages/_document.astro";
import type { RecentPageProps } from "./recent";

const props = Astro.props as RecentPageProps;
---

<DocumentShell currentPathname="/" pageTitle="recent" pageDescription="Recent posts">
	<section>
		<!-- feature body -->
	</section>
</DocumentShell>
```

이 구조는 feature가 pages-local document helper와 메타 계약을 직접 알아야 하므로 pages와 features의 경계를 깨뜨립니다.

**Correct (page만 document helper를 알고, feature는 body만 렌더링):**

```astro
---
import Document from "@/pages/_document.astro";
import RecentPage from "@/features/recent/recent-page.astro";
import { getRecentEntries, getRecentListPageProps } from "@/features/recent/recent";

const recentEntries = await getRecentEntries();
const pageProps = getRecentListPageProps({
	entries: recentEntries,
	currentPage: 1,
});
---

<Document currentPathname={Astro.url.pathname} pageTitle="recent" pageDescription="Recent posts">
	<RecentPage {...pageProps} />
</Document>
```

```astro
---
import type { RecentPageProps } from "./recent";

const props = Astro.props as RecentPageProps;
---

<section>
	<!-- feature body -->
</section>
```

이 구조에서는 page만 top-level shell과 meta props를 조립하고, feature는 routed body surface에만 집중합니다.

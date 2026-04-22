---
title: Compose Page-level Documents Through a Page-adjacent Document Shell
impact: HIGH
impactDescription: keeps repeated document, head, and body chrome composition out of feature screens while preserving a single page-level entry point
tags: component, document, head, chrome, pages
---

## Compose Page-level Documents Through a Page-adjacent Document Shell

**Impact: HIGH (keeps repeated document, head, and body chrome composition out of feature screens while preserving a single page-level entry point)**

반복되는 top-level document composition이 필요하면 page entry가 `src/pages/_document.astro` 하나만 import하고, `_document.astro`가 내부적으로 `_head.astro`와 `_page-chrome.astro`를 조립하게 둡니다. `_document.astro`는 `<html>`, `<head>`, `<body>`의 최상위 문서 조립을 맡고, `_head.astro`는 SEO/meta/favicon/manifest 같은 head concern을 맡고, `_page-chrome.astro`는 header/nav/main wrapper 같은 바깥 chrome을 맡습니다. feature screen은 이 helper들을 모르고 `<slot />`에 들어갈 body content만 렌더링합니다.

**Incorrect (각 page가 head/body chrome을 반복 조립하거나 feature가 document helper를 직접 앎):**

```astro
---
import RecentListPage from "@/features/recent/recent-list-page.astro";
import Head from "./_head.astro";
import PageChrome from "./_page-chrome.astro";
---

<html lang="ko">
	<head>
		<Head pageTitle="recent" pageDescription="Recent posts" />
	</head>
	<body>
		<PageChrome>
			<RecentListPage />
		</PageChrome>
	</body>
</html>
```

이 방식은 각 page마다 top-level document 조립이 반복되고, 나중에 문서 셸 변경이 생기면 page 파일 전체를 건드리기 쉬워집니다.

**Correct (page는 `_document.astro` 하나만 import하고 feature body를 slot으로 전달):**

```astro
---
import Document from "./_document.astro";
import RecentListPage from "@/features/recent/recent-list-page.astro";
import { getRecentEntries, getRecentListPageProps } from "@/features/recent/recent";

const entries = await getRecentEntries();
const pageProps = getRecentListPageProps({ entries, currentPage: 1 });
---

<Document pageTitle="recent" pageDescription="Recent posts and notes from meepin">
	<RecentListPage {...pageProps} />
</Document>
```

```astro
---
import Head from "./_head.astro";
import PageChrome from "./_page-chrome.astro";

const { pageTitle, pageDescription } = Astro.props;
---

<html lang="ko">
	<head>
		<Head pageTitle={pageTitle} pageDescription={pageDescription} />
	</head>
	<body>
		<PageChrome>
			<slot />
		</PageChrome>
	</body>
</html>
```

```astro
---
import { SEO } from "astro-seo";

const { pageTitle, pageDescription } = Astro.props;
---

<SEO title={pageTitle} description={pageDescription} />
<link rel="icon" href="/favicon.ico" />
<link rel="manifest" href="/site.webmanifest" />
```

이 구조에서는 page는 route adapter와 top-level document 진입점만 소유하고, `_document`가 document helper를 감싸며, feature는 body content만 렌더링합니다.

---
title: Compose Page-level Documents Through `_document.astro` and `_head.astro`
impact: HIGH
impactDescription: keeps repeated document, head, and body shell composition out of route files while preserving a single page-level entry point
tags: component, document, head, pages, seo
---

## Compose Page-level Documents Through `_document.astro` and `_head.astro`

**Impact: HIGH (keeps repeated document, head, and body shell composition out of route files while preserving a single page-level entry point)**

반복되는 top-level document composition이 필요하면 page entry가 `src/pages/_document.astro` 하나만 import하게 둡니다. `_document.astro`는 내부적으로 `_head.astro`, `_document.css`를 사용해 `<html>`, `<head>`, `<body>`와 route-shared body shell을 직접 조립합니다. `_document.astro`는 문서 셸 contract를 자기 로컬 `Props`로 직접 소유하고, `_head.astro`도 head/meta 전용 contract를 자기 로컬 `Props`로 직접 소유합니다. `Props extends DocumentMetaProps` 같은 얇은 타입 확장이나 `_document.ts` 같은 중간 타입 파일은 두지 않습니다. `_head.astro`는 `astro-seo`를 기본 SEO surface로 사용하고, favicon, manifest, RSS alternate, theme/app meta, JSON-LD 같은 프로젝트 고유 메타는 계속 로컬 구현으로 유지합니다. 특별한 재사용 경계가 생기지 않는 한 body shell 전용 helper를 `_page-chrome.astro`처럼 한 단계 더 분리하지 않고 `_document.astro` 안에 둡니다. feature screen은 이 helper들을 모르고 `<slot />`에 들어갈 body content만 렌더링합니다.

**Incorrect (각 page가 문서 조립을 반복하거나 body shell을 불필요하게 한 단계 더 분리함):**

```astro
---
import DocumentHead from "./_head.astro";
import RecentListPage from "@/features/recent/recent-list-page.astro";
---

<html lang="ko">
	<head>
		<DocumentHead pageTitle="recent" pageDescription="Recent posts" />
	</head>
	<body class="shell">
		<header>...</header>
		<main>
			<RecentListPage />
		</main>
	</body>
</html>
```

이 방식은 각 page마다 top-level document 조립이 반복되고, body shell 수정이 생길 때 route file 전체를 다시 건드리기 쉬워집니다.

**Correct (page는 `_document.astro` 하나만 import하고 feature body를 slot으로 전달):**

```astro
---
import DocumentShell from "@/pages/_document.astro";
import RecentListPage from "@/features/recent/recent-list-page.astro";
import { getRecentEntries, getRecentListPageProps } from "@/features/recent/recent";

const entries = await getRecentEntries();
const pageProps = getRecentListPageProps({ entries, currentPage: 1 });
---

<DocumentShell currentPathname={Astro.url.pathname} pageTitle="recent" pageDescription="Recent posts and notes from meepin">
	<RecentListPage {...pageProps} />
</DocumentShell>
```

```astro
---
import "./_document.css";
import HeadMeta from "./_head.astro";
import UiBox from "@/components/ui/box/ui-box.astro";
import UiStack from "@/components/ui/stack/ui-stack.astro";
import UiSurface from "@/components/ui/surface/ui-surface.astro";
import WidgetSiteHeader from "@/components/widget/site-header/widget-site-header.astro";

interface Props {
	currentPathname: string;
	pageTitle?: string;
	pageDescription?: string;
	pageImagePath?: string;
	pageType?: "website" | "article";
	pageKeywords?: string[];
	pagePublishedTime?: Date;
	pageModifiedTime?: Date;
	pageNoIndex?: boolean;
	pageNoFollow?: boolean;
}

const {
	currentPathname,
	pageTitle,
	pageDescription,
	pageImagePath,
	pageType,
	pageKeywords,
	pagePublishedTime,
	pageModifiedTime,
	pageNoIndex,
	pageNoFollow,
} = Astro.props as Props;
---

<html lang="ko">
	<HeadMeta
		pageTitle={pageTitle}
		pageDescription={pageDescription}
		pageImagePath={pageImagePath}
		pageType={pageType}
		pageKeywords={pageKeywords}
		pagePublishedTime={pagePublishedTime}
		pageModifiedTime={pageModifiedTime}
		pageNoIndex={pageNoIndex}
		pageNoFollow={pageNoFollow}
	/>
	<body class="rt_document__body">
		<UiSurface class="rt_document__surface">
			<UiStack class="rt_document__stack">
				<UiBox class="rt_document__header">
					<WidgetSiteHeader currentPathname={currentPathname} />
				</UiBox>
				<main class="rt_document__main">
					<UiBox class="rt_document__content">
						<slot />
					</UiBox>
				</main>
			</UiStack>
		</UiSurface>
	</body>
</html>
```

```astro
---
import { SEO } from "astro-seo";

interface Props {
	pageTitle?: string;
	pageDescription?: string;
	pageNoIndex?: boolean;
	pageNoFollow?: boolean;
}

const { pageTitle, pageDescription, pageNoIndex = false, pageNoFollow = false } = Astro.props as Props;
---

<SEO title={pageTitle} description={pageDescription} noindex={pageNoIndex} nofollow={pageNoFollow} />
<link rel="icon" href="/favicon.ico" />
<link rel="manifest" href="/site.webmanifest" />
<link rel="alternate" type="application/rss+xml" title="meepin RSS" href="/rss.xml" />
<meta name="theme-color" content="#ffffff" />
<script is:inline type="application/ld+json" set:html={JSON.stringify({ "@context": "https://schema.org" })} />
```

이 구조에서는 page는 route adapter와 meta props handoff만 소유하고, `_document.astro`가 top-level document와 shared body shell을 직접 감싸며, feature는 body content만 렌더링합니다.

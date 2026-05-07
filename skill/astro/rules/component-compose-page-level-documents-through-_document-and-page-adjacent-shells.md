---
title: Compose Page-level Documents Through `_document.astro` and `_head.astro`
impact: HIGH
impactDescription: keeps repeated document, head, and body shell composition out of route files while preserving a single page-level entry point
tags: component, document, head, pages, seo
---

## Compose Page-level Documents Through `_document.astro` and `_head.astro`

**Impact: HIGH (keeps repeated document, head, and body shell composition out of route files while preserving a single page-level entry point)**

반복되는 top-level document composition이 필요하면 page entry가 `src/pages/_document.astro` 하나만 import하게 둡니다. `_document.astro`는 내부적으로 `_head.astro`, `_document.css`, base stylesheet를 사용해 `<html>`, `<head>`, `<body>`와 route-shared body shell을 직접 조립합니다. `_document.astro`는 문서 셸 contract를 자기 로컬 `Props`로 직접 소유하고, `_head.astro`도 head/meta 전용 contract를 자기 로컬 `Props`로 직접 소유합니다. `Props extends DocumentMetaProps` 같은 얇은 타입 확장이나 `_document.ts` 같은 중간 타입 파일은 두지 않습니다. `_head.astro`는 `astro-seo`를 기본 SEO surface로 사용하고, canonical, favicon, manifest, RSS alternate, theme/app meta, JSON-LD 같은 프로젝트 고유 메타는 계속 로컬 구현으로 유지합니다. 특별한 재사용 경계가 생기지 않는 한 body shell 전용 helper를 `_page-chrome.astro`처럼 한 단계 더 분리하지 않고 `_document.astro` 안에 둡니다. Routed page는 이 document helper에 body content를 slot으로 전달하고, route-local runtime이나 section은 필요할 때만 `_local/`로 분리합니다.

**Incorrect (각 page가 문서 조립을 반복하거나 body shell을 불필요하게 한 단계 더 분리함):**

```astro
---
import DocumentHead from "./_head.astro";
---

<html lang="ko">
	<head>
		<DocumentHead pageTitle="recent" pageDescription="Recent posts" />
	</head>
	<body class="shell">
		<header>...</header>
		<main>
			<section>recent route body...</section>
		</main>
	</body>
</html>
```

이 방식은 각 page마다 top-level document 조립이 반복되고, body shell 수정이 생길 때 route file 전체를 다시 건드리기 쉬워집니다.

**Correct (page는 `_document.astro` 하나만 import하고 route body를 slot으로 전달):**

```astro
---
import Document from "@/pages/_document.astro";
import WgEntryFeed from "@/components/widget/entry-feed/wg-entry-feed.astro";
import { getRecentEntries, getRecentListPageProps } from "./_index";

const recentEntries = await getRecentEntries();
const pageProps = getRecentListPageProps({
	entries: recentEntries,
	currentPage: 1,
});
---

<Document currentPathname={Astro.url.pathname} pageTitle="recent" pageDescription="Recent entries">
	<section class="rt_ri__root">
		<WgEntryFeed entries={pageProps.entries} />
	</section>
</Document>
```

```astro
---
import "./_document.css";
import "@/styles/base.css";
import Head from "./_head.astro";
import UiBox from "@/components/ui/box/ui-box.astro";
import UiStack from "@/components/ui/stack/ui-stack.astro";
import UiSurface from "@/components/ui/surface/ui-surface.astro";
import WgSiteFooter from "@/components/widget/site-footer/wg-site-footer.astro";
import WgSiteHeader from "@/components/widget/site-header/wg-site-header.astro";
import { config } from "@/shared/config";

interface Props {
	currentPathname: string;
	pageShellVariant?: "default" | "wide";
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
	pageShellVariant = "default",
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

<!doctype html>
<html lang={config.site.language}>
	<Head
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
					<WgSiteHeader currentPathname={currentPathname} />
				</UiBox>
				<main class:list={["rt_document__main", pageShellVariant === "wide" && "rt_document__main--wide"]}>
					<UiBox class="rt_document__content">
						<slot />
					</UiBox>
				</main>
				<UiBox class:list={["rt_document__footer", pageShellVariant === "wide" && "rt_document__footer--wide"]}>
					<WgSiteFooter />
				</UiBox>
			</UiStack>
		</UiSurface>
	</body>
</html>
```

```astro
---
import { SEO } from "astro-seo";
import { config } from "@/shared/config";
import { util } from "@/shared/util";

interface Props {
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
	pageTitle,
	pageDescription,
	pageImagePath,
	pageType = "website",
	pageKeywords,
	pagePublishedTime,
	pageModifiedTime,
	pageNoIndex = false,
	pageNoFollow = false,
} = Astro.props as Props;
const documentTitle = pageTitle ? `${pageTitle} | ${config.site.name}` : config.site.name;
const description = pageDescription ?? config.site.description;
const canonicalUrl = Astro.site ? new URL(Astro.url.pathname, Astro.site) : undefined;
const socialImagePath = pageImagePath ?? config.site.defaultSocialImagePath;
const socialImageUrl = Astro.site ? new URL(util.path.withBasePath(socialImagePath), Astro.site) : undefined;
---

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content={config.site.themeColor} />
	<link rel="icon" href={util.path.withBasePath(config.site.faviconIcoPath)} sizes="any" />
	<link rel="manifest" href={util.path.withBasePath(config.site.manifestPath)} />
	<link rel="alternate" type="application/rss+xml" title={`${config.site.name} RSS`} href={util.path.withBasePath("/rss.xml")} />
	<SEO
		title={documentTitle}
		description={description}
		canonical={canonicalUrl}
		noindex={pageNoIndex}
		nofollow={pageNoFollow}
		openGraph={
			socialImageUrl
				? {
						basic: {
							title: documentTitle,
							type: pageType,
							image: socialImageUrl.toString(),
							url: canonicalUrl,
						},
						optional: {
							description,
							siteName: config.site.name,
						},
						article:
							pageType === "article"
								? {
										publishedTime: pagePublishedTime?.toISOString(),
										modifiedTime: pageModifiedTime?.toISOString(),
										tags: pageKeywords,
									}
								: undefined,
				  }
				: undefined
		}
	/>
</head>
```

이 구조에서는 page가 route contract와 meta props handoff, body content의 high-level flow를 소유하고, `_document.astro`가 top-level document와 shared body shell을 직접 감싸며, `_head.astro`가 SEO/meta 계산을 자기 contract로 직접 소유합니다.

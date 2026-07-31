---
title: Compose Page-level Documents Through `_document.astro` and `_head.astro`
titleKo: 페이지 문서의 _document.astro·_head.astro 조립
impact: HIGH
impactDescription: 반복되는 document·head·body 셸 조립을 route 파일 밖으로 빼면서 페이지 진입점은 하나로 유지합니다
tags: component, document, head, pages, seo
---

## Compose Page-level Documents Through `_document.astro` and `_head.astro`

**Impact: HIGH (반복되는 document·head·body 셸 조립을 route 파일 밖으로 빼면서 페이지 진입점은 하나로 유지합니다)**

반복되는 top-level document composition이 필요하면 routed page는 `src/pages/_document.astro` 하나만 import합니다.

소유권:

- Routed page: route data, page meta handoff, body content flow
- `_document.astro`: `<html>`, `<head>` 연결, `<body>`, shared body shell, base CSS import, `<slot />`
- `_head.astro`: SEO/meta/canonical/link/JSON-LD 계산과 head 전용 `Props`
- `_document.css`: document shell style

금지:

- 각 page가 `<html>`, `<head>`, `<body>` 조립을 반복
- `_document.ts` 같은 중간 type-only contract 파일 추가
- `Props extends DocumentMetaProps`처럼 얇은 타입 확장으로 contract 숨기기
- 실제 재사용 경계 없는 `_page-chrome.astro` helper 추가

SEO library는 `_head.astro` 내부 구현 선택지일 뿐 필수 contract가 아닙니다.
중요한 기준은 page, document, head의 책임이 한눈에 보이고, routed page가 body content를 slot으로 전달한다는 점입니다.

**Incorrect (각 page가 문서 조립을 반복함):**

```astro
---
import Head from "./_head.astro";
---

<html lang="ko">
	<Head pageTitle="archive" pageDescription="Archived entries" />
	<body>
		<header>...</header>
		<main>
			<section class="pg_entriesIndex__root">...</section>
		</main>
	</body>
</html>
```

**Correct (page는 document helper에 route body를 slot으로 전달):**

```astro
---
import Document from "@/pages/_document.astro";
import WgEntryFeed from "@/components/widget/entry-feed/wg-entry-feed.astro";

const entries = await listEntries();
---

<Document currentPathname={Astro.url.pathname} pageTitle="entries" pageDescription="Archived entries">
	<section class="pg_entriesIndex__root">
		<WgEntryFeed entries={entries} />
	</section>
</Document>
```

```astro
---
import "./_document.css";
import "@/styles/base.css";
import Head from "./_head.astro";
import WgSiteFooter from "@/components/widget/site-footer/wg-site-footer.astro";
import WgSiteHeader from "@/components/widget/site-header/wg-site-header.astro";

interface Props {
	currentPathname: string;
	pageTitle?: string;
	pageDescription?: string;
}

const {currentPathname, pageTitle, pageDescription} = Astro.props as Props;
---

<!doctype html>
<html lang="ko">
	<Head pageTitle={pageTitle} pageDescription={pageDescription} />
	<body class="pg_document__body">
		<WgSiteHeader currentPathname={currentPathname} />
		<main class="pg_document__main">
			<slot />
		</main>
		<WgSiteFooter />
	</body>
</html>
```

```astro
---
interface Props {
	pageTitle?: string;
	pageDescription?: string;
}

const {pageTitle, pageDescription} = Astro.props as Props;
const title = pageTitle ? `${pageTitle} | Site` : "Site";
const description = pageDescription ?? "Default site description";
---

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>{title}</title>
	<meta name="description" content={description} />
</head>
```

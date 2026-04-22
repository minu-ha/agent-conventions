---
title: Keep Page-adjacent Shells Imported Only by Pages
impact: HIGH
impactDescription: preserves one-way dependency flow from pages to page-adjacent shells to features, instead of letting feature code depend on routing helpers
tags: responsibility, pages, features, imports, dependency-direction
---

## Keep Page-adjacent Shells Imported Only by Pages

**Impact: HIGH (preserves one-way dependency flow from pages to page-adjacent shells to features, instead of letting feature code depend on routing helpers)**

`src/pages/_document.astro`, `_head.astro`, `_page-chrome.astro` 같은 page-adjacent shell은 `src/pages/**`만 import합니다. `src/features/**`는 이 파일들을 모르고, page가 넘겨주는 props와 `<slot />` 안의 body rendering에만 집중합니다. 의존 방향은 `pages -> pages/_*.astro -> widget/ui`와 `pages -> features`가 되고, `features -> pages` 방향 import는 금지합니다. 이렇게 해야 feature는 라우터와 top-level document composition에 독립적인 body layer로 유지됩니다.

**Incorrect (feature가 page-adjacent shell을 직접 import함):**

```astro
---
import Document from "@/pages/_document.astro";
import type { RecentListPageProps } from "./recent";

const props = Astro.props as RecentListPageProps;
---

<Document pageTitle="recent" pageDescription="Recent posts">
	<section>
		<!-- feature body -->
	</section>
</Document>
```

이 구조는 feature가 page-adjacent document helper를 직접 알아야 하므로 pages와 features의 경계를 깨뜨립니다.

**Correct (page만 document shell을 알고, feature는 body만 렌더링):**

```astro
---
import Document from "../_document.astro";
import RecentListPage from "@/features/recent/recent-list-page.astro";
import { getRecentListPageProps } from "@/features/recent/recent";

const pageProps = getRecentListPageProps({ entries: [], currentPage: 1 });
---

<Document pageTitle="recent" pageDescription="Recent posts">
	<RecentListPage {...pageProps} />
</Document>
```

```astro
---
import type { RecentListPageProps } from "./recent";

const props = Astro.props as RecentListPageProps;
---

<section>
	<!-- feature body -->
</section>
```

이 구조에서는 page만 top-level shell을 조립하고, feature는 routed body surface에만 집중합니다.

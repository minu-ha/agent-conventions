---
title: Keep Route Page Files Focused on Screen Flow
impact: HIGH
impactDescription: >-
  keeps routed `.astro` files readable as the main route orchestration layer instead of turning them into import-only
  adapters
tags: responsibility, pages, screen-flow
---

## Keep Route Page Files Focused on Screen Flow

**Impact: HIGH (keeps routed `.astro` files readable as the main route orchestration layer instead of turning them into import-only adapters)**

`src/pages/**/index.astro`, `[slug].astro`, and similar route files own more than the URL.

Page file에서 보여야 하는 것:

- route contract
- data selection
- document props
- empty/error branch
- high-level screen order

Do not reduce every route file to a one-line import of a page component just to keep `src/pages` thin.
Extract only pieces with real rendering, browser runtime, provider, third-party library, or data-shaping boundaries.

**Incorrect (route page hides all screen flow behind route-local components):**

```astro
---
import AdminEntriesRuntime from "./_local/entry-admin-runtime.tsx";
import EntryAdminShell from "./_local/entry-admin-shell.astro";
import Document from "@/pages/_document.astro";
---

<Document currentPathname={Astro.url.pathname} pageTitle="entries">
	<EntryAdminShell>
		<AdminEntriesRuntime client:load />
	</EntryAdminShell>
</Document>
```

이 구조만 보면 route에서 어떤 server data가 준비되는지, 어떤 empty state가 있는지,
어떤 screen surface가 route owner인지 보이지 않습니다.

**Correct (route page가 screen flow와 runtime handoff를 계속 소유):**

```astro
---
import "./_entry-admin.css";
import Document from "@/pages/_document.astro";
import EntryAdminRuntime from "./_local/entry-admin-runtime.tsx";
import { getEntryAdminInitialState } from "./_entry-admin";

const initialState = await getEntryAdminInitialState();
const hasEntries = initialState.entries.length > 0;
---

<Document currentPathname={Astro.url.pathname} pageTitle="admin entries" pageNoIndex>
	<section class="rt_adminEntriesIndex__root">
		<header class="rt_adminEntriesIndex__header">
			<h1>Entries</h1>
		</header>

		{hasEntries ? (
			<EntryAdminRuntime client:load initialState={initialState} />
		) : (
			<p class="rt_adminEntriesIndex__empty">No entries yet.</p>
		)}
	</section>
</Document>
```

이 예시는 React runtime이 필요해도 route entry가 document handoff, server data, high-level branch,
`rt_*` surface owner를 계속 보여 줍니다.

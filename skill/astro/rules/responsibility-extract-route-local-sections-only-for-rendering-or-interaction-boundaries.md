---
title: Extract Route-local Sections Only for Rendering or Interaction Boundaries
titleKo: route-local 섹션은 렌더링·상호작용 경계일 때만 추출
impact: HIGH
impactDescription: 조급한 _local/ 섹션 추출 없이 route 페이지를 읽을 수 있게 유지함
tags: responsibility, local, islands, boundaries
---

## Extract Route-local Sections Only for Rendering or Interaction Boundaries

**Impact: HIGH (조급한 _local/ 섹션 추출 없이 route 페이지를 읽을 수 있게 유지함)**

Move a section into `src/pages/**/_local/` only when it owns a real rendering or interaction boundary.

추출할 수 있는 경계:

- `client:*` or `client:only` hydration
- `server:defer` with fallback
- form/action ownership
- provider setup
- browser-only custom element or script behavior
- third-party widget adapter
- repeated slot contract

Do not extract a component just because a heading/body/footer group looks like a section.
If the subtree still describes the same route surface,
keep the route `rt_*` owner instead of inventing a `loc_*` namespace.

**Incorrect (simple page markup is split into `_local/` wrappers):**

```astro
---
import EntryBodySection from "./_local/entry-body-section.astro";
import EntryHeaderSection from "./_local/entry-header-section.astro";
import EntryMetaSection from "./_local/entry-meta-section.astro";

const { entry } = Astro.props;
---

<article class="rt_entryDetail__root">
	<EntryHeaderSection entry={entry} />
	<EntryMetaSection entry={entry} />
	<EntryBodySection html={entry.html} />
</article>
```

이 세 section이 단순 markup grouping뿐이라면 routed page의 흐름만 숨깁니다.

**Correct (boundary가 있는 subtree만 `_local/`로 분리):**

```astro
---
import RelatedEntriesPanel from "./_local/related-entries-panel.astro";
import EntryReactionIsland from "./_local/entry-reaction-island.tsx";

const { entry, relatedEntries } = Astro.props;
---

<article class="rt_entryDetail__root">
	<header class="rt_entryDetail__header">
		<h1>{entry.title}</h1>
		<p>{entry.description}</p>
	</header>

	<div class="rt_entryDetail__meta">
		<span>{entry.author}</span>
		<span>{entry.publishedAtLabel}</span>
	</div>

	<div class="rt_entryDetail__body" set:html={entry.html} />

	<RelatedEntriesPanel server:defer entries={relatedEntries}>
		<p slot="fallback">Loading related entries...</p>
	</RelatedEntriesPanel>

	<EntryReactionIsland client:visible entryId={entry.id} />
</article>
```

이 예시에서는 deferred panel과 hydrated island처럼 runtime 경계가 있는 부분만 `_local/`로 내리고,
route의 본문 흐름은 routed page에서 읽히게 유지합니다.

---
title: Extract Route-local Sections Only for Rendering or Interaction Boundaries
impact: HIGH
impactDescription: keeps routed pages readable while avoiding premature `_local/` section extraction
tags: responsibility, local, islands, boundaries
---

## Extract Route-local Sections Only for Rendering or Interaction Boundaries

**Impact: HIGH (keeps routed pages readable while avoiding premature `_local/` section extraction)**

Move a section into `src/pages/**/_local/` only when it owns a real boundary: `client:*` or `client:only` hydration, `server:defer` with fallback, form/action ownership, provider setup, browser-only custom element/script behavior, a third-party widget adapter, or a repeated slot contract. Do not extract a component just because a heading/body/footer group looks like a section. If the subtree still describes the same route surface, keep the route `rt_*` owner instead of inventing a `loc_*` namespace.

**Incorrect (simple page markup is split into `_local/` wrappers):**

```astro
---
import PostBodySection from "./_local/post-body-section.astro";
import PostHeaderSection from "./_local/post-header-section.astro";
import PostMetaSection from "./_local/post-meta-section.astro";

const { post } = Astro.props;
---

<article class="rt_ps__root">
	<PostHeaderSection post={post} />
	<PostMetaSection post={post} />
	<PostBodySection html={post.html} />
</article>
```

이 세 section이 단순 markup grouping뿐이라면 routed page의 흐름만 숨깁니다.

**Correct (boundary가 있는 subtree만 `_local/`로 분리):**

```astro
---
import RelatedPostsPanel from "./_local/related-posts-panel.astro";
import PostReactionIsland from "./_local/post-reaction-island.tsx";

const { post, relatedPosts } = Astro.props;
---

<article class="rt_ps__root">
	<header class="rt_ps__header">
		<h1>{post.title}</h1>
		<p>{post.description}</p>
	</header>

	<div class="rt_ps__meta">
		<span>{post.author}</span>
		<span>{post.publishedAtLabel}</span>
	</div>

	<div class="rt_ps__body" set:html={post.html} />

	<RelatedPostsPanel server:defer posts={relatedPosts}>
		<p slot="fallback">Loading related posts...</p>
	</RelatedPostsPanel>

	<PostReactionIsland client:visible postId={post.id} />
</article>
```

이 예시에서는 deferred panel과 hydrated island처럼 runtime 경계가 있는 부분만 `_local/`로 내리고, route의 본문 흐름은 routed page에서 읽히게 유지합니다.

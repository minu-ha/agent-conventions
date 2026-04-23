---
title: Extract Feature-private Sections Only for Rendering or Interaction Boundaries
impact: HIGH
impactDescription: keeps feature pages readable while avoiding premature `private/` section extraction
tags: responsibility, private, islands, boundaries
---

## Extract Feature-private Sections Only for Rendering or Interaction Boundaries

**Impact: HIGH (keeps feature pages readable while avoiding premature `private/` section extraction)**

feature page에서 `private/` component를 추출할지는 "섹션처럼 보이느냐"가 아니라 실제 rendering boundary나 interaction boundary를 소유하느냐로 판단합니다. Astro 기준으로는 `client:*`나 `client:only` hydration, `server:defer`와 fallback slot, form/action ownership, custom element나 inline `<script>`가 붙는 브라우저 동작, props adapter가 복잡한 third-party widget, slot contract를 가진 reusable partial 같은 경우에만 `private/` section으로 분리할 가치가 있습니다. 반대로 단순 layout wrapper, heading/body/footer grouping, 들여쓰기 감소만을 위한 component 추출은 feature page의 흐름만 숨기므로 기본값으로 삼지 않습니다. 이때 `private/`로 내린 subtree도 여전히 같은 page surface owner를 설명한다면 `loc_*`로 namespace를 새로 만들지 말고 `ft_postDetail__*`처럼 같은 `ft_*` ownership을 유지합니다.

**Incorrect (단순한 화면 덩어리를 모두 `private/` section으로 쪼갬):**

```astro
---
import PostBodySection from "./private/post-body-section.astro";
import PostHeaderSection from "./private/post-header-section.astro";
import PostMetaSection from "./private/post-meta-section.astro";

const { pageModel } = Astro.props;
---

<article class="ft_postDetail__root">
	<PostHeaderSection post={pageModel.post} />
	<PostMetaSection post={pageModel.post} />
	<PostBodySection html={pageModel.post.html} />
</article>
```

이 세 section이 하는 일이 단순 markup grouping뿐이라면 분리 이유가 약합니다. 읽는 사람은 실제로 boundary가 있는 부분과 아닌 부분을 구분하기 어려워집니다.

**Correct (boundary가 있는 subtree만 `private/`로 분리):**

```astro
---
import NewsletterSignupIsland from "./private/newsletter-signup-island.tsx";
import RelatedPostsPanel from "./private/related-posts-panel.astro";
import type { PostDetailPageModel } from "./post";

/**
 * @summary 포스트 상세 feature screen props
 */
interface Props {
	pageModel: PostDetailPageModel;
}

const { pageModel } = Astro.props;
---

<article class="ft_postDetail__root">
	<header class="ft_postDetail__header">
		<h1>{pageModel.post.title}</h1>
		<p>{pageModel.post.description}</p>
	</header>

	<div class="ft_postDetail__meta">
		<span>{pageModel.post.author}</span>
		<span>{pageModel.post.publishedAtLabel}</span>
	</div>

	<div class="ft_postDetail__body" set:html={pageModel.post.html} />

	<RelatedPostsPanel server:defer posts={pageModel.relatedPosts}>
		<p slot="fallback">Loading related posts...</p>
	</RelatedPostsPanel>

	<NewsletterSignupIsland client:visible postId={pageModel.post.id} />
</article>
```

이 예시에서는 deferred related posts와 hydrated signup widget처럼 실제 boundary가 있는 부분만 `private/` component로 추출하고, 단순한 header/meta/body markup은 feature page에 남겨 화면 흐름을 보이게 유지합니다.

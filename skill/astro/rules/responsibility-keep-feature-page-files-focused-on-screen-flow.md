---
title: Keep Feature Page Files Focused on Screen Flow
impact: HIGH
impactDescription: keeps `src/features/<feature>/*-page.astro` readable as the main screen orchestration layer after route handoff
tags: responsibility, features, screen-flow
---

## Keep Feature Page Files Focused on Screen Flow

**Impact: HIGH (keeps `src/features/<feature>/*-page.astro` readable as the main screen orchestration layer after route handoff)**

`src/pages`가 route contract와 data handoff를 끝내고 나면 `src/features/<feature>/*-page.astro`가 화면의 주 orchestration owner가 됩니다. 이 파일에는 section 순서, page-scoped derived value, `Astro.props`에서 받은 data의 화면용 분기, empty state 선택, slot/layout 조립, island prop handoff 같은 화면 흐름이 계속 보여야 합니다. feature page는 동시에 `ft_*` screen surface owner이기도 하므로, `ft_posts__*`, `ft_postDetail__*`, `ft_notes__*`처럼 해당 page의 주 클래스 namespace가 이 파일에서 읽히는 편이 좋습니다. 단순히 마크업 덩어리가 커 보인다는 이유만으로 feature page를 `private/` section wrapper들의 나열로 바꾸지 않습니다. 실제 rendering boundary나 interaction boundary를 가진 subtree만 아래로 내리고, 나머지 화면 흐름은 feature page에서 읽히게 둡니다.

**Incorrect (feature page가 단순 wrapper 나열만 남아 화면 흐름을 숨김):**

```astro
---
import PostHeroSection from "./private/post-hero-section.astro";
import PostFilterSection from "./private/post-filter-section.astro";
import PostListSection from "./private/post-list-section.astro";
import PostPaginationSection from "./private/post-pagination-section.astro";
---

<PostHeroSection />
<PostFilterSection />
<PostListSection />
<PostPaginationSection />
```

이 구조만 보면 어떤 data를 기준으로 분기하는지, 어떤 island가 선택을 바꾸는지, empty state가 어디서 결정되는지 feature page에서 전혀 보이지 않습니다.

**Correct (feature page가 screen flow와 page-level handoff를 계속 소유):**

```astro
---
import PostListItem from "./private/post-list-item.astro";
import PostFiltersIsland from "./private/post-filters-island.tsx";
import type { PostsPageModel } from "./post";

/**
 * @summary 포스트 목록 feature screen props
 */
interface Props {
	pageModel: PostsPageModel;
	selectedTag?: string;
}

const { pageModel, selectedTag } = Astro.props;
const visiblePosts = selectedTag
	? pageModel.posts.filter((post) => post.tags.includes(selectedTag))
	: pageModel.posts;
const hasVisiblePosts = visiblePosts.length > 0;
---

<section class="ft_posts__root">
	<header class="ft_posts__header">
		<h1>{pageModel.title}</h1>
		<p>{pageModel.description}</p>
	</header>

	<PostFiltersIsland
		client:idle
		availableTags={pageModel.availableTags}
		selectedTag={selectedTag}
	/>

	{hasVisiblePosts ? (
		<ul class="ft_posts__list">
			{visiblePosts.map((post) => (
				<PostListItem post={post} />
			))}
		</ul>
	) : (
		<p class="ft_posts__empty">No posts match this filter.</p>
	)}
</section>
```

이 예시는 filter island와 list item처럼 경계가 있는 subtree만 분리하고, 전체 화면 순서와 empty state 선택은 feature page에서 계속 읽히게 유지합니다.

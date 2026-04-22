---
title: Extract Feature Support Code Only When the Astro Boundary Is Real
impact: HIGH
impactDescription: prevents feature pages from scattering one-off frontmatter logic into generic helpers
tags: responsibility, support-code, frontmatter, naming
---

## Extract Feature Support Code Only When the Astro Boundary Is Real

**Impact: HIGH (prevents feature pages from scattering one-off frontmatter logic into generic helpers)**

feature page frontmatter의 support code는 입력과 출력 계약이 분명하고, 페이지에서 치우면 화면 흐름이 더 잘 읽히며, 다른 entry에서도 같은 owner가 재사용할 가치가 있을 때만 `src/features/<feature>/<feature>.ts` 같은 support module로 옮깁니다. 컬렉션 응답 정규화, page model 조립, metadata helper, shared query argument 생성처럼 server-side data shaping 역할은 옮길 수 있습니다. 반대로 작은 1회성 boolean branch, `Astro.props` destructuring 바로 옆이 가장 읽기 쉬운 계산, 현재 page에만 붙는 `class:list` 조건, 짧은 empty-state label 선택은 feature page frontmatter에 남깁니다. `utils.ts`, `helpers.ts`, `common.ts` 같은 generic 파일명은 만들지 않고 owner-named module을 사용합니다.

**Incorrect (작은 page-local 계산을 generic helper로 흩뿌림):**

```ts
// src/features/post/utils.ts
export const getHasActiveTag = (selectedTag?: string) => {
	return typeof selectedTag === "string" && selectedTag.length > 0;
};

export const getEmptyMessage = (selectedTag?: string) => {
	return selectedTag ? "No posts match this filter." : "No published posts yet.";
};
```

이 정도 로직은 feature page frontmatter 바로 옆이 더 읽기 쉽고, `utils.ts`라는 이름도 ownership을 흐립니다.

**Correct (owner-named support module에는 진짜 data boundary만 둠):**

```ts
// src/features/post/post.ts
/**
 * @helper post collection 응답을 목록 화면 model로 정규화
 */
export const buildPostListPageModel = (posts: PostCollectionEntry[]) => {
	return {
		title: "Posts",
		description: "Latest writing from the team.",
		availableTags: [...new Set(posts.flatMap((post) => post.data.tags))].sort(),
		posts: posts.map((post) => ({
			id: post.id,
			title: post.data.title,
			description: post.data.description,
			tags: post.data.tags,
			href: `/post/${post.slug}/`,
		})),
	};
};
```

```astro
---
import type { PostListPageModel } from "./post";

/**
 * @summary 포스트 목록 feature screen props
 */
interface Props {
	pageModel: PostListPageModel;
	selectedTag?: string;
}

const { pageModel, selectedTag } = Astro.props;
const hasActiveTag = typeof selectedTag === "string" && selectedTag.length > 0;
const emptyMessage = hasActiveTag
	? "No posts match this filter."
	: "No published posts yet.";
---
```

이 구조에서는 collection normalization 같은 실제 data boundary만 `post.ts`에 두고, 현재 feature page 흐름을 읽는 데 필요한 작은 분기와 문구 선택은 frontmatter에 남겨 둡니다.

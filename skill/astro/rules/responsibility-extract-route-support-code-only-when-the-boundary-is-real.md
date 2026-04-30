---
title: Extract Route Support Code Only When the Boundary Is Real
impact: HIGH
impactDescription: prevents routed pages from scattering one-off frontmatter logic into generic helper files
tags: responsibility, support-code, frontmatter, naming
---

## Extract Route Support Code Only When the Boundary Is Real

**Impact: HIGH (prevents routed pages from scattering one-off frontmatter logic into generic helper files)**

Route page frontmatter support code should move into `_index.ts`, `_slug.ts`, `_post-admin.ts`, or another owner-named route support module only when the input/output contract is clear and the code represents a real data, validation, auth, serialization, or model-building boundary. Keep small one-off booleans, `Astro.props` destructuring, page-local labels, `class:list` conditions, and empty-state branch choices in the page file. Do not create `_form.ts`, `_api.ts`, `utils.ts`, `helpers.ts`, or `common.ts` unless the owner name makes the boundary explicit.

**Incorrect (small route-local calculations are scattered into generic helpers):**

```ts
// src/pages/admin/posts/_form.ts
export const getHasActiveFilter = (filter?: string) => Boolean(filter);

export const getEmptyMessage = (filter?: string) => {
	return filter ? "No posts match this filter." : "No posts yet.";
};
```

이 정도 로직은 routed page frontmatter 바로 옆이 더 읽기 쉽고, `_form.ts`라는 이름도 실제 owner를 설명하지 못합니다.

**Correct (owner-named support module에는 실제 route data boundary만 둠):**

```ts
// src/pages/admin/posts/_post-admin.ts
import type { PostAdminInitialState } from "./_local/post-admin-runtime";

/**
 * @summary admin posts 화면의 초기 server state를 만든다.
 */
export const getPostAdminInitialState = async (): Promise<PostAdminInitialState> => {
	const posts = await postAdminApi.listPosts();

	return {
		posts: posts.map(toPostAdminRow),
	};
};
```

```astro
---
import { getPostAdminInitialState } from "./_post-admin";

const initialState = await getPostAdminInitialState();
const hasPosts = initialState.posts.length > 0;
const emptyMessage = hasPosts ? undefined : "No posts yet.";
---
```

이 구조에서는 API normalization과 initial state 조립만 support module로 내리고, 현재 route의 branch와 문구 선택은 page frontmatter에 남깁니다.

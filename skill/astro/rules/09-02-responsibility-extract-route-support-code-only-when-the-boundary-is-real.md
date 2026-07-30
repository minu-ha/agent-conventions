---
title: Extract Route Support Code Only When the Boundary Is Real
titleKo: route support 코드는 경계가 실재할 때만 추출
impact: HIGH
impactDescription: route 페이지의 일회성 frontmatter 로직이 generic 헬퍼 파일로 흩어지는 것을 막음
tags: responsibility, support-code, frontmatter, naming
---

## Extract Route Support Code Only When the Boundary Is Real

**Impact: HIGH (route 페이지의 일회성 frontmatter 로직이 generic 헬퍼 파일로 흩어지는 것을 막음)**

Route page frontmatter support code should move into owner-named support modules only when the boundary is real.

추출할 수 있는 것:

- clear input/output data boundary
- validation, auth, serialization, model building
- shared route-family data loader

Page file에 남길 것:

- small one-off booleans
- `Astro.props` destructuring
- page-local labels
- `class:list` conditions
- empty-state branch choices

Do not create `_form.ts`, `_api.ts`, `utils.ts`, `helpers.ts`,
or `common.ts` unless the owner name makes the boundary explicit.

**Incorrect (small route-local calculations are scattered into generic helpers):**

```ts
// src/pages/admin/entries/_form.ts
export const getHasActiveFilter = (filter?: string) => Boolean(filter);

export const getEmptyMessage = (filter?: string) => {
	return filter ? "No entries match this filter." : "No entries yet.";
};
```

이 정도 로직은 routed page frontmatter 바로 옆이 더 읽기 쉽고, `_form.ts`라는 이름도 실제 owner를 설명하지 못합니다.

**Correct (owner-named support module에는 실제 route data boundary만 둠):**

```ts
// src/pages/admin/entries/_entry-admin.ts
import type { EntryAdminInitialState } from "./_local/entry-admin-runtime";

/**
 * @summary admin entries 화면의 초기 server state를 만든다.
 */
export const getEntryAdminInitialState = async (): Promise<EntryAdminInitialState> => {
	const entries = await entryAdminApi.listEntries();

	return {
		entries: entries.map(toEntryAdminRow),
	};
};
```

```astro
---
import { getEntryAdminInitialState } from "./_entry-admin";

const initialState = await getEntryAdminInitialState();
const hasEntries = initialState.entries.length > 0;
const emptyMessage = hasEntries ? undefined : "No entries yet.";
---
```

이 구조에서는 API normalization과 initial state 조립만 support module로 내리고,
현재 route의 branch와 문구 선택은 page frontmatter에 남깁니다.

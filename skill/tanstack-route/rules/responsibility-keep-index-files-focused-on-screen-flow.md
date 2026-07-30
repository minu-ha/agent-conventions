---
title: Keep `*.index.tsx` Files Focused on Screen Flow
titleKo: *.index.tsx는 화면 흐름에 집중
impact: HIGH
impactDescription: preserves a readable route entry where screen assembly, hooks, and handlers stay visible
tags: index-files, screen-flow, ownership
---

## Keep `*.index.tsx` Files Focused on Screen Flow

**Impact: HIGH (preserves a readable route entry where screen assembly, hooks, and handlers stay visible)**

`*.index.tsx`는 실제 화면 렌더링, API hook, 이벤트 핸들러, search 기반 상태 동기화, 화면 조립을 담당합니다.
entry file이 순수 helper, 대형 상수, route 외부 재사용 로직까지 떠안기 시작하면
화면 흐름이 흐려지므로 route-local support module과 `-local/`로 책임을 분리합니다.
작은 1회성 guard나 사용 지점 바로 옆이 더 읽기 쉬운 계산은 entry file에 남길 수 있습니다.

**Incorrect (entry file에 화면 흐름과 무관한 support code를 누적):**

```tsx
const DEFAULT_COLUMNS = ["name", "role", "status"] as const;

const normalizeMembersSearch = (value: string | undefined) => {
	return value?.trim().toLowerCase() ?? "";
};

export const Route = createFileRoute("/app/(members)/members/")({
	component: MembersIndex,
});
```

**Correct (entry file은 화면 흐름을 보여주고 support code는 owner-named module로 분리):**

```tsx
import {normalizeMembersSearch} from "./members";
import {MembersToolbar} from "./-local/members-toolbar";

export const Route = createFileRoute("/app/(members)/members/")({
	component: MembersIndex,
});

function MembersIndex() {
	const search = Route.useSearch();
	const normalizedKeyword = normalizeMembersSearch(search.keyword);

	return <MembersToolbar keyword={normalizedKeyword} />;
}
```

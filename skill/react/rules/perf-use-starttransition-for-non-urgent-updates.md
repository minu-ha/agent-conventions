---
title: Use startTransition for Non-urgent Visual Updates
impact: MEDIUM
impactDescription: keeps interactions responsive when a state change triggers a heavy list, table, or tree update
appliesWhen: 클릭·선택·필터 변경 뒤 큰 list·table·tree를 다시 그리는 state update의 우선순위나 transition 처리를 바꾼다.
tags: state, transitions, starttransition, performance
---

## Use startTransition for Non-urgent Visual Updates

**Impact: MEDIUM (keeps interactions responsive when a state change triggers a heavy list, table, or tree update)**

클릭이나 선택 이후 무거운 list, table, tree 렌더가 따라오는 비긴급 시각 업데이트는 `startTransition`으로 감쌉니다.
입력값 자체, 폼 에러, 즉시 비활성화 같은 urgent feedback까지 transition에 넣지는 않습니다.

**Incorrect (무거운 비긴급 업데이트를 urgent state로 처리):**

```tsx
const handleStatusFilterChange = (nextStatus: EntryStatusFilter) => {
	setStatusFilter(nextStatus);
};
```

**Correct (비긴급 시각 업데이트는 transition으로 내림):**

```tsx
/**
 * @event 상태 필터 변경으로 인한 무거운 목록 갱신을 transition으로 예약
 */
const handleStatusFilterChange = (nextStatus: EntryStatusFilter) => {
	startTransition(() => {
		setStatusFilter(nextStatus);
	});
};
```

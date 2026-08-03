---
title: Use startTransition for Non-urgent Visual Updates
titleKo: 급하지 않은 화면 갱신은 startTransition 으로 넘깁니다
impact: MEDIUM
impactDescription: 상태 변경이 무거운 목록이나 표를 건드릴 때도 반응이 유지됩니다
appliesWhen:
  - 클릭·선택·필터 변경 뒤 큰 list·table·tree를 다시 그리는 상태 update를 다룰 때
  - 상태 update의 우선순위나 전환 처리를 바꿀 때
tags: state, transitions, starttransition, performance
---

## Use startTransition for Non-urgent Visual Updates

**Impact: MEDIUM (상태 변경이 무거운 목록이나 표를 건드릴 때도 반응이 유지됩니다)**

클릭이나 선택 이후 무거운 list, table, tree 렌더가 따라오는 비긴급 시각 업데이트는 `startTransition`으로 감쌉니다.
입력값 자체, 폼 에러, 즉시 비활성화 같은 urgent feedback까지 전환에 넣지는 않습니다.

**Incorrect (무거운 비긴급 업데이트를 urgent 상태로 처리):**

```tsx
const handleStatusFilterChange = (nextStatus: EntryStatusFilter) => {
	setStatusFilter(nextStatus);
};
```

**Correct (비긴급 시각 업데이트는 전환으로 내림):**

```tsx
/**
 * 상태 필터 변경으로 인한 무거운 목록 갱신을 transition으로 예약
 */
const handleStatusFilterChange = (nextStatus: EntryStatusFilter) => {
	startTransition(() => {
		setStatusFilter(nextStatus);
	});
};
```

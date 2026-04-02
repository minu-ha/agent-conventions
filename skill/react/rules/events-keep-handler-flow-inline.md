---
title: Keep Screen-specific Handler Flow Inline Until a Real Utility Emerges
impact: MEDIUM
impactDescription: 모든 분기를 작은 helper로 쪼개지 않고도 가독성을 유지함
tags: events, handlers, flow
---

## Keep Screen-specific Handler Flow Inline Until a Real Utility Emerges

**Impact: MEDIUM (모든 분기를 작은 helper로 쪼개지 않고도 가독성을 유지함)**

핸들러가 길어져도 바로 helper로 쪼개지 않습니다. 먼저 early return, 단계적 지역 변수, 의미 있는 블록 구분으로 읽기 쉽게 유지하고, `screen-extract-utilities-selectively` 규칙을 만족할 때만 분리합니다.

**Incorrect (재사용 근거 없이 흐름을 지나치게 분해):**

```ts
const validate = () => {/* ... */};
const buildRequest = () => {/* ... */};
const runMutation = async () => {/* ... */};
const postProcess = () => {/* ... */};
```

**Correct (핸들러에서 흐름을 직접 읽을 수 있게 유지):**

```ts
const handleSubmitButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  if (!responseContentTypeGetListSuspense.data.selectedTable) {
    return;
  }

  if (mutationContentTypeUpsert.isPending) {
    return;
  }

  await mutationContentTypeUpsert.mutateAsync({ data: request });
  void navigate({ to: "/content-type-builder" });
};
```

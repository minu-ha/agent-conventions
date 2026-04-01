---
title: Avoid Silent Fallback Defaults and Ad-hoc Loading Branches
impact: HIGH
impactDescription: keeps missing data visible and pushes loading UX toward Suspense or explicit exception handling
tags: state, fallback, loading, suspense
---

## Avoid Silent Fallback Defaults and Ad-hoc Loading Branches

**Impact: HIGH (keeps missing data visible and pushes loading UX toward Suspense or explicit exception handling)**

옵셔널 값에 `??`, `||`로 습관적인 기본값을 넣지 않고, `isPending`, `isFetching` 같은 상태를 즉시 렌더링하지 않습니다. 결측값은 드러내고, 로딩은 기본적으로 Suspense 경계나 상위 레이아웃에서 처리합니다. 예외가 필요하면 가까운 한글 주석으로 이유를 남깁니다.

**Incorrect (결측과 로딩을 즉석에서 숨김):**

```tsx
const name = responseUserGetItemSuspense.data?.name ?? "";

if (responseUserGetItemSuspense.isPending) {
  return <Spinner />;
}
```

**Correct (결측을 드러내고 의도 있는 분기만 허용):**

```tsx
const name = responseUserGetItemSuspense.data?.name;

return (
  <Activity mode={name ? "visible" : "hidden"}>
    <UserName value={name} />
  </Activity>
);
```

---
title: Avoid Silent Fallback Defaults and Ad-hoc Loading Branches
titleKo: 조용한 fallback 기본값과 임시 loading 분기 피하기
impact: HIGH
impactDescription: 결측 데이터를 숨기지 않고 로딩 UX를 Suspense 또는 명시적 예외 처리 쪽으로 유도함
appliesWhen: >-
  optional 응답에 `??`·`||` 기본값을 넣거나 Suspense 화면 본문에 초기 loading return을 추가·변경하고 결측·로딩 UX를
  다룬다.
reviewWith: >-
  data-preserve-origin-chaining, screen-keep-derived-values-close,
  typescript/absence-expose-optional-values-instead-of-silent-fallbacks
tags: state, fallback, loading, suspense
---

## Avoid Silent Fallback Defaults and Ad-hoc Loading Branches

**Impact: HIGH (결측 데이터를 숨기지 않고 로딩 UX를 Suspense 또는 명시적 예외 처리 쪽으로 유도함)**

옵셔널 값에 `??`, `||`로 습관적인 기본값을 넣지 않습니다.
Suspense query의 초기 blocking 로딩도 화면 본문에서 즉석 분기하지 않습니다.
결측값은 드러내고, 초기 로딩은 Suspense 경계나 상위 레이아웃에서 처리합니다.

- `isPending`, `isFetching` 같은 상태는 기존 UI를 보조하는 좁은 용도로만 씁니다.
  버튼 비활성화, background refetch indicator, 저장 중 배지가 그런 경우입니다.
- 화면 전체를 가리는 로컬 loading 분기가 꼭 필요하면 가까운 한글 주석으로 이유를 남깁니다.

**Incorrect (결측과 로딩을 즉석에서 숨김):**

```tsx
const name = responseUserGetItemSuspense.data?.name ?? "";

if (responseUserGetItemSuspense.isPending) {
  return <Spinner />;
}
```

**Correct (결측은 명시적으로 드러내고, pending/fetching은 보조 UI에만 사용):**

```tsx
if (!responseUserGetItemSuspense.data?.name) {
  return (
    <>
      <UserNameEmptyState />
      <UiButton disabled={mutationUserSave.isPending}>저장</UiButton>
      {responseUserGetItemSuspense.isFetching ? <RefreshIndicator /> : null}
    </>
  );
}

return (
  <>
    <UserName value={responseUserGetItemSuspense.data.name} />
    <UiButton disabled={mutationUserSave.isPending}>저장</UiButton>
    {responseUserGetItemSuspense.isFetching ? <RefreshIndicator /> : null}
  </>
);
```

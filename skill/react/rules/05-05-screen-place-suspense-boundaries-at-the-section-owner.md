---
title: Place Suspense Boundaries at the Section Owner
titleKo: `Suspense` 경계는 섹션 소유자에 둡니다
impact: HIGH
impactDescription: 막는 로딩을 화면 본문이 아니라 정해진 한 자리에서 처리합니다
appliesWhen:
  - `Suspense` 쿼리를 쓰는 화면에서 로딩 대체 화면의 위치를 정할 때
  - `Suspense` 경계를 추가하거나 옮길 때
requiresSelected: screen-avoid-ad-hoc-loading-branches
reviewWith: screen-extract-local-section-components-for-runtime-boundaries
tags: screen, suspense, loading
---

## Place Suspense Boundaries at the Section Owner

**Impact: HIGH (막는 로딩을 화면 본문이 아니라 정해진 한 자리에서 처리합니다)**

`Suspense` 쿼리를 쓰는 컴포넌트마다 그 **바로 위 섹션 소유자**가 경계를 갖습니다.
경계와 대체 화면은 거기 한 곳에만 둡니다.

- 섹션이 따로 없으면 라우트 진입이 경계를 갖습니다.
- 라우트 진입이 직접 쿼리를 부르면 그 라우트의 레이아웃이나 상위 라우트가 경계를 갖습니다.
  자기 자신을 감쌀 수 없기 때문입니다.
- 한 화면에 경계를 여러 겹 쌓지 않습니다.
  섹션이 독립적으로 채워져야 할 때만 나눕니다.
- 대체 화면은 실제 내용과 같은 컨테이너 클래스 안에 넣습니다.
  높이를 대체 화면에만 따로 적으면 실제 내용이 들어올 때 그 값이 남아 레이아웃이 튑니다.
- 쿼리를 부르는 컴포넌트 자신은 경계를 갖지 않습니다.
  자기 자신을 감쌀 수 없습니다.

경계가 있으므로 화면 본문에는 로딩 분기가 남지 않습니다.
그 판정은 `screen-avoid-ad-hoc-loading-branches`가 합니다.

**Incorrect (진입에 경계가 없어 화면 전체가 함께 멈춤):**

```tsx
export const PgProductTreeSection = () => {
  const responseProductTreeSuspense = useProductTreeSuspense();

  return <UiTree nodes={responseProductTreeSuspense.data.categoryNodes} />;
};
```

```tsx
// 진입 파일: 경계가 없어 화면 전체가 함께 멈춘다
return <PgProductTreeSection />;
```

**Correct (섹션 소유자가 경계와 대체 화면을 가짐):**

```tsx
return (
  <Suspense fallback={<PgProductTreeSkeleton />}>
    <PgProductTreeSection />
  </Suspense>
);
```

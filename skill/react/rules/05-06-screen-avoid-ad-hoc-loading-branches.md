---
title: Avoid Ad-hoc Loading Branches in Screen Bodies
titleKo: 화면 본문에서 로딩 분기를 즉석으로 만들지 않습니다
impact: HIGH
impactDescription: 초기 로딩은 Suspense 경계가 맡고 화면 본문에는 데이터가 있는 경로만 남습니다
appliesWhen:
  - Suspense 쿼리를 쓰는 화면 본문에 초기 로딩 반환을 추가·변경할 때
  - `isFetching`이나 뮤테이션 `isPending`으로 화면을 가리는 분기를 넣을 때
  - 제외: 선택 값에 기본값을 채우는 것만 바꾸는 경우
requiresSelected: typescript/absence-expose-optional-values-instead-of-silent-fallbacks
reviewWith: data-preserve-origin-chaining, screen-keep-derived-values-close
tags: screen, loading, suspense
---

## Avoid Ad-hoc Loading Branches in Screen Bodies

**Impact: HIGH (초기 로딩은 Suspense 경계가 맡고 화면 본문에는 데이터가 있는 경로만 남습니다)**

Suspense 쿼리를 쓰는 화면은 본문에서 초기 로딩을 다시 분기하지 않습니다.
막는 로딩은 Suspense 경계나 상위 레이아웃이 이미 처리합니다.

- `isFetching`은 이미 그려진 화면을 보조할 때만 씁니다.
  Suspense 쿼리의 `isPending`은 타입이 `false`로 고정되어 분기 자체가 죽은 코드입니다.
  뮤테이션의 `isPending`은 씁니다.
  버튼 비활성화, 백그라운드 다시 불러오기 표시, 저장 중 배지가 그런 경우입니다.
- 화면 전체를 가리는 지역 로딩 분기가 꼭 필요하면 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 이유를 남깁니다.

값이 없을 수 있다는 사실을 기본값으로 덮는 문제는 이 규칙이 아니라
`typescript/absence-expose-optional-values-instead-of-silent-fallbacks`가 판정합니다.
로딩 분기를 고치면서 `??`나 `||`도 함께 손대면 두 규칙이 같이 걸립니다.

**Incorrect (Suspense 쿼리 화면에서 초기 로딩을 다시 분기):**

```tsx
if (responseUserGetItemSuspense.isFetching) {
  return <Spinner />;
}

return <UserName value={responseUserGetItemSuspense.data.name} />;
```

**Correct (로딩과 갱신 상태는 보조 UI에만 사용):**

```tsx
return (
  <>
    <UserName value={responseUserGetItemSuspense.data.name} />
    <UiButton disabled={mutationUserSave.isPending}>저장</UiButton>
    {responseUserGetItemSuspense.isFetching ? <RefreshIndicator /> : null}
  </>
);
```

**Correct (가리는 분기가 필요하면 이유를 남김):**

```tsx
// 결제 위젯은 금액 확정 전에 그리면 외부 SDK 가 잘못된 금액으로 초기화된다
if (mutationOrderConfirm.isPending) {
  return <OrderConfirmingScreen />;
}
```

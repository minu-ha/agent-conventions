---
title: Avoid Ad-hoc Loading and Failure Branches in Screen Bodies
titleKo: 화면 본문에 초기 로딩 · 실패 분기를 추가하지 않습니다
impact: HIGH
impactDescription: 초기 로딩과 실패는 경계가 맡고 화면 본문에는 데이터가 있는 경로만 남습니다
appliesWhen:
  - `Suspense` 쿼리를 쓰는 화면 본문에 초기 로딩 반환을 추가 · 변경할 때
  - `isFetching`이나 뮤테이션 `isPending`으로 화면을 가리는 분기를 넣을 때
  - 제외: 선택 값에 기본값을 채우는 것만 바꾸는 경우
reviewWith: >-
  data-preserve-origin-chaining, screen-keep-derived-values-close,
  typescript/absence-expose-optional-values-instead-of-silent-fallbacks
tags: screen, loading, suspense
---

## Avoid Ad-hoc Loading and Failure Branches in Screen Bodies

**Impact: HIGH (초기 로딩과 실패는 경계가 맡고 화면 본문에는 데이터가 있는 경로만 남습니다)**

`Suspense` 쿼리의 초기 로딩은 경계나 상위 레이아웃이 처리하므로 화면 본문에서 다시 분기하지 않습니다.

| 플래그 | 사용 기준 |
| --- | --- |
| Suspense 쿼리의 `isPending` | 타입이 `false`로 고정되어 분기가 죽은 코드입니다 |
| 쿼리의 `isFetching` | 백그라운드 재조회 표시처럼 이미 렌더된 화면을 보조할 때만 씁니다 |
| 쿼리의 `isError` | 초기 실패 대체 화면을 본문에 만들지 않습니다 |
| 뮤테이션의 `isPending` | 버튼 비활성화 · 저장 중 배지 등에 씁니다 |

캐시가 있는 재조회 실패는 `runtime-place-error-boundaries-by-blast-radius`를 따릅니다.
화면을 가리지 않으면 외부 SDK나 폼이 잘못된 값으로 초기화될 때만 본문에 가림 분기를 둡니다.
이 예외는 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`에 따라 이유를 남깁니다.
없는 값을 기본값으로 덮는 문제는 `typescript/absence-expose-optional-values-instead-of-silent-fallbacks`를 따릅니다.

**Incorrect 1 (`Suspense` 쿼리의 `isPending`을 다시 분기합니다. 타입이 `false`라 죽은 코드입니다):**

```tsx
if (responseUserGetItemSuspense.isPending) {
	return <UiSpinner />;
}

return <UiUserName value={responseUserGetItemSuspense.data.name} />;
```

**Correct 1 (초기 로딩은 경계가 받으므로 본문은 데이터가 있는 경로만 렌더합니다):**

```tsx
return <UiUserName value={responseUserGetItemSuspense.data.name} />;
```

**Incorrect 2 (다시 불러오는 중에 화면 전체를 가립니다):**

```tsx
if (responseUserGetItemSuspense.isFetching) {
	return <UiSpinner />;
}

return <UiUserName value={responseUserGetItemSuspense.data.name} />;
```

**Correct 2 (갱신 상태는 이미 렌더된 화면을 보조하는 표시에만 씁니다):**

```tsx
return (
	<Fragment>
		<UiUserName value={responseUserGetItemSuspense.data.name} />
		{responseUserGetItemSuspense.isFetching && <UiRefreshIndicator />}
	</Fragment>
);
```

**Correct (외부 SDK가 잘못 초기화되므로 이유 주석을 남기고 로딩 동안 가립니다):**

```tsx
// 결제 위젯은 마운트할 때 금액을 한 번만 읽는다. 다시 불러오는 중에 그리면 옛 금액으로 초기화된다
if (responseOrderAmountSuspense.isFetching) {
	return <PgOrderAmountLoadingScreen />;
}

return <PgPaymentWidgetSection amount={responseOrderAmountSuspense.data.confirmedAmount} />;
```

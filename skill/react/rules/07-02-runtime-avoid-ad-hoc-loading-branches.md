---
title: Avoid Ad-hoc Loading Branches in Screen Bodies
titleKo: 화면 본문에서 로딩·실패 분기를 그때그때 만들지 않습니다
impact: HIGH
impactDescription: 초기 로딩과 실패는 경계가 맡고 화면 본문에는 데이터가 있는 경로만 남습니다
appliesWhen:
  - `Suspense` 쿼리를 쓰는 화면 본문에 초기 로딩 반환을 추가·변경할 때
  - `isFetching`이나 뮤테이션 `isPending`으로 화면을 가리는 분기를 넣을 때
  - 제외: 선택 값에 기본값을 채우는 것만 바꾸는 경우
reviewWith: >-
  data-preserve-origin-chaining, screen-keep-derived-values-close,
  typescript/absence-expose-optional-values-instead-of-silent-fallbacks
tags: screen, loading, suspense
---

## Avoid Ad-hoc Loading Branches in Screen Bodies

**Impact: HIGH (초기 로딩과 실패는 경계가 맡고 화면 본문에는 데이터가 있는 경로만 남습니다)**

`Suspense` 쿼리를 쓰는 화면은 본문에서 초기 로딩을 다시 분기하지 않습니다.
막는 로딩은 `Suspense` 경계나 상위 레이아웃이 이미 처리합니다.

- `isFetching`은 이미 그려진 화면을 보조할 때만 씁니다.
  `Suspense` 쿼리의 `isPending`은 타입이 `false`로 고정되어 분기 자체가 죽은 코드입니다.
  뮤테이션의 `isPending`은 씁니다.
  버튼 비활성화, 백그라운드 다시 불러오기 표시, 저장 중 배지가 그런 예입니다.
- 실패도 본문에서 `isError`로 다시 분기하지 않습니다.
  받을 자리는 `runtime-place-error-boundaries-by-blast-radius`가 정합니다.
- 가리는 분기는 가리지 않으면 외부 SDK나 폼이 잘못된 값으로 초기화되는 경우에만 씁니다.
  그때 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 이유를 남깁니다.

값이 없을 수 있다는 사실을 기본값으로 덮는 문제는 이 규칙이 아니라
`typescript/absence-expose-optional-values-instead-of-silent-fallbacks`가 판정합니다.

**Incorrect (다시 불러오는 중에 화면 전체를 가림):**

```tsx
if (responseUserGetItemSuspense.isFetching) {
	return <UiSpinner />;
}

return <UiUserName value={responseUserGetItemSuspense.data.name} />;
```

**Correct (로딩과 갱신 상태는 보조 UI에만 사용):**

```tsx
return (
	<Fragment>
		<UiUserName value={responseUserGetItemSuspense.data.name} />
		<UiButton disabled={mutationUserSave.isPending}>저장</UiButton>
		{responseUserGetItemSuspense.isFetching && <UiRefreshIndicator />}
	</Fragment>
);
```

**Correct (가리지 않으면 외부 SDK가 잘못 초기화되어 이유를 남기고 가림):**

```tsx
// 결제 위젯은 마운트할 때 금액을 한 번만 읽는다. 다시 불러오는 중에 그리면 옛 금액으로 초기화된다
if (responseOrderAmountSuspense.isFetching) {
	return <PgOrderAmountLoadingScreen />;
}

return <PgPaymentWidgetSection amount={responseOrderAmountSuspense.data.confirmedAmount} />;
```

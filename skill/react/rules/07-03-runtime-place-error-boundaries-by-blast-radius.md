---
title: Place Error Boundaries by How Much Should Survive
titleKo: 오류 경계는 무엇이 살아남아야 하는지로 자리를 정합니다
impact: HIGH
impactDescription: 쿼리가 실패해도 받을 곳이 있고 화면 본문이 실패 분기로 채워지지 않습니다
appliesWhen:
  - 오류 경계를 추가하거나 옮길 때
  - 화면 본문에 `isError` 분기나 실패 대체 화면 반환을 넣을 때
requiresSelected: runtime-place-suspense-boundaries-at-the-section-owner
tags: screen, errors
---

## Place Error Boundaries by How Much Should Survive

**Impact: HIGH (쿼리가 실패해도 받을 곳이 있고 화면 본문이 실패 분기로 채워지지 않습니다)**

`Suspense` 쿼리는 실패하면 던집니다.
받을 경계가 없으면 화면 전체가 빈 채로 남습니다.

**자리는 "여기가 죽으면 무엇이 같이 죽는가"로 정합니다.** 세 층을 둡니다.

| 층 | 두는 곳 | 이 층이 잡으면 살아남는 것 |
| --- | --- | --- |
| 앱 | 루트 한 번 | 없음. 마지막 안전망이라 하나는 반드시 둠 |
| 화면 | 라우트 진입 | 내비게이션과 레이아웃 셸 |
| 섹션 | `Suspense` 경계와 같은 소유자 | 같은 화면의 다른 섹션 |

섹션 층은 **그 섹션만 죽어도 나머지가 쓸모 있을 때만** 둡니다.
목록이 실패했는데 옆 필터가 살아 있어도 할 수 있는 게 없으면 화면 층으로 충분합니다.

경계 하나가 로딩과 실패를 함께 맡습니다.
`Suspense`와 오류 경계를 같은 소유자에 두면 대체 화면 두 개가 한 자리에 모입니다.
로딩 경계 자리는 `runtime-place-suspense-boundaries-at-the-section-owner`가 정합니다.

화면 본문에 실패 분기를 남기지 않는 판정은 `runtime-avoid-ad-hoc-loading-branches`가 로딩과 함께 봅니다.

**경계가 못 잡는 것이 있습니다.**
이벤트 핸들러와 비동기 콜백에서 난 오류는 경계를 그냥 지나칩니다.
사용자 액션의 실패는 `data-handle-mutation-failure-where-it-is-called`가 정합니다.

오류 경계 컴포넌트는 `ui`에 하나 둔 `UiErrorBoundary`입니다.
리액트는 클래스 컴포넌트로만 경계를 만들 수 있어 그 클래스를 이 래퍼 하나에 가둡니다.
화면 층은 `react-router` 라우트 설정의 `errorElement`로 얹습니다.
라우트 밖에서 감싸야 하면 `UiErrorBoundary`로 진입을 감쌉니다.
어느 쪽이든 경계를 어느 층에 두는지는 위 표가 정합니다.

다시 시도를 열려면 대체 화면에 그 버튼을 둡니다.
그 버튼은 `@tanstack/react-query`의 `useQueryErrorResetBoundary`가 주는 `reset`을 함께 부릅니다.
경계 안에서 상태를 되살릴 수 없으므로 다시 시도는 하위 트리를 새로 마운트합니다.

**Incorrect (경계 없이 화면 본문에서 실패를 분기합니다):**

```tsx
export const PgProducts = () => {
	const responseProductListSuspense = useProductListSuspense();

	if (responseProductListSuspense.isError) {
		return <UiErrorState />;
	}

	return <UiTable rows={responseProductListSuspense.data.products} />;
};
```

**Correct (화면 층 경계가 받고 셸은 살아남습니다):**

```tsx
// component/widget/app-shell/wg-app-shell.tsx
export const WgAppShell = (props: WgAppShellProps) => {
	return (
		<div className={clsx("wg_appShell__root")}>
			<WgAppNavigation />

			<main className={clsx("wg_appShell__main")}>
				<UiErrorBoundary fallback={<UiScreenErrorState />}>
					<Suspense fallback={<UiScreenSkeleton />}>{props.children}</Suspense>
				</UiErrorBoundary>
			</main>
		</div>
	);
};
```

```tsx
// page/products/pg-products.tsx
export const PgProducts = () => {
	/**
	 * 실패하면 셸이 가진 화면 층 경계가 받는다. 본문은 성공 경로만 그린다
	 */
	const responseProductListSuspense = useProductListSuspense();

	return <UiTable rows={responseProductListSuspense.data.products} />;
};
```

**Correct (섹션이 따로 죽어도 나머지가 쓸모 있을 때만 섹션 층에 둡니다):**

```tsx
export const PgProducts = () => {
	return (
		<div className={clsx("pg_products__layout")}>
			<PgProductTreeSection />

			{/**
			 * 추천 목록이 실패해도 본문 표는 그대로 쓸 수 있다
			 */}
			<UiErrorBoundary fallback={<UiInlineErrorState />}>
				<Suspense fallback={<UiRecommendationSkeleton />}>
					<PgProductRecommendationSection />
				</Suspense>
			</UiErrorBoundary>

			<PgProductTableSection />
		</div>
	);
};
```

**Correct (다시 시도는 쿼리 오류 상태를 되돌리고 하위 트리를 새로 마운트합니다):**

```tsx
export const PgProductRecommendationBoundary = () => {
	const queryErrorResetBoundary = useQueryErrorResetBoundary();

	return (
		<UiErrorBoundary
			onReset={queryErrorResetBoundary.reset}
			fallback={<UiInlineErrorState retryLabel="다시 불러오기" />}
		>
			<Suspense fallback={<UiRecommendationSkeleton />}>
				<PgProductRecommendationSection />
			</Suspense>
		</UiErrorBoundary>
	);
};
```

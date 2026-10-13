// page/product-detail/pg-product-detail.tsx: 서버는 계산 전이면 null. 여기서 한 번 좁힘
const responseSummarySuspense = useSuspenseQuery({
	...productDetailSummaryQueryOptions(productId),
	select: (response) => ({
		...response,
		changeRate:
			isNotNil(response.changeRate) && Number.isFinite(response.changeRate) ? response.changeRate : undefined,
	}),
});

// [!code ++]
// page/orders/_function/to-order-summary/to-order-summary.ts
/**
 * 주문 요약 영역의 표시 데이터. 재고 카드는 재고 수량이 있을 때만
 */
export const toOrderSummary = (params: ToOrderSummaryParams): OrderSummaryContent => {
// [!code ++]
	// 1. 고른 기간 기준으로 갱신되는 비교 수치 행
// [!code ++]
	const metrics = [
// [!code ++]
		{id: "orderAmount", label: "주문 금액", value: formatAmount(params.orderSummary.orderAmount)},
// [!code ++]
		{id: "orderCount", label: "주문 건수", value: params.orderSummary.orderCount},
// [!code ++]
	];

// [!code ++]
	// 2. 상품 상태 그룹. 설명이 비면 그룹 제목만
// [!code ++]
	const statusGroups = [
// [!code ++]
		{
// [!code ++]
			id: "product-status",
// [!code ++]
			title: "상품 상태",
// [!code ++]
			description: params.orderSummary.statusDescription,
// [!code ++]
			total: formatAmount(params.orderSummary.totalAmount),
// [!code ++]
			rows: metrics,
// [!code ++]
		},
// [!code ++]
	];

// [!code ++]
	// 3. 재고 카드. 재고 수량이 있을 때만
// [!code ++]
	return {metrics, statusGroups, stockCount: params.stockCount};
};

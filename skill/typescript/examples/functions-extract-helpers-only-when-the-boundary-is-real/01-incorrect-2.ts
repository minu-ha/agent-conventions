// [!code error]
// page/orders/_function/to-order-summary.ts
/**
 * 주문 요약 영역의 표시 데이터. 재고 카드는 재고 수량이 있을 때만
 */
export const toOrderSummary = (params: ToOrderSummaryParams): OrderSummaryContent => {
// [!code error]
	return {
// [!code error]
		metrics: toComparisonRows(params),
// [!code error]
		statusGroups: toStatusGroups(params),
// [!code error]
		stockCount: toStockCard(params),
// [!code error]
	};
};

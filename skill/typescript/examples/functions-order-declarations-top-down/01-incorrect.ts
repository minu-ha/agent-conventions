// page/orders/_function/to-summary-rows.ts
// [!code error]
export const toSummaryRows = (params: ToSummaryRowsParams): SummaryRow[] => {
// [!code error]
	return params.response.items.map((item) => ({id: item.id, label: item.name.trim() || item.code}));
// [!code error]
};

/**
 * 요약 표 행을 만들 때 필요한 입력
 */
export interface ToSummaryRowsParams {
	/**
	 * 요약 조회 응답
	 */
	response: OrderSummaryResponse;
}

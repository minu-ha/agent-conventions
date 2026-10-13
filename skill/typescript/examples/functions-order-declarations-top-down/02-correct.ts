// page/orders/_function/to-summary-rows.ts
/**
 * 요약 표 행을 만들 때 필요한 입력
 */
export interface ToSummaryRowsParams {
	/**
	 * 요약 조회 응답
	 */
	response: OrderSummaryResponse;
}

// [!code ++]
/**
// [!code ++]
 * 요약 표가 그리는 행 목록. 이름이 비면 코드로 표시
// [!code ++]
 */
// [!code ++]
export const toSummaryRows = (params: ToSummaryRowsParams): SummaryRow[] => {
// [!code ++]
	return params.response.items.map((item) => ({id: item.id, label: item.name.trim() || item.code}));
// [!code ++]
};

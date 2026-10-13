// [!code ++]
// page/orders/_type/summary-snapshot.ts: 폴더 이름이 이미 orders
/**
// [!code ++]
 * 한 조회 시점의 주문 요약 목록과 조건
 */
// [!code ++]
interface SummarySnapshot {
	/**
	 * 조회 시점의 행 목록
	 */
	rows: OrderRow[];
	/**
	 * 조회에 사용한 필터
	 */
	filters: OrderFilters;
}

// [!code ++]
const summarySnapshot: SummarySnapshot = response.data;

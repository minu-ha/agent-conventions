/**
 * 주문 화면 데이터
 */
// [!code error]
interface OrderViewModel {
	/**
	 * 조회 시점의 행 목록
	 */
	rows: OrderRow[];
	/**
	 * 조회에 사용한 필터
	 */
	filters: OrderFilters;
}

// [!code error]
const orderVM: OrderViewModel = response.data;

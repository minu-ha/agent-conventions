// page/orders/_function/to-order-row/_to-status-label.ts
/**
 * 주문 행의 상태 라벨. 취소가 임박보다 우선
 */
export const toStatusLabel = (order: OrderRow): StatusLabel => {
	if (order.isCancelled) {
		return "취소";
	}
	if (order.isDueSoon) {
		return "임박";
	}
	return "진행";
};

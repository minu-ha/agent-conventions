// [!code ++]
const toOverdueLines = (order: Order): OrderLine[] => {
// [!code ++]
	// 콜백 안으로 옮기면 줄마다 다시 생성
// [!code ++]
	const overdueIds = new Set(order.overdueLineIds);

// [!code ++]
	return order.lines.filter((line) => overdueIds.has(line.id));
};

/**
 * 주문 내보내기 표 칸 표시 계약. align, padding은 TableCell로 그대로 전달
 */
interface OrderExportCell {
	/**
	 * 칸 정렬. TableCell은 비울 수 있지만 이 표는 칸마다 지정
	 */
// [!code ++]
	align: NonNullable<TableCellProps["align"]>;
	/**
	 * 칸 여백. checkbox 칸이 없어 normal, none만 허용
	 */
// [!code ++]
	padding?: Extract<TableCellProps["padding"], "normal" | "none">;
}

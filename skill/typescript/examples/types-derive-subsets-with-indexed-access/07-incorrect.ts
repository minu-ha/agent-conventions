// [!code error]
// 원본: TableCellProps.align은 선택 필드, padding은 normal, checkbox, none
/**
// [!code error]
 * 주문 내보내기 표 칸 표시 계약
 */
interface OrderExportCell {
	/**
// [!code error]
	 * 칸 정렬
	 */
// [!code error]
	align: "inherit" | "left" | "center" | "right" | "justify";
	/**
// [!code error]
	 * 칸 여백. checkbox 칸 없음
	 */
// [!code error]
	padding?: "normal" | "none";
}

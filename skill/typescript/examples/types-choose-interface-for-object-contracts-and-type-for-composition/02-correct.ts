/**
 * 상품 요약
 */
// [!code ++]
interface ProductSummary {
	/**
	 * 상품 식별자
	 */
	id: string;
	/**
	 * 목록에 표시할 이름
	 */
	name: string;
// [!code ++]
}

// [!code ++]
/**
// [!code ++]
 * 상품 목록 표시 방식
// [!code ++]
 */
// [!code ++]
type ProductMode = "list" | "grid";

// [!code ++]
/**
// [!code ++]
 * 자식 목록을 편집할 수 있는 행
// [!code ++]
 */
// [!code ++]
type MutableRow = Omit<Row, "children"> & {
// [!code ++]
	/**
// [!code ++]
	 * 편집 중인 자식 행
// [!code ++]
	 */
// [!code ++]
	children: Row[];
};

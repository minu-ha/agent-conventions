/**
 * 상품 요약
 */
interface ProductSummary {
	/**
	 * 상품 식별자
	 */
	id: string;
	/**
	 * 목록에 표시할 이름
	 */
	name: string;
}

/**
 * 상품 목록 표시 방식
 */
type ProductMode = "list" | "grid";

/**
 * 자식 분류를 편집할 수 있는 노드
 */
type EditableCategoryNode = Omit<ProductCategoryNode, "children"> & {
	/**
	 * 편집 중인 자식 분류
	 */
	children: EditableCategoryNode[];
};

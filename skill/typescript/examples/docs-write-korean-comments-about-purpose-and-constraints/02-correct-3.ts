// page/products/_pg-product-tree-section.tsx
/**
 * 상품 트리 입력 계약
 */
export interface PgProductTreeSectionProps {
// [!code ++]
	/**
	 * 사이드바에 그릴 분류 노드 목록
	 */
	categoryNodes: ProductCategoryNode[];
}

// util/array/to-products-newest-first.ts
/**
// [!code error]
 * 상품을 정렬하는 함수
 */
export const toProductsNewestFirst = (products: Product[]): Product[] => {
	return orderBy(products, ["updatedAt", "id"], ["desc", "asc"]);
};

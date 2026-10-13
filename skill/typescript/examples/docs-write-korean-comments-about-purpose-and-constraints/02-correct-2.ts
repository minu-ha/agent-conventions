// util/array/to-products-newest-first.ts
/**
// [!code ++]
 * 저장 응답 순서 대신 최신순으로 다시 정렬
// [!code ++]
 *
// [!code ++]
 * 서버가 같은 updatedAt 항목의 순서를 보장하지 않음
// [!code ++]
 * 응답 순서 그대로면 새로고침마다 목록이 흔들림
 */
export const toProductsNewestFirst = (products: Product[]): Product[] => {
	return orderBy(products, ["updatedAt", "id"], ["desc", "asc"]);
};

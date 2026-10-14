// util/array/to-products-newest-first.ts
/**
 * 저장 응답 순서 대신 최신순 재정렬
 *
 *   - 제약: 동일 updatedAt 항목 순서는 서버 미보장
 *   - 응답 순서 사용 시 새로고침마다 목록 순서 변동
 */
export const toProductsNewestFirst = (products: Product[]): Product[] => {
	return orderBy(products, ["updatedAt", "id"], ["desc", "asc"]);
};

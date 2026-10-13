// util/array/to-sorted-product-refs.ts
/**
// [!code ++]
 * 검토 목록 순서 고정. 중복 참조 제거 후 식별자순 정렬
 */
export const toSortedProductRefs = (refs: ProductRef[]): ProductRef[] => {
	return sortBy(uniq(refs), [(ref) => ref.id]);
};

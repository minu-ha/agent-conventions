// util/array/to-sorted-product-refs.ts
/**
// [!code error]
 * This function sorts product refs and returns the result.
 */
export const toSortedProductRefs = (refs: ProductRef[]): ProductRef[] => {
	return sortBy(uniq(refs), [(ref) => ref.id]);
};

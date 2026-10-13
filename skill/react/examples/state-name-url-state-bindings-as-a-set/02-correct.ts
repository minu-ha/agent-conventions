// [!code ++]
// page/products/_constant/product-url-parsers.ts
// [!code ++]
/**
// [!code ++]
 * 상품 목록 화면이 주소에 올린 상태의 파서 묶음
// [!code ++]
 */
// [!code ++]
export const productUrlParsers = {
	page: parseAsInteger.withDefault(pagination_default_page),
	keyword: parseAsString,
};

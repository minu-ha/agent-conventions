// [!code error]
// page/products/_constant/product-search.ts
// [!code error]
export const productSearch = {
	page: parseAsInteger.withDefault(pagination_default_page),
	keyword: parseAsString,
};

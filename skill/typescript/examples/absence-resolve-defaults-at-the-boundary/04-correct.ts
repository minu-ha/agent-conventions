/**
 * 상품 목록 search 파라미터. pageSize를 여기서 채우므로 화면에서는 선택 값 아님
 */
const productUrlParsers = {
	pageSize: parseAsInteger.withDefault(pagination_default_page_size),
};

const [query] = useQueryStates(productUrlParsers);

fetchProducts({pageSize: query.pageSize});
setVisibleRowCount(query.pageSize);

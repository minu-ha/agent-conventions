/**
 * 상품 목록 한 페이지 요청 조건
 */
interface ProductPageRequest {
	/**
	 * 요청 기준 주소
	 */
	baseUrl: string;
	/**
	 * 1부터 세는 페이지 번호
	 */
	page: number;
	/**
	 * 한 페이지에 담을 개수
	 */
	pageSize: number;
	/**
	 * 검색어. 비우면 전체 목록
	 */
	keyword?: string;
}

const fetchProductPage = (request: ProductPageRequest): Promise<ProductPage> => {
	/* … */
};

fetchProductPage({baseUrl: api_base_url, page: urlParams.page, pageSize: pagination_default_page_size});

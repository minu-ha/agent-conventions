// [!code error]
const fetchProductPage = (baseUrl: string, page: number, pageSize: number, keyword?: string): Promise<ProductPage> => {
	/* … */
};

// [!code error]
fetchProductPage(api_base_url, urlParams.page, pagination_default_page_size, undefined);

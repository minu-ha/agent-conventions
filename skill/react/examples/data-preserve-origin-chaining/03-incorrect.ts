// [!code error]
const {products} = responseProductSearchSuspense.data;

useEffect(() => {
// [!code error]
	if (products.length > 0) {
		return;
	}

	reportEmptySearch(urlParams.keyword);
// [!code error]
}, [products, urlParams.keyword]);

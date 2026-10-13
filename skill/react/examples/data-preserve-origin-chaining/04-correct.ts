// [!code ++]
/**
// [!code ++]
 * 검색 결과가 있으면 빈 검색 보고 생략. 결과가 없을 때만 한 번 보고
// [!code ++]
 */
useEffect(() => {
// [!code ++]
	if (responseProductSearchSuspense.data.products.length > 0) {
		return;
	}

	reportEmptySearch(urlParams.keyword);
// [!code ++]
}, [responseProductSearchSuspense.data, urlParams.keyword]);

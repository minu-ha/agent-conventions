/**
 * 검색 결과가 있으면 빈 검색 보고 생략. 결과가 없을 때만 한 번 보고
 */
useEffect(() => {
	if (responseProductSearchSuspense.data.products.length > 0) {
		return;
	}

	reportEmptySearch(urlParams.keyword);
}, [responseProductSearchSuspense.data, urlParams.keyword]);

const toMatchedProducts = (products: Product[], keyword: string) => {
// [!code error]
	// keyword를 소문자로 변환
	const lowerKeyword = keyword.trim().toLowerCase();

	return products.filter((product) => product.title.toLowerCase().includes(lowerKeyword));
};

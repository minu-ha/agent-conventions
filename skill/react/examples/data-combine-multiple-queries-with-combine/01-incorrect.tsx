// [!code error]
const responseProductListSuspense = useProductListSuspense();
// [!code error]
const responseCategoryListSuspense = useCategoryListSuspense();

// [!code error]
const rows = responseProductListSuspense.data.products.map((product) => ({
	id: product.id,
// [!code error]
	categoryName: responseCategoryListSuspense.data.categories.find(
// [!code error]
		(category) => category.id === product.categoryId,
// [!code error]
	)?.name,
// [!code error]
}));

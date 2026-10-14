export const PgProductTableSection = () => {
	/**
 * 분류 이름이 목록 응답에 없어 표 한 행에 두 응답을 함께 담음
	 */
	const responseProductRowsSuspense = useSuspenseQueries({
		queries: [productListQueryOptions(), categoryListQueryOptions()],
		combine: ([productResult, categoryResult]) => {
			// 분류 응답의 id는 유일. 모든 행이 같은 분류 목록을 찾으므로 Map은 한 번만 생성
			const categoryById = new Map(categoryResult.data.categories.map((category) => [category.id, category]));

			return {
				rows: productResult.data.products.map((product) => ({
					id: product.id,
					name: product.name,
					categoryName: categoryById.get(product.categoryId)?.name,
				})),
			};
		},
	});

	return <UiTable rows={responseProductRowsSuspense.rows} />;
};

// page/products/pg-products.tsx
export const PgProducts = () => {
// [!code error]
	const [urlParams] = useQueryStates(productUrlParsers);
// [!code error]
	const responseProductListSuspense = useProductListSuspense({page: urlParams.page});

	return (
		<Fragment>
			<PgProductFilterSection />
// [!code error]
			<PgProductListSection products={responseProductListSuspense.data.list} />
		</Fragment>
	);
};

// page/products/pg-products.tsx
export const PgProducts = () => {
	return (
		<Fragment>
			<PgProductFilterSection />
// [!code ++]
			<Suspense fallback={<UiLoadingFallback ariaLabel="product 목록을 불러오는 중" />}>
// [!code ++]
				<PgProductListSection />
// [!code ++]
			</Suspense>
		</Fragment>
	);
};

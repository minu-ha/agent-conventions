// page/products/pg-products.tsx: 섹션이 따로 없어 진입이 쿼리 호출. 경계는 이 진입을 그리는 셸 몫
export const PgProducts = () => {
	const responseProductListSuspense = useProductListSuspense();

	return <UiTable rows={responseProductListSuspense.data.items} />;
};

export const PgProducts = () => {
	const responseProductListSuspense = useProductListSuspense();

// [!code error]
	if (responseProductListSuspense.isError) {
// [!code error]
		return <UiErrorState />;
// [!code error]
	}

	return <UiTable rows={responseProductListSuspense.data.items} />;
};

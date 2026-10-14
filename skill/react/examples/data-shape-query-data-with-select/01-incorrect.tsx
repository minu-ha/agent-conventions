const responseProductListSuspense = useProductListSuspense();

<UiTable
	rows={responseProductListSuspense.data.items.map((product) => ({
		id: product.id,
		name: product.name,
	}))}
/>;

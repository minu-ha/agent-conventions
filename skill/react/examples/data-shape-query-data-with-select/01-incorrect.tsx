const responseProductListSuspense = useProductListSuspense();

<UiTable
	rows={responseProductListSuspense.data.list.map((product) => ({
		id: product.id,
		label: product.title,
	}))}
/>;

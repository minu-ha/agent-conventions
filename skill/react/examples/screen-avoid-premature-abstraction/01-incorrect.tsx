// [!code error]
const toEditHref = ({editHrefBase, row}: {editHrefBase: string; row: ProductRow}) =>
// [!code error]
	`${editHrefBase}${row.id}/`;

// [!code error]
const toProductRows = (response: ProductListResponse) =>
// [!code error]
	response.data.map((product) => ({id: product.id, title: product.title}));

export const PgProductTable = (props: PgProductTableProps) => {
// [!code error]
	const responseProductListSuspense = useProductListSuspense({}, {query: {select: toProductRows}});

	return responseProductListSuspense.data.map((row) => (
// [!code error]
		<a href={toEditHref({editHrefBase: props.editHrefBase, row})} key={row.id}>
			{row.title}
		</a>
	));
};

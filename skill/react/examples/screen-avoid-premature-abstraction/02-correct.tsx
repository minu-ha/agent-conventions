export const PgProductTable = (props: PgProductTableProps) => {
	/**
	 * 링크에 필요한 두 필드만 남김. 표는 응답 구조를 모름
	 */
	const responseProductListSuspense = useProductListSuspense(
		{},
		{query: {select: (response) => response.data.map((product) => ({id: product.id, title: product.title}))}},
	);

	return responseProductListSuspense.data.map((row) => (
		<a href={`${props.editHrefBase}${row.id}/`} key={row.id}>
			{row.title}
		</a>
	));
};

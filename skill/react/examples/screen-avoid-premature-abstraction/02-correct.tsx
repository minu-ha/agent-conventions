export const PgProductTable = (props: PgProductTableProps) => {
// [!code ++]
	/**
// [!code ++]
	 * 링크에 필요한 두 필드만 남김. 표는 응답 구조를 모름
// [!code ++]
	 */
// [!code ++]
	const responseProductListSuspense = useProductListSuspense(
// [!code ++]
		{},
// [!code ++]
		{query: {select: (response) => response.data.map((product) => ({id: product.id, title: product.title}))}},
// [!code ++]
	);

	return responseProductListSuspense.data.map((row) => (
// [!code ++]
		<a href={`${props.editHrefBase}${row.id}/`} key={row.id}>
			{row.title}
		</a>
	));
};

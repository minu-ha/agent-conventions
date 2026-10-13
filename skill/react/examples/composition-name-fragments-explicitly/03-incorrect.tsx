export const PgProductRows = (props: PgProductRowsProps) => {
	return props.products.map((product) => (
// [!code error]
		<>
			<PgProductRow product={product} />
			<PgProductRowDivider />
// [!code error]
		</>
	));
};

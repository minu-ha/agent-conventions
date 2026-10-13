// [!code error]
// page/product-detail/product-table-section.tsx
// [!code error]
export const ProductTable = (props: ProductTableProps) => {
	return <section className={clsx("pg_productTableSection__root")}>{props.children}</section>;
};

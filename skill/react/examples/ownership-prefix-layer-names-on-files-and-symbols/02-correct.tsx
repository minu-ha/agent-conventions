// [!code ++]
// page/product-detail/_pg-product-table-section.tsx
// [!code ++]
export const PgProductTableSection = (props: PgProductTableSectionProps) => {
	return <section className={clsx("pg_productTableSection__root")}>{props.children}</section>;
};

// [!code error]
// page/products/_pg-product-sidebar-panel.tsx: 감싸기만 하고 자기 책임 없음
// [!code error]
export const PgProductSidebarPanel = (props: PgProductSidebarPanelProps) => {
// [!code error]
	return <section className={clsx("pg_products__sidebar")}>{props.children}</section>;
};

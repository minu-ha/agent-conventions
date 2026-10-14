// component/widget/product-table/wg-product-table.tsx
export const WgProductTable = (props: WgProductTableProps) => {
	return <section className={clsx("wg_productTable__root")}>{props.children}</section>;
};

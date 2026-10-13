// component/widget/product-table/wg-product-table.tsx
export const WgProductTable = (props: WgProductTableProps) => {
	return <section className={clsx("wg_productTable__root")}>{props.children}</section>;
};

// page/order-detail/pg-order-detail.tsx
import {WgProductTable} from "@/component/widget/product-table/wg-product-table";

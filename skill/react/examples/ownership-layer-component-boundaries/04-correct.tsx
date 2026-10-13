// component/widget/product-table/_wg-product-status-badge.tsx
export const WgProductStatusBadge = (props: WgProductStatusBadgeProps) => {
	return <span className={clsx("wg_productTable__statusBadge")}>{props.children}</span>;
};

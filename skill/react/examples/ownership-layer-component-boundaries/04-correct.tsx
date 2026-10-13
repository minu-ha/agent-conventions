// [!code ++]
// component/widget/product-table/_wg-product-status-badge.tsx
// [!code ++]
export const WgProductStatusBadge = (props: WgProductStatusBadgeProps) => {
// [!code ++]
	return <svg className={clsx("wg_productTable__statusBadge")}>{props.children}</svg>;
};

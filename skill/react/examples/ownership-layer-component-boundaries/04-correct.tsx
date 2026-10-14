// component/widget/product-table/_wg-product-status-badge.tsx
/**
 * 상품 상태 배지 계약
 */
export interface WgProductStatusBadgeProps {
	/**
	 * 배지 색을 정하는 상품 상태
	 */
	status: ProductStatus;
	children: ReactNode;
}

export const WgProductStatusBadge = (props: WgProductStatusBadgeProps) => {
	return (
		<span
			className={clsx(
				"wg_productTable__statusBadge",
				props.status === "hidden" && "wg_productTable__statusBadge--hidden",
			)}
		>
			{props.children}
		</span>
	);
};

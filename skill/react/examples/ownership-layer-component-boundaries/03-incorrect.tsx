// [!code error]
// page/product-detail/_pg-product-status-badge.tsx
// [!code error]
// 프롭스가 도메인 타입 하나만 받고 훅도 안 부름. 이 화면에서만 쓴다는 이유로 남아 있음
// [!code error]
export const PgProductStatusBadge = (props: PgProductStatusBadgeProps) => {
// [!code error]
	return <svg className={clsx("pg_productStatusBadge__root")}>{props.children}</svg>;
};

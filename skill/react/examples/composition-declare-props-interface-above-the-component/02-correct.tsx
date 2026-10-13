// [!code ++]
// component/ui/badge/ui-badge.tsx
// [!code ++]
/**
// [!code ++]
 * 상태 배지 계약
// [!code ++]
 */
// [!code ++]
export interface UiBadgeProps {
// [!code ++]
	/**
// [!code ++]
	 * 배지에 표시할 문구
// [!code ++]
	 */
	label: string;
}

export const UiBadge = (props: UiBadgeProps) => {
	return <span className={clsx("ui_badge__root")}>{props.label}</span>;
};

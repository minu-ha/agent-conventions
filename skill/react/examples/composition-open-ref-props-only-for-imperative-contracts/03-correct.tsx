/**
 * 상태 배지 계약
 *
 * 밖에서 다룰 일이 없어 `ref` 비공개
 */
export interface UiStatusBadgeProps {
	/**
	 * 배지에 표시할 상태 문구
	 */
	label: string;
}

export const UiStatusBadge = (props: UiStatusBadgeProps) => {
	return <span>{props.label}</span>;
};

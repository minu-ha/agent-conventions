/**
 * 표 줄
 *
 * 감싸는 컴포넌트의 프롭이 DOM 계약과 호환돼 `HTMLAttributes`를 그대로 받음
 */
export interface UiTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
	/**
	 * 선택된 줄로 표시할지
	 */
	selected?: TableRowProps["selected"];
}

export const UiTableRow = (props: UiTableRowProps) => {
	return (
		<TableRow {...props} className={clsx("ui_tableRow__root", props.className)} />
	);
};

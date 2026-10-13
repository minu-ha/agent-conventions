import {TableCell} from "@mui/material";
import type {TableCellProps} from "@mui/material";
import {clsx} from "clsx";
import type {TdHTMLAttributes} from "react";

/**
 * 라이브러리 셀의 정렬과 여백을 여는 계약
 *
 * align의 inherit은 DOM td 타입에 없어 그 이름만 빼고 다시 선언
 */
export interface UiTableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
	/**
	 * 내용 가로 정렬
	 */
	align?: TableCellProps["align"];
	/**
	 * 셀 여백
	 */
	padding?: TableCellProps["padding"];
}

export const UiTableCell = (props: UiTableCellProps) => {
	return <TableCell {...props} className={clsx("ui_tableCell__root", props.className)} />;
};

import type {TdHTMLAttributes} from "react";
import type {TableCellProps} from "@mui/material";

/**
 * 표 셀에서 정렬과 여백만 여는 계약
 *
 * 라이브러리 셀의 나머지 표시 프롭은 표 소유자가 정하므로 열지 않음
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
	return <TableCell {...props} />;
};

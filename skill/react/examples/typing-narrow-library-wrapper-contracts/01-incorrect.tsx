// [!code error]
export type UiTableCellProps = TableCellProps;

export const UiTableCell = (props: UiTableCellProps) => {
	return <TableCell {...props} />;
};

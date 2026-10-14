const toRowClassNames = (row: OrderRow): string[] => {
// [!code error]
	const isOverdue = row.dueDate < today;

	return [
// [!code error]
		isOverdue ? "ui_row__root--overdue" : "ui_row__root",
// [!code error]
		isOverdue ? "ui_row__badge--overdue" : "ui_row__badge",
	];
};

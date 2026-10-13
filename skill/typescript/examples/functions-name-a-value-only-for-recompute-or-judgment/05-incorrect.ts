const toRowAction = (row: Row): RowAction => {
// [!code error]
	return row.status === product_status.draft && !row.lockedAt && row.ownerId === session.userId
// [!code error]
		? row_action.edit
// [!code error]
		: row_action.view;
};

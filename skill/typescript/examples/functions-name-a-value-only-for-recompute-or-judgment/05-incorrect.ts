const toRowAction = (row: ProductRow): RowAction => {
	return row.status === product_status.draft && !row.lockedAt && row.ownerId === session.userId
		? row_action.edit
		: row_action.view;
};

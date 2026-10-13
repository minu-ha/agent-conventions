const toRowAction = (row: Row): RowAction => {
// [!code ++]
	const isEditable = row.status === product_status.draft && !row.lockedAt && row.ownerId === session.userId;

// [!code ++]
	return isEditable ? row_action.edit : row_action.view;
};

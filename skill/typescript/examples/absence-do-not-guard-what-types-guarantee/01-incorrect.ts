const toRowLabel = (row: ProductRow): string => {
// [!code error]
	if (isNil(row.name)) {
// [!code error]
		return row.id;
// [!code error]
	}

	return row.name.trim();
};

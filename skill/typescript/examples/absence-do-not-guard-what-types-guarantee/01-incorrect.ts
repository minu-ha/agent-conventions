const toRowLabel = (row: ProductRow): string => {
// [!code error]
	if (isNil(row.name)) {
// [!code error]
		return row.code;
// [!code error]
	}

	return row.name.trim();
};

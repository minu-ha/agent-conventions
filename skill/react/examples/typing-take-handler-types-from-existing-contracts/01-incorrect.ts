// [!code error]
const handleRowSelectToggle = (rowId: string) => (event) => {
	event.preventDefault();
	toggleSelection(rowId);
};

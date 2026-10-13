// [!code error]
const handleListItemClickWithProductId = (productId: string): MouseEventHandler<HTMLButtonElement> => {
// [!code error]
	const handleListItemClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
// [!code error]
		toggleSelection(productId);
// [!code error]
	};

// [!code error]
	return handleListItemClick;
};

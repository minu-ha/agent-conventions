const handleListItemClickWithProductId = (productId: string): MouseEventHandler<HTMLButtonElement> => {
	const handleListItemClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
		toggleSelection(productId);
	};

	return handleListItemClick;
};

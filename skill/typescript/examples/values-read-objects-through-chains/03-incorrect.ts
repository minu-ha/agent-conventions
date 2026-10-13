const toOrderLine = ({product, quantity}: OrderLineInput): OrderLine => {
	const {title, unitPrice} = product;

	return {
		label: title,
		amount: unitPrice * quantity,
	};
};

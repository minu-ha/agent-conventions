const toOrderLine = ({product, quantity}: OrderLineInput): OrderLine => {
	const {name, price} = product;

	return {
		label: name,
		amount: price * quantity,
	};
};

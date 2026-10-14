const toOrderLine = (input: OrderLineInput): OrderLine => {
	return {
		id: input.product.id,
		label: input.product.name,
		amount: input.product.price * input.quantity,
	};
};

const toOrderTotal = (lines: OrderLine[]): OrderTotal => {
	return {
		currency: pricing_default_currency,
		amount: sumBy(lines, (line) => line.amount),
	};
};

if (order.status === "cancelled") {
	notify(order.ownerId);
}

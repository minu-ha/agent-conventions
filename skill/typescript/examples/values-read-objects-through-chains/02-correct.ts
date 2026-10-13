const toOrderLine = (input: OrderLineInput): OrderLine => {
	return {
		label: input.product.title,
		amount: input.product.unitPrice * input.quantity,
	};
};

const toOrderTotal = (lines: OrderLine[]): OrderTotal => {
	return {
		currency: pricing_default_currency,
		amount: sumBy(lines, (line) => line.amount),
	};
};

if (order.status === "archived") {
	notify(order.owner);
}

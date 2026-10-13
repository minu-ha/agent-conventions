const currency = pricing_default_currency;

const toOrderTotal = (lines: OrderLine[]): OrderTotal => {
	return {
		currency,
		amount: sumBy(lines, (line) => line.amount),
	};
};

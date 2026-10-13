// [!code error]
const currency = pricing_default_currency;

// [!code error]
const toOrderTotal = (lines: OrderLine[]): OrderTotal => {
// [!code error]
	return {
// [!code error]
		currency,
// [!code error]
		amount: sumBy(lines, (line) => line.amount),
// [!code error]
	};
};

// page/product-detail/_function/format-signed-percent.ts
// [!code error]
export const formatSignedPercent = (value: number | null | undefined) => {
// [!code error]
	if (isNil(value) || !Number.isFinite(value)) {
// [!code error]
		return copy_empty_value_text;
// [!code error]
	}
	return `${value > 0 ? "+" : ""}${value}%`;
};

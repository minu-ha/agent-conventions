// page/product-detail/_function/format-signed-percent.ts
// [!code ++]
/**
// [!code ++]
 * 부호를 붙인 변화율 표시 문자열
// [!code ++]
 */
// [!code ++]
export const formatSignedPercent = (value: number) => {
	return `${value > 0 ? "+" : ""}${value}%`;
};

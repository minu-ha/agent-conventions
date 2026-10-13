// page/product-detail/_function/format-signed-percent.ts
/**
 * 부호를 붙인 변화율 표시 문자열
 */
export const formatSignedPercent = (value: number) => {
	return `${value > 0 ? "+" : ""}${value}%`;
};

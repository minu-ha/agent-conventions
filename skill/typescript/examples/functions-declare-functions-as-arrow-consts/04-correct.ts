/**
 * 값 종류별 표 셀 표시 함수. 문자열은 앞뒤 공백 제거 후 표시
 */
export const cellFormatterByValueType = {
	text: (value: string): string => {
		return value.trim();
	},
} as const;

/**
 * 상품 식별자 목록
 */
export const toProductIds = (products: Product[]): string[] => {
	return products.map((product) => product.id);
};

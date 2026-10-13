// [!code ++]
/**
// [!code ++]
 * 값 종류별 표 셀 표시 함수. 문자열은 앞뒤 공백 제거 후 표시
// [!code ++]
 */
export const cellFormatterByValueType = {
// [!code ++]
	text: (value: string): string => {
		return value.trim();
	},
} as const;

// [!code ++]
/**
// [!code ++]
 * 상품 식별자 목록
// [!code ++]
 */
// [!code ++]
export const toProductIds = (products: Product[]): string[] => {
// [!code ++]
	return products.map((product) => product.id);
// [!code ++]
};

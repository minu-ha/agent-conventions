// page/product-detail/_function/to-badge/_to-signed-tone.ts
// [!code ++]
/**
 * 부호 있는 변화율의 강조 톤. 0은 중립
 */
// [!code ++]
export const toSignedTone = (value: number): Tone => {
// [!code ++]
	if (value === 0) {
		return "neutral";
	}
	return value > 0 ? "positive" : "negative";
};

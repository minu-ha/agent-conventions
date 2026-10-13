// page/product-detail/_function/to-badge/_to-signed-tone.ts
// [!code error]
export const toSignedTone = (value: number | null | undefined): Tone => {
// [!code error]
	if (isNil(value) || !Number.isFinite(value) || value === 0) {
		return "neutral";
	}
	return value > 0 ? "positive" : "negative";
};

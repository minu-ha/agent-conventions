// page/product-detail/_function/to-status-tone.ts
/**
 * 상태 문자열의 강조 톤. API가 상태를 자유 문자열로 주므로 값 포함 여부로 판정
 */
export const toStatusTone = (status: string): Tone => {
	const normalizedStatus = status.trim().toLowerCase();
	if (status_positive_values.some((value) => normalizedStatus.includes(value))) {
		return "positive";
	}
	if (status_negative_values.some((value) => normalizedStatus.includes(value))) {
		return "negative";
	}
	return "neutral";
};

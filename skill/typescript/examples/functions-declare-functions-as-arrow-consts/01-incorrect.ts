/**
 * 제목 공백 정리. 검색어 비교에서 공백 차이 무시
 */
// [!code error]
export function toTrimmedTitle(rawTitle: string): string {
	return rawTitle.trim().replace(/\s+/g, " ");
// [!code error]
}

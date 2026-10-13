/**
 * 앞뒤 공백을 걷어 낸 요청 문자열
 */
// [!code error]
const toRequest = (request: string): string => {
	return request.trim();
};

/**
 * 검색어용으로 공백을 한 칸으로 줄인 요청 문자열
 */
// [!code error]
const toSearchRequest = (request: string): string => {
	return request.replaceAll(/\s+/g, " ").trim();
};

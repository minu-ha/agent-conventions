/**
 * 요청 문자열 변환 계약
 */
// [!code ++]
type ToRequest = (request: string) => string;

// [!code ++]
/**
 * 앞뒤 공백을 걷어 낸 요청 문자열
 */
// [!code ++]
const toRequest: ToRequest = (request) => {
	return request.trim();
};

/**
 * 검색어용으로 공백을 한 칸으로 줄인 요청 문자열
 */
// [!code ++]
const toSearchRequest: ToRequest = (request) => {
	return request.replaceAll(/\s+/g, " ").trim();
};

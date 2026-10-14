/**
 * 요청 순서 고정. 선택 목록의 중복 ID 제거 후 오름차순 정렬
 */
export const toSortedUserIds = (userIds: string[]): string[] => {
	return uniq(userIds).toSorted();
};

/**
 * 상품 목록 조회. 로딩과 오류는 이 응답 객체로만 판단
 */
const responseProductList = useProductList();

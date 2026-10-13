/**
 * 표에 그릴 상품 조회. 멈추는 동안은 섹션 소유자의 경계가 처리
 */
const responseProductListSuspense = useGetProductListSuspense();

/**
 * 표에서 고른 상품 삭제. 성공 뒤 무효화는 부르는 화면 몫
 */
const mutationProductRemove = useProductRemove();

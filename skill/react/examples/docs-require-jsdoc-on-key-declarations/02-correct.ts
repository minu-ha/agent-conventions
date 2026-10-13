// [!code ++]
/**
// [!code ++]
 * 저장하지 않고 목록으로 이동. 입력 중인 값은 버림
// [!code ++]
 */
const handleBackButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	void navigate("/products");
};

// [!code ++]
/**
// [!code ++]
 * 표에 보이는 상품의 변경 알림 구독. 목록이 바뀌면 재구독
// [!code ++]
 */
useEffect(() => {
	return subscribeToProductChanges(watchedProductIds);
}, [watchedProductIds]);

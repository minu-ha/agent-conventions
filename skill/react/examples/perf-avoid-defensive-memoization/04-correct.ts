/**
 * 입력된 상품 목록이 바뀔 때만 변경 알림 재구독
 */
useEffect(() => {
	return subscribeToProductChanges(props.products.map((product) => product.id));
}, [props.products]);

/**
 * 상품 변경 수신 시 최신 onChange 로직 실행
 */
const handleProductChange = useEffectEvent((change: ProductChange) => {
	props.onChange(change);
});

/**
 * 상품 변경 구독 생명주기 유지
 */
useEffect(() => {
	const unsubscribe = subscribeToProductChanges(props.productId, (change) => {
		handleProductChange(change);
	});

	return unsubscribe;
}, [props.productId]);

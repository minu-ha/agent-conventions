// [!code ++]
/**
// [!code ++]
 * 상품 변경 수신 시 최신 onChange 로직 실행
// [!code ++]
 */
// [!code ++]
const handleProductChange = useEffectEvent((change: ProductChange) => {
// [!code ++]
	props.onChange(change);
// [!code ++]
});

// [!code ++]
/**
// [!code ++]
 * 상품 변경 구독 생명주기 유지
// [!code ++]
 */
useEffect(() => {
	const unsubscribe = subscribeToProductChanges(props.productId, (change) => {
// [!code ++]
		handleProductChange(change);
	});

	return unsubscribe;
}, [props.productId]);

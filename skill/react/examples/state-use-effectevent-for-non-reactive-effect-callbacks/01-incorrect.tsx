// [!code error]
const onChangeRef = useRef(props.onChange);

// [!code error]
useEffect(() => {
// [!code error]
	onChangeRef.current = props.onChange;
// [!code error]
}, [props.onChange]);

useEffect(() => {
	const unsubscribe = subscribeToProductChanges(props.productId, (change) => {
// [!code error]
		onChangeRef.current(change);
	});

	return unsubscribe;
}, [props.productId]);

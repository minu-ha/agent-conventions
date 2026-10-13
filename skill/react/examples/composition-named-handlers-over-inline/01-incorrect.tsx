// [!code error]
<UiButton
// [!code error]
	onClick={() => {
		if (!selectedProduct) {
			return;
		}

		mutationProductRemove.mutate({params: {productId: selectedProduct.id}});
// [!code error]
	}}
// [!code error]
>
// [!code error]
	삭제
// [!code error]
</UiButton>

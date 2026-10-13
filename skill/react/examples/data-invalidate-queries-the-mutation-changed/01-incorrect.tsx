const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: () => {
// [!code error]
			void responseProductListSuspense.refetch();
		},
	},
});

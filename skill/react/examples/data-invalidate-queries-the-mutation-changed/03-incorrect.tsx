const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: (saved) => {
			queryClient.setQueryData(["products"], (previous = []) => [...previous, saved]);
		},
	},
});

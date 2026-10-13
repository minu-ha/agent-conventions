// [!code ++]
const queryClient = useQueryClient();

// [!code ++]
/**
 * 저장이 목록과 요약 집계를 함께 바꾸므로 두 키를 나란히 무효화
 */
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: () => {
// [!code ++]
			void queryClient.invalidateQueries({queryKey: productListQueryKey()});
// [!code ++]
			void queryClient.invalidateQueries({queryKey: productSummaryQueryKey()});
		},
	},
});

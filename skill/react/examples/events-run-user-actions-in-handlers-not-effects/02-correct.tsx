/**
 * 생성 성공 시 목록으로 이동
 */
const mutationProductCreate = useProductCreate({
	mutation: {
		onSuccess: () => {
			void navigate("/products");
		},
	},
});

// [!code ++]
/**
 * 버튼을 누른 그 자리에서 생성 호출. 상태로 올려 이펙트가 대신 부르게 하지 않음
 */
// [!code ++]
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	mutationProductCreate.mutate({data: toProductCreateRequest(formValues)});
};

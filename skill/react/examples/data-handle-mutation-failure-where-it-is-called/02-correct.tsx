/**
 * 저장 성공 시 목록 화면으로 이동. 실패 문구는 폼 위에 표시
 */
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: () => {
			void navigate("/products");
		},
		onError: (error) => {
			setSubmitErrorMessage(toSubmitErrorMessage(error));
		},
	},
});

const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	if (mutationProductSave.isPending) {
		return;
	}

	mutationProductSave.mutate({data: toProductSaveRequest(props.formValues)});
};

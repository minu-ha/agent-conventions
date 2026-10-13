/**
 * 버튼 disabled와 별개로 겹쳐 들어온 저장을 한 번 더 차단
 */
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	if (mutationProductSave.isPending) {
		return;
	}

	mutationProductSave.mutate({data: toProductSaveRequest(props.formValues)});
};

<UiButton disabled={mutationProductSave.isPending} onClick={handleSaveButtonClick}>
	저장
</UiButton>;

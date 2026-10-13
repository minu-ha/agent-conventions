/**
 * 첨부를 먼저 올린 뒤 그 식별자로 상품 저장
 */
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	if (mutationAttachmentUpload.isPending || mutationProductSave.isPending) {
		return;
	}

	try {
		const uploaded = await mutationAttachmentUpload.mutateAsync({files: draftFiles});

		await mutationProductSave.mutateAsync({
			data: toProductSaveRequest(props.formValues, uploaded.attachmentIds),
		});

		void navigate("/products");
	} catch (error) {
		setSubmitErrorMessage(toSubmitErrorMessage(error));
	}
};

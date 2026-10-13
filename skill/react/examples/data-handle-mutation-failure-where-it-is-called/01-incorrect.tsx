// [!code error]
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
// [!code error]
	await mutationProductSave.mutateAsync({data: toProductSaveRequest(props.formValues)});
	void navigate("/products");
};

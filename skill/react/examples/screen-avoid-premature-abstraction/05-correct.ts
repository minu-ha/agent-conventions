/**
 * 등록 화면과 수정 화면이 저장 실패를 같은 문구로 보여야 해서 한곳에 묶음
 * 두 화면 모두 이 훅을 부르므로 한쪽만 고치면 표시가 갈림
 */
export const useProductEditor = () => {
	const form = useForm<ProductEditorFormValues>();
	const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

	/**
	 * 저장 실패 문구를 이 훅이 함께 들고 있어야 해서 여기서 받음
	 */
	const mutationProductSave = useProductSave({
		mutation: {
			onError: (error) => {
				setSubmitErrorMessage(toSubmitErrorMessage(error));
			},
		},
	});

	return {form, mutationProductSave, submitErrorMessage};
};

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

// [!code error]
const [shouldSubmit, setShouldSubmit] = useState(false);

// [!code error]
useEffect(() => {
// [!code error]
	if (!shouldSubmit) {
// [!code error]
		return;
// [!code error]
	}

// [!code error]
	mutationProductCreate.mutate({data: toProductCreateRequest(formValues)});
// [!code error]
}, [mutationProductCreate, formValues, shouldSubmit]);

const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
// [!code error]
	setShouldSubmit(true);
};

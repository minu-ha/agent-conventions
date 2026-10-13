// [!code error]
// component/widget/product-toolbar/_wg-product-toolbar-delete-button.tsx
// [!code error]
export const WgProductToolbarDeleteButton = () => {
	const navigate = useNavigate();

	/**
	 * 삭제 후 목록으로 이동
	 */
	const handleDeleteButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		void navigate("/products");
	};

	return <UiButton onClick={handleDeleteButtonClick}>삭제</UiButton>;
};

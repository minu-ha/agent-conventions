// page/products/_pg-product-list-section.tsx
export const PgProductListSection = () => {
	const [urlParams, setUrlParams] = useQueryStates(productUrlParsers);

	/**
	 * 표에 그릴 상품을 URL의 page로 조회
	 */
	const responseProductListSuspense = useProductListSuspense(
		{page: urlParams.page},
		{query: {select: (response) => ({items: response.data.items})}},
	);

	const queryClient = useQueryClient();

	/**
	 * 저장 성공 시 목록을 다시 읽고 첫 페이지로 이동. 새 상품이 맨 앞
	 */
	const mutationProductSave = useProductSave({
		mutation: {
			onSuccess: () => {
				void queryClient.invalidateQueries({queryKey: productListQueryKey()});
				void setUrlParams({page: 1});
			},
		},
	});

	/**
	 * 폼 값을 전송 형태로 바꿔 저장만 호출. 저장 뒤 흐름은 mutation 콜백이 이어 감
	 */
	const handleProductSave: UiTableProps["onSave"] = (formValues) => {
		mutationProductSave.mutate({data: toProductSaveRequest(formValues)});
	};

	return <UiTable rows={responseProductListSuspense.data.items} onSave={handleProductSave} />;
};

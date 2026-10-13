/**
 * 표가 그대로 쓰는 필드 이름으로 목록 변환. 화면은 응답 구조를 모름
 */
const responseProductListSuspense = useProductListSuspense(
	{},
	{
		query: {
			select: (response) => ({
				items: response.data.list.map((product) => ({id: product.id, label: product.title})),
			}),
		},
	},
);

<UiTable rows={responseProductListSuspense.data.items} />;

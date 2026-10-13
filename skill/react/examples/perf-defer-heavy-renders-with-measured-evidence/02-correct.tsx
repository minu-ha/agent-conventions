// [!code ++]
const handleTagClick = (nextTagId: string) => {
// [!code ++]
	setSelectedTagId(nextTagId);
// [!code ++]
};

// [!code ++]
const handleStatusFilterChange = (nextStatus: ProductStatusFilter) => {
// [!code ++]
	// 행 12,000개에서 필터 전환에 320ms, 클릭이 밀림
	startTransition(() => {
// [!code ++]
		setStatusFilter(nextStatus);
	});
};

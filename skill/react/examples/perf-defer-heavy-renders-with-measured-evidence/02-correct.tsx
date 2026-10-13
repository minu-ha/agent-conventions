const handleTagClick = (nextTagId: string) => {
	setSelectedTagId(nextTagId);
};

const handleStatusFilterChange = (nextStatus: ProductStatusFilter) => {
	// 행 12,000개에서 필터 전환에 320ms, 클릭이 밀림
	startTransition(() => {
		setStatusFilter(nextStatus);
	});
};

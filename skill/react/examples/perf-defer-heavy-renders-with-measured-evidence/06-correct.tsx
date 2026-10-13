const handleStatusFilterChange = (nextStatus: ProductStatusFilter) => {
	startTransition(async () => {
		const nextRows = await fetchFilteredRows(nextStatus);

		// await 뒤에는 트랜지션 범위가 끊김. 다시 감싸야 급하지 않은 갱신으로 남음
		startTransition(() => {
			setRows(nextRows);
		});
	});
};

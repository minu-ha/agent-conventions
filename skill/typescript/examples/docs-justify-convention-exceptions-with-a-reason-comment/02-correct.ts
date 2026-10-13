// [!code ++]
// columns 참조 유지. MUI Data Grid는 참조가 바뀌면 열 너비, 순서를 잃을 수 있음
const columns = useMemo(() => {
	return toTableColumns(responseTableColumnsSuspense.data.columns);
}, [responseTableColumnsSuspense.data.columns]);

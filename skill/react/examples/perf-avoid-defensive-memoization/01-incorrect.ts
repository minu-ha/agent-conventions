const columns = useMemo(() => {
	return toTableColumns(props.columns);
}, [props.columns]);

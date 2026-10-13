// 열 2,000개의 표시 계약 변환이 입력마다 45ms 측정. 같은 columns의 반복 계산 생략
const columns = useMemo(() => {
	return toTableColumns(props.columns);
}, [props.columns]);

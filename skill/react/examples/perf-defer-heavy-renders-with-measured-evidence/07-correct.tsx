// 행 12,000개 표. 부모가 입력값으로 다시 렌더할 때 이 트리까지 따라 그리지 않도록 memo로 감쌈
export const PgProductRows = memo((props: PgProductRowsProps) => {
	return <UiTable rows={props.rows} />;
});

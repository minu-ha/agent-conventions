<section className={clsx("wg_orderTable__root")}>
	{/**
	 * 헤더 행. 정렬 기준과 단위 표시
	 */}
	<WgOrderTableHeader sort={sort} />
{/* [!code ++] */}
	{/**
	 * 주문 행. 상세 버튼과 아코디언이 있는 기본 행
	 */}
	{rows.map((row) => (
		<WgOrderTableRow key={row.id} row={row} />
	))}
{/* [!code ++] */}
	{/**
	 * 펼친 자식 주문 행. 상세 버튼과 아코디언 없이 같은 칸 구성 반복
	 */}
	{expandedRows.map((row) => (
		<WgOrderTableChildRow key={row.id} row={row} />
	))}
</section>;

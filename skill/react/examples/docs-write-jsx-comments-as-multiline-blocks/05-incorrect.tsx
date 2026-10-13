<section className={clsx("wg_orderTable__root")}>
	{/**
	 * 헤더 행. 정렬 기준과 단위 표시
	 */}
	<WgOrderTableHeader sort={sort} />
	{rows.map((row) => (
		<WgOrderTableRow key={row.id} row={row} />
	))}
	{expandedRows.map((row) => (
		<WgOrderTableChildRow key={row.id} row={row} />
	))}
</section>;

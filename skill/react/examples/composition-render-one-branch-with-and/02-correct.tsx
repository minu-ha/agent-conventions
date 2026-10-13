return (
	<section>
// [!code ++]
		{props.view === "chart" && <PgChart />}
// [!code ++]
		{props.view === "table" && <PgTable />}
	</section>
);

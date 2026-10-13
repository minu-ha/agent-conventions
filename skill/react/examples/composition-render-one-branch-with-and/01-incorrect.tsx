return (
	<section>
// [!code error]
		{props.view === "chart" ? <PgChart /> : <PgTable />}
	</section>
);

<div className={clsx("pg_productDetail__chart")}>
	<Suspense fallback={<UiLineChartSkeleton />}>
		<PgProductDetailChartSection />
	</Suspense>
</div>

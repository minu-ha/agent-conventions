// [!code ++]
<div className={clsx("pg_productDetail__chart")}>
// [!code ++]
	<Suspense fallback={<UiLineChartSkeleton />}>
		<PgProductDetailChartSection />
	</Suspense>
// [!code ++]
</div>

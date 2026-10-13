// [!code error]
<Suspense fallback={<UiLineChartSkeleton className={clsx("pg_productDetail__chartSkeleton")} />}>
	<PgProductDetailChartSection />
</Suspense>

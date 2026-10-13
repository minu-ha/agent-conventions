// [!code error]
<Suspense
// [!code error]
	fallback={
// [!code error]
		<div className="pg_products__loading">
// [!code error]
			<img src={loadingGif} />
// [!code error]
			<p>불러오는 중</p>
// [!code error]
		</div>
// [!code error]
	}
// [!code error]
>
	<PgProductTableSection />
</Suspense>

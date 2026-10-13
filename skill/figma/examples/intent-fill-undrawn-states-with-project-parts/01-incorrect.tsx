<Suspense
	fallback={
		<div className="pg_products__loading">
			<img src={loadingGif} />
			<p>불러오는 중</p>
		</div>
	}
>
	<PgProductTableSection />
</Suspense>

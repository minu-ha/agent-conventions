// page/products/pg-products.tsx: 쿼리를 부르는 섹션을 경계로 감쌈
return (
	<Suspense fallback={<PgProductTreeSkeleton />}>
		<PgProductTreeSection />
	</Suspense>
);

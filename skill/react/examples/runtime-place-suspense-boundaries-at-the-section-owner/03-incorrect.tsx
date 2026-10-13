// page/products/_pg-product-tree-section.tsx: 진입 파일에 이미 경계가 있는데 같은 쿼리를 다시 감쌈
export const PgProductTreeSection = () => {
	return (
		<Suspense fallback={<PgProductTreeSkeleton />}>
			<PgProductTreeInner />
		</Suspense>
	);
};

export const PgProducts = () => {
	return (
		<div className={clsx("pg_products__layout")}>
			<PgProductTreeSection />

			{/**
			 * 추천 목록이 실패해도 본문 표는 그대로 사용 가능
			 */}
			<UiErrorBoundary fallback={<UiInlineErrorState />}>
				<Suspense fallback={<UiRecommendationSkeleton />}>
					<PgProductRecommendationSection />
				</Suspense>
			</UiErrorBoundary>

			<PgProductTableSection />
		</div>
	);
};

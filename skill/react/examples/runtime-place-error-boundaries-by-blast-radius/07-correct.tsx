export const PgProductRecommendationBoundary = () => {
	const queryErrorResetBoundary = useQueryErrorResetBoundary();

	return (
		<UiErrorBoundary
			onReset={queryErrorResetBoundary.reset}
			fallbackRender={(fallbackProps) => (
				<UiInlineErrorState
					retryLabel="다시 불러오기"
					onRetry={fallbackProps.resetErrorBoundary}
				/>
			)}
		>
			<Suspense fallback={<UiRecommendationSkeleton />}>
				<PgProductRecommendationSection />
			</Suspense>
		</UiErrorBoundary>
	);
};

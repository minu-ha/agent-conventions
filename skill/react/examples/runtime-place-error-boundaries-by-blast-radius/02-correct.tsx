// 추천을 확정하는 화면은 재조회 실패 시 이전 추천을 계속 선택하게 두지 않음
if (responseProductRecommendationsSuspense.error && !responseProductRecommendationsSuspense.isFetching) {
	throw responseProductRecommendationsSuspense.error;
}

return <WgProductRecommendations items={responseProductRecommendationsSuspense.data.items} />;

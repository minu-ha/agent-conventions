// [!code ++]
// 범례를 만드는 자리에서 색을 정해 항목에 저장
// [!code ++]
const comparisonSeries = seriesItems.map((series, seriesIndex) => ({
// [!code ++]
	...series,
	colorToken: toSeriesColorToken(series.role, seriesIndex),
}));

// [!code ++]
// 차트 둘은 같은 항목의 색을 그대로 읽음
// [!code ++]
const chartSeries = comparisonSeries.map((series) => ({
	id: series.id,
// [!code ++]
	colorToken: series.colorToken,
}));

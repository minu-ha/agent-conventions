// [!code error]
// 범례
// [!code error]
const legendSeries = seriesItems.map((series, seriesIndex) => ({
// [!code error]
	id: series.id,
	colorToken: toSeriesColorToken(series.role, seriesIndex),
}));

// [!code error]
// 차트 둘. 범례 팔레트를 읽고도 같은 판정 반복
// [!code error]
const chartSeries = seriesItems.map((series, index) => ({
	id: series.id,
// [!code error]
	colorToken: colorTokenById.get(series.id) ?? toSeriesColorToken(series.role, index),
}));

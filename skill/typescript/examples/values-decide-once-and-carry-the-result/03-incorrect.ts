// 범례
const legendSeries = seriesItems.map((series, seriesIndex) => ({
	id: series.id,
	colorToken: toSeriesColorToken(series.role, seriesIndex),
}));

// 차트 둘. 범례 팔레트를 읽고도 같은 판정 반복
const chartSeries = seriesItems.map((series, index) => ({
	id: series.id,
	colorToken: colorTokenById.get(series.id) ?? toSeriesColorToken(series.role, index),
}));

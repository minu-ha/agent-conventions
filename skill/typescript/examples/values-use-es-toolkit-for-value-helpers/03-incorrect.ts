const toChartBounds = (points: readonly ChartPoint[]) => {
// [!code error]
	const yValues = points.map((point) => point.y);

// [!code error]
	if (yValues.length === 0) {
		return undefined;
	}

// [!code error]
	return {min: Math.min(...yValues), max: Math.max(...yValues)};
};

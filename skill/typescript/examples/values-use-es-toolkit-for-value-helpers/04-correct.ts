import {maxBy, minBy} from "es-toolkit";

const toChartBounds = (points: readonly ChartPoint[]) => {
	const lowestPoint = minBy(points, (point) => point.y);
	const highestPoint = maxBy(points, (point) => point.y);

	if (lowestPoint === undefined || highestPoint === undefined) {
		return undefined;
	}

	return {min: lowestPoint.y, max: highestPoint.y};
};

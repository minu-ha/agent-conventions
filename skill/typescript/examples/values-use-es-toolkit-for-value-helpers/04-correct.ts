// [!code ++]
import {maxBy, minBy} from "es-toolkit";

const toChartBounds = (points: readonly ChartPoint[]) => {
// [!code ++]
	const lowestPoint = minBy(points, (point) => point.y);
// [!code ++]
	const highestPoint = maxBy(points, (point) => point.y);

// [!code ++]
	if (lowestPoint === undefined || highestPoint === undefined) {
		return undefined;
	}

// [!code ++]
	return {min: lowestPoint.y, max: highestPoint.y};
};

// component/ui/line-chart/ui-line-chart.tsx
/**
 * 꺾은선 그래프 계약
 */
export interface UiLineChartProps {
	/**
	 * 그래프의 접근 가능한 이름
	 */
	title: string;
	/**
	 * 그릴 좌표. 어느 도메인의 값인지 모름
	 */
	points: ChartPoint[];
}

export const UiLineChart = (props: UiLineChartProps) => {
	return (
		<svg className={clsx("ui_lineChart__root")} viewBox="0 0 100 40">
			<title>{props.title}</title>
			<polyline points={props.points.map((point) => `${point.x},${point.y}`).join(" ")} />
		</svg>
	);
};

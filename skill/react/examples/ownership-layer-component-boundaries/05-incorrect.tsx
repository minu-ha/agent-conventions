// [!code error]
// component/widget/line-chart/wg-line-chart.tsx
/**
 * 꺾은선 그래프 계약
 */
export interface WgLineChartProps {
	/**
	 * 그래프의 접근 가능한 이름
	 */
	title: string;
	/**
	 * 그릴 좌표. 어느 도메인의 값인지 모름
	 */
	points: ChartPoint[];
}

// 좌표 배열만 받고 도메인 타입을 모름. 조립 규모만 보고 widget에 둠
// [!code error]
export const WgLineChart = (props: WgLineChartProps) => {
	return (
		<svg className={clsx("wg_lineChart__root")} viewBox="0 0 100 40">
			<title>{props.title}</title>
			<polyline points={props.points.map((point) => `${point.x},${point.y}`).join(" ")} />
		</svg>
	);
};

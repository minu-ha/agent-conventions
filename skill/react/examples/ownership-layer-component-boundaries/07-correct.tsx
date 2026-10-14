// component/widget/chart-card/wg-chart-card.tsx
import {UiLineChart} from "@/component/ui/line-chart/ui-line-chart";

export const WgChartCard = (props: WgChartCardProps) => {
	return <UiLineChart title="일별 주문 수" points={toChartPoints(props.dailyCounts)} />;
};

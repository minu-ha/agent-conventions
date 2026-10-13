// component/widget/chart-card/wg-chart-card.tsx
import {UiLineChart} from "@/component/ui/line-chart/ui-line-chart";

export const WgChartCard = (props: WgChartCardProps) => {
	return <UiLineChart points={toChartPoints(props.dailyCounts)} />;
};

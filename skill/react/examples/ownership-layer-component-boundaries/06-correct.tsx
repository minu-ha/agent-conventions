// component/ui/line-chart/ui-line-chart.tsx
export const UiLineChart = (props: UiLineChartProps) => {
	return <span className={clsx("ui_lineChart__root")}>{props.children}</span>;
};

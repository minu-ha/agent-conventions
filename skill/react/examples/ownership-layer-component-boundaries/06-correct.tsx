// [!code ++]
// component/ui/line-chart/ui-line-chart.tsx
// [!code ++]
export const UiLineChart = (props: UiLineChartProps) => {
// [!code ++]
	return <svg className={clsx("ui_lineChart__root")}>{props.children}</svg>;
};

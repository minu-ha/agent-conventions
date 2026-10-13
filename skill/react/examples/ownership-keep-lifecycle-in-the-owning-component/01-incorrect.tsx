// component/widget/chart-card/wg-chart-card.tsx
// [!code error]
// 생성, resize, 정리가 _hook/use-chart-instance.ts로 빠져 이 파일에서는 실행 흐름이 안 보임
export const WgChartCard = (props: WgChartCardProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
// [!code error]
	const chart = useChartInstance(containerRef);

	/**
	 * option이 바뀌면 기존 인스턴스에 다시 반영
	 */
	useEffect(() => {
// [!code error]
		chart?.setOption(props.option);
// [!code error]
	}, [chart, props.option]);

	return <div ref={containerRef} className={clsx("wg_chartCard__canvas")} />;
};

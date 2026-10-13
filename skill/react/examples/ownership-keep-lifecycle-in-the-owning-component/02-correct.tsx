// component/widget/chart-card/wg-chart-card.tsx
export const WgChartCard = (props: WgChartCardProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<ChartInstance | null>(null);

	/**
	 * 컨테이너 마운트 시 차트 인스턴스를 만들고 resize, dispose까지 소유
	 */
	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		// 외부 차트 라이브러리 인스턴스. 만든 컴포넌트가 resize와 dispose까지 책임
		const instance = mountChart(containerRef.current);
		const handleResize = () => {
			instance.resize();
		};

		window.addEventListener("resize", handleResize);
		chartRef.current = instance;

		return () => {
			chartRef.current = null;
			window.removeEventListener("resize", handleResize);
			instance.dispose();
		};
	}, []);

	/**
	 * option이 바뀌면 기존 인스턴스에 다시 반영
	 */
	useEffect(() => {
		chartRef.current?.setOption(props.option);
	}, [props.option]);

	return <div ref={containerRef} className={clsx("wg_chartCard__canvas")} />;
};

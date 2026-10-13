// component/widget/chart-card/wg-chart-card.tsx
export const WgChartCard = (props: WgChartCardProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
// [!code ++]
	const chartRef = useRef<ChartInstance | null>(null);

// [!code ++]
	/**
// [!code ++]
	 * 컨테이너 마운트 시 차트 인스턴스를 만들고 resize, dispose까지 소유
// [!code ++]
	 */
// [!code ++]
	useEffect(() => {
// [!code ++]
		if (!containerRef.current) {
// [!code ++]
			return;
// [!code ++]
		}

// [!code ++]
		// 외부 차트 라이브러리 인스턴스. 만든 컴포넌트가 resize와 dispose까지 책임
// [!code ++]
		const instance = mountChart(containerRef.current);
// [!code ++]
		const handleResize = () => {
// [!code ++]
			instance.resize();
// [!code ++]
		};

// [!code ++]
		window.addEventListener("resize", handleResize);
// [!code ++]
		chartRef.current = instance;

// [!code ++]
		return () => {
// [!code ++]
			chartRef.current = null;
// [!code ++]
			window.removeEventListener("resize", handleResize);
// [!code ++]
			instance.dispose();
// [!code ++]
		};
// [!code ++]
	}, []);

	/**
	 * option이 바뀌면 기존 인스턴스에 다시 반영
	 */
	useEffect(() => {
// [!code ++]
		chartRef.current?.setOption(props.option);
// [!code ++]
	}, [props.option]);

	return <div ref={containerRef} className={clsx("wg_chartCard__canvas")} />;
};

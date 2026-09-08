# Keep Library Lifecycle in the Owning Component

**Impact: MEDIUM (외부 라이브러리의 생명주기와 실행 흐름을 소유 컴포넌트에서 확인할 수 있습니다)**

외부 라이브러리의 인스턴스 생성 · 크기 변경 · 이벤트 구독 · 정리는 하위 트리를 소유한 컴포넌트에 둡니다.
파일 분량을 줄이려고 생명주기를 커스텀 훅으로 옮기지 않습니다.

| 상황 | 처리 |
| --- | --- |
| 한 소유자만 쓰는 생명주기 | 해당 컴포넌트의 이펙트에 둡니다 |
| 여러 소유자가 같은 생명주기 계약을 실제로 호출함 | 훅으로 추출합니다 |
| 파일이 길어짐 | 생명주기 대신 도메인 계산을 `_function`으로 분리합니다 |
| 이펙트 정리 · 재설치 | 정리할 때 인스턴스 참조를 비우고 다시 설치할 때 새로 만듭니다. 상태에 남은 폐기된 인스턴스를 재사용하지 않습니다 |

순수 계산을 훅으로 감싸는 문제는 `ownership-prefer-plain-ts-for-local-react-helpers`를 따릅니다.

**Incorrect (파일 분량을 줄이려고 생명주기를 훅으로 옮깁니다):**

```tsx
// component/widget/chart/chart-root/wg-chart-root.tsx
// 생성 · resize · 정리가 _hook/use-chart-instance.ts로 빠져 이 파일에서는 실행 흐름이 보이지 않는다
export const WgChartRoot = (props: WgChartRootProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const chart = useChartInstance(containerRef);

	/**
	 * option이 바뀌면 기존 instance에 다시 반영
	 */
	useEffect(() => {
		chart?.setOption(props.option);
	}, [chart, props.option]);

	return <div ref={containerRef} className={clsx("wg_chart__canvas")} />;
};
```

**Correct (생명주기를 소유 컴포넌트가 직접 가집니다):**

```tsx
// component/widget/chart/chart-root/wg-chart-root.tsx
export const WgChartRoot = (props: WgChartRootProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<ChartInstance | null>(null);

	/**
	 * container mount 시 chart instance를 만들고 resize · dispose까지 소유
	 */
	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		// 외부 차트 라이브러리 인스턴스. 만든 컴포넌트가 resize 와 dispose 까지 책임진다
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
	 * option이 바뀌면 기존 instance에 다시 반영
	 */
	useEffect(() => {
		chartRef.current?.setOption(props.option);
	}, [props.option]);

	return <div ref={containerRef} className={clsx("wg_chart__canvas")} />;
};
```

> 나머지 예시 · 예외는 [full rule](../rules/01-06-ownership-keep-lifecycle-in-the-owning-component.md)에 있습니다.

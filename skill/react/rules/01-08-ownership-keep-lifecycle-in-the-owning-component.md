---
title: Keep Library Lifecycle in the Owning Component
titleKo: 라이브러리 lifecycle의 소유 컴포넌트 직접 보유
impact: HIGH
impactDescription: 파일 길이를 줄이려고 lifecycle을 hook 뒤로 숨겨 실행 흐름이 사라지는 것을 막습니다
appliesWhen:
  - 외부 library instance 생성·resize·구독·dispose를 한 component가 소유할 때
  - lifecycle 코드를 custom hook으로 옮겨 파일을 줄이려 할 때
  - 제외: 여러 owner가 같은 lifecycle 계약을 실제로 호출하는 경우
reviewWith: ownership-prefer-plain-ts-for-local-react-helpers
tags: ownership, lifecycle, hooks, library
---

## Keep Library Lifecycle in the Owning Component

**Impact: HIGH (파일 길이를 줄이려고 lifecycle을 hook 뒤로 숨겨 실행 흐름이 사라지는 것을 막습니다)**

외부 library의 instance 생성, resize, 이벤트 구독, dispose는 그 subtree를 소유한 component가 직접 가집니다.
파일이 길어졌다는 이유만으로 custom hook을 만들어 lifecycle을 숨기지 않습니다.

- 한 owner만 쓰는 lifecycle은 그 component 안의 effect로 둡니다.
- LOC 감소는 추출 근거가 아닙니다. 읽는 사람이 파일을 왕복하게 만들 뿐입니다.
- 여러 owner가 같은 lifecycle 계약을 실제로 호출할 때만 hook으로 올립니다.
- 파일이 길면 lifecycle을 옮기기보다 도메인 계산을 `function`으로 분리합니다.

`ownership-prefer-plain-ts-for-local-react-helpers`는 순수 계산을 hook으로 포장하는 것을 막고,
이 규칙은 반대로 실제 lifecycle이 있어도 분량 때문에 hook으로 옮기는 것을 막습니다.

**Incorrect (LOC를 줄이려고 lifecycle을 hook 뒤로 옮김):**

```tsx
// component/chart-root/use-chart-instance.ts
export const useChartInstance = (containerRef: RefObject<HTMLDivElement>) => {
	const [chart, setChart] = useState<EChartsType | null>(null);

	useEffect(() => {
		const instance = init(containerRef.current);
		const handleResize = () => instance.resize();

		window.addEventListener("resize", handleResize);
		setChart(instance);

		return () => {
			window.removeEventListener("resize", handleResize);
			instance.dispose();
		};
	}, [containerRef]);

	return chart;
};
```

```tsx
// component/chart-root/chart-root.tsx
export const ChartRoot = (props: ChartRootProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const chart = useChartInstance(containerRef);

	return <div ref={containerRef} className="wg_chart__canvas" />;
};
```

**Correct (lifecycle을 소유 component가 직접 가짐):**

```tsx
// component/chart-root/chart-root.tsx
export const ChartRoot = (props: ChartRootProps) => {
	const { option } = props;
	const containerRef = useRef<HTMLDivElement>(null);
	const [chart, setChart] = useState<EChartsType | null>(null);

	/**
	 * container mount 시 chart instance를 만들고 resize·dispose까지 소유
	 */
	useEffect(() => {
		if (!containerRef.current) return;

		const instance = init(containerRef.current);
		const handleResize = () => instance.resize();

		window.addEventListener("resize", handleResize);
		setChart(instance);

		return () => {
			window.removeEventListener("resize", handleResize);
			instance.dispose();
		};
	}, []);

	/**
	 * option이 바뀌면 기존 instance에 다시 반영
	 */
	useEffect(() => {
		chart?.setOption(option);
	}, [chart, option]);

	return <div ref={containerRef} className="wg_chart__canvas" />;
};
```

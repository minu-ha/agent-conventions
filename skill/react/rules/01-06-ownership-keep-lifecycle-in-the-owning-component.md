---
title: Keep Library Lifecycle in the Owning Component
titleKo: 라이브러리 생명주기는 소유 컴포넌트가 직접 갖습니다
impact: MEDIUM
impactDescription: 파일 길이를 줄이려고 생명주기를 훅 뒤로 숨겨 실행 흐름이 사라지지 않습니다
appliesWhen:
  - 외부 라이브러리 인스턴스 생성·크기 변경·구독·정리를 한 컴포넌트가 소유할 때
  - 생명주기 코드를 커스텀 훅으로 옮겨 파일을 줄이려 할 때
  - 제외: 여러 소유자가 같은 생명주기 계약을 실제로 호출하는 경우
reviewWith: ownership-prefer-plain-ts-for-local-react-helpers
tags: ownership, hooks
---

## Keep Library Lifecycle in the Owning Component

**Impact: MEDIUM (파일 길이를 줄이려고 생명주기를 훅 뒤로 숨겨 실행 흐름이 사라지지 않습니다)**

외부 라이브러리의 인스턴스 생성, 크기 변경, 이벤트 구독, 정리는 그 하위 트리를 소유한 컴포넌트가 직접 가집니다.
파일이 길어졌다는 이유만으로 커스텀 훅을 만들어 생명주기를 숨기지 않습니다.

- 한 소유자만 쓰는 생명주기는 그 컴포넌트 안의 이펙트로 둡니다.
- 줄 수 감소는 추출 근거가 아닙니다.
  읽는 사람이 파일을 왕복하게 만들 뿐입니다.
- 여러 소유자가 같은 생명주기 계약을 실제로 호출할 때만 훅으로 올립니다.
- 파일이 길면 생명주기를 옮기기보다 도메인 계산을 `_function`으로 분리합니다.

`ownership-prefer-plain-ts-for-local-react-helpers`는 순수 계산을 훅으로 포장하는 것을 막고,
이 규칙은 반대로 실제 생명주기가 있어도 분량 때문에 훅으로 옮기는 것을 막습니다.

**Incorrect (줄 수를 줄이려고 생명주기를 훅 뒤로 옮김):**

```ts
// component/widget/chart/chart-root/_hook/use-chart-instance.ts
export const useChartInstance = (containerRef: RefObject<HTMLDivElement | null>) => {
	const [chart, setChart] = useState<EChartsType | null>(null);

	useEffect(() => {
		const instance = init(containerRef.current);
		const handleResize = () => {
			instance.resize();
		};

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
// component/widget/chart/chart-root/wg-chart-root.tsx
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

**Correct (생명주기를 소유 컴포넌트가 직접 가짐):**

```tsx
// component/widget/chart/chart-root/wg-chart-root.tsx
export const WgChartRoot = (props: WgChartRootProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [chart, setChart] = useState<EChartsType | null>(null);

	/**
	 * container mount 시 chart instance를 만들고 resize·dispose까지 소유
	 */
	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const instance = init(containerRef.current);
		const handleResize = () => {
			instance.resize();
		};

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
		chart?.setOption(props.option);
	}, [chart, props.option]);

	return <div ref={containerRef} className={clsx("wg_chart__canvas")} />;
};
```

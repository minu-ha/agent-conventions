---
title: Order Hooks, Handlers, Effects, Then Return
titleKo: 본문은 훅, 핸들러, 이펙트, 반환 순으로 배치합니다
impact: HIGH
impactDescription: 컴포넌트마다 훅 · 핸들러 · 이펙트를 같은 순서로 찾을 수 있습니다
appliesWhen:
  - 컴포넌트 본문에 훅 · 핸들러 · 이펙트를 추가하거나 자리를 옮길 때
  - 본문 선언이 아래 선언을 참조해 순서를 다시 잡을 때
reviewWith: screen-keep-derived-values-close, events-run-user-actions-in-handlers-not-effects
tags: composition, ordering
---

## Order Hooks, Handlers, Effects, Then Return

**Impact: HIGH (컴포넌트마다 훅 · 핸들러 · 이펙트를 같은 순서로 찾을 수 있습니다)**

컴포넌트 본문은 아래 네 구획 순서로 작성합니다.
렌더 중에 읽는 값은 사용 위치보다 위에서 선언합니다.

| 순서 | 구획 | 내용 |
| --- | --- | --- |
| 1 | 훅 | 라우터 · 스토어 · 쿼리 · 컨텍스트 · 커스텀 훅과 `useState`, `useRef` |
| 2 | 핸들러 | `handle*` 함수 |
| 3 | 이펙트 | `useEffect`, `useLayoutEffect` |
| 4 | 반환 | 이른 반환과 JSX |

이펙트의 인자와 의존성 배열은 해당 줄에서 평가되므로, 이펙트를 마지막 훅으로 두어 앞선 선언을 참조합니다.
이른 반환은 모든 훅 뒤에 두어 렌더마다 훅 호출 개수를 유지합니다.
구획 안에서는 선언 뒤에 참조한다는 조건만 지키고 별도 순서를 강제하지 않습니다.
파생 값은 별도 구획으로 모으지 않고 `screen-keep-derived-values-close`에 따라 사용하는 곳에서 계산합니다.

**Incorrect (같은 종류가 흩어지고 이펙트가 아래 선언을 의존성으로 참조합니다):**

```tsx
export const PgOrderToolbar = () => {
	// selectedIds는 아직 초기화 전이라 의존성 배열을 평가하는 이 줄에서 깨진다
	useEffect(() => {
		document.title = `주문 ${selectedIds.length}건 선택`;
	}, [selectedIds]);

	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const handleClearButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		setSelectedIds([]);
	};

	const [isPanelOpen, setIsPanelOpen] = useState(false);

	const handlePanelOpenButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		setIsPanelOpen(true);
	};

	return (
		<section className={clsx("pg_orderToolbar__root")}>
			<UiButton onClick={handleClearButtonClick}>비우기</UiButton>
			<UiButton onClick={handlePanelOpenButtonClick}>필터</UiButton>
			{isPanelOpen && <PgOrderFilterPanel />}
		</section>
	);
};
```

**Correct (네 구획이 순서대로 놓입니다):**

```tsx
export const PgOrderToolbar = () => {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [isPanelOpen, setIsPanelOpen] = useState(false);

	/**
	 * 비우기는 선택만 지우고 패널은 그대로 둔다
	 */
	const handleClearButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		setSelectedIds([]);
	};

	/**
	 * 필터 패널 열기
	 */
	const handlePanelOpenButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		setIsPanelOpen(true);
	};

	useEffect(() => {
		document.title = `주문 ${selectedIds.length}건 선택`;
	}, [selectedIds]);

	return (
		<section className={clsx("pg_orderToolbar__root")}>
			<UiButton onClick={handleClearButtonClick}>비우기</UiButton>
			<UiButton onClick={handlePanelOpenButtonClick}>필터</UiButton>
			{isPanelOpen && <PgOrderFilterPanel />}
		</section>
	);
};
```

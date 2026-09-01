---
title: Order Hooks, Handlers, Effects, Then Return
titleKo: 본문은 훅, 핸들러, 이펙트, 반환 순으로 배치합니다
impact: MEDIUM
impactDescription: 어느 컴포넌트를 열어도 같은 자리에서 같은 종류를 찾습니다
appliesWhen:
  - 컴포넌트 본문에 훅·핸들러·이펙트를 추가하거나 자리를 옮길 때
  - 본문 선언이 아래 선언을 참조해 순서를 다시 잡을 때
reviewWith: screen-keep-derived-values-close, events-run-user-actions-in-handlers-not-effects
tags: composition, ordering
---

## Order Hooks, Handlers, Effects, Then Return

**Impact: MEDIUM (어느 컴포넌트를 열어도 같은 자리에서 같은 종류를 찾습니다)**

컴포넌트 본문은 네 구획을 이 순서로 둡니다.

| 순서 | 구획 | 담는 것 |
| --- | --- | --- |
| 1 | 훅 | 라우터·스토어·쿼리·컨텍스트·커스텀 훅과 `useState`·`useRef` |
| 2 | 핸들러 | `handle*` 함수 |
| 3 | 이펙트 | `useEffect`·`useLayoutEffect` |
| 4 | 반환 | 이른 반환과 JSX |

본문은 렌더마다 위에서 아래로 실행되므로 렌더 중에 값을 읽는 자리는 그보다 위에 선언된 것만 읽습니다.
네 구획은 그 제약을 그대로 따른 것입니다.

- 이펙트의 인자와 의존성 배열은 그 줄에서 바로 평가됩니다.
  이펙트를 마지막 훅으로 두면 본문의 어떤 선언이든 의존성에 넣을 수 있습니다.
- 이른 반환은 어떤 훅보다도 뒤에 옵니다.
  훅 호출 개수가 렌더마다 같아야 하기 때문입니다.
- 구획 안에서는 참조가 선언 뒤에 오게만 하고 순서를 더 정하지 않습니다.
- 파생 값은 구획이 아닙니다.
  `screen-keep-derived-values-close`대로 쓰는 자리에서 계산합니다.

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

	return <section className={clsx("pg_orderToolbar__root")}>{/* ... */}</section>;
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

---
title: Defer Heavy Renders Only With Measured Evidence
titleKo: 측정한 근거가 있을 때만 무거운 렌더를 미룹니다
impact: MEDIUM
impactDescription: 무겁다고 짐작해서 트랜지션과 지연 값으로 감싸지 않고 실제로 무거운 자리만 미룹니다
appliesWhen:
  - `startTransition`·`useTransition`·`useDeferredValue`를 추가·삭제할 때
  - 목록이나 표가 커져 입력 반응이 늦다는 보고를 받았을 때
reviewWith: perf-avoid-defensive-memoization
tags: perf, state
---

## Defer Heavy Renders Only With Measured Evidence

**Impact: MEDIUM (무겁다고 짐작해서 트랜지션과 지연 값으로 감싸지 않고 실제로 무거운 자리만 미룹니다)**

렌더를 미루는 도구는 `startTransition`, `useTransition`, `useDeferredValue`입니다.
**먼저 미룰 만큼 무거운지 확인합니다.**

`perf-avoid-defensive-memoization`이 허용하는 세 사유 중 측정한 병목 하나만 여기서 근거가 됩니다.
목록이 몇 줄인지, 어느 조작이 몇 밀리초 걸렸는지 확인한 뒤에 씁니다.
"목록이 커질 것 같아서"는 근거가 아닙니다.

미루기로 했으면 원인이 어디에 있느냐에 따라 도구가 갈립니다.

| 원인 | 쓰는 것 |
| --- | --- |
| 내가 부르는 `setState`가 무거운 렌더를 일으킴 | `startTransition`으로 그 호출을 감쌉니다 |
| 값은 즉시 반응해야 하는데 그 값에서 파생되는 렌더가 무거움 | `useDeferredValue`로 한 박자 지연 값을 만듭니다 |

`set` 함수가 내 것이 아니면 `startTransition`을 쓸 수 없습니다.
그때는 `useDeferredValue`입니다.

- 입력값 자체, 폼 오류, 즉시 비활성화처럼 급한 반응은 트랜지션에 넣지 않습니다.
- `startTransition`은 대기 상태를 알려 주지 않습니다.
  진행 표시가 필요하면 `useTransition`의 `isPending`을 씁니다.
- `await` 뒤에 상태를 갱신하면 그 갱신을 다시 `startTransition`으로 감쌉니다.
  `await` 뒤에는 트랜지션 범위가 끊깁니다.
  리액트가 비동기 문맥을 이어가지 못하기 때문입니다.
- 무거운 하위 트리의 렌더를 늦추려면 지연 값을 받는 컴포넌트가 `memo`여야 합니다.
  `memo`가 아니면 부모가 다시 렌더할 때 그 트리도 함께 다시 렌더합니다.
- 무거운 것이 하위 트리 렌더가 아니라 계산이면 `memo`가 필요 없습니다.
  `useMemo`가 지연 값에서만 다시 계산하므로 급한 입력 렌더는 그 계산을 건너뜁니다.
- 지연 값 기준 재계산에 `useMemo`를 함께 쓰는 것은 `perf-avoid-defensive-memoization`의 허용 사유에 듭니다.
  그때도 측정한 근거를 주석으로 남깁니다.

**Incorrect (행 20개 목록을 다시 그리는 갱신까지 트랜지션으로 감쌉니다):**

```tsx
const [selectedTagId, setSelectedTagId] = useState("all");
const tagRows = responseTagListSuspense.data.tags.slice(0, 20);

const handleTagClick = (nextTagId: string) => {
	startTransition(() => {
		setSelectedTagId(nextTagId);
	});
};

return <UiTagRows rows={tagRows} selectedTagId={selectedTagId} />;
```

**Correct (측정 근거가 있는 갱신만 트랜지션으로 감싸고 행 20개 목록은 그대로 둡니다):**

```tsx
const handleTagClick = (nextTagId: string) => {
	setSelectedTagId(nextTagId);
};

const handleStatusFilterChange = (nextStatus: ProductStatusFilter) => {
	// 행 12,000개에서 필터 전환에 320ms가 걸려 클릭이 밀렸다.
	startTransition(() => {
		setStatusFilter(nextStatus);
	});
};
```

**Incorrect (입력과 무거운 파생 렌더를 같은 값에 묶습니다):**

```tsx
const [keyword, setKeyword] = useState("");
const filteredRows = rows.filter((row) => fuzzyMatchRow(row, keyword));
```

**Correct (입력은 즉시 반응하고 무거운 파생 계산만 늦춥니다):**

```tsx
const [keyword, setKeyword] = useState("");
const deferredKeyword = useDeferredValue(keyword);

// 행 12,000개에서 매 렌더 필터링이 180ms로 측정됐다. 늦춘 검색어에만 다시 계산한다.
const filteredRows = useMemo(() => {
	return rows.filter((row) => fuzzyMatchRow(row, deferredKeyword));
}, [deferredKeyword, rows]);

return <PgProductRows rows={filteredRows} />;
```

**Correct (진행 표시가 필요하면 `useTransition`의 `isPending`을 씁니다):**

```tsx
const [isPending, startTransition] = useTransition();

const handleStatusFilterChange = (nextStatus: ProductStatusFilter) => {
	// 행 12,000개에서 필터 전환에 320ms가 걸려 클릭이 밀렸다.
	startTransition(() => {
		setStatusFilter(nextStatus);
	});
};

return <UiFilterBar isBusy={isPending} onStatusChange={handleStatusFilterChange} />;
```

**Correct (`await` 뒤의 상태 갱신은 다시 `startTransition`으로 감쌉니다):**

```tsx
const handleStatusFilterChange = (nextStatus: ProductStatusFilter) => {
	startTransition(async () => {
		const nextRows = await fetchFilteredRows(nextStatus);

		// await 뒤에는 트랜지션 범위가 끊겨 다시 감싸야 급하지 않은 갱신으로 남는다
		startTransition(() => {
			setRows(nextRows);
		});
	});
};
```

**Correct (지연 값을 받는 무거운 하위 트리는 `memo`로 감쌉니다):**

```tsx
// 행 12,000개 표. 부모가 입력값으로 다시 렌더할 때 이 트리까지 따라 그리지 않도록 memo 로 감싼다
export const PgProductRows = memo((props: PgProductRowsProps) => {
	return <UiTable rows={props.rows} />;
});
```

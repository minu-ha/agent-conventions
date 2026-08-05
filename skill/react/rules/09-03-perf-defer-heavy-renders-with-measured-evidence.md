---
title: Defer Heavy Renders Only With Measured Evidence
titleKo: 무거운 렌더를 미루는 것은 측정한 근거가 있을 때만 합니다
impact: MEDIUM
impactDescription: 무겁다고 짐작해서 전환과 지연 값을 두르지 않고 실제로 무거운 자리만 미룹니다
appliesWhen:
  - `startTransition`이나 `useDeferredValue`를 추가·삭제할 때
  - 목록이나 표가 커져 입력 반응이 늦다는 보고를 받았을 때
reviewWith: perf-avoid-defensive-memoization
tags: perf, state, performance
---

## Defer Heavy Renders Only With Measured Evidence

**Impact: MEDIUM (무겁다고 짐작해서 전환과 지연 값을 두르지 않고 실제로 무거운 자리만 미룹니다)**

렌더를 미루는 도구는 둘입니다.
**먼저 미룰 만큼 무거운지 확인합니다.**

`perf-avoid-defensive-memoization`이 메모이제이션에 요구하는 것과 같은 근거를 요구합니다.
목록이 몇 줄인지, 어느 조작이 몇 밀리초 걸렸는지 확인한 뒤에 씁니다.
"목록이 커질 것 같아서"는 근거가 아닙니다.

미루기로 했으면 원인이 어디 있는지로 도구가 갈립니다.

| 원인 | 쓰는 것 |
| --- | --- |
| 내가 부르는 `setState`가 무거운 렌더를 일으킨다 | `startTransition`으로 그 호출을 감쌉니다 |
| 값은 즉시 반응해야 하는데 그 값에서 파생되는 렌더가 무겁다 | `useDeferredValue`로 한 박자 늦춘 값을 만듭니다 |

`set` 함수가 내 것이 아니면 첫째 줄을 쓸 수 없습니다.
그때는 둘째 줄입니다.

- 입력값 자체, 폼 오류, 즉시 비활성화처럼 급한 반응은 전환에 넣지 않습니다.
- `startTransition`은 대기 상태를 알려 주지 않습니다.
  진행 표시가 필요하면 `useTransition`의 `isPending`을 씁니다.
- `await` 뒤에 상태를 갱신하면 그 갱신을 다시 `startTransition`으로 감쌉니다.
  앞의 전환은 거기서 이미 끝나 있습니다.
- `useDeferredValue`로 늦춘 값을 받는 컴포넌트가 `memo`가 아니면 어차피 다시 렌더합니다.
  받는 쪽을 함께 보지 않으면 늦춘 효과가 없습니다.
- 지연 값 기준 재계산에 `useMemo`를 함께 쓰는 것은 `perf-avoid-defensive-memoization`의 허용 사유에 듭니다.
  그때도 측정한 근거를 주석으로 남깁니다.

**Incorrect (무거운지 확인하지 않고 전환부터 두름):**

```tsx
/**
 * 상태 필터 변경
 */
const handleStatusFilterChange = (nextStatus: ProductStatusFilter) => {
	startTransition(() => {
		setStatusFilter(nextStatus);
	});
};
```

**Incorrect (입력과 무거운 파생 렌더를 같은 값에 묶음):**

```tsx
const [keyword, setKeyword] = useState("");
const filteredRows = rows.filter((row) => fuzzyMatchRow(row, keyword));
```

**Correct (내 `setState`가 원인이고 측정 근거가 있음):**

```tsx
/**
 * 상태 필터 변경
 */
const handleStatusFilterChange = (nextStatus: ProductStatusFilter) => {
	// 행 12000 개에서 필터 전환에 320ms 가 걸려 클릭이 밀렸다.
	startTransition(() => {
		setStatusFilter(nextStatus);
	});
};
```

**Correct (입력은 즉시 반응하고 파생 렌더만 늦춤):**

```tsx
const [keyword, setKeyword] = useState("");
const deferredKeyword = useDeferredValue(keyword);

// 행이 수천 개라 매 렌더 필터링이 측정에서 병목이었다. 늦춘 검색어에만 다시 계산한다.
const filteredRows = useMemo(() => {
	return rows.filter((row) => fuzzyMatchRow(row, deferredKeyword));
}, [deferredKeyword, rows]);

return <PgProductRows rows={filteredRows} />;
```

**Correct (미룰 만큼 무겁지 않으면 그대로 둠):**

```tsx
/**
 * 상태 필터 변경
 */
const handleStatusFilterChange = (nextStatus: ProductStatusFilter) => {
	setStatusFilter(nextStatus);
};
```

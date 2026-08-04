---
title: Use useDeferredValue for Heavy Derived Renders
titleKo: 무거운 파생 화면에는 `useDeferredValue` 를 씁니다
impact: MEDIUM
impactDescription: 무거운 화면이 따라오는 동안에도 입력과 작은 조작이 반응합니다
appliesWhen:
  - 검색어·필터·정렬 입력마다 큰 목록이나 표를 다시 계산해 입력 반응이 늦어질 때
  - `useDeferredValue` 기반 계산을 추가·변경할 때
reviewWith: perf-avoid-defensive-memoization, perf-use-starttransition-for-non-urgent-updates
tags: perf, state, performance
---

## Use useDeferredValue for Heavy Derived Renders

**Impact: MEDIUM (무거운 화면이 따라오는 동안에도 입력과 작은 조작이 반응합니다)**

검색어, 필터, 정렬 입력이 무거운 파생 렌더를 유발하면 원본 입력값을 그대로 무거운 화면에 연결하지 않습니다.
`useDeferredValue`로 한 박자 늦춘 값을 만들고, 필요하면 그 값을 기준으로 필터링이나 정렬을 계산합니다.

- 작은 배열이나 단순 문자열 가공까지 습관적으로 지연하지 않습니다.
- 이 경우의 `useMemo`는 `perf-avoid-defensive-memoization`의 예외적 허용 사례입니다.
  지연 값 기준 재계산 비용이 실제로 크고,
  렌더마다 같은 작업을 반복하지 않으려는 목적이 분명할 때만 함께 씁니다.

내가 부르는 `setState`가 원인이면 이 규칙이 아니라
`perf-use-starttransition-for-non-urgent-updates`로 그 호출을 감쌉니다.
입력은 즉시 반응해야 하고 비용이 그 값에서 파생되는 렌더에 있을 때 이 규칙을 씁니다.

**Incorrect (입력과 무거운 파생 렌더를 같은 값에 묶음):**

```tsx
const [keyword, setKeyword] = useState("");
const filteredRows = rows.filter((row) => fuzzyMatchRow(row, keyword));
```

**Correct (입력은 급한 갱신으로, 무거운 파생 렌더는 지연 값과 제한적인 메모이제이션으로 계산):**

```tsx
const [keyword, setKeyword] = useState("");
const deferredKeyword = useDeferredValue(keyword);

// 지연한 검색어에만 다시 계산하도록 묶는다. 행이 수천 개라 매 렌더 필터링은 측정에서 병목이었다.
const filteredRows = useMemo(() => {
	return rows.filter((row) => fuzzyMatchRow(row, deferredKeyword));
}, [deferredKeyword, rows]);
```

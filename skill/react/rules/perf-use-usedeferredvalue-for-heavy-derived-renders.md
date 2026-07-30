---
title: Use useDeferredValue for Heavy Derived Renders
titleKo: 무거운 파생 렌더에는 useDeferredValue
impact: MEDIUM
impactDescription: keeps typing and small interactions responsive while expensive derived views catch up
appliesWhen: >-
  검색어·필터·정렬 입력이 무거운 파생 view를 갱신해 typing 지연이 생기거나 `useDeferredValue` 기반 계산을 추가·변경한다.
reviewWith: perf-compiler-first-memoization, perf-use-starttransition-for-non-urgent-updates
tags: state, usedeferredvalue, performance, derived
---

## Use useDeferredValue for Heavy Derived Renders

**Impact: MEDIUM (keeps typing and small interactions responsive while expensive derived views catch up)**

검색어, 필터, 정렬 입력이 무거운 파생 렌더를 유발하면 원본 입력값을 그대로 expensive view에 연결하지 않습니다.
`useDeferredValue`로 한 박자 늦춘 값을 만들고, 필요하면 그 값을 기준으로 필터링이나 정렬을 계산합니다.

- 작은 배열이나 단순 문자열 가공까지 습관적으로 defer하지 않습니다.
- 이 경우의 `useMemo`는 `perf-compiler-first-memoization`의 예외적 허용 사례입니다.
  deferred value 기준 재계산 비용이 실제로 크고,
  render마다 같은 작업을 반복하지 않으려는 목적이 분명할 때만 함께 씁니다.

**Incorrect (입력과 무거운 파생 렌더를 같은 값에 묶음):**

```tsx
const [keyword, setKeyword] = useState("");
const filteredRows = rows.filter((row) => fuzzyMatchRow(row, keyword));
```

**Correct (입력은 urgent, 무거운 파생 렌더는 deferred 값과 제한적인 memoization으로 계산):**

```tsx
const [keyword, setKeyword] = useState("");
const deferredKeyword = useDeferredValue(keyword);

const filteredRows = useMemo(() => {
	return rows.filter((row) => fuzzyMatchRow(row, deferredKeyword));
}, [deferredKeyword, rows]);
```

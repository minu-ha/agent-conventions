---
title: Use Lazy State Initializers for Expensive Defaults
titleKo: 초기값 계산이 비싸면 지연 초기화를 씁니다
impact: MEDIUM
impactDescription: 초기 상태 계산이 무거울 때 준비 작업이 렌더마다 되풀이되지 않습니다
appliesWhen:
  - `useState` 초기값에 localStorage 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용 있는 계산을 넣을 때
tags: perf, state, performance
---

## Use Lazy State Initializers for Expensive Defaults

**Impact: MEDIUM (초기 상태 계산이 무거울 때 준비 작업이 렌더마다 되풀이되지 않습니다)**

`useState` 초기값이 `localStorage` 파싱, 인덱스 생성,
큰 배열 정규화처럼 무거운 계산이라면 값을 바로 넣지 말고 초기화 함수로 감쌉니다.
숫자나 문자열 같은 값, 프롭을 그대로 넘기는 경우까지 감쌀 필요는 없습니다.

**Incorrect (비싼 초기화가 렌더마다 다시 평가됨):**

```tsx
const [searchIndex] = useState(toSearchIndex(productList));
const [draftFilter] = useState(JSON.parse(localStorage.getItem("product-filter") ?? "{}"));
```

**Correct (비싼 초기화는 최초 렌더에서만 수행):**

```tsx
const [searchIndex] = useState(() => toSearchIndex(productList));
const [draftFilter] = useState(() => {
	const storedValue = localStorage.getItem("product-filter");
	return storedValue ? JSON.parse(storedValue) : {};
});
```

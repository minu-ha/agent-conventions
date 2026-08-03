---
title: Use Lazy State Initializers for Expensive Defaults
titleKo: 초기값 계산이 비싸면 지연 초기화를 씁니다
impact: MEDIUM
impactDescription: 초기 상태 계산이 무거울 때 준비 작업이 렌더마다 되풀이되지 않습니다
appliesWhen:
  - `useState` 초기값에 localStorage 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용 있는 계산을 넣을 때
tags: state, usestate, initialization, performance
---

## Use Lazy State Initializers for Expensive Defaults

**Impact: MEDIUM (초기 상태 계산이 무거울 때 준비 작업이 렌더마다 되풀이되지 않습니다)**

`useState` 초기값이 localStorage 파싱, 인덱스 생성,
큰 배열 정규화처럼 무거운 계산이라면 값을 바로 넣지 말고 initializer 함수로 감쌉니다.
싼 literal이나 단순 prop passthrough까지 전부 함수형으로 감쌀 필요는 없습니다.

**Incorrect (비싼 초기화가 렌더마다 다시 평가됨):**

```tsx
const [searchIndex] = useState(buildSearchIndex(entryList));
const [draftFilter] = useState(JSON.parse(localStorage.getItem("entry-filter") ?? "{}"));
```

**Correct (비싼 초기화는 최초 렌더에서만 수행):**

```tsx
const [searchIndex] = useState(() => buildSearchIndex(entryList));
const [draftFilter] = useState(() => {
	const storedValue = localStorage.getItem("entry-filter");
	return storedValue ? JSON.parse(storedValue) : {};
});
```

---
title: Calculate Derived Values During Rendering
titleKo: 파생값은 렌더 중에 계산합니다
impact: HIGH
impactDescription: 지금 입력으로 구할 수 있는 값을 상태로 두고 이펙트로 맞추지 않습니다
appliesWhen:
  - 현재 프롭스·상태·검색·응답에서 계산 가능한 값을 별도 상태와 이펙트로 동기화할 때
  - 그런 동기화를 제거할 때
requiresSelected: screen-keep-derived-values-close
tags: state, effects
---

## Calculate Derived Values During Rendering

**Impact: HIGH (지금 입력으로 구할 수 있는 값을 상태로 두고 이펙트로 맞추지 않습니다)**

현재 프롭스, 상태, 검색, 응답에서 바로 계산할 수 있는 값은
`useEffect`와 `useState`로 다시 동기화하지 않습니다.
렌더 중에 계산하면 추가 렌더와 어긋남이 줄고, 이펙트 의존성도 억지로 늘어나지 않습니다.

파생값은 렌더 중에 만들고 사용 지점 가까이에 둡니다.
배치 기준은 `screen-keep-derived-values-close`가 함께 정합니다.

**Incorrect (파생값을 이펙트로 다시 상태에 동기화):**

```tsx
const [selectedCount, setSelectedCount] = useState(0);

useEffect(() => {
	setSelectedCount(selectedIds.length);
}, [selectedIds]);
```

**Correct (렌더 중에 바로 계산):**

```tsx
return <SelectedCountBadge count={selectedIds.length} />;
```

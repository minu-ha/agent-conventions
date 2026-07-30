---
title: Calculate Derived Values During Rendering
titleKo: 파생 값의 렌더 중 계산
impact: HIGH
impactDescription: 현재 입력에서 계산할 수 있는 값의 불필요한 state 동기화와 effect 기반 어긋남을 막습니다
impactDescriptionKo: 현재 입력에서 계산할 수 있는 값의 불필요한 state 동기화와 effect 기반 어긋남을 막습니다
appliesWhen: >-
  현재 props·state·search·response에서 계산 가능한 값을 별도 state와 effect로 동기화하거나 그 동기화를 제거한다.
requiresSelected: screen-keep-derived-values-close
tags: state, derived-state, render, effects
---

## Calculate Derived Values During Rendering

**Impact: HIGH (현재 입력에서 계산할 수 있는 값의 불필요한 state 동기화와 effect 기반 어긋남을 막습니다)**

현재 props, state, search, response에서 바로 계산할 수 있는 값은
`useEffect`와 `useState`로 다시 동기화하지 않습니다.
render 중에 계산하면 추가 렌더와 drift가 줄고, effect dependency도 억지로 늘어나지 않습니다.

파생값은 render 중에 만들고 사용 지점 가까이에 둡니다.
배치 기준은 `screen-keep-derived-values-close`가 함께 정합니다.

**Incorrect (파생값을 effect로 다시 state에 동기화):**

```tsx
const [selectedCount, setSelectedCount] = useState(0);

useEffect(() => {
	setSelectedCount(selectedIds.length);
}, [selectedIds]);
```

**Correct (render 중에 바로 계산):**

```tsx
return <SelectedCountBadge count={selectedIds.length} />;
```

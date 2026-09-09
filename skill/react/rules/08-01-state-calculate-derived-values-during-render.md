---
title: Calculate Derived Values During Rendering
titleKo: 파생값은 렌더 중에 계산합니다
impact: HIGH
impactDescription: 지금 입력으로 구할 수 있는 값은 상태에 두지 않고 렌더에서 계산합니다
appliesWhen:
  - 현재 프롭스, 상태, search 파라미터, 응답에서 계산 가능한 값을 별도 상태와 이펙트로 동기화할 때
  - 파생값 동기화 이펙트를 제거할 때
reviewWith: screen-keep-derived-values-close, state-store-derived-authority
tags: state, effects
---

## Calculate Derived Values During Rendering

**Impact: HIGH (지금 입력으로 구할 수 있는 값은 상태에 두지 않고 렌더에서 계산합니다)**

현재 프롭스 · 상태 · search 파라미터 · 응답으로 계산할 수 있는 값은 렌더 중에 구합니다.
`useState`에 복제해 `useEffect`로 동기화하면 추가 렌더와 값의 어긋남이 생기기 쉽습니다.

계산 위치는 `screen-keep-derived-values-close`에 따라 사용처 가까이에 둡니다.
여러 화면이 공유하는 파생 판단을 스토어에 채우는 이펙트만 예외이며,
허용 조건은 `state-store-derived-authority`를 따릅니다.

**Incorrect 1 (파생값을 이펙트로 다시 상태에 동기화합니다):**

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [selectedCount, setSelectedCount] = useState(0);

useEffect(() => {
	setSelectedCount(selectedIds.length);
}, [selectedIds]);
```

**Correct 1 (같은 `selectedIds`에서 렌더 중에 바로 계산합니다):**

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);

return <UiSelectedCountBadge count={selectedIds.length} />;
```

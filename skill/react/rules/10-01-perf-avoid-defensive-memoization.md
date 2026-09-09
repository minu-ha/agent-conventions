---
title: Do Not Memoize Without a Confirmed Reason
titleKo: 확인한 이유가 없으면 `useMemo` · `useCallback` · `memo`를 쓰지 않습니다
impact: HIGH
impactDescription: 효과를 확인하지 않은 방어적 `useMemo`, `useCallback`, `memo`를 막습니다
appliesWhen:
  - `useMemo` · `useCallback`을 추가하거나 제거할 때
  - `memo`로 컴포넌트를 감싸거나 벗길 때
  - 참조 동일성 · 실측 병목 · 무거운 지연 계산을 이유로 수동 메모이제이션을 검토할 때
reviewWith: perf-defer-heavy-renders-with-measured-evidence
tags: perf, state
---

## Do Not Memoize Without a Confirmed Reason

**Impact: HIGH (효과를 확인하지 않은 방어적 `useMemo`, `useCallback`, `memo`를 막습니다)**

`useMemo` · `useCallback` · `memo`는 아래 네 경우에만 씁니다.
어느 경우든 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`에 따라 이유를 남깁니다.

### 허용하는 네 경우

| 허용 근거 | 확인할 내용 |
| --- | --- |
| 외부 라이브러리의 참조 계약 | 참조 변경이 상태 초기화나 구독 재설치로 이어짐 |
| 불필요한 이펙트 재구독 | 객체 · 배열이 이펙트 밖에서도 필요하고, 재구독이 확인됐고 의존성을 더 줄일 수 없음 |
| 실측 병목 | 계산이나 렌더 비용을 실제로 측정했음 |
| 지연 값을 받는 하위 트리 | `perf-defer-heavy-renders-with-measured-evidence`가 `memo`를 요구함 |

계산이나 함수가 다시 실행된다는 사실만으로 메모이제이션하지 않습니다.
이펙트에서만 쓰는 객체 · 배열은 이펙트 안에서 만들고 원본 값에 의존합니다.

### 캐시와 컴파일러

리액트는 `useMemo` · `useCallback` 캐시를 버릴 수 있으므로 정확성을 캐시에 의존하지 않습니다.
다시 계산되거나 이펙트가 재설치되어도 동작해야 합니다.
외부 인스턴스의 수명은 소유 이펙트가, 렌더 사이에 보존할 값은 상태나 `ref`가 관리합니다.

리액트 컴파일러가 없어도 같은 기준을 적용합니다.
컴파일러가 같은 최적화를 이미 제공하면 수동 메모이제이션을 더하지 않습니다.

**Incorrect 1 (단순 가공을 습관적으로 메모이제이션합니다):**

```ts
const columns = useMemo(() => {
	return toTableColumns(props.columns);
}, [props.columns]);
```

**Correct 1 (근거가 없으면 감싸지 않고 그대로 계산합니다):**

```ts
const columns = toTableColumns(props.columns);
```

**Correct (측정한 계산 비용을 근거로 메모이제이션합니다):**

```ts
// 열 2,000개의 표시 계약 변환이 입력마다 45ms로 측정됐다. 같은 columns의 반복 계산을 건너뛴다.
const columns = useMemo(() => {
	return toTableColumns(props.columns);
}, [props.columns]);
```

**Correct (이펙트에서만 쓰는 배열은 안에서 만들고 원본 값에 의존합니다):**

```ts
/**
 * 입력된 product 목록이 바뀔 때만 변경 알림을 다시 구독한다
 */
useEffect(() => {
	return subscribeToProductChanges(props.products.map((product) => product.id));
}, [props.products]);
```

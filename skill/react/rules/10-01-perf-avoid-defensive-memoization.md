---
title: Do Not Memoize Without a Confirmed Reason
titleKo: 확인한 이유가 없으면 `useMemo`·`useCallback`·`memo`를 쓰지 않습니다
impact: MEDIUM
impactDescription: 효과를 확인하지 않은 방어적 `useMemo`, `useCallback`, `memo`를 막습니다
appliesWhen:
  - `useMemo`·`useCallback`을 추가하거나 제거할 때
  - `memo`로 컴포넌트를 감싸거나 벗길 때
  - 참조 동일성·실측 병목·무거운 지연 계산을 이유로 수동 메모이제이션을 검토할 때
reviewWith: perf-defer-heavy-renders-with-measured-evidence
tags: perf, state
---

## Do Not Memoize Without a Confirmed Reason

**Impact: MEDIUM (효과를 확인하지 않은 방어적 `useMemo`, `useCallback`, `memo`를 막습니다)**

`useMemo`와 `useCallback`, 컴포넌트를 감싸는 `memo`는 쓰지 않습니다.
쓰는 경우는 다음 넷뿐입니다.
어느 경우든 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 이유를 남깁니다.

- 외부 라이브러리에서 참조 변경이 상태 초기화나 구독 재설치로 이어질 때
- 이펙트 의존성으로 들어가는 객체나 배열이어서 감싸지 않으면 이펙트가 매 렌더 다시 돌 때
- 병목이 실제로 측정됐을 때
- `perf-defer-heavy-renders-with-measured-evidence`가 지연 값을 받는 하위 트리에 `memo`를 요구할 때

함수나 계산이 다시 실행된다는 사실은 참조 동일성을 고정할 이유가 아닙니다.

이펙트 의존성을 이유로 감쌀 때는 성능이 아니라 정합성 때문입니다.
객체와 배열은 렌더마다 새 참조라 의존성 비교가 늘 어긋납니다.

리액트 컴파일러를 켜지 않은 프로젝트도 같습니다.
"컴파일러가 없으니 다 감싼다"는 이유는 이 셋에 없습니다.
자리마다 위 셋 중 하나가 있어야 합니다.

**Incorrect (단순 가공을 습관적으로 메모이제이션합니다):**

```ts
const columns = useMemo(() => {
	return toTableColumns(responseTableColumnsSuspense.data.columns);
}, [responseTableColumnsSuspense.data.columns]);
```

**Correct (근거가 없으면 감싸지 않고 그대로 계산합니다):**

```ts
const columns = toTableColumns(responseTableColumnsSuspense.data.columns);
```

**Correct (외부 패키지 제약을 가리키는 근거를 적고 씁니다):**

```ts
// 외부 표 라이브러리는 columns 참조가 바뀌면 컬럼 폭·정렬 상태를 초기화한다. 참조를 고정해야 한다.
const columns = useMemo(() => {
	return toTableColumns(responseTableColumnsSuspense.data.columns);
}, [responseTableColumnsSuspense.data.columns]);
```

**Correct (이펙트 의존성이라 참조를 고정합니다):**

```ts
// 이 배열이 매 렌더 새 참조면 아래 이펙트가 매번 다시 구독한다.
const watchedProductIds = useMemo(
	() => responseProductListSuspense.data.products.map((product) => product.id),
	[responseProductListSuspense.data.products],
);

/**
 * 표에 보이는 product 의 변경 알림을 구독한다
 */
useEffect(() => {
	return subscribeToProductChanges(watchedProductIds);
}, [watchedProductIds]);
```

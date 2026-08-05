---
title: Do Not Memoize Without a Confirmed Reason
titleKo: 확인한 이유가 없으면 메모이제이션하지 않습니다
impact: MEDIUM-HIGH
impactDescription: 효과를 확인하지 않은 방어적 `useMemo`, `useCallback`을 막습니다
appliesWhen:
  - `useMemo`·`useCallback`을 추가하거나 제거할 때
  - 참조 동일성·실측 병목·무거운 지연 계산을 이유로 수동 메모이제이션을 검토할 때
reviewWith: perf-defer-heavy-renders-with-measured-evidence
tags: perf, state
---

## Do Not Memoize Without a Confirmed Reason

**Impact: MEDIUM-HIGH (효과를 확인하지 않은 방어적 `useMemo`, `useCallback`을 막습니다)**

`useMemo`와 `useCallback`은 기본적으로 쓰지 않습니다.
쓰는 경우는 다음 셋뿐입니다.
어느 경우든 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 이유를 남깁니다.

- 외부 라이브러리가 참조 동일성에 민감할 때
- 이펙트 의존성으로 들어가는 객체나 배열이어서 감싸지 않으면 이펙트가 매 렌더 다시 돌 때
- 병목이 실제로 측정됐을 때

이펙트 의존성 사유는 성능이 아니라 정합성 문제입니다.
객체와 배열은 렌더마다 새 참조라 의존성 비교가 늘 어긋납니다.

`perf-defer-heavy-renders-with-measured-evidence`를 따라 늦춘 값 기준으로 다시 계산하는 자리는
측정 사유에 듭니다.

리액트 컴파일러를 켜지 않은 프로젝트도 같습니다.
"컴파일러가 없으니 다 감싼다"는 이유는 이 셋에 없습니다.
자리마다 위 셋 중 하나가 있어야 합니다.

**Incorrect (단순 가공을 관성적으로 메모이제이션):**

```ts
const columns = useMemo(() => toTableColumns(response.data.columns), [response.data.columns]);
```

**Correct (근거가 없으면 감싸지 않고 그대로 계산):**

```ts
const columns = toTableColumns(response.data.columns);
```

**Correct (외부 패키지 제약을 가리키는 근거를 적고 사용):**

```ts
// ag-grid는 columnDefs 참조가 바뀌면 컬럼 폭·정렬 상태를 초기화한다. 참조를 고정해야 한다.
const columns = useMemo(() => toTableColumns(response.data.columns), [response.data.columns]);
```

**Correct (이펙트 의존성이라 참조를 고정):**

```ts
// 이 배열이 매 렌더 새 참조면 아래 이펙트가 매번 다시 구독한다.
const watchedProductIds = useMemo(
	() => responseProductListSuspense.data.products.map((product) => product.id),
	[responseProductListSuspense.data.products],
);

useEffect(() => {
	return subscribeToProductChanges(watchedProductIds);
}, [watchedProductIds]);
```

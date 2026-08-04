---
title: Do Not Memoize Without a Confirmed Reason
titleKo: 확인한 이유가 없으면 메모이제이션하지 않습니다
impact: MEDIUM-HIGH
impactDescription: 효과를 확인하지 않은 방어적 `useMemo`, `useCallback` 을 막습니다
appliesWhen:
  - `useMemo`·`useCallback`을 추가하거나 제거할 때
  - 참조 동일성·실측 병목·무거운 지연 계산을 이유로 수동 메모이제이션을 검토할 때
reviewWith: perf-use-usedeferredvalue-for-heavy-derived-renders
tags: perf, state
---

## Do Not Memoize Without a Confirmed Reason

**Impact: MEDIUM-HIGH (효과를 확인하지 않은 방어적 `useMemo`, `useCallback` 을 막습니다)**

`useMemo`와 `useCallback`은 기본적으로 쓰지 않습니다.
쓰는 경우는 다음 셋뿐이며, 어느 경우든 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 이유를 남깁니다.

- 외부 라이브러리가 참조 동일성에 민감할 때
- 병목이 실제로 측정됐을 때
- `useDeferredValue` 기준으로 무거운 파생 계산을 늦출 때

리액트 컴파일러를 켜지 않은 프로젝트도 같습니다.
"컴파일러가 없으니 다 감싼다"는 이유는 이 셋에 없습니다. 자리마다 위 셋 중 하나가 있어야 합니다.

**Incorrect (단순 가공을 관성적으로 메모이제이션):**

```ts
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);
```

**Correct (외부 패키지 제약을 가리키는 근거를 적고 사용):**

```ts
// ag-grid 는 columnDefs 참조가 바뀌면 컬럼 폭·정렬 상태를 초기화한다. 참조를 고정해야 한다.
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);
```

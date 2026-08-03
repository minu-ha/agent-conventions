---
title: Prefer React Compiler Defaults Over Manual Memoization
titleKo: 직접 메모이제이션하지 않고 React Compiler 에 맡깁니다
impact: MEDIUM-HIGH
impactDescription: 효과를 확인하지 않은 방어적 useMemo 와 useCallback 을 막습니다
appliesWhen:
  - `useMemo`·`useCallback`을 추가하거나 제거할 때
  - 참조 동일성·실측 병목·무거운 지연 계산을 이유로 수동 memoization을 검토할 때
tags: state, react, memoization
---

## Prefer React Compiler Defaults Over Manual Memoization

**Impact: MEDIUM-HIGH (효과를 확인하지 않은 방어적 useMemo 와 useCallback 을 막습니다)**

React Compiler가 처리하는 범위에서는 `useMemo`, `useCallback`을 기본적으로 쓰지 않습니다.

허용하는 경우는 다음 셋뿐이며, 어느 경우든 바로 위에 한글 주석으로 이유를 남깁니다.

- 외부 라이브러리가 참조 동일성에 민감할 때
- 병목이 실제로 확인됐을 때
- `useDeferredValue` 기준으로 무거운 파생 계산을 늦출 때

마지막 경우에도 실제로 무거운 계산인지를 먼저 확인합니다.

**Incorrect (단순 가공을 관성적으로 memoization):**

```ts
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);
```

**Correct (필요할 때만 이유를 적고 사용):**

```ts
// list library가 columns 참조 동일성을 요구하여 리렌더 폭증을 방지한다.
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);
```

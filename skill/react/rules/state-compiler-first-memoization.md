---
title: Prefer React Compiler Defaults Over Manual Memoization
impact: MEDIUM-HIGH
impactDescription: avoids defensive useMemo and useCallback that add noise without proven value
tags: state, react, memoization
---

## Prefer React Compiler Defaults Over Manual Memoization

**Impact: MEDIUM-HIGH (avoids defensive useMemo and useCallback that add noise without proven value)**

React 19 컴파일러가 처리하는 범위에서는 `useMemo`, `useCallback`을 기본적으로 사용하지 않습니다. 외부 라이브러리가 참조 동일성에 민감하거나, 병목이 실제로 확인된 경우에만 허용하고 바로 위에 한글 주석으로 이유를 남깁니다.

**Incorrect (단순 가공을 관성적으로 memoization):**

```ts
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);
```

**Correct (필요할 때만 이유를 적고 사용):**

```ts
// 테이블 라이브러리가 columns 참조 동일성을 요구하여 리렌더 폭증을 방지한다.
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);
```

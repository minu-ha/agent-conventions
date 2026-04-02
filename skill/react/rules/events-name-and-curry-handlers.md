---
title: Name Handlers Predictably and Curry Extra Arguments
impact: MEDIUM-HIGH
impactDescription: 이벤트 흐름을 검색 가능하게 유지하고 즉흥적인 handler 시그니처를 피함
tags: events, handlers, naming
---

## Name Handlers Predictably and Curry Extra Arguments

**Impact: MEDIUM-HIGH (이벤트 흐름을 검색 가능하게 유지하고 즉흥적인 handler 시그니처를 피함)**

이벤트 핸들러는 `handle + Target + Event` 패턴으로 이름 짓습니다. 추가 인자가 필요하면 handler factory 형태의 고차 함수로 감싸고, 최종 반환값은 React handler 타입으로 고정합니다.

**Incorrect (이름과 시그니처가 제각각임):**

```ts
const onSelect = (id: string, event: MouseEvent<HTMLLIElement>) => {
  console.log(id, event.currentTarget);
};
```

**Correct (추가 인자는 바깥 함수, 이벤트는 안쪽 handler):**

```ts
import type { MouseEventHandler } from "react";

const handleListItemClick =
  (id: string): MouseEventHandler<HTMLLIElement> =>
  (_event) => {
    console.log(id);
  };
```

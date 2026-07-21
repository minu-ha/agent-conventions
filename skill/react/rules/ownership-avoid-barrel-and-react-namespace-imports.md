---
title: Avoid Barrel Exports and React Namespace Types
impact: HIGH
impactDescription: import 경로를 명시적으로 유지하고 타입 import 스타일 혼용을 막음
appliesWhen: `index.ts`·barrel 재노출, `React.*` namespace 타입, type/value 혼합 import 또는 소유 출처를 숨긴 경로를 직접 추가·수정한다. 일반 direct value import는 제외한다.
requiresSelected: typescript/naming-use-direct-imports-and-public-entry-points
tags: ownership, imports, barrel, react
---

## Avoid Barrel Exports and React Namespace Types

**Impact: HIGH (import 경로를 명시적으로 유지하고 타입 import 스타일 혼용을 막음)**

`index.ts` 기반 barrel export를 만들지 않고, React 타입은 `React.MouseEvent` 같은 전역 네임스페이스 대신 `import type`으로 직접 가져옵니다. 이렇게 해야 import 경로와 타입 출처가 더 명시적으로 유지됩니다.

**Incorrect (barrel export와 namespace 타입 혼용):**

```ts
// index.ts
export * from "./user-card";

const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
};
```

**Correct (직접 import와 import type 사용):**

```ts
import type { MouseEventHandler } from "react";

/**
 * @event 버튼 클릭 기본 동작 차단
 */
const handleClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
  // ...
};
```

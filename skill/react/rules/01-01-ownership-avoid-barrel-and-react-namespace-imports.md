---
title: Avoid Barrel Exports and React Namespace Types
titleKo: barrel export와 React namespace 타입 금지
impact: HIGH
impactDescription: import 경로를 명시적으로 유지하고 타입 import 스타일 혼용을 막습니다
appliesWhen:
  - `index.ts` barrel 재노출을 추가·수정할 때
  - `React.*` 타입과 direct `import type` 중 선택할 때
  - type/value 혼합 import나 출처를 숨기는 경로를 추가·수정할 때
  - 제외: 일반 direct value import만 바꾸는 경우
requiresSelected: typescript/naming-use-direct-imports-and-public-entry-points
tags: ownership, imports, barrel, react
---

## Avoid Barrel Exports and React Namespace Types

**Impact: HIGH (import 경로를 명시적으로 유지하고 타입 import 스타일 혼용을 막습니다)**

`index.ts` 기반 barrel export를 만들지 않습니다.
React 타입은 `React.MouseEvent` 같은 전역 네임스페이스 대신 `import type`으로 직접 가져옵니다.
import 경로와 타입 출처를 명시적으로 유지하기 위해서입니다.

- React 타입을 namespace로 둘지 direct `import type`으로 가져올지 정하는 변경도 이 규칙의 판단 대상입니다.
- 일반 third-party value를 alias 없이 직접 import하는 변경만으로는 걸리지 않습니다.
- `export const Dialog = { Root, Header } as const` 같은 compound facade는 barrel이 아닙니다.
  재노출 계층이 아니라 같은 파일이 소유한 public part 조립이므로 허용합니다.
- `component`, `function` 같은 role 폴더에 `index.ts`를 만들어 묶는 것은 barrel이므로 금지합니다.

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

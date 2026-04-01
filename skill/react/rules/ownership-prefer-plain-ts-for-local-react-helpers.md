---
title: Prefer Plain .ts Helpers Over Local Custom Hooks
impact: HIGH
impactDescription: keeps React-only abstractions reserved for real lifecycle or context coupling
tags: ownership, hooks, helpers, widget
---

## Prefer Plain .ts Helpers Over Local Custom Hooks

**Impact: HIGH (keeps React-only abstractions reserved for real lifecycle or context coupling)**

컴포넌트 하나를 위한 계산, 정규화, payload 조립은 기본적으로 일반 `.ts` helper로 둡니다. React 생명주기, state, context, effect에 실제로 묶일 때만 custom hook으로 승격합니다.

**Incorrect (로컬 계산을 습관적으로 hook으로 포장):**

```ts
export const useMediaUploadPayload = (files: UploadFile[]) => {
  return files.map((file) => ({ uid: file.uid }));
};
```

**Correct (순수 계산은 일반 helper로 유지):**

```ts
export const buildMediaUploadPayload = (files: UploadFile[]) => {
  return files.map((file) => ({ uid: file.uid }));
};
```

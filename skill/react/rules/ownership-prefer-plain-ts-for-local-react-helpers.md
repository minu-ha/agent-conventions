---
title: Do Not Create Screen-local Custom Hooks for Pure Logic
impact: HIGH
impactDescription: React 전용 추상화를 실제 lifecycle/context 결합이 있는 경우에만 사용하게 함
tags: ownership, hooks, helpers, widget
---

## Do Not Create Screen-local Custom Hooks for Pure Logic

**Impact: HIGH (React 전용 추상화를 실제 lifecycle/context 결합이 있는 경우에만 사용하게 함)**

컴포넌트 하나를 위한 계산, 정규화, payload 조립은 기본적으로 일반 `.ts` support module로 둡니다.   
route entry 화면이라면 첫 추출 대상은 같은 계층의 `page.ts`이고, screen-owned pure function은 named export로 직접 내보냅니다. 화면 하나에서만 쓰는 custom hook은 기본적으로 만들지 않고, hook은 여러 컴포넌트나 화면이 공유하는 React orchestration 경계일 때만 승격합니다.

**Incorrect (로컬 계산을 습관적으로 hook으로 포장):**

```ts
export const useMediaUploadPayload = (files: UploadFile[]) => {
  return files.map((file) => ({ uid: file.uid }));
};
```

**Correct (순수 계산은 sibling `page.ts`의 named export로 유지):**

```ts
export const buildMediaUploadPayload = (files: UploadFile[]) => {
  return files.map((file) => ({ uid: file.uid }));
};
```

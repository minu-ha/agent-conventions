---
title: Use Consistent File and Symbol Naming
impact: HIGH
impactDescription: keeps ownership and intent obvious when agents create or move files
tags: ownership, naming, files
---

## Use Consistent File and Symbol Naming

**Impact: HIGH (keeps ownership and intent obvious when agents create or move files)**

파일명은 `kebab-case`, 변수와 함수는 `camelCase`, 타입과 컴포넌트는 `PascalCase`, 상수는 `SCREAMING_SNAKE_CASE`를 사용합니다. 파일명과 심볼명이 소유자나 역할을 바로 드러내야 route-local 이동과 공용화 판단이 쉬워집니다.

**Incorrect (파일명과 심볼 규칙이 제각각임):**

```tsx
// UserCard.tsx
export const user_card = () => {
  return null;
};
```

**Correct (파일명과 심볼 규칙이 일관됨):**

```tsx
// user-card.tsx
export const UserCard = () => {
  return null;
};
```

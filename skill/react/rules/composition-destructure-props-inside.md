---
title: Accept props as a Whole and Destructure Inside the Component
impact: MEDIUM
impactDescription: keeps the component contract visible at the signature and local usage close to the body
tags: composition, props
---

## Accept props as a Whole and Destructure Inside the Component

**Impact: MEDIUM (keeps the component contract visible at the signature and local usage close to the body)**

컴포넌트 시그니처는 `props` 전체를 받고, 함수 본문 첫 줄에서 구조분해합니다. 이렇게 하면 시그니처에서 계약을 한눈에 읽고, 본문에서 실제 사용하는 값을 좁은 스코프에 둘 수 있습니다.

**Incorrect (시그니처에서 바로 구조분해):**

```tsx
const UserCard = ({ id, onSave }: UserCardProps) => {
  return <button onClick={onSave}>{id}</button>;
};
```

**Correct (계약과 사용 위치를 분리):**

```tsx
const UserCard = (props: UserCardProps) => {
  const { id, onSave } = props;
  return <button onClick={onSave}>{id}</button>;
};
```

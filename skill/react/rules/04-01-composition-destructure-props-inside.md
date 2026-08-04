---
title: Accept props as a Whole and Destructure Inside the Component
titleKo: 프롭스를 통째로 받고 본문에서 구조분해합니다
impact: MEDIUM
impactDescription: 컴포넌트 계약은 시그니처에 남고 실제 사용은 본문 가까이 옵니다
appliesWhen:
  - 프롭스를 받는 함수 컴포넌트의 시그니처나 구조분해 방식을 추가·변경할 때
  - 프롭스를 받는 컴포넌트를 다른 파일로 옮기거나 이름을 바꿀 때
tags: composition, props
---

## Accept props as a Whole and Destructure Inside the Component

**Impact: MEDIUM (컴포넌트 계약은 시그니처에 남고 실제 사용은 본문 가까이 옵니다)**

컴포넌트 시그니처는 `props` 전체를 받고, 함수 본문 첫 줄에서 구조분해합니다.
시그니처에서 계약을 한눈에 읽고, 본문에서 실제 쓰는 값을 좁은 스코프에 둘 수 있습니다.

- 컴포넌트를 다른 파일로 옮기거나 이름을 바꾸는 것도 시그니처를 다시 쓰는 작업입니다.
  프롭스 필드가 그대로여도 이 형태를 다시 확인합니다.
- 프롭스가 없는 컴포넌트 이동만으로는 이 규칙이 걸리지 않습니다.

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

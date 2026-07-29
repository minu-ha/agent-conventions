---
title: Accept props as a Whole and Destructure Inside the Component
impact: MEDIUM
impactDescription: 컴포넌트 계약을 시그니처에 남기고 실제 사용을 본문 가까이에 유지함
appliesWhen: props를 받는 함수 컴포넌트의 시그니처·본문 구조분해 방식을 추가·변경하거나 그 컴포넌트를 다른 파일로 이동·이름 변경한다.
tags: composition, props
---

## Accept props as a Whole and Destructure Inside the Component

**Impact: MEDIUM (컴포넌트 계약을 시그니처에 남기고 실제 사용을 본문 가까이에 유지함)**

컴포넌트 시그니처는 `props` 전체를 받고, 함수 본문 첫 줄에서 구조분해합니다.
props를 받는 컴포넌트를 다른 파일로 이동하거나 이름을 바꾸는 작업도 시그니처를 복사·재작성하는 surface이므로, props field가 그대로여도 이 형태를 다시 확인합니다.
props가 없는 컴포넌트 이동만으로는 이 규칙을 선택하지 않습니다.
이렇게 하면 시그니처에서 계약을 한눈에 읽고, 본문에서 실제 사용하는 값을 좁은 스코프에 둘 수 있습니다.

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

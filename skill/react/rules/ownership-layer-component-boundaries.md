---
title: Keep UI, Widget, and -local Ownership Separate
impact: CRITICAL
impactDescription: 공용 책임과 route-local 책임이 같은 레이어로 섞이는 것을 막음
tags: ownership, ui, widget, local, naming
---

## Keep UI, Widget, and -local Ownership Separate

**Impact: CRITICAL (공용 책임과 route-local 책임이 같은 레이어로 섞이는 것을 막음)**

`ui`는 순수 view, `widget`은 여러 화면에서 재사용되는 공용 조합, `-local`은 특정 route 맥락을 아는 화면 전용 코드로 유지합니다. 파일명도 `ui-*`, `widget-*` 접두사로 소유자를 바로 드러내야 합니다.

**Incorrect (view 레이어와 화면 전용 로직이 섞임):**

```tsx
// <component-root>/ui/button/ui-delete-table-button.tsx
const UiDeleteTableButton = () => {
  const navigate = useNavigate();

  return <button onClick={() => void navigate({ to: "/tables" })}>삭제</button>;
};
```

**Correct (레이어별 책임과 이름이 분리됨):**

```tsx
// <component-root>/ui/button/ui-button.tsx
export interface UiButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export const UiButton = (props: UiButtonProps) => {
  const { onClick } = props;
  return <button onClick={onClick} />;
};
```

```tsx
// <route-root>/tables/-local/delete-table-button.tsx
const DeleteTableButton = () => {
  const navigate = useNavigate();
  return <UiButton onClick={() => void navigate({ to: "/tables" })} />;
};
```

---
title: Keep UI, Widget, and -local Ownership Separate
impact: CRITICAL
impactDescription: 공용 책임과 route-local 책임이 같은 레이어로 섞이는 것을 막음
appliesWhen: 컴포넌트를 ui·widget·route-local 중 어느 소유 레이어에 둘지 결정하거나 레이어 사이에서 이동·공용화한다.
reviewWith: ownership-place-route-local-files-by-scope, css/naming-separate-local-and-route-style-scopes
tags: ownership, ui, widget, local, naming
---

## Keep UI, Widget, and -local Ownership Separate

**Impact: CRITICAL (공용 책임과 route-local 책임이 같은 레이어로 섞이는 것을 막음)**

`ui`는 순수 view,
`widget`은 여러 화면에서 재사용되는 공용 조합,
`-local`은 특정 route 맥락을 아는 화면 전용 코드로 유지합니다. `widget` 레이어 폴더명은 유지하되,
widget-owned 파일과 심볼은 `wg-*`,
`Wg*` 규칙으로 소유자를 바로 드러내야 합니다. `ui`는 계속 `ui-*`,
`Ui*` 규칙을 사용합니다.

**Incorrect (view 레이어와 화면 전용 로직이 섞임):**

```tsx
// <component-root>/ui/button/ui-delete-entry-button.tsx
const UiDeleteEntryButton = () => {
  const navigate = useNavigate();

  return <button onClick={() => void navigate({ to: "/entries" })}>삭제</button>;
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
// <component-root>/widget/entry-toolbar/wg-entry-toolbar.tsx
export interface WgEntryToolbarProps {
  onClose: () => void;
}

export const WgEntryToolbar = (props: WgEntryToolbarProps) => {
  const { onClose } = props;
  return <UiButton onClick={onClose} />;
};
```

```tsx
// <route-root>/entries/-local/delete-entry-button.tsx
const DeleteEntryButton = () => {
  const navigate = useNavigate();
  return <UiButton onClick={() => void navigate({ to: "/entries" })} />;
};
```

---
title: Keep UI, Widget, and -local Ownership Separate
titleKo: ui·widget·-local 소유 레이어를 섞지 않기
impact: CRITICAL
impactDescription: 공용 책임과 route-local 책임이 같은 레이어로 섞이는 것을 막음
impactDescriptionKo: 공용 책임과 route-local 책임이 같은 레이어로 섞이는 것을 막음
appliesWhen: 컴포넌트를 ui·widget·route-local 중 어느 소유 레이어에 둘지 결정하거나 레이어 사이에서 이동·공용화한다.
reviewWith: ownership-place-route-local-files-by-scope, css/naming-separate-local-and-route-style-scopes
tags: ownership, ui, widget, local, naming
---

## Keep UI, Widget, and -local Ownership Separate

**Impact: CRITICAL (공용 책임과 route-local 책임이 같은 레이어로 섞이는 것을 막음)**

컴포넌트는 소유 레이어를 이름으로 드러냅니다.

| 레이어 | 책임 | 파일·심볼 |
| --- | --- | --- |
| `ui` | 순수 view | `ui-*` · `Ui*` |
| `widget` | 여러 화면이 재사용하는 공용 조합 | `wg-*` · `Wg*` |
| `-local` | 특정 route 맥락을 아는 화면 전용 코드 | route 소유자 이름 |

`widget` 레이어 폴더명은 그대로 두되, widget-owned 파일과 심볼은 `wg-*`, `Wg*`로 소유자를 드러냅니다.

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

---
title: Keep UI, Widget, and Private Ownership Separate
titleKo: ui·widget·private 소유 레이어 분리
impact: CRITICAL
impactDescription: 공용 책임과 owner-private 책임이 같은 레이어로 섞이는 것을 막습니다
appliesWhen:
  - 컴포넌트를 ui·widget·private 중 어느 소유 레이어에 둘지 정할 때
  - 컴포넌트를 레이어 사이에서 옮기거나 공용화할 때
reviewWith: ownership-place-owner-files-in-role-folders, css/naming-separate-owner-style-scopes
tags: ownership, ui, widget, private, naming
---

## Keep UI, Widget, and Private Ownership Separate

**Impact: CRITICAL (공용 책임과 owner-private 책임이 같은 레이어로 섞이는 것을 막습니다)**

컴포넌트는 소유 레이어를 이름으로 드러냅니다.

| 레이어 | 책임 | 파일·심볼 |
| --- | --- | --- |
| `ui` | 도메인을 모르는 순수 view | `ui-*` · `Ui*` |
| `widget` | 화면 조립을 전제하지 않는 공용 조합 | `wg-*` · `Wg*` |
| private | 한 owner 안에서만 쓰이는 화면 전용 코드 | owner 이름 |

private 레이어는 전용 폴더를 갖지 않고 owner 아래 `component`에 살기 때문에, 이름이 아니라 위치가 소유를 드러냅니다.
`ui`와 `widget`은 여러 곳에서 import하므로 최상위에 모으고, private component는 owner 옆에 둡니다.

레이어 판정은 두 축으로 갈립니다.

| 축 | 질문 | 결정하는 것 |
| --- | --- | --- |
| 맥락 독립성 | 화면 조립이나 부모 구조를 전제하는가 | 승격 가능 여부 |
| 도메인 지식 | 도메인을 아는가 | `ui`와 `widget` 중 어디인가 |

- 화면 조립을 전제하면 private으로 남습니다.
- 맥락 독립이고 도메인을 모르면 `ui`입니다.
- 맥락 독립이고 도메인을 알면 `widget`입니다. 이름에 도메인 단어가 남아도 됩니다.

**사용 횟수는 판정 기준이 아닙니다.**
한 화면에서만 쓰여도 맥락 독립이면 `widget`입니다.
사용 횟수로 판정하면 쓰임이 늘거나 줄 때마다 컴포넌트가 폴더를 옮겨 다니게 됩니다.

**Incorrect (view 레이어와 화면 전용 로직이 섞임):**

```tsx
// ui/button/ui-delete-entry-button.tsx
const UiDeleteEntryButton = () => {
	const navigate = useNavigate();

	return <button onClick={() => void navigate({ to: "/entries" })}>삭제</button>;
};
```

**Incorrect (맥락 독립인 부품을 사용 횟수만 보고 private에 남김):**

```tsx
// page/detail/component/spike-pattern-panel/component/spike-legend-glyph.tsx
// props만 받아 마커를 그리는데 이 화면에서만 쓴다는 이유로 private에 남아 있다.
export const SpikeLegendGlyph = (props: SpikeLegendGlyphProps) => {
	const { item } = props;
	return <svg className="pv_spikeLegendGlyph__root">{/* ... */}</svg>;
};
```

**Correct (레이어별 책임과 이름이 분리됨):**

```tsx
// ui/button/ui-button.tsx
export interface UiButtonProps {
	onClick: MouseEventHandler<HTMLButtonElement>;
}

export const UiButton = (props: UiButtonProps) => {
	const { onClick } = props;
	return <button onClick={onClick} />;
};
```

```tsx
// widget/entry-toolbar/wg-entry-toolbar.tsx
export interface WgEntryToolbarProps {
	onClose: () => void;
}

export const WgEntryToolbar = (props: WgEntryToolbarProps) => {
	const { onClose } = props;
	return <UiButton onClick={onClose} />;
};
```

**Correct (맥락 독립·도메인 인지 부품은 widget으로 올림):**

```tsx
// widget/spike-legend-glyph/wg-spike-legend-glyph.tsx
export const WgSpikeLegendGlyph = (props: WgSpikeLegendGlyphProps) => {
	const { item } = props;
	return <svg className="wg_spikeLegendGlyph__root">{/* ... */}</svg>;
};
```

**Correct (화면 조립을 전제하는 코드는 owner 아래 private으로 남김):**

```tsx
// page/entries/component/delete-entry-button.tsx
const DeleteEntryButton = () => {
	const navigate = useNavigate();
	return <UiButton onClick={() => void navigate({ to: "/entries" })} />;
};
```

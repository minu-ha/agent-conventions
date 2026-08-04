---
title: Keep UI, Widget, and Page Ownership Separate
titleKo: 컴포넌트를 `ui`·`widget`·`page` 로 나눕니다
impact: CRITICAL
impactDescription: 공용 책임과 화면 전용 책임이 같은 레이어에 섞이지 않습니다
appliesWhen:
  - 컴포넌트를 ui·widget·page 중 어느 소유 레이어에 둘지 정할 때
  - 컴포넌트를 레이어 사이에서 옮기거나 공용화할 때
reviewWith: ownership-place-owner-files-in-role-folders, css/ownership-choose-scope-prefix-by-reuse-range
tags: ownership, widget, naming
---

## Keep UI, Widget, and Page Ownership Separate

**Impact: CRITICAL (공용 책임과 화면 전용 책임이 같은 레이어에 섞이지 않습니다)**

컴포넌트는 소유 레이어를 이름으로 드러냅니다.

| 레이어 | 책임 | 파일 · 심볼 · 식별자 |
| --- | --- | --- |
| `ui` | 도메인을 모르는 순수 화면 | `ui-button.tsx` · `UiButton` · `ui_button` |
| `widget` | 화면 조립을 전제하지 않는 공용 조합 | `wg-chart.tsx` · `WgChart` · `wg_chart` |
| `page` | 한 화면 안에서만 쓰이는 뼈대와 컴포넌트 | `pg-detail.tsx` · `PgDetail` · `pg_detail` |

세 레이어 모두 파일명과 심볼에 계층 접두사를 붙이고 예외를 두지 않습니다.
폴더에는 붙이지 않습니다. 상위 계층 폴더가 이미 계층을 말합니다.
식별자에서는 접두사가 말하는 부분을 반복하지 않습니다.

레이어 판정은 두 축으로 갈립니다.

| 축 | 질문 | 결정하는 것 |
| --- | --- | --- |
| 맥락 독립성 | 화면 조립이나 부모 구조를 전제하는가 | 승격 가능 여부 |
| 도메인 지식 | 도메인을 아는가 | `ui`와 `widget` 중 어디인가 |

- 화면 조립을 전제하면 `page`에 남습니다.
- 맥락 독립이고 도메인을 모르면 `ui`입니다.
- 맥락 독립이고 도메인을 알면 `widget`입니다. 이름에 도메인 단어가 남아도 됩니다.

사용 횟수는 판정 기준이 아닙니다.
한 화면에서만 쓰여도 맥락 독립이면 `widget`이고, 사용 횟수로 판정하면 쓰임이 변할 때마다 폴더를 옮겨 다닙니다.

**Incorrect (화면 레이어와 화면 전용 로직이 섞임):**

```tsx
// ui/button/ui-delete-entry-button.tsx
const UiDeleteEntryButton = () => {
	const navigate = useNavigate();

	return <button onClick={() => void navigate({ to: "/entries" })}>삭제</button>;
};
```

**Incorrect (화면 컴포넌트에만 계층 접두사를 빼먹음):**

```tsx
// page/detail/component/spike-pattern-panel.tsx
export const SpikePatternPanel = (props: SpikePatternPanelProps) => {
	return <section className="pg_spikePatternPanel__root">{/* ... */}</section>;
};
```

**Incorrect (맥락 독립인 부품을 사용 횟수만 보고 화면에 남김):**

```tsx
// page/detail/component/pg-spike-legend-glyph.tsx
// props만 받아 마커를 그리는데 이 화면에서만 쓴다는 이유로 남아 있다.
export const PgSpikeLegendGlyph = (props: PgSpikeLegendGlyphProps) => {
	const { item } = props;
	return <svg className="pg_spikeLegendGlyph__root">{/* ... */}</svg>;
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
export const WgEntryToolbar = (props: WgEntryToolbarProps) => {
	const { onClose } = props;
	return <UiButton onClick={onClose} />;
};
```

**Correct (맥락 독립·도메인 인지 부품은 `widget`으로 올림):**

```tsx
// widget/spike-legend-glyph/wg-spike-legend-glyph.tsx
export const WgSpikeLegendGlyph = (props: WgSpikeLegendGlyphProps) => {
	const { item } = props;
	return <svg className="wg_spikeLegendGlyph__root">{/* ... */}</svg>;
};
```

**Correct (화면 조립을 전제하는 코드는 화면 레이어에 접두사를 붙여 남김):**

```tsx
// page/entries/component/pg-delete-entry-button.tsx
const PgDeleteEntryButton = () => {
	const navigate = useNavigate();
	return <UiButton onClick={() => void navigate({ to: "/entries" })} />;
};
```

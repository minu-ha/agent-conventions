---
title: Keep UI, Widget, and Page Ownership Separate
titleKo: 컴포넌트를 `ui`, `widget`, `page` 소유 레이어로 나눕니다
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

이름 표기는 `ownership-prefix-layer-names-on-files-and-symbols`가 정합니다.
여기서는 어느 레이어인지만 판정합니다.

**먼저 `page`인지 봅니다.** 다음 중 하나라도 해당하면 `page`입니다.

- 프롭스 타입이 그 화면의 응답·뷰모델 타입이나 라우트 검색 매개변수를 참조합니다.
- 질의, 변경 요청, 라우터 훅, 화면 스토어를 직접 부릅니다.
- `Suspense`, 폼 프로바이더, 모달처럼 실행 환경 경계를 소유합니다.

**`page`가 아니면 도메인 지식으로 갈립니다.**

- 도메인을 모르면 `ui`입니다.
- 도메인을 알면 `widget`입니다. 이름에 도메인 단어가 남아도 됩니다.

사용 횟수는 판정 기준이 아닙니다.
한 화면에서만 쓰여도 위 셋에 해당하지 않으면 `widget`입니다.
사용 횟수로 판정하면 쓰임이 변할 때마다 폴더를 옮겨 다닙니다.

**Incorrect (화면 레이어와 화면 전용 로직이 섞임):**

```tsx
// ui/button/ui-delete-entry-button.tsx
const UiDeleteEntryButton = () => {
	const navigate = useNavigate();

	return <button onClick={() => void navigate({ to: "/entries" })}>삭제</button>;
};
```

**Incorrect (화면 타입도 안 쓰고 훅도 안 부르는 부품을 사용 횟수만 보고 화면에 남김):**

```tsx
// page/detail/component/pg-spike-legend-glyph.tsx
// 프롭스가 도메인 타입 하나만 받고 훅도 부르지 않는다. 이 화면에서만 쓴다는 이유로 남아 있다.
export const PgSpikeLegendGlyph = (props: {item: SpikeLegendItem}) => {
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

**Correct (화면 타입도 훅도 쓰지 않는 도메인 부품은 `widget`으로 올림):**

```tsx
// widget/spike-legend-glyph/wg-spike-legend-glyph.tsx
export const WgSpikeLegendGlyph = (props: WgSpikeLegendGlyphProps) => {
	const { item } = props;
	return <svg className="wg_spikeLegendGlyph__root">{/* ... */}</svg>;
};
```

**Correct (라우터 훅을 부르는 코드는 화면 레이어에 남김):**

```tsx
// page/entries/component/pg-delete-entry-button.tsx
const PgDeleteEntryButton = () => {
	const navigate = useNavigate();
	return <UiButton onClick={() => void navigate({ to: "/entries" })} />;
};
```

---
title: Prefix Layer Names on Files and Symbols
titleKo: 파일명과 심볼에 레이어 접두사를 붙입니다
impact: MEDIUM
impactDescription: 파일 하나만 봐도 어느 레이어 소유인지 드러납니다
appliesWhen:
  - 컴포넌트 파일이나 심볼 이름을 새로 지을 때
  - 컴포넌트를 다른 레이어로 옮기면서 이름을 바꿀 때
  - 소유자 안 비공개 부품의 파일·심볼·CSS 식별자를 짓거나 바꿀 때
reviewWith: ownership-layer-component-boundaries, typescript/naming-use-consistent-file-and-symbol-naming
tags: ownership, naming
---

## Prefix Layer Names on Files and Symbols

**Impact: MEDIUM (파일 하나만 봐도 어느 레이어 소유인지 드러납니다)**

세 레이어 모두 파일명과 심볼에 레이어 접두사를 붙입니다.
레이어 판정은 `ownership-layer-component-boundaries`를 따릅니다.

| 레이어 | 파일 | 심볼 | CSS 식별자 |
| --- | --- | --- | --- |
| `ui` | `ui-button.tsx` | `UiButton` | `ui_button` |
| `widget` | `wg-chart.tsx` | `WgChart` | `wg_chart` |
| `page` | `pg-detail.tsx` | `PgDetail` | `pg_detail` |

| 대상 | 표기 |
| --- | --- |
| 폴더 | 상위 폴더가 레이어를 나타내므로 접두사를 붙이지 않습니다 |
| 진입 파일이 아닌 컴포넌트 | `_pg-unit-toggle.tsx`처럼 접두사 앞에 `_`를 붙입니다. 동반 `.css`도 같은 이름을 씁니다 |
| 심볼 | 진입 파일 여부와 관계없이 `_`를 붙이지 않습니다 |
| 접두사와 겹치는 이름 | `component/ui/button/ui-button.tsx`로 쓰고 `ui-button-button.tsx`처럼 반복하지 않습니다 |
| 소유자 안 비공개 부품 | 부모 이름을 붙이지 않습니다. `_wg-header.tsx`·`WgHeader`·`wg_header`처럼 쓰며, `_` 파일은 자기 폴더에서만 가져오므로 이름이 겹칠 자리가 없고 폴더가 소유자를 말합니다 |
| 합성 부품 | 사용처가 `WgProfileDialog.Header`처럼 합성 객체로 부르므로 파일·심볼도 `_wg-header.tsx`·`WgHeader`로 두고 부모 이름을 갖지 않습니다 |
| 겹친 CSS 식별자 | 다른 소유자와 겹칠 때만 `css/naming-keep-page-slug-traceable`처럼 소유자 이름 하나를 덧붙입니다 |

진입 파일의 기준은 `ownership-place-owner-files-in-role-folders`를 따릅니다.

**Incorrect (화면 컴포넌트의 접두사를 누락합니다):**

```tsx
// page/detail/sales-trend-panel.tsx
export const SalesTrendPanel = (props: SalesTrendPanelProps) => {
	return <section className={clsx("pg_salesTrendPanel__root")}>{props.children}</section>;
};
```

**Correct (진입 파일이 아닌 파일에는 `_`를 붙이고 파일명과 심볼에 레이어 접두사를 씁니다):**

```tsx
// page/detail/_pg-sales-trend-panel.tsx
export const PgSalesTrendPanel = (props: PgSalesTrendPanelProps) => {
	return <section className={clsx("pg_salesTrendPanel__root")}>{props.children}</section>;
};
```

**Incorrect (폴더에도 접두사를 붙이고 이름에서 되풀이합니다):**

```tsx
// component/ui/ui-button/ui-button-button.tsx
export const UiButtonButton = (props: UiButtonButtonProps) => {
	return <button type="button">{props.children}</button>;
};
```

**Correct (폴더에는 접두사를 붙이지 않고 파일명에서 같은 말을 반복하지 않습니다):**

```tsx
// component/ui/button/ui-button.tsx
export const UiButton = (props: UiButtonProps) => {
	return <button type="button">{props.children}</button>;
};
```

**Incorrect (비공개 부품에 부모 이름을 반복합니다):**

```text
component/widget/profile-dialog/
├── wg-profile-dialog.tsx          # WgProfileDialog
└── _wg-profile-dialog-avatar.tsx  # WgProfileDialogAvatar, wg_profileDialogAvatar. 이 폴더 밖에서는 쓰지 않는 부품
```

**Correct (부품은 짧게 쓰고 합성 객체와 폴더가 소유자를 말합니다):**

```text
component/widget/profile-dialog/
├── wg-profile-dialog.tsx  # WgProfileDialog = {Root, Header} as const
├── _wg-root.tsx           # WgRoot. 사용처는 WgProfileDialog.Root 로 조립한다
├── _wg-header.tsx         # WgHeader
└── _wg-avatar.tsx         # WgAvatar, wg_avatar. 이 폴더 안에서만 쓰는 부품
```

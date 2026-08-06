---
title: Prefix Layer Names on Files and Symbols
titleKo: 파일명과 심볼에 레이어 접두사를 붙입니다
impact: MEDIUM
impactDescription: 파일 하나만 봐도 어느 레이어 소유인지 드러납니다
appliesWhen:
  - 컴포넌트 파일이나 심볼 이름을 새로 지을 때
  - 컴포넌트를 다른 레이어로 옮기면서 이름을 바꿀 때
reviewWith: ownership-layer-component-boundaries, typescript/naming-use-consistent-file-and-symbol-naming
tags: ownership, naming
---

## Prefix Layer Names on Files and Symbols

**Impact: MEDIUM (파일 하나만 봐도 어느 레이어 소유인지 드러납니다)**

세 레이어 모두 파일명과 심볼에 레이어 접두사를 붙입니다.
예외를 두지 않습니다.

| 레이어 | 파일 | 심볼 | CSS 식별자 |
| --- | --- | --- | --- |
| `ui` | `ui-button.tsx` | `UiButton` | `ui_button` |
| `widget` | `wg-chart.tsx` | `WgChart` | `wg_chart` |
| `page` | `pg-detail.tsx` | `PgDetail` | `pg_detail` |

- 폴더에는 붙이지 않습니다.
  상위 폴더 이름이 이미 레이어를 가리킵니다.
- 접두사가 말하는 부분을 이름에서 되풀이하지 않습니다.
  `ui/button/ui-button.tsx`이고 `ui-button-button.tsx`가 아닙니다.
- 어느 레이어인지 정하는 것은 `ownership-layer-component-boundaries`가 먼저 판정합니다.
  이 규칙은 그 결과를 이름에 적는 것만 봅니다.

**Incorrect (화면 컴포넌트에만 접두사를 빼먹음):**

```tsx
// page/detail/component/sales-trend-panel.tsx
export const SalesTrendPanel = (props: SalesTrendPanelProps) => {
	return <section className={clsx("pg_salesTrendPanel__root")}>{/* ... */}</section>;
};
```

**Incorrect (폴더에도 접두사를 붙이고 이름에서 되풀이함):**

```tsx
// ui/ui-button/ui-button-button.tsx
export const UiButtonButton = (props: UiButtonButtonProps) => {
	return <button />;
};
```

**Correct (파일과 심볼에만 붙이고 폴더에는 붙이지 않음):**

```tsx
// page/detail/component/pg-sales-trend-panel.tsx
export const PgSalesTrendPanel = (props: PgSalesTrendPanelProps) => {
	return <section className={clsx("pg_salesTrendPanel__root")}>{/* ... */}</section>;
};
```

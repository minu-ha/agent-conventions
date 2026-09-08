---
title: Prefix Layer Names on Files and Symbols
titleKo: 파일명과 심볼에 레이어 접두사를 붙입니다
impact: MEDIUM
impactDescription: 파일 하나만 봐도 어느 레이어 소유인지 드러납니다
appliesWhen:
  - 컴포넌트 파일이나 심볼 이름을 새로 지을 때
  - 컴포넌트를 다른 레이어로 옮기면서 이름을 바꿀 때
  - 부품이나 하위 소유자의 이름을 짓거나 바꿀 때
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
| 부품과 하위 소유자 | 이름이 스스로 무엇인지 말하게 짓습니다. `header`·`item`·`panel`처럼 역할 낱말 하나로 짓지 않고 `table-col`·`chat-message`·`disruptor-guide-modal`처럼 무엇의 것인지 말하는 낱말을 앞에 둡니다. 소유자 이름은 그 방법 중 하나일 뿐 필수가 아닙니다 |

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

**Incorrect (역할 낱말 하나로 지어 무엇의 부품인지 알 수 없습니다):**

```text
component/widget/chatbot/
├── _wg-launcher.tsx    # WgLauncher, wg_launcher
└── panel/
    ├── wg-panel.tsx    # WgPanel, wg_panel
    └── _wg-header.tsx  # WgHeader, wg_header
```

**Correct (이름이 스스로 뜻을 말하고 소유자 이름은 필요할 때만 들어갑니다):**

```text
component/widget/chatbot/
├── _wg-chatbot-launcher.tsx       # WgChatbotLauncher
└── chat-panel/
    ├── wg-chat-panel.tsx          # WgChatPanel, wg_chatPanel
    ├── _wg-chat-panel-header.tsx  # WgChatPanelHeader
    └── _wg-history-pane.tsx       # WgHistoryPane. history 가 뜻을 만들어 소유자 이름이 필요 없다
```

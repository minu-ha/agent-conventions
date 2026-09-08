# Prefix Layer Names on Files and Symbols

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
| 위젯·ui 안 부품 | 소유자 이름을 잇습니다. `_wg-chatbot-header.tsx`·`WgChatbotHeader`·`wg_chatbotHeader`입니다. 헤더·행·칸처럼 되풀이되는 역할 이름이라 소유자를 붙여야 검색이 되고 CSS 식별자가 저절로 유일해집니다 |
| 합성 부품 | 같습니다. `_wg-profile-dialog-root.tsx`·`WgProfileDialogRoot`를 `WgProfileDialog.Root`로 조립합니다 |
| 하위 소유자 | 위 소유자 이름부터 잇습니다. `chatbot/panel/wg-chatbot-panel.tsx`·`_wg-chatbot-panel-header.tsx`입니다. 한 겹만 두는 `ownership-place-owner-files-in-role-folders`가 길이를 막습니다 |
| 화면 부품 | 라우트 폴더가 소유자라 `_pg-unit-toggle.tsx`처럼 짧게 쓰고, CSS 식별자 충돌은 `css/naming-keep-page-slug-traceable`을 따릅니다 |

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

> 나머지 예시·예외는 [full rule](../rules/01-02-ownership-prefix-layer-names-on-files-and-symbols.md)에 있습니다.

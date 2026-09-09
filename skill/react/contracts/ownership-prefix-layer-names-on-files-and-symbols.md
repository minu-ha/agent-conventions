# Prefix Layer Names on Files and Symbols

**Impact: MEDIUM (파일 하나만 봐도 어느 레이어 소유인지 드러납니다)**

세 레이어 모두 파일명과 심볼에 레이어 접두사를 붙입니다.
레이어 판정은 `ownership-layer-component-boundaries`를 따릅니다.

### 레이어 접두사

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

### 부품 이름 짓기

부품과 하위 소유자는 이름이 스스로 무엇인지 말하게 짓습니다.

| 부품 이름 | 예 |
| --- | --- |
| 역할 낱말 하나만 | `header`, `item`, `panel`은 안 됨 |
| 무엇의 것인지 앞에 | `table-col`, `chat-message`, `disruptor-guide-modal` |
| 소유자 이름 | 필수가 아니라 방법 하나 |

진입 파일의 기준은 `ownership-place-owner-files-in-role-folders`를 따릅니다.

**Incorrect 1 (화면 컴포넌트의 접두사를 누락합니다):**

```tsx
// page/detail/product-table-section.tsx
export const ProductTable = (props: ProductTableProps) => {
	return <section className={clsx("pg_productTableSection__root")}>{props.children}</section>;
};
```

**Correct 1 (진입 파일이 아닌 파일에는 `_`를 붙이고 파일명과 심볼에 레이어 접두사를 씁니다):**

```tsx
// page/detail/_pg-product-table-section.tsx
export const PgProductTableSection = (props: PgProductTableSectionProps) => {
	return <section className={clsx("pg_productTableSection__root")}>{props.children}</section>;
};
```

> 나머지 예시와 예외는 [full rule](../rules/01-02-ownership-prefix-layer-names-on-files-and-symbols.md)에 있습니다.

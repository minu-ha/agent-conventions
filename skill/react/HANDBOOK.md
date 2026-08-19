# React 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.companions`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=react`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 React 코딩 컨벤션입니다. `ui`·`widget`·`page` 세 레이어의 소유 경계, composition 전략, React handler/prop 계약, 화면 흐름, state 오리진, React 19 component/effect/transition 패턴과 문서화를 다룹니다. TypeScript 규칙을 항상 함께 따르고, class contract나 stylesheet를 바꿀 때는 CSS 규칙도 함께 봅니다. `rules/` 아래 rule 파일이 source of truth입니다.

이 문서에는 React 컨벤션 규칙만 담겨 있습니다. 아래 규칙도 함께 따릅니다.

---

## 함께 따르는 규칙

- [TypeScript Convention](../typescript/HANDBOOK.md) — 항상 함께 적용합니다.
- [CSS Convention](../css/HANDBOOK.md) — 다음 조건에서 함께 적용합니다. class contract, stylesheet 또는 styling surface를 변경한다.

---

## 목차

1. [Ownership and Boundaries](#1-ownership-and-boundaries) — **CRITICAL**
    - 1.1 [Keep UI, Widget, and Page Ownership Separate](#11-keep-ui-widget-and-page-ownership-separate)
    - 1.2 [Prefix Layer Names on Files and Symbols](#12-prefix-layer-names-on-files-and-symbols)
    - 1.3 [Place Owner Files in Role Folders](#13-place-owner-files-in-role-folders)
    - 1.4 [Keep Component Imports Flowing Downward](#14-keep-component-imports-flowing-downward)
    - 1.5 [Do Not Create Screen-local Custom Hooks for Pure Logic](#15-do-not-create-screen-local-custom-hooks-for-pure-logic)
    - 1.6 [Keep Library Lifecycle in the Owning Component](#16-keep-library-lifecycle-in-the-owning-component)
2. [Server Data Flow](#2-server-data-flow) — **HIGH**
    - 2.1 [Name Query and Mutation Bindings Consistently](#21-name-query-and-mutation-bindings-consistently)
    - 2.2 [Shape React Query Data in query.select](#22-shape-react-query-data-in-query-select)
    - 2.3 [Combine Multiple Queries With `combine`](#23-combine-multiple-queries-with-combine)
    - 2.4 [Preserve Response and Store Origin Down to the JSX](#24-preserve-response-and-store-origin-down-to-the-jsx)
    - 2.5 [Handle Mutation Failure Where the Mutation Is Called](#25-handle-mutation-failure-where-the-mutation-is-called)
    - 2.6 [Invalidate the Queries a Mutation Changed](#26-invalidate-the-queries-a-mutation-changed)
3. [Typing and Contracts](#3-typing-and-contracts) — **CRITICAL**
    - 3.1 [Take React Handler and Wrapper Prop Types From Existing Contracts](#31-take-react-handler-and-wrapper-prop-types-from-existing-contracts)
    - 3.2 [Narrow the Contract a Library Wrapper Opens](#32-narrow-the-contract-a-library-wrapper-opens)
    - 3.3 [Choose the Wrapper Shape and Forward Props Accordingly](#33-choose-the-wrapper-shape-and-forward-props-accordingly)
4. [Composition Strategy](#4-composition-strategy) — **MEDIUM-HIGH**
    - 4.1 [Choose Single Components, Compound Components, and Variants Deliberately](#41-choose-single-components-compound-components-and-variants-deliberately)
    - 4.2 [Expose Only Compound Parts the Consumer Assembles](#42-expose-only-compound-parts-the-consumer-assembles)
    - 4.3 [Avoid Boolean Prop Proliferation in Shared Components](#43-avoid-boolean-prop-proliferation-in-shared-components)
    - 4.4 [Prefer Children Over Render Props for Static Composition](#44-prefer-children-over-render-props-for-static-composition)
5. [Component Structure and JSX](#5-component-structure-and-jsx) — **HIGH**
    - 5.1 [Read Props Through the Props Object Without Destructuring](#51-read-props-through-the-props-object-without-destructuring)
    - 5.2 [Do Not Define Components Inside Components](#52-do-not-define-components-inside-components)
    - 5.3 [Use Named Handlers Instead of Hiding Logic in JSX](#53-use-named-handlers-instead-of-hiding-logic-in-jsx)
    - 5.4 [Open ref Props Only for Real Imperative Contracts](#54-open-ref-props-only-for-real-imperative-contracts)
    - 5.5 [Use Activity Only to Preserve Mounted Subtrees](#55-use-activity-only-to-preserve-mounted-subtrees)
    - 5.6 [Declare Props Interfaces Above the Component](#56-declare-props-interfaces-above-the-component)
    - 5.7 [Write Fragments as `Fragment`, Not the Shorthand](#57-write-fragments-as-fragment-not-the-shorthand)
    - 5.8 [Render a Single Branch With `&&`, Not a Ternary](#58-render-a-single-branch-with-not-a-ternary)
    - 5.9 [Order Hooks, Handlers, Effects, Then Return](#59-order-hooks-handlers-effects-then-return)
6. [Screen File Discipline](#6-screen-file-discipline) — **MEDIUM-HIGH**
    - 6.1 [Keep Route Entry Files Focused on Screen Flow](#61-keep-route-entry-files-focused-on-screen-flow)
    - 6.2 [Avoid Premature Abstraction in Screen Code](#62-avoid-premature-abstraction-in-screen-code)
    - 6.3 [Extract Local Section Components Only for Runtime Boundaries](#63-extract-local-section-components-only-for-runtime-boundaries)
    - 6.4 [Keep Derived Values Close to Where They Are Used](#64-keep-derived-values-close-to-where-they-are-used)
7. [Runtime Boundaries](#7-runtime-boundaries) — **HIGH**
    - 7.1 [Place Suspense Boundaries at the Section Owner](#71-place-suspense-boundaries-at-the-section-owner)
    - 7.2 [Avoid Ad-hoc Loading Branches in Screen Bodies](#72-avoid-ad-hoc-loading-branches-in-screen-bodies)
    - 7.3 [Place Error Boundaries by How Much Should Survive](#73-place-error-boundaries-by-how-much-should-survive)
8. [State Ownership and Updates](#8-state-ownership-and-updates) — **HIGH**
    - 8.1 [Calculate Derived Values During Rendering](#81-calculate-derived-values-during-rendering)
    - 8.2 [Choose State Tools by Source of Truth](#82-choose-state-tools-by-source-of-truth)
    - 8.3 [Store Shared Derived Decisions Only When They Are Truly Shared](#83-store-shared-derived-decisions-only-when-they-are-truly-shared)
    - 8.4 [Use Functional setState Updates When Based on Previous State](#84-use-functional-setstate-updates-when-based-on-previous-state)
    - 8.5 [Use useEffectEvent for Non-reactive Effect Callbacks](#85-use-useeffectevent-for-non-reactive-effect-callbacks)
9. [Events and Interaction Flow](#9-events-and-interaction-flow) — **HIGH**
    - 9.1 [Name Handlers Predictably](#91-name-handlers-predictably)
    - 9.2 [Curry Extra Arguments Into DOM Event Handlers](#92-curry-extra-arguments-into-dom-event-handlers)
    - 9.3 [Run User Actions in Handlers, Not Effects](#93-run-user-actions-in-handlers-not-effects)
10. [Render Performance](#10-render-performance) — **MEDIUM**
    - 10.1 [Do Not Memoize Without a Confirmed Reason](#101-do-not-memoize-without-a-confirmed-reason)
    - 10.2 [Use Lazy State Initializers for Expensive Defaults](#102-use-lazy-state-initializers-for-expensive-defaults)
    - 10.3 [Defer Heavy Renders Only With Measured Evidence](#103-defer-heavy-renders-only-with-measured-evidence)
11. [Accessibility](#11-accessibility) — **HIGH**
    - 11.1 [Give Interactive Elements an Accessible Name](#111-give-interactive-elements-an-accessible-name)
12. [Documentation and Comments](#12-documentation-and-comments) — **MEDIUM**
    - 12.1 [Require Doc Comments on React Hooks, Handlers, and Key Declarations](#121-require-doc-comments-on-react-hooks-handlers-and-key-declarations)
13. [Tooling](#13-tooling) — **MEDIUM**
    - 13.1 [Enable the Biome React Domain](#131-enable-the-biome-react-domain)

---

## 1. Ownership and Boundaries

**Impact: CRITICAL**

`ui`, `widget`, `page` 세 레이어의 소유 경계가 분명해야 코드를 예측 가능하게 배치할 수 있습니다. 레이어 판정과 이름 표기, 역할 폴더, 하향 단방향 가져오기, 생명주기 소유가 이 경계를 지탱하고, 순수 계산을 훅으로 감싸지 않는 규율도 여기에 속합니다.

### 1.1 Keep UI, Widget, and Page Ownership Separate

**Rule:** `R01-01` · `ownership-layer-component-boundaries`

**Applies when:** 컴포넌트를 `ui`, `widget`, `page` 중 어느 소유 레이어에 둘지 정할 때. 컴포넌트를 레이어 사이에서 옮기거나 공용화할 때.

**Review with:** `css/ownership-choose-scope-prefix-by-owner-layer`, `ownership-place-owner-files-in-role-folders`

**Impact: CRITICAL (공용 책임과 화면 전용 책임이 같은 레이어에 섞이지 않습니다)**

컴포넌트는 셋 중 한 레이어가 소유합니다.
레이어는 컴포넌트가 무엇을 아는가로만 가릅니다.

| 레이어 | 담는 컴포넌트 |
| --- | --- |
| `ui` | 도메인도 화면도 모르는 컴포넌트 |
| `widget` | 도메인은 알고 화면은 모르는 컴포넌트 |
| `page` | 화면을 아는 뼈대와 컴포넌트 |

이름 표기는 `ownership-prefix-layer-names-on-files-and-symbols`가 정합니다.
여기서는 어느 레이어인지만 판정합니다.

**먼저 `page`인지 봅니다.** 다음 중 하나라도 해당하면 `page`입니다.

- 프롭스 타입이 그 화면의 응답·뷰모델 타입이나 라우트 search 파라미터를 참조합니다.
- 쿼리, 뮤테이션, 라우터 훅, 화면 스토어를 직접 부릅니다.
- `Suspense`, 폼 프로바이더, 모달을 직접 소유합니다.

**`page`가 아니면 도메인 지식으로 갈립니다.**

- 도메인을 모르면 `ui`입니다.
- 도메인을 알면 `widget`입니다.
  이름에 도메인 단어가 남아도 됩니다.

사용 횟수는 판정 기준이 아닙니다.
한 화면에서만 쓰여도 위 `page` 판정에 해당하지 않으면 `page`가 아닙니다.
사용 횟수로 판정하면 쓰임이 변할 때마다 컴포넌트가 폴더를 옮겨 다니게 됩니다.

조립 규모도 판정 기준이 아닙니다.
`ui` 부품 여럿을 조립한 컴포넌트라도 도메인을 모르면 `ui`입니다.
조립 규모로 판정하면 도메인을 모르는 조합이 전부 `widget`에 쌓여
레이어 이름이 소유를 말하지 못하게 됩니다.

**Incorrect (공용 레이어에 화면 전용 로직이 섞임):**

```tsx
// ui/button/ui-delete-product-button.tsx
const UiDeleteProductButton = () => {
	const navigate = useNavigate();

	return <button onClick={() => void navigate({ to: "/products" })}>삭제</button>;
};
```

**Incorrect (화면 타입도 안 쓰고 훅도 안 부르는 부품을 사용 횟수만 보고 화면에 남김):**

```tsx
// page/detail/component/pg-sales-legend-glyph.tsx
// 프롭스가 도메인 타입 하나만 받고 훅도 부르지 않는다. 이 화면에서만 쓴다는 이유로 남아 있다.
export const PgSalesLegendGlyph = (props: PgSalesLegendGlyphProps) => {
	return <svg className={clsx("pg_salesLegendGlyph__root")}>{/* ... */}</svg>;
};
```

**Incorrect (도메인을 모르는 조합을 조립 규모만 보고 `widget`에 둠):**

```tsx
// widget/line-chart/wg-line-chart.tsx
// 프롭스가 좌표 배열만 받고 도메인 타입을 모른다. ui 부품을 조립했다는 이유로 widget에 있다.
export const WgLineChart = (props: WgLineChartProps) => {
	return <svg className={clsx("wg_lineChart__root")}>{/* ... */}</svg>;
};
```

**Correct (화면 타입도 훅도 쓰지 않는 도메인 부품은 `widget`으로 올림):**

```tsx
// widget/sales-legend-glyph/wg-sales-legend-glyph.tsx
export const WgSalesLegendGlyph = (props: WgSalesLegendGlyphProps) => {
	return <svg className={clsx("wg_salesLegendGlyph__root")}>{/* ... */}</svg>;
};
```

**Correct (도메인을 모르는 조합은 `ui`로 내리고 도메인을 아는 조합만 `widget`에 남김):**

```tsx
// ui/line-chart/ui-line-chart.tsx
export const UiLineChart = (props: UiLineChartProps) => {
	return <svg className={clsx("ui_lineChart__root")}>{/* ... */}</svg>;
};
```

```tsx
// widget/sales-window-chart/wg-sales-window-chart.tsx
export const WgSalesWindowChart = (props: WgSalesWindowChartProps) => {
	return <UiLineChart points={toChartPoints(props.readings)} />;
};
```

**Correct (라우터 훅을 부르는 코드는 화면 레이어에 남김):**

```tsx
// page/products/component/pg-delete-product-button.tsx
const PgDeleteProductButton = () => {
	const navigate = useNavigate();

	/**
	 * 삭제 후 목록으로 이동
	 */
	const handleDeleteButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		void navigate({ to: "/products" });
	};

	return <UiButton onClick={handleDeleteButtonClick}>삭제</UiButton>;
};
```

### 1.2 Prefix Layer Names on Files and Symbols

**Rule:** `R01-02` · `ownership-prefix-layer-names-on-files-and-symbols`

**Applies when:** 컴포넌트 파일이나 심볼 이름을 새로 지을 때. 컴포넌트를 다른 레이어로 옮기면서 이름을 바꿀 때.

**Review with:** `ownership-layer-component-boundaries`, `typescript/naming-use-consistent-file-and-symbol-naming`

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
- 어느 레이어인지는 `ownership-layer-component-boundaries`가 먼저 판정합니다.
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

### 1.3 Place Owner Files in Role Folders

**Rule:** `R01-03` · `ownership-place-owner-files-in-role-folders`

**Applies when:** 소유자 아래 `component`·`config`·`function`·`hook`·`type` 폴더를 만들거나 옮길 때. 추출한 컴포넌트·함수·타입의 배치 위치를 정할 때. 제외: 기존 파일 내부 구현만 바꾸는 경우.

**Review with:** `css/ownership-choose-scope-prefix-by-owner-layer`, `ownership-keep-component-imports-flowing-downward`

**Impact: MEDIUM-HIGH (빼낸 파일이 소유자를 따라가 예상한 자리에 놓입니다)**

라우트와 복잡한 컴포넌트가 소유자이고, 추출한 파일은 그 소유자 아래 역할 폴더에 둡니다.
소유자 이름이 폴더 이름이므로 위치만 보고 소유자를 알 수 있습니다.

역할 폴더는 다음 다섯 개뿐이고 새 역할 폴더를 만들지 않습니다.

| 폴더 | 담는 것 |
| --- | --- |
| `component` | 이 소유자만 쓰는 하위 컴포넌트 |
| `config` | 입력을 받지 않는 선언형 설정, 기본 설정, 기준값 |
| `function` | 이름 붙여 내보낸 도메인 계산 |
| `hook` | 실제 상태·이펙트·컨텍스트를 소유한 커스텀 훅 |
| `type` | 여러 파일이 공유하는 계약 |

소유자 아래에는 `util`, `helper`, `constant`, `common`, `shared` 같은 폴더를 만들지 않습니다.
전역 `shared/`는 다른 자리라 여기 해당하지 않습니다.
폴더 이름은 단수로 쓰고 프레임워크가 강제하는 이름만 예외로 둡니다.

배치 기준입니다.

- 필요한 역할 폴더만 그때 만듭니다.
  빈 폴더를 미리 만들어 두지 않습니다.
- 파일이 하나뿐인 역할 폴더도 그대로 둡니다.
  형제 `.ts` 하나로 대신하지 않습니다.
- 자기 역할 폴더가 필요한 컴포넌트만 자기 폴더를 갖고, 더 나뉘지 않는 것은 `component` 아래 파일로 둡니다.
- 함수도 같습니다.
  전용 보조 파일을 거느린 함수만 `function` 아래 자기 이름 폴더를 갖습니다.
  언제 거느리는지는 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`이 정합니다.
- 프롭스는 해당 TSX에 두고 여러 파일이 공유하는 계약만 `type`으로 옮깁니다.
- 파일명과 심볼의 레이어 접두사는 `ownership-prefix-layer-names-on-files-and-symbols`가 정합니다.
- 소유자 중첩이 3단계에 닿으면 분리가 맞는지 `widget`으로 나갈 대상인지 다시 봅니다.
- 호출 계층은 폴더 깊이가 아니라 진입 파일의 조립이 드러냅니다.
  어느 컴포넌트가 이것을 쓰는지 폴더 경로로 표현하려고 중첩을 늘리지 않습니다.

무엇을 추출할지는 이 규칙이 정하지 않습니다.
`typescript/functions-extract-helpers-only-when-the-boundary-is-real`이 추출 여부를 먼저 판정하고
이 규칙은 그 결과의 위치만 정합니다.

**Incorrect (단순 컴포넌트에 역할 폴더를 미리 다 만듦):**

```txt
ui/button/
├── ui-button.tsx
├── ui-button.css
├── component/
├── config/
├── function/
├── hook/
└── type/
```

**Incorrect (범용 이름 폴더와 복수형을 섞어 씀):**

```txt
page/detail/
├── pg-detail.tsx
├── components/
├── constants/
├── utils/
└── helpers/
```

**Correct (필요한 역할 폴더만 만들고 나머지는 파일로 둠):**

```txt
page/detail/
├── pg-detail.tsx
├── pg-detail.css
├── function/
│   ├── to-product-summary.ts
│   └── to-sales-chart/
│       ├── to-sales-chart.ts
│       └── to-chart-window.ts
├── type/
│   └── detail-view-model.ts
└── component/
    ├── pg-summary-band.tsx
    ├── pg-summary-band.css
    └── sales-trend-panel/
        ├── pg-sales-trend-panel.tsx
        ├── pg-sales-trend-panel.css
        └── function/
            └── to-chart-viewport.ts
```

**Correct (지원 코드가 없으면 폴더 없이 파일만 둠):**

```txt
ui/button/
├── ui-button.tsx
└── ui-button.css
```

### 1.4 Keep Component Imports Flowing Downward

**Rule:** `R01-04` · `ownership-keep-component-imports-flowing-downward`

**Applies when:** `component` 폴더 안의 파일을 다른 파일에서 가져올 때. `../`나 `@/page` 경로로 컴포넌트를 가져오려 할 때. 여러 자식이 같은 컴포넌트를 써야 해서 배치를 다시 정할 때. 제외: `function`·`type`·`config`·`hook` 파일을 가져오는 경우.

**Requires selected:** `typescript/naming-restrict-absolute-aliases-to-layer-roots` · 함께 적용

**Review with:** `ownership-layer-component-boundaries`

**Impact: CRITICAL (비공개 컴포넌트를 형제나 위쪽에서 되짚어 소유 관계가 무너지지 않습니다)**

컴포넌트 가져오기는 소유 관계를 따라 아래로만 흐릅니다.

- `component` 폴더 안의 파일은 그 폴더의 소유자만 가져옵니다.
- 형제끼리는 가져오지 않습니다.
- `../`로 컴포넌트를 가져오지 않습니다.
- 절대경로 별칭의 허용 범위는 `typescript/naming-restrict-absolute-aliases-to-layer-roots`가 정합니다.

여러 자식이 같은 컴포넌트를 써야 하면 셋 중 하나로 해소합니다.

1. 부모가 조립해서 프롭이나 `children`으로 내려보냅니다.
2. 화면 조립을 전제하지 않는 컴포넌트면 `ui` 또는 `widget`으로 올립니다.
3. 짧은 조각이면 그대로 중복해서 씁니다.

세 자식 이상이 같은 것을 써야 하는데 올릴 수도 없으면 자식 분리가 잘못됐다는 신호입니다.
`function`, `type`, `config`, `hook`은 렌더 트리를 만들지 않으므로 소유자 안에서 공유하고 이 방향 제약을 받지 않습니다.
`hook`이 예외인 근거는 `ownership-keep-lifecycle-in-the-owning-component`에 있습니다.
여러 소유자가 함께 부르는 생명주기만 훅으로 올리라고 정하는데,
올린 훅을 자식이 가져오지 못하면 그 규칙이 성립하지 않습니다.

**Incorrect (형제 컴포넌트를 직접 가져와 소유 관계가 사라짐):**

```tsx
// page/detail/component/sales-trend-panel/component/pg-detection-section.tsx
import { PgLegendRow } from "./pg-legend-row";
import { SectionHeading } from "../../section-heading/section-heading";
```

**Incorrect (절대경로로 다른 화면 내부를 가져옴):**

```tsx
import { PgSalesChartCard } from "@/page/detail/component/sales-trend-panel/component/pg-sales-chart-card";
```

**Correct (부모가 조립해서 내려보냄):**

```tsx
// page/detail/component/sales-trend-panel/pg-sales-trend-panel.tsx
import { UiSectionHeading } from "@/ui/section-heading/ui-section-heading";

import { PgDetectionSection } from "./component/pg-detection-section";
import { PgSummaryBand } from "./component/pg-summary-band";

export const PgSalesTrendPanel = (props: PgSalesTrendPanelProps) => {
	return (
		<section className={clsx("pg_salesTrendPanel__root")}>
			<PgDetectionSection heading={<UiSectionHeading title="매출 추이" />} legendItems={props.legendItems} />
			<PgSummaryBand heading={<UiSectionHeading title="요약" />} />
		</section>
	);
};
```

**Correct (맥락 독립 컴포넌트는 전역 레이어에서 가져옴):**

```tsx
// page/detail/component/sales-trend-panel/component/pg-detection-section.tsx
import { WgLegendPanel } from "@/widget/legend-panel/wg-legend-panel";
```

### 1.5 Do Not Create Screen-local Custom Hooks for Pure Logic

**Rule:** `R01-05` · `ownership-prefer-plain-ts-for-local-react-helpers`

**Applies when:** 화면 전용 계산·정규화·전송 값 조립을 커스텀 훅으로 추출하려 할 때. 화면 전용 순수 로직을 별도 보조 모듈로 옮기려 할 때. 제외: 상태·컨텍스트·다른 훅 호출 순서를 실제로 캡슐화하는 경우.

**Review with:** `ownership-keep-lifecycle-in-the-owning-component`, `ownership-place-owner-files-in-role-folders`, `typescript/functions-extract-helpers-only-when-the-boundary-is-real`, `typescript/naming-use-direct-imports-and-public-entry-points`

**Impact: MEDIUM-HIGH (리액트 전용 추상을 실제 생명주기나 문맥이 얽힌 자리로만 한정합니다)**

순수 계산은 훅으로 감싸지 않고 일반 `.ts` 파일의 함수로 둡니다.
화면 하나에 종속된 계산, 정규화, 전송 값 조립이 모두 여기 해당합니다.

- 이 규칙은 훅으로 감쌀지 여부만 판정합니다.
  그 함수를 아예 밖으로 뺄지는 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`이,
  뺀 결과를 어디 둘지는 `ownership-place-owner-files-in-role-folders`가 정합니다.
- 화면 지역 커스텀 훅은 상태, 컨텍스트, 다른 훅 호출 순서를 실제로 캡슐화할 때만 허용합니다.
- 보조 모듈의 내보내기와 가져오기 형태는 `typescript/naming-use-direct-imports-and-public-entry-points`가 정합니다.
- 생명주기가 실제로 있어도 파일 분량을 줄이려는 추출은 허용하지 않습니다.
  그 판단은 `ownership-keep-lifecycle-in-the-owning-component`가 담당합니다.
- 단순 계산을 훅처럼 보이게 만드는 추상화는 피합니다.

**Incorrect (로컬 계산을 습관적으로 훅으로 포장):**

```ts
export const useMediaUploadPayload = (files: UploadFile[]) => {
	return files.map((file) => ({ uid: file.uid }));
};
```

**Correct (순수 계산은 소유자의 `function` 폴더에 일반 함수로 둠):**

```ts
// page/products/function/to-media-upload-request.ts
/**
 * 업로드 파일 목록을 저장 payload로 정규화
 */
export const toMediaUploadRequest = (files: UploadFile[]) => {
	return files.map((file) => ({ uid: file.uid }));
};
```

**Correct (훅 없이 컴포넌트 핸들러가 그 함수를 직접 부름):**

```tsx
// page/products/component/pg-media-upload-panel.tsx
import { toMediaUploadRequest } from "../function/to-media-upload-request";

const PgMediaUploadPanel = (props: PgMediaUploadPanelProps) => {
	/**
	 * 업로드를 확정할 때만 정규화해서 보냄. 렌더 중에는 계산하지 않는다
	 */
	const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		void saveMedia(toMediaUploadRequest(props.files));
	};

	return <UiButton onClick={handleSaveButtonClick}>저장</UiButton>;
};
```

### 1.6 Keep Library Lifecycle in the Owning Component

**Rule:** `R01-06` · `ownership-keep-lifecycle-in-the-owning-component`

**Applies when:** 외부 라이브러리 인스턴스 생성·크기 변경·구독·정리를 한 컴포넌트가 소유할 때. 생명주기 코드를 커스텀 훅으로 옮겨 파일을 줄이려 할 때. 제외: 여러 소유자가 같은 생명주기 계약을 실제로 호출하는 경우.

**Review with:** `ownership-prefer-plain-ts-for-local-react-helpers`

**Impact: MEDIUM (파일 길이를 줄이려고 생명주기를 훅 뒤로 숨겨 실행 흐름이 사라지지 않습니다)**

외부 라이브러리의 인스턴스 생성, 크기 변경, 이벤트 구독, 정리는 그 하위 트리를 소유한 컴포넌트가 직접 가집니다.
파일이 길어졌다는 이유만으로 커스텀 훅을 만들어 생명주기를 숨기지 않습니다.

- 한 소유자만 쓰는 생명주기는 그 컴포넌트 안의 이펙트로 둡니다.
- 줄 수 감소는 추출 근거가 아닙니다.
  읽는 사람이 파일을 왕복하게 만들 뿐입니다.
- 여러 소유자가 같은 생명주기 계약을 실제로 호출할 때만 훅으로 올립니다.
- 파일이 길면 생명주기를 옮기기보다 도메인 계산을 `function`으로 분리합니다.

`ownership-prefer-plain-ts-for-local-react-helpers`는 순수 계산을 훅으로 포장하는 것을 막고,
이 규칙은 반대로 실제 생명주기가 있어도 분량 때문에 훅으로 옮기는 것을 막습니다.

**Incorrect (줄 수를 줄이려고 생명주기를 훅 뒤로 옮김):**

```ts
// component/chart-root/use-chart-instance.ts
export const useChartInstance = (containerRef: RefObject<HTMLDivElement | null>) => {
	const [chart, setChart] = useState<EChartsType | null>(null);

	useEffect(() => {
		const instance = init(containerRef.current);
		const handleResize = () => {
			instance.resize();
		};

		window.addEventListener("resize", handleResize);
		setChart(instance);

		return () => {
			window.removeEventListener("resize", handleResize);
			instance.dispose();
		};
	}, [containerRef]);

	return chart;
};
```

```tsx
// widget/chart/component/chart-root/wg-chart-root.tsx
export const WgChartRoot = (props: WgChartRootProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const chart = useChartInstance(containerRef);

	/**
	 * option이 바뀌면 기존 instance에 다시 반영
	 */
	useEffect(() => {
		chart?.setOption(props.option);
	}, [chart, props.option]);

	return <div ref={containerRef} className={clsx("wg_chart__canvas")} />;
};
```

**Correct (생명주기를 소유 컴포넌트가 직접 가짐):**

```tsx
// widget/chart/component/chart-root/wg-chart-root.tsx
export const WgChartRoot = (props: WgChartRootProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [chart, setChart] = useState<EChartsType | null>(null);

	/**
	 * container mount 시 chart instance를 만들고 resize·dispose까지 소유
	 */
	useEffect(() => {
		if (!containerRef.current) return;

		const instance = init(containerRef.current);
		const handleResize = () => {
			instance.resize();
		};

		window.addEventListener("resize", handleResize);
		setChart(instance);

		return () => {
			window.removeEventListener("resize", handleResize);
			instance.dispose();
		};
	}, []);

	/**
	 * option이 바뀌면 기존 instance에 다시 반영
	 */
	useEffect(() => {
		chart?.setOption(props.option);
	}, [chart, props.option]);

	return <div ref={containerRef} className={clsx("wg_chart__canvas")} />;
};
```

## 2. Server Data Flow

**Impact: HIGH**

쿼리와 뮤테이션은 출처를 보존해야 하며, 응답 변형은 `query.select`처럼 출처에 가장 가까운 지점에서 끝내야 합니다. 바인딩 이름도 어떤 API에서 왔는지 드러내야 하고, 실패와 무효화는 부른 자리에서 받습니다.

### 2.1 Name Query and Mutation Bindings Consistently

**Rule:** `R02-01` · `data-name-query-and-mutation-bindings-consistently`

**Applies when:** React Query 쿼리·뮤테이션 훅의 지역 바인딩을 추가하거나 이름을 바꿀 때. 쿼리나 뮤테이션 훅의 반환값을 새 지역 변수에 담을 때.

**Requires selected:** `docs-require-jsdoc-on-key-declarations`, `typescript/naming-use-consistent-file-and-symbol-naming` · 함께 적용

**Review with:** `data-preserve-origin-chaining`

**Impact: MEDIUM (생성된 API 훅과 지역 바인딩을 훑고 되짚기 쉬워집니다)**

프로젝트가 이미 채택한 쿼리/뮤테이션 훅 이름은 유지하고, 지역 바인딩은 `response`와 `mutation` 접두사만 씁니다.
훅 하나를 담는 바인딩 이름은 훅 이름에서 `use`를 떼고 앞에 `response` 또는 `mutation`을 붙여 만듭니다.
`useProductListSuspense`는 `responseProductListSuspense`, `useProductRemove`는 `mutationProductRemove`입니다.
여러 쿼리를 합친 결과처럼 훅 이름 하나로 정해지지 않는 값은 합친 값이 무엇인지로 이름을 짓습니다.

**Incorrect (쿼리와 뮤테이션 바인딩 이름이 제각각임):**

```ts
const list = useProductListSuspense();
const removeApi = useProductRemove();
```

**Correct (지역 바인딩 접두사를 통일):**

```ts
/**
 * 표에 그릴 product를 읽는다. 멈추는 동안은 섹션 소유자의 경계가 받는다
 */
const responseProductListSuspense = useProductListSuspense();

/**
 * 표에서 고른 product를 지운다. 성공 뒤 무효화는 부르는 화면이 맡는다
 */
const mutationProductRemove = useProductRemove();
```

### 2.2 Shape React Query Data in query.select

**Rule:** `R02-02` · `data-shape-query-data-with-select`

**Applies when:** 서버 응답의 목록·항목·메타 등을 렌더에서 가공하거나 반복 소비할 때. React Query `select`의 결과 형태를 추가·변경할 때.

**Requires selected:** `docs-require-jsdoc-on-key-declarations` · 함께 적용

**Review with:** `data-name-query-and-mutation-bindings-consistently`, `data-preserve-origin-chaining`

**Impact: MEDIUM-HIGH (변환이 통신 경계 한 곳에 모여 화면이 응답 원본 구조를 모릅니다)**

서버 응답 가공은 화면 본문이 아니라 `query.select`에서 처리합니다.

- `data.list` 같은 응답 원본 구조를 화면 여러 군데에서 직접 해석하지 않습니다.
  도메인 의미가 드러나는 필드 이름으로 한 번 변환합니다.
- 여러 쿼리 결과를 함께 가공하는 것은 `select`로 할 수 없습니다.
  `select`는 자기 쿼리 데이터만 받습니다.
  그 자리는 `data-combine-multiple-queries-with-combine`이 정합니다.

**`select`는 인라인으로 적습니다.**
인라인이면 렌더마다 다시 도는데, 그 비용은 렌더 중에 값을 계산하는 것과 같습니다.
`state-calculate-derived-values-during-render`가 이미 허용하는 자리입니다.

변환이 무겁다는 근거가 `perf-avoid-defensive-memoization`이 요구하는 만큼 있으면
그때만 같은 파일 위쪽의 모듈 최상위 상수로 빼서 참조를 고정합니다.
결과는 구조를 공유해 참조가 안정적이므로 `useMemo`로 감싸지 않습니다.

`select` 안 변환 함수는 이 규칙이 담당합니다.
별도 함수나 보조 모듈 경계가 없으면 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`은
적용하지 않습니다.

**Incorrect (렌더에서 응답 원본 구조를 가공):**

```tsx
<UiTable
	dataSource={responseProductListSuspense.data.list.map((product) => ({
		id: product.id,
		label: product.title,
	}))}
/>;
```

**Correct (통신 경계에서 화면이 쓸 모양으로 변환):**

```ts
/**
 * 표가 그대로 쓰는 필드 이름으로 목록을 바꿔서 화면이 응답 구조를 모르게 한다
 */
const responseProductListSuspense = useProductListSuspense(
	{},
	{query: {select: (response) => ({items: response.data.list})}},
);
```

### 2.3 Combine Multiple Queries With `combine`

**Rule:** `R02-03` · `data-combine-multiple-queries-with-combine`

**Applies when:** 쿼리 결과 둘 이상을 하나의 값으로 합치는 코드를 추가·변경할 때. 화면 본문에서 두 `data`를 꺼내 함께 계산하는 코드를 넣거나 뺄 때.

**Review with:** `data-shape-query-data-with-select`, `screen-keep-derived-values-close`

**Impact: MEDIUM-HIGH (여러 응답을 합치는 자리가 통신 경계에 남고 화면 본문에 별칭이 쌓이지 않습니다)**

쿼리 결과 둘 이상을 하나의 값으로 합쳐야 하면 `useSuspenseQueries`나 `useQueries`에 `combine`을 넘깁니다.
`Suspense` 쿼리를 쓰는 화면은 `useSuspenseQueries`를 쓰고, 합친 값에 `isPending`을 만들어 내보내지 않습니다.
그 분기는 `runtime-avoid-ad-hoc-loading-branches`가 죽은 코드로 봅니다.

| 상황 | 쓰는 것 |
| --- | --- |
| 결과 둘 이상을 하나의 값으로 합침 | `useSuspenseQueries` 또는 `useQueries` + `combine` |
| 각각 따로 그림 | 합치지 않고 훅을 따로 부르기 |
| 뒤 쿼리가 앞 결과를 입력으로 받음 | `combine` 대신 `enabled`로 순서 만들기 |

`select`로는 못 합니다.
`select`는 자기 쿼리 데이터만 받습니다.
한 쿼리를 가공하는 자리는 `data-shape-query-data-with-select`가 정합니다.

화면 본문에서 두 `data`를 꺼내 합치지 않습니다.
합친 값이 화면 위쪽 `const`로 남아 출처를 잃습니다.
`screen-keep-derived-values-close`가 그것을 막습니다.

**`combine`도 인라인으로 적습니다.** `select`와 같은 자리이고 같은 기준을 씁니다.
무거워서 렌더마다 도는 것이 문제가 되면 그때만 모듈 최상위 상수로 뺍니다.
판정은 `data-shape-query-data-with-select`가 정한 것과 같습니다.

합친 결과는 구조 공유되어 참조가 안정적입니다.
그래서 `useMemo`로 다시 감싸지 않습니다.
`perf-avoid-defensive-memoization`이 그것을 막습니다.

**Incorrect (화면 본문에서 두 응답을 꺼내 합침):**

```tsx
const responseProductListSuspense = useProductListSuspense();
const responseCategoryListSuspense = useCategoryListSuspense();

const rows = responseProductListSuspense.data.products.map((product) => ({
	id: product.id,
	categoryName: responseCategoryListSuspense.data.categories.find(
		(category) => category.id === product.categoryId,
	)?.name,
}));
```

**Correct (통신 경계에서 인라인 `combine`으로 합침):**

```tsx
export const PgProducts = () => {
	/**
	 * 분류 이름이 목록 응답에 없어서 표 한 행에 두 응답을 함께 담는다
	 */
	const responseProductRows = useSuspenseQueries({
		queries: [productListQueryOptions(), categoryListQueryOptions()],
		combine: ([productResult, categoryResult]) => ({
			rows: productResult.data.products.map((product) => ({
				id: product.id,
				categoryName: categoryResult.data.categories.find(
					(category) => category.id === product.categoryId,
				)?.name,
			})),
		}),
	});

	return <UiTable dataSource={responseProductRows.rows} />;
};
```

**Correct (뒤 쿼리가 앞 결과를 받으면 `enabled`로 순서를 만듦):**

```tsx
/**
 * route search가 가리키는 product를 읽는다. 아래 배송 이력의 입력이 된다
 */
const responseProductGetItemSuspense = useProductGetItemSuspense({productId: search.productId});

/**
 * 배송 이력은 주문이 붙은 product에만 있어서 orderId를 받은 뒤에만 부른다
 */
const responseShipmentList = useShipmentList(
	{orderId: responseProductGetItemSuspense.data.orderId},
	{query: {enabled: Boolean(responseProductGetItemSuspense.data.orderId)}},
);
```

### 2.4 Preserve Response and Store Origin Down to the JSX

**Rule:** `R02-04` · `data-preserve-origin-chaining`

**Applies when:** 응답, 뮤테이션, 스토어에서 값을 꺼내 쓰는 코드를 추가·변경할 때. 원본을 별칭으로 끊고 값 접근 방식을 바꿀 때.

**Review with:** `data-shape-query-data-with-select`, `screen-keep-derived-values-close`

**Impact: MEDIUM (파일 전체에서 별칭을 따라가지 않고 값의 출처를 바로 압니다)**

`response...`, `mutation...`, `*Store` 원본은 JSX에 닿을 때까지 이름 그대로 갑니다.
구조분해와 별칭으로 끊지 않는 규범은 `typescript/values-read-objects-through-chains`가 모든 객체에 정합니다.
여기서는 리액트 화면에서 그 원본이 무엇인지만 짚습니다.

- 스코프가 넓든 좁든 같습니다.
  핸들러 안이든 이펙트 안이든 `responseProductSearchSuspense.data.products`로 읽습니다.
  `좁은 스코프`는 코드를 보고 판정할 수 없는 기준이라 예외로 두지 않습니다.
- 쿼리 결과를 화면에서 다시 빚고 싶으면 끊지 말고 `data-shape-query-data-with-select`가 정한
  `query.select`에서 형태를 잡습니다.
  받는 쪽에서 끊으면 깊이는 그대로고 출처만 사라집니다.
- 프롭스는 `composition-read-props-without-destructuring`이 같은 말을 한 번 더 합니다.

**Incorrect (구조분해로 출처가 흐려짐):**

```ts
const {products, selectedProduct} = responseProductListSuspense.data;
```

**Correct (원본 체이닝으로 출처를 유지):**

```tsx
<Fragment>
	<UiList dataSource={responseProductListSuspense.data.products} />
	<UiTable dataSource={responseProductListSuspense.data.selectedProduct.fields} />
</Fragment>;
```

**Correct (이펙트 안에서도 원본 이름 그대로):**

```ts
/**
 * 검색 결과가 있으면 빈 검색 보고를 건너뛴다. 결과가 없을 때만 한 번 보고한다
 */
useEffect(() => {
	if (responseProductSearchSuspense.data.products.length > 0) {
		return;
	}

	reportEmptySearch(search.keyword);
}, [responseProductSearchSuspense.data, search.keyword]);
```

### 2.5 Handle Mutation Failure Where the Mutation Is Called

**Rule:** `R02-05` · `data-handle-mutation-failure-where-it-is-called`

**Applies when:** 뮤테이션을 부르는 코드를 추가·변경할 때. `mutate`와 `mutateAsync` 사이를 오갈 때.

**Review with:** `data-invalidate-queries-the-mutation-changed`, `events-run-user-actions-in-handlers-not-effects`

**Impact: HIGH (저장이 실패했는데 성공한 것처럼 넘어가거나 아무 표시 없이 끝나지 않습니다)**

뮤테이션 실패는 오류 경계가 받지 못합니다.
핸들러 안에서 난 오류는 렌더 중에 난 것이 아니어서 경계를 그냥 지나칩니다.
`runtime-place-error-boundaries-by-blast-radius`가 그 경계를 정하고, 여기서는 그 밖의 자리를 봅니다.

**기본은 `mutate`와 `useMutation`의 `onError`·`onSuccess`입니다.**
성공과 실패가 선언 자리에 함께 남고 핸들러는 부르기만 합니다.

| 상황 | 쓰는 것 |
| --- | --- |
| 부른 뒤 핸들러가 더 할 일이 없음 | `mutate` + `onError`·`onSuccess` |
| 부른 결과를 기다렸다가 핸들러가 이어서 해야 함 | `mutateAsync` + `try`/`catch` |

`mutateAsync`는 실패하면 던집니다.
`await`만 하고 `catch`하지 않으면 그 뒤 줄이 실행되지 않고 사용자에게 아무 표시도 남지 않습니다.
`mutateAsync`를 쓰기로 했으면 `try`/`catch`를 같이 씁니다.

- 한 뮤테이션을 부르는 자리들끼리는 형태를 섞지 않습니다.
  같은 저장을 어떤 자리에서는 `mutate`로, 어떤 자리에서는 `mutateAsync`로 부르면 실패를 어디서 받는지 다시 찾게 됩니다.
- 빈 `catch`로 실패를 삼키지 않습니다.
  다시 던지든 표시하든 무엇이든 합니다.
- 여러 번 눌러 같은 뮤테이션이 겹치는 것은 버튼을 `isPending`으로 `disabled` 처리해 막고,
  핸들러 첫 줄에서 `isPending` 이른 반환으로 한 번 더 막습니다.
- 성공 뒤 캐시를 다시 맞추는 것은 `data-invalidate-queries-the-mutation-changed`가 정합니다.

실패했을 때 무엇을 보여 줄지는 이 규칙이 정하지 않습니다.
제품마다 다르고 코드로 판정할 수 없습니다.

**Incorrect (`await`만 하고 실패를 받지 않음):**

```tsx
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	await mutationProductSave.mutateAsync({data: toProductSaveRequest(formValues)});
	void navigate({to: "/products"});
};
```

**Correct (핸들러가 더 할 일이 없어 콜백으로 받음):**

```tsx
const queryClient = useQueryClient();

/**
 * 저장에 성공하면 목록을 다시 읽고 목록 화면으로 돌아간다. 실패 문구는 폼 위에 남긴다
 */
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: () => {
			void queryClient.invalidateQueries({queryKey: productListQueryKey()});
			void navigate({to: "/products"});
		},
		onError: (error) => {
			setSubmitErrorMessage(toSubmitErrorMessage(error));
		},
	},
});

/**
 * 버튼 disabled와 별개로 겹쳐 들어온 저장을 한 번 더 막는다
 */
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	if (mutationProductSave.isPending) {
		return;
	}

	mutationProductSave.mutate({data: toProductSaveRequest(formValues)});
};
```

```tsx
<UiButton disabled={mutationProductSave.isPending} onClick={handleSaveButtonClick}>
	저장
</UiButton>;
```

**Correct (결과를 기다려 이어서 해야 해서 `try`/`catch`):**

```tsx
/**
 * 첨부를 먼저 올린 뒤 그 식별자로 product를 저장한다
 */
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	if (mutationAttachmentUpload.isPending) {
		return;
	}

	try {
		const uploaded = await mutationAttachmentUpload.mutateAsync({files: draftFiles});

		await mutationProductSave.mutateAsync({
			data: toProductSaveRequest(formValues, uploaded.attachmentIds),
		});

		void navigate({to: "/products"});
	} catch (error) {
		setSubmitErrorMessage(toSubmitErrorMessage(error));
	}
};
```

### 2.6 Invalidate the Queries a Mutation Changed

**Rule:** `R02-06` · `data-invalidate-queries-the-mutation-changed`

**Applies when:** 뮤테이션 성공 뒤 서버 상태를 다시 맞추는 코드를 추가·변경할 때. 캐시를 직접 쓰거나 다시 불러오는 코드를 넣을 때.

**Review with:** `data-handle-mutation-failure-where-it-is-called`

**Impact: HIGH (저장 뒤 화면이 옛 서버 상태를 계속 보여 주지 않습니다)**

뮤테이션이 바꾼 서버 상태는 그 데이터를 소유한 쿼리 키로 `invalidateQueries`해서 다시 맞춥니다.

| 하려는 것 | 쓰는 것 |
| --- | --- |
| 바뀐 서버 상태를 다시 읽음 | `invalidateQueries` |
| 응답으로 목록을 손으로 고쳐 넣음 | 쓰지 않기 |
| 지금 화면만 다시 불러옴 | 쓰지 않기 |

뮤테이션 성공 뒤 서버 상태를 맞추는 자리에서는 `setQueryData`로 캐시를 조립하지 않습니다.
서버가 할 계산을 화면이 대신하는 것이라, 정렬이나 집계가 서버와 어긋나면 조용히 틀린 화면이 남습니다.
요청을 보내기 전에 화면을 먼저 움직이는 낙관적 갱신은 대상이 아닙니다.

뮤테이션 성공 뒤 서버 상태를 맞추는 자리에서는 `refetch()`를 부르지 않습니다.
그 훅 하나만 다시 읽어서, 같은 데이터를 보는 다른 화면은 옛 값을 그대로 갖습니다.
사용자가 직접 누르는 새로 고침 버튼은 대상이 아닙니다.

- 쿼리 키 문자열을 화면에서 손으로 적지 않습니다.
  쿼리 훅이 내보낸 키를 씁니다.
- 무효화 대상이 여럿이면 성공 콜백에서 나란히 부릅니다.
- 무효화를 이펙트로 옮기지 않습니다.
  `events-run-user-actions-in-handlers-not-effects`가 그것을 막습니다.
- 어디서 부를지는 `data-handle-mutation-failure-where-it-is-called`가 정한 자리와 같습니다.

**Incorrect (캐시를 손으로 조립하고 키를 문자열로 적음):**

```tsx
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: (saved) => {
			queryClient.setQueryData(["products"], (previous = []) => [...previous, saved]);
		},
	},
});
```

**Incorrect (그 훅만 다시 읽어 다른 화면이 옛 값을 유지):**

```tsx
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: () => {
			void responseProductListSuspense.refetch();
		},
	},
});
```

**Correct (바뀐 데이터를 소유한 키를 무효화):**

```tsx
const queryClient = useQueryClient();

/**
 * 저장이 목록과 요약 집계를 함께 바꿔서 두 키를 나란히 무효화한다
 */
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: () => {
			void queryClient.invalidateQueries({queryKey: productListQueryKey()});
			void queryClient.invalidateQueries({queryKey: productSummaryQueryKey()});
		},
	},
});
```

## 3. Typing and Contracts

**Impact: CRITICAL**

리액트 핸들러 타입과 래퍼가 노출한 프롭 계약은 선언 자리에서 바로 드러나야 합니다. 라이브러리 래퍼는 여는 표면을 좁히고 형태에 맞는 방법으로 프롭을 넘깁니다. 일반 TypeScript 타입 규칙은 동반 스킬이 다루고 여기서는 리액트 문맥만 봅니다.

### 3.1 Take React Handler and Wrapper Prop Types From Existing Contracts

**Rule:** `R03-01` · `typing-take-handler-types-from-existing-contracts`

**Applies when:** 커링 팩토리가 돌려주는 리액트 핸들러의 타입을 정할 때. `Ui*` 래퍼 사용처에서 프롭스 타입을 참조할 때. 제외: `query.select` 같은 훅 옵션의 일회성 문맥 콜백인 경우.

**Requires selected:** `typescript/types-prefer-function-variable-types-over-parameter-annotations` · 함께 적용

**Impact: MEDIUM-HIGH (같은 시그니처를 손으로 다시 적지 않아 계약이 어긋나지 않습니다)**

타입을 어디에 붙일지는 `typescript/types-prefer-function-variable-types-over-parameter-annotations`가
정합니다.
여기서는 그 규칙이 다루지 않는 리액트 두 자리만 봅니다.

**커링 팩토리가 돌려주는 함수에도 타입을 적습니다.**
JSX에 바로 쓴 화살표 함수에는 리액트가 타입을 붙여 주지만, 팩토리가 돌려주는 함수에는 붙여 주지 않습니다.
안쪽 매개변수가 암묵적 `any`가 되어 `strict`에서 컴파일이 막힙니다.
`MouseEventHandler<...>` 같은 리액트 별칭을 팩토리 반환 타입으로 적습니다.

**`Ui*` 래퍼를 쓸 때는 래퍼가 내보낸 `Ui*Props`를 가져옵니다.**
안에서 쓰는 라이브러리의 원본 프롭스 타입을 가져오지 않습니다.
래퍼가 일부러 좁히거나 늘린 계약이 사용처로 새지 않게 하려는 것입니다.

`query.select` 같은 훅 옵션의 일회성 문맥 콜백은 리액트 핸들러 구현이 아니므로 이 규칙 대상이 아닙니다.

**Incorrect (팩토리 반환 타입을 적지 않아 이벤트가 암묵적 `any`가 됨):**

```ts
const handleRowSelectToggle = (rowId: string) => (event) => {
	event.preventDefault();
	toggleSelection(rowId);
};
```

**Incorrect (래퍼를 쓰면서 라이브러리 원본 프롭스를 참조):**

```ts
import type { LibButtonProps } from "@ui-lib/core";

const handleSubmitClick: LibButtonProps["onClick"] = (event) => {
	event.preventDefault();
};
```

**Correct (팩토리 반환 타입을 기존 별칭으로 고정):**

```ts
import type { MouseEventHandler } from "react";

/**
 * 행 id를 커링으로 고정해 목록 JSX에 인라인 래퍼를 두지 않게 한다
 */
const handleRowSelectToggle =
	(rowId: string): MouseEventHandler<HTMLLIElement> =>
	(event) => {
		event.preventDefault();
		toggleSelection(rowId);
	};
```

**Correct (래퍼가 노출한 계약을 참조):**

```ts
import type { UiButtonProps } from "@/ui/ui-button";

/**
 * 저장 버튼 클릭 기본 동작 차단
 */
const handleSubmitClick: UiButtonProps["onClick"] = (event) => {
	event.preventDefault();
};
```

### 3.2 Narrow the Contract a Library Wrapper Opens

**Rule:** `R03-02` · `typing-narrow-library-wrapper-contracts`

**Applies when:** 라이브러리 컴포넌트를 감싸는 `Ui*` 래퍼의 프롭스 타입을 만들거나 바꿀 때. 래퍼에 프롭을 추가하거나 여는 범위를 넓힐 때.

**Review with:** `css/composition-do-not-style-through-the-style-attribute`, `typescript/docs-justify-convention-exceptions-with-a-reason-comment`, `typing-choose-wrapper-shape-and-forwarding`, `typing-take-handler-types-from-existing-contracts`

**Impact: CRITICAL (라이브러리의 스타일 우회로가 화면으로 새지 않고 교체할 때 래퍼 한 파일만 고칩니다)**

라이브러리 컴포넌트는 화면에서 직접 쓰지 않고 `Ui*` 래퍼를 거칩니다.
래퍼가 있어야 라이브러리를 올리거나 바꿀 때 한 파일만 고칩니다.

**`export type UiXProps = LibXProps`로 두지 않습니다.**
라이브러리 표면이 통째로 열려서 그 라이브러리의 스타일 창구까지 화면이 쓸 수 있게 됩니다.
`css/composition-inject-classes-only-at-the-entry-point`가 정한 스타일 창구가 그 자리에서 뚫립니다.

DOM 프롭이 아닌 계약은 세 가지로 나눠 각각 다르게 씁니다.
DOM 표면은 아래 세 단계 표가 맡습니다.

| 프롭 | 어떻게 |
| --- | --- |
| 라이브러리에 **이미 있는** 표시 프롭 (`color`, `padding`, `size`) | `LibXProps["color"]` 인덱스 접근으로 하나씩 |
| 우리가 **새로 만든** 자기 프롭 (`icon`, `label`, `helperText`) | 우리가 타입을 적습니다 |
| 라이브러리 스타일 창구 (테마 스타일 프롭, 클래스 맵, 렌더 태그 교체) | 선언하지 않습니다 |

**자기 프롭**은 안쪽 컴포넌트가 받지 않는 프롭입니다.
`UiIconButtonProps`의 `icon`은 감싸는 컴포넌트가 모르므로 자기 프롭이고,
`UiTableRowProps`의 `selected`는 감싸는 컴포넌트가 받으므로 자기 프롭이 아닙니다.
인덱스 접근은 자기 프롭이 아닌 것, 곧 **이미 있는 프롭을 그대로 여는 자리**에만 씁니다.

**DOM 표면을 여는 방법은 세 단계이고 위에서부터 되는 것을 씁니다.**
어느 단계인지는 컴파일러가 알려 주므로 미리 고민하지 않습니다.

| 단계 | 언제 | 형태 |
| --- | --- | --- |
| 1 | 그냥 컴파일됨 | `extends HTMLAttributes<T>` |
| 2 | 라이브러리가 같은 이름 프롭의 **값을 좁혀** 부딪힘 | `extends Omit<HTMLAttributes<T>, "color">`로 빼고 그 프롭을 인덱스 접근으로 다시 엽니다 |
| 3 | 감싸는 요소와 이벤트 대상 요소가 **서로 다름** | `extends`를 쓰지 않고 필요한 프롭만 선언합니다 |

2단계가 필요한 이유는 `HTMLAttributes`에 `color`, `title`, `onChange`, `defaultValue`가 이미 있어서입니다.
라이브러리가 그중 하나를 자기 값 집합으로 좁혀 두면 `extends`가 막힙니다.
그때는 **부딪히는 이름만 빼면 되지, 나머지 DOM 표면을 포기하지 않습니다.**

3단계는 입력 래퍼에서 나옵니다.
겉을 `div`로 감싸면서 이벤트는 안쪽 `input`이 받는 컴포넌트가 그렇습니다.
값이 아니라 요소 타입이 어긋나므로 `Omit`으로 한둘 빼도 이벤트 핸들러가 줄줄이 걸립니다.
이때는 DOM 프롭도 필요한 것만 적고, 라이브러리 타입이 아니라 `string`,
`ChangeEventHandler<HTMLInputElement>` 같은 플랫폼 타입을 씁니다.
`value`나 `onChange`처럼 DOM이 이미 정한 이름은 라이브러리 것이 아닙니다.

여기 쓰는 `Omit`은 `typescript/types-reuse-existing-contracts-before-new-types`가 허용하는 자리입니다.
DOM 표면은 리액트가 속성을 더하면 래퍼도 따라 받아야 하는 열린 집합이라
뺄 이름만 적는 것이 맞습니다.
남는 것을 손으로 적을 수도 없습니다.

- 인덱스 접근은 상속 사슬을 따라갑니다.
  바깥 타입 이름 하나만 쓰면 됩니다.
- 값을 손으로 다시 적는 것은 일부러 좁힐 때만 합니다.
  좁힌 이유를 적는 형식과 근거 기준은
  `typescript/docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.
- `aria-*`와 `data-*`는 하이픈이 들어 있어 TypeScript가 검사하지 않습니다.
  선언하지 않아도 넘어갑니다.
- `ref`를 여는 기준은 `composition-open-ref-props-only-for-imperative-contracts`가 정합니다.
- 프롭을 어떻게 넘기는지는 `typing-choose-wrapper-shape-and-forwarding`이 정합니다.
- `HTMLAttributes`를 `extends` 하면 `style`도 같이 열립니다.
  인라인 `style`을 쓸지는 `css/composition-do-not-style-through-the-style-attribute`가 정합니다.

**Incorrect (라이브러리 타입을 그대로 내보냄):**

```tsx
export type UiButtonProps = LibButtonProps;

export const UiButton = (props: UiButtonProps) => {
	return <LibButton {...props} />;
};
```

**Incorrect (프롭 하나가 부딪힌다고 DOM 표면을 통째로 포기함):**

```tsx
// id·role·tabIndex·aria-*·이벤트를 전부 잃고 다섯 개만 남았다
export interface UiButtonProps {
	className?: string;
	children?: ReactNode;
	color?: LibButtonProps["color"];
	disabled?: LibButtonProps["disabled"];
	onClick?: MouseEventHandler<HTMLButtonElement>;
}
```

**Correct (1단계 — 그냥 통과하는 래퍼):**

```tsx
import { LibTableCell } from "@ui-lib/core";
import type { LibTableCellProps } from "@ui-lib/core";
import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

/**
 * 표 셀에서 정렬과 여백만 여는 계약
 *
 * 라이브러리 셀의 나머지 표시 프롭은 표 소유자가 정하므로 열지 않는다.
 */
export interface UiTableCellProps extends HTMLAttributes<HTMLTableCellElement> {
	/**
	 * 내용 가로 정렬
	 */
	align?: LibTableCellProps["align"];
	/**
	 * 셀 여백
	 */
	padding?: LibTableCellProps["padding"];
}

export const UiTableCell = (props: UiTableCellProps) => {
	return (
		<LibTableCell {...props} className={clsx("ui_tableCell__root", props.className)} />
	);
};
```

**Correct (2단계 — 부딪히는 이름만 빼고 다시 엶):**

```tsx
import { LibButton } from "@ui-lib/core";
import type { LibButtonProps } from "@ui-lib/core";
import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

/**
 * 라이브러리 버튼에 우리 클래스 창구만 더한 계약
 *
 * 라이브러리가 `color`를 자기 값 집합으로 좁혀 두어 그 이름만 빼고 다시 연다.
 */
export interface UiButtonProps extends Omit<HTMLAttributes<HTMLButtonElement>, "color"> {
	/**
	 * 강조 단계
	 */
	color?: LibButtonProps["color"];
}

export const UiButton = (props: UiButtonProps) => {
	return (
		<LibButton {...props} className={clsx("ui_button__root", props.className)} />
	);
};
```

**Correct (3단계 — 요소 타입이 어긋나 필요한 프롭만 선언):**

```tsx
import { LibTextField } from "@ui-lib/core";
import type { LibTextFieldProps } from "@ui-lib/core";
import { clsx } from "clsx";
import type { ChangeEventHandler } from "react";

/**
 * 라벨 없이 값만 받는 한 줄 입력 계약
 *
 * 겉은 `div`인데 이벤트는 안쪽 `input`이 받아 `HTMLAttributes`를 그대로 못 쓴다.
 */
export interface UiTextFieldProps {
	/**
	 * 최상위에 얹을 클래스
	 */
	className?: string;
	/**
	 * 입력 식별자
	 */
	id?: string;
	/**
	 * 입력값
	 */
	value: string;
	/**
	 * 입력이 바뀔 때
	 */
	onChange: ChangeEventHandler<HTMLInputElement>;
	/**
	 * 오류 표시 여부
	 */
	error?: LibTextFieldProps["error"];
}

export const UiTextField = (props: UiTextFieldProps) => {
	return (
		<LibTextField
			className={clsx("ui_textField__root", props.className)}
			id={props.id}
			value={props.value}
			onChange={props.onChange}
			error={props.error}
		/>
	);
};
```

### 3.3 Choose the Wrapper Shape and Forward Props Accordingly

**Rule:** `R03-03` · `typing-choose-wrapper-shape-and-forwarding`

**Applies when:** 래퍼가 받은 프롭을 안쪽 컴포넌트나 요소로 넘기는 코드를 추가·변경할 때. 래퍼에 자기 프롭을 더하거나 안쪽 요소를 늘릴 때.

**Requires selected:** `typing-narrow-library-wrapper-contracts` · 함께 적용

**Impact: HIGH (프롭이 엉뚱한 요소로 흘러가지 않고 어디로 가는지가 코드에 남습니다)**

**기본은 이름으로 하나씩 넘기는 것입니다.**
어느 프롭이 어느 요소로 가는지가 코드에 그대로 남습니다.

`{...props}`는 **아래 셋을 모두 만족할 때만** 씁니다.

| 조건 | 확인하는 방법 |
| --- | --- |
| 안쪽 요소가 하나임 | 반환하는 JSX에 요소가 하나입니다 |
| **자기 프롭**이 하나도 없음 | 선언한 프롭을 안쪽 컴포넌트가 전부 받습니다 |
| DOM 표면을 `extends`로 열 수 있음 | `typing-narrow-library-wrapper-contracts`의 1·2단계입니다 |

**자기 프롭**이 무엇인지는 `typing-narrow-library-wrapper-contracts`가 정합니다.

**자기 프롭이 있는데 `{...props}`를 쓰면 그 프롭이 DOM까지 내려갑니다.**
`icon`이 `<button icon="…">`이 되어 리액트가 경고합니다.
JSX 스프레드는 초과 프롭을 검사하지 않아 **컴파일러가 잡아 주지 않습니다.** 리뷰가 봐야 합니다.

라이브러리 API가 커서 프롭이 서른 개로 늘어날 것 같으면 만능 래퍼를 만들지 않습니다.
우리 어휘로 계약을 다시 쓰고 라이브러리 어휘는 본문 안에서만 씁니다.
그래도 줄지 않으면 `strategy-choose-single-composition-compound-and-variants`를 따라
쓰임새별 변형으로 쪼갭니다.

`headerProps`, `buttonProps`처럼 안쪽 부품으로 가는 프롭 묶음을 만들지 않습니다.
사용처가 내부 구조를 알게 되어 안쪽을 바꿀 때 함께 깨집니다.
안쪽을 밖에서 조립해야 하면 `strategy-prefer-children-over-render-props`를 따라 `children`으로 엽니다.

구조분해 기준은 `composition-read-props-without-destructuring`이 정합니다.

**Incorrect (자기 프롭을 더해 놓고 스프레드로 넘김):**

```tsx
export interface UiIconButtonProps extends HTMLAttributes<HTMLButtonElement> {
	icon: ReactNode;
}

// icon이 <button icon="…"> 으로 내려간다. 컴파일은 통과한다
export const UiIconButton = (props: UiIconButtonProps) => (
	<LibButton {...props}>
		{props.icon}
		{props.children}
	</LibButton>
);
```

**Correct (안쪽 요소는 하나지만 자기 프롭이 있어 스프레드를 못 씀):**

```tsx
/**
 * 아이콘만 있는 버튼
 *
 * `icon`과 `label`은 안쪽 컴포넌트가 모르는 자기 프롭이라 타입을 직접 적는다.
 * `disabled`는 라이브러리에 이미 있어 인덱스 접근으로 가져온다.
 */
export interface UiIconButtonProps {
	/**
	 * 최상위에 얹을 클래스
	 */
	className?: string;
	/**
	 * 버튼 안에 그릴 아이콘
	 */
	icon: ReactNode;
	/**
	 * 스크린 리더가 읽을 이름. `aria-label`로 내려간다
	 */
	label: string;
	/**
	 * 비활성 여부
	 */
	disabled?: LibButtonProps["disabled"];
	/**
	 * 눌렀을 때
	 */
	onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const UiIconButton = (props: UiIconButtonProps) => {
	return (
		<LibButton
			className={clsx("ui_iconButton__root", props.className)}
			aria-label={props.label}
			disabled={props.disabled}
			onClick={props.onClick}
		>
			{props.icon}
		</LibButton>
	);
};
```

**Correct (프롭이 서로 다른 요소로 갈라져 각각 이름으로 넘김):**

```tsx
/**
 * 라벨과 보조 설명을 붙인 입력 한 줄
 */
export interface UiFieldProps {
	/**
	 * 최상위에 얹을 클래스
	 */
	className?: string;
	/**
	 * 입력 위에 붙는 라벨
	 */
	label: string;
	/**
	 * 입력 아래 보조 설명
	 */
	helperText?: string;
	/**
	 * 라벨과 입력을 잇는 id
	 */
	inputId: string;
	/**
	 * 입력값
	 */
	value: string;
	/**
	 * 입력이 바뀔 때
	 */
	onChange: ChangeEventHandler<HTMLInputElement>;
}

export const UiField = (props: UiFieldProps) => {
	return (
		<div className={clsx("ui_field__root", props.className)}>
			<label className={clsx("ui_field__label")} htmlFor={props.inputId}>
				{props.label}
			</label>
			<LibTextField id={props.inputId} value={props.value} onChange={props.onChange} />
			{props.helperText && <span className={clsx("ui_field__helper")}>{props.helperText}</span>}
		</div>
	);
};
```

**Correct (셋을 모두 만족해 스프레드로 끝냄):**

```tsx
/**
 * 표 줄
 *
 * 감싸는 컴포넌트가 `color`를 좁히지 않아 `HTMLAttributes`를 그대로 받을 수 있다.
 */
export interface UiTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
	/**
	 * 선택된 줄로 표시할지
	 */
	selected?: LibTableRowProps["selected"];
}

export const UiTableRow = (props: UiTableRowProps) => {
	return (
		<LibTableRow {...props} className={clsx("ui_tableRow__root", props.className)} />
	);
};
```

## 4. Composition Strategy

**Impact: MEDIUM-HIGH**

공용 컴포넌트는 단일 컴포넌트, 합성 컴포넌트, 드러난 변형 중 어떤 구조를 쓸지 먼저 결정하고, 그다음 무엇을 공개 부품으로 열지 정합니다. 불리언 프롭으로 모드를 늘리지 않고, 정적 조립에는 렌더 프롭 대신 `children`을 씁니다.

### 4.1 Choose Single Components, Compound Components, and Variants Deliberately

**Rule:** `R04-01` · `strategy-choose-single-composition-compound-and-variants`

**Applies when:** 내보낸 공용 컴포넌트에 슬롯, 공개 부품, 공용 컨텍스트나 동작을 추가할 때. 반복되는 기본 설정이나 모드 API를 추가할 때. 공용 컴포넌트의 조립 구조를 재설계할 때.

**Review with:** `screen-avoid-premature-abstraction`, `strategy-avoid-boolean-prop-proliferation`, `strategy-expose-only-assembled-compound-parts`, `strategy-prefer-children-over-render-props`

**Impact: MEDIUM-HIGH (필요한 확장점은 열면서 가장 단순한 구조를 고르게 돕습니다)**

공용 컴포넌트는 프롭스보다 구조를 먼저 고릅니다.
고정 UI, 공개 부품 조립, 공용 상태/동작/컨텍스트, 반복 기본 설정 중 무엇이 필요한지 순서대로 봅니다.

**빠른 선택표**

| 상황 | 선택 |
| --- | --- |
| 고정 UI | `single component` 또는 화면 지역 JSX |
| 부품 조립만 필요함 | `stateless compound component` |
| 여러 부품이 같은 상태/동작/컨텍스트를 읽음 | `stateful compound component` |
| 같은 합성 조합이 반복됨 | `explicit variant component` |

아래 네 예시는 같은 대화상자 하나를 네 단계로 끌고 갑니다.
필요가 늘 때 앞 단계에서 다음 단계로만 넘어가고, 공개 이름은 그대로 둡니다.

렌더 프롭을 쓸 자리인지는 `strategy-prefer-children-over-render-props`가 따로 판정합니다.

무엇을 공개 부품으로 열지는 `strategy-expose-only-assembled-compound-parts`가 정합니다.

**Incorrect (단일, 합성, 드러난 변형의 경계를 구분하지 않고 한 컴포넌트에 몰아넣음):**

```tsx
export interface UiProfileDialogProps {
	isCompact?: boolean;
	showActivity?: boolean;
	showFocus?: boolean;
	dialogTitle?: string;
	renderFooter?: () => ReactNode;
}

export const UiProfileDialog = (props: UiProfileDialogProps) => {
	return (
		<section className={props.isCompact ? "dialog dialog--compact" : "dialog"}>
			<header>
				<h3>{props.dialogTitle}</h3>
			</header>
			<UiProfileSummary />
			{props.showActivity && <UiProfileActivityPanel />}
			{props.showFocus && <UiProfileFocusPanel />}
			<footer>{props.renderFooter?.()}</footer>
		</section>
	);
};
```

**Correct (1단계 — 열 자리가 없으면 단일 컴포넌트로 유지):**

```tsx
/**
 * 프로필 요약만 보여 주는 고정 구조 대화상자
 *
 * 사용처가 끼워 넣을 자리가 없어 부품으로 쪼개지 않는다.
 */
export interface UiProfileDialogProps {
	/**
	 * 헤더에 그릴 제목
	 */
	title: string;
	/**
	 * 요약 영역에 그릴 프로필
	 */
	profile: Profile;
}

export const UiProfileDialog = (props: UiProfileDialogProps) => {
	return (
		<section className={clsx("ui_profileDialog__root")}>
			<header className={clsx("ui_profileDialog__header")}>
				<h3>{props.title}</h3>
			</header>
			<UiProfileSummary profile={props.profile} />
		</section>
	);
};
```

**Correct (2단계 — 끼워 넣을 자리가 생기면 상태 없는 합성으로 엶):**

```tsx
/**
 * 대화상자 부품 셋이 나눠 쓰는 계약
 *
 * 세 부품 모두 받는 것이 `children` 하나뿐이라 형태를 하나로 둔다.
 */
export interface UiProfileDialogPartProps {
	/**
	 * 그 부품 자리에 사용처가 넣을 내용
	 */
	children: ReactNode;
}

const UiProfileDialogRoot = (props: UiProfileDialogPartProps) => {
	return <section className={clsx("ui_profileDialog__root")}>{props.children}</section>;
};

const UiProfileDialogHeader = (props: UiProfileDialogPartProps) => {
	return <header className={clsx("ui_profileDialog__header")}>{props.children}</header>;
};

const UiProfileDialogBody = (props: UiProfileDialogPartProps) => {
	return <section className={clsx("ui_profileDialog__body")}>{props.children}</section>;
};

export const UiProfileDialog = {
	Root: UiProfileDialogRoot,
	Header: UiProfileDialogHeader,
	Body: UiProfileDialogBody,
} as const;
```

**Correct (3단계 — 부품이 같은 상태를 읽으면 공개 이름을 그대로 두고 컨텍스트만 더함):**

```tsx
const UiProfileDialogContext = createContext<UiProfileDialogContextValue | null>(null);

const UiProfileDialogRoot = (props: UiProfileDialogPartProps) => {
	const [isBodyOpen, setIsBodyOpen] = useState(true);

	/**
	 * 헤더가 부를 접기 토글. 이전 값에 기대므로 함수형으로 갱신한다
	 */
	const toggleBody = () => {
		setIsBodyOpen((previous) => !previous);
	};

	return (
		<UiProfileDialogContext value={{ isBodyOpen, toggleBody }}>
			<section className={clsx("ui_profileDialog__root")}>{props.children}</section>
		</UiProfileDialogContext>
	);
};

const UiProfileDialogHeader = (props: UiProfileDialogPartProps) => {
	const dialog = useUiProfileDialog();

	/**
	 * 헤더를 누르면 본문을 접거나 펼친다
	 */
	const handleHeaderClick: MouseEventHandler<HTMLButtonElement> = () => {
		dialog.toggleBody();
	};

	return (
		<header className={clsx("ui_profileDialog__header")}>
			<button type="button" onClick={handleHeaderClick}>
				{props.children}
			</button>
		</header>
	);
};

const UiProfileDialogBody = (props: UiProfileDialogPartProps) => {
	const dialog = useUiProfileDialog();

	if (!dialog.isBodyOpen) {
		return null;
	}

	return <section className={clsx("ui_profileDialog__body")}>{props.children}</section>;
};

// 상태가 늘었지만 사용처가 쓰는 이름은 2단계와 같다
export const UiProfileDialog = {
	Root: UiProfileDialogRoot,
	Header: UiProfileDialogHeader,
	Body: UiProfileDialogBody,
} as const;
```

**Correct (4단계 — 같은 조합이 반복되면 드러난 변형으로 감쌈):**

```tsx
/**
 * 읽기 전용 프로필 대화상자
 *
 * 세 화면이 같은 조합을 쓰고 있어 조립을 한 이름 뒤로 고정한다.
 */
export interface UiReadOnlyProfileDialogProps {
	/**
	 * 요약 영역에 그릴 프로필
	 */
	profile: Profile;
}

export const UiReadOnlyProfileDialog = (props: UiReadOnlyProfileDialogProps) => {
	return (
		<UiProfileDialog.Root>
			<UiProfileDialog.Header>프로필 보기</UiProfileDialog.Header>
			<UiProfileDialog.Body>
				<UiProfileSummary profile={props.profile} />
			</UiProfileDialog.Body>
		</UiProfileDialog.Root>
	);
};
```

### 4.2 Expose Only Compound Parts the Consumer Assembles

**Rule:** `R04-02` · `strategy-expose-only-assembled-compound-parts`

**Applies when:** 합성 컴포넌트의 공개 부품 목록에 부품을 넣거나 뺄 때. 상태 없는 합성에 상태를 넣으면서 공개 이름을 바꾸려 할 때.

**Review with:** `css/composition-do-not-add-wrapper-elements-for-styling`, `strategy-choose-single-composition-compound-and-variants`

**Impact: MEDIUM-HIGH (내부 구조가 공개 계약이 되지 않아 나중에 바꿀 수 있습니다)**

공개 부품은 두 경우만 엽니다.

- 부품이 없으면 사용처가 그 자리에 자기 JSX를 넣을 수 없는 영역
- 공용 컨텍스트나 동작을 직접 쓰는 영역

그 밖은 숨깁니다.
특히 다음 셋은 공개하지 않습니다.

- 단순 `className` 래퍼
- 여백 보정용 DOM. `css/composition-do-not-add-wrapper-elements-for-styling`이 애초에 만들지 말라고 합니다.
- 내부 레이아웃 보조 함수

상태 없는 합성에 상태를 넣으면서 공개 이름을 어떻게 할지는
`strategy-choose-single-composition-compound-and-variants`가 정합니다.

**Incorrect (내부 구조를 전부 공개해 계약으로 굳힘):**

```tsx
// 사용처가 끼워 넣을 자리가 없는 래퍼와 여백 보정용 DOM까지 이름이 붙어 나갔다
const UiPanelHeaderInner = (props: UiPanelPartProps) => {
	return <div className={clsx("ui_panel__headerInner")}>{props.children}</div>;
};

const UiPanelSpacer = () => {
	return <div className={clsx("ui_panel__spacer")} />;
};

export const UiPanel = {
	Root: UiPanelRoot,
	Header: UiPanelHeader,
	HeaderInner: UiPanelHeaderInner,
	Spacer: UiPanelSpacer,
	Body: UiPanelBody,
} as const;
```

**Correct (조립에 필요한 것만 공개):**

```tsx
// 단순 클래스 래퍼는 모듈 안에 남기고 여백 보정용 DOM은 만들지 않는다
const UiPanelHeaderInner = (props: UiPanelPartProps) => {
	return <div className={clsx("ui_panel__headerInner")}>{props.children}</div>;
};

export const UiPanel = {
	Root: UiPanelRoot,
	Header: UiPanelHeader,
	Body: UiPanelBody,
} as const;
```

### 4.3 Avoid Boolean Prop Proliferation in Shared Components

**Rule:** `R04-03` · `strategy-avoid-boolean-prop-proliferation`

**Applies when:** `ui`나 `widget` 컴포넌트에 불리언 모드·표시 프롭을 추가할 때. 기존 불리언 프롭 조합과 JSX 분기가 늘어날 때. 제외: 라우트 진입 파일 안에서만 쓰는 일회성 분기인 경우.

**Review with:** `strategy-expose-only-assembled-compound-parts`

**Impact: MEDIUM-HIGH (공용 컴포넌트가 숨은 조합을 쌓지 않고 구조를 드러냅니다)**

여러 파일과 레이어에서 재사용되는 공용 컴포넌트에 `isCompact`, `isEditing`, `showSearch` 같은
불리언 프롭을 늘리지 않습니다.

두 신호 중 하나라도 보이면 구조를 다시 고릅니다.

- 모양이나 모드를 정하는 불리언 프롭이 둘 이상입니다.
- 같은 불리언이 JSX 분기와 클래스 조건에 동시에 쓰입니다.

불리언이 늘어날수록 가능한 조합이 급증하고, JSX 분기와 스타일 조건도 함께 불어납니다.

- 라우트 진입 안의 일회성 분기는 로컬에서 유지해도 됩니다.
- 공용 `ui`나 `widget`은 드러난 변형 컴포넌트나 합성 컴포넌트로 드러냅니다.
- `.Root` 같은 네임스페이스 부품 문법은 권장 예시일 뿐입니다.
  본질은 불리언을 없애고 구조를 명시적으로 드러내는 데 있습니다.

**Incorrect (불리언 프롭 조합으로 공용 컴포넌트가 비대해짐):**

```tsx
export interface WgProductToolbarProps {
	isCompact?: boolean;
	isEditing?: boolean;
	showSearch?: boolean;
}

export const WgProductToolbar = (props: WgProductToolbarProps) => {
	return (
		<header>
			{props.showSearch && <WgProductSearchField />}
			{props.isEditing ? (
				<WgProductEditActions compact={props.isCompact} />
			) : (
				<WgProductBrowseActions compact={props.isCompact} />
			)}
		</header>
	);
};
```

**Correct (변형을 드러난 컴포넌트와 상태 없는 합성 컴포넌트로 분리):**

```tsx
/**
 * 툴바 바깥 틀 부품
 */
export interface WgProductToolbarRootProps {
	/**
	 * 툴바 줄에 늘어놓을 검색과 동작 부품
	 */
	children: ReactNode;
}

const WgProductToolbarRoot = (props: WgProductToolbarRootProps) => {
	return <header className={clsx("wg_productToolbar__root")}>{props.children}</header>;
};

// 조합은 아래 두 변형이 이미 제공하므로 사용처가 직접 조립할 `Root`만 공개한다
export const WgProductToolbar = {
	Root: WgProductToolbarRoot,
} as const;

export const WgProductBrowseToolbar = () => {
	return (
		<WgProductToolbar.Root>
			<WgProductSearchField />
			<WgProductBrowseActions />
		</WgProductToolbar.Root>
	);
};

export const WgProductEditToolbar = () => {
	return (
		<WgProductToolbar.Root>
			<WgProductEditActions />
		</WgProductToolbar.Root>
	);
};
```

### 4.4 Prefer Children Over Render Props for Static Composition

**Rule:** `R04-04` · `strategy-prefer-children-over-render-props`

**Applies when:** 공용 컴포넌트에 헤더·푸터·동작 같은 정적 슬롯을 추가·변경할 때. 렌더 프롭을 추가·변경하는데 실행 환경 데이터 주입이 꼭 필요한지 불분명할 때.

**Impact: MEDIUM (부모가 콜백으로 값을 내려보낼 필요가 없으면 조립이 읽기 쉬워집니다)**

공용 컴포넌트가 `stateless compound component`로 충분할 때는 `renderHeader`,
`renderFooter` 같은 렌더 프롭보다 `children`과 네임스페이스 슬롯 부품을 우선합니다.
렌더 프롭은 부모가 자식에게 항목, 순번, 상태 같은 실행 환경 데이터를 전달해야 할 때만 씁니다.

**Incorrect (정적인 구조를 렌더 프롭으로 조립):**

```tsx
export interface UiPanelProps {
	renderHeader?: () => ReactNode;
	renderFooter?: () => ReactNode;
}

export const UiPanel = (props: UiPanelProps) => {
	return (
		<section className={clsx("ui_panel__root")}>
			{props.renderHeader?.()}
			<UiItemList />
			{props.renderFooter?.()}
		</section>
	);
};
```

**Correct (`children`과 네임스페이스 슬롯 부품으로 구조를 드러냄):**

```tsx
/**
 * 패널 부품 셋이 나눠 쓰는 계약
 *
 * 세 부품 모두 받는 것이 `children` 하나뿐이라 형태를 하나로 둔다.
 */
export interface UiPanelProps {
	/**
	 * 그 부품 자리에 사용처가 넣을 내용
	 */
	children: ReactNode;
}

const UiPanelRoot = (props: UiPanelProps) => {
	return <section className={clsx("ui_panel__root")}>{props.children}</section>;
};

const UiPanelHeader = (props: UiPanelProps) => {
	return <header className={clsx("ui_panel__header")}>{props.children}</header>;
};

const UiPanelFooter = (props: UiPanelProps) => {
	return <footer className={clsx("ui_panel__footer")}>{props.children}</footer>;
};

export const UiPanel = {
	Root: UiPanelRoot,
	Header: UiPanelHeader,
	Footer: UiPanelFooter,
} as const;

export const PgProductScreen = () => {
	return (
		<Fragment>
			<UiPanel.Root>
				<UiPanel.Header>
					<h2>제품</h2>
					<PgProductSearchField />
				</UiPanel.Header>
				<PgProductList />
				<UiPanel.Footer>
					<UiPagination />
				</UiPanel.Footer>
			</UiPanel.Root>

			<UiPanel.Root>
				<UiPanel.Header>
					<h2>제품 등록</h2>
				</UiPanel.Header>
				<PgProductCreateForm />
			</UiPanel.Root>
		</Fragment>
	);
};
```

## 5. Component Structure and JSX

**Impact: HIGH**

프롭스 계약은 컴포넌트 바로 위에서 읽히고 값은 `props.`로 읽어 출처를 남깁니다. 본문은 훅, 핸들러, 이펙트, 반환 순으로 읽힙니다. JSX 안에는 동작을 숨기지 않고, 컴포넌트를 컴포넌트 안에서 정의하지 않습니다. `ref`와 `Activity`처럼 밖으로 여는 창구는 실제 계약이 있을 때만 엽니다. 조각과 조건부 렌더링은 형태를 하나로 고정합니다.

### 5.1 Read Props Through the Props Object Without Destructuring

**Rule:** `R05-01` · `composition-read-props-without-destructuring`

**Applies when:** 함수 컴포넌트의 시그니처나 본문에서 프롭스를 읽는 코드를 추가·변경할 때. 컴포넌트 안에서 `props`를 구조분해하는 줄을 넣거나 뺄 때.

**Review with:** `data-preserve-origin-chaining`, `screen-keep-derived-values-close`, `typescript/values-read-objects-through-chains`

**Impact: MEDIUM (값이 프롭스에서 왔다는 사실이 쓰는 자리마다 그대로 남습니다)**

컴포넌트는 `props` 전체를 받고 쓰는 자리마다 `props.id`로 읽습니다.
시그니처에서도, 본문 어느 줄에서도, 본문 안 중첩 함수에서도 구조분해하지 않습니다.

구조분해로 끊지 않는 규범은 `typescript/values-read-objects-through-chains`가 모든 객체에 정합니다.
프롭스는 컴포넌트 시그니처라 끊고 싶은 압력이 가장 센 자리여서 여기서 한 번 더 못 박습니다.

- `{...props}`로 그대로 펼치는 것은 구조분해가 아닙니다.
  `props`를 이름 그대로 읽어 넘기는 것이라 출처가 지워지지 않습니다.
  스프레드를 쓸 조건은 `typing-choose-wrapper-shape-and-forwarding`이 정합니다.
- 선택 프롭에 기본값이 필요하면
  `typescript/absence-expose-optional-values-instead-of-silent-fallbacks`를 따릅니다.
  프롭 값을 그대로 비교해서 쓰면 기본값 자체가 필요 없는 경우가 많습니다.
- 쿼리 결과는 `data-preserve-origin-chaining`, 계산한 값은 `screen-keep-derived-values-close`가
  같은 원본에 대해 각각 더 볼 것을 정합니다.

**Incorrect (시그니처에서 구조분해):**

```tsx
const WgUserCard = ({ label, onSave }: WgUserCardProps) => {
	return <button onClick={onSave}>{label}</button>;
};
```

**Incorrect (본문 첫 줄에서 구조분해):**

```tsx
const WgUserCard = (props: WgUserCardProps) => {
	const { label, onSave } = props;
	return <button onClick={onSave}>{label}</button>;
};
```

**Correct (`props`로 읽어 출처를 남김):**

```tsx
const WgUserCard = (props: WgUserCardProps) => {
	return <button onClick={props.onSave}>{props.label}</button>;
};
```

### 5.2 Do Not Define Components Inside Components

**Rule:** `R05-02` · `composition-do-not-define-components-inside-components`

**Applies when:** 컴포넌트 본문 안에 JSX를 반환하는 로컬 함수·컴포넌트를 추가하거나 옮길 때. 재렌더 시 재마운트·포커스 초기화 징후를 다룰 때.

**Impact: HIGH (렌더마다 컴포넌트 타입을 다시 만들어 생기는 재마운트와 상태 초기화를 막습니다)**

컴포넌트 본문 안에서 다른 컴포넌트를 새로 정의하지 않습니다.
부모가 다시 렌더될 때마다 자식 컴포넌트 타입도 새로 만들어져
재마운트, 포커스 초기화, 애니메이션 재시작, 이펙트 재실행이 생깁니다.

로컬에서 JSX 조각을 재사용하려면 보조 함수 호출로 남기거나,
독립 컴포넌트로 빼고 프롭스를 전달합니다.

**Incorrect (렌더마다 새 컴포넌트 타입을 생성):**

```tsx
export const WgUserProfileCard = (props: WgUserProfileCardProps) => {
	const Avatar = () => {
		return (
			<img
				className={clsx(
					"wg_userProfileAvatar__image",
					props.theme === "dark" && "wg_userProfileAvatar__image--dark",
				)}
				src={props.user.avatarUrl}
			/>
		);
	};

	return (
		<section>
			<Avatar />
		</section>
	);
};
```

**Correct (컴포넌트를 바깥으로 분리하고 프롭스로 전달):**

```tsx
/**
 * 사용자 프로필 아바타 프롭스
 */
export interface WgUserProfileAvatarProps {
	/**
	 * 어두운 배경에서 쓸지
	 */
	theme: "dark" | "light";
	/**
	 * 아바타 이미지 주소
	 */
	src: string;
}

export const WgUserProfileAvatar = (props: WgUserProfileAvatarProps) => {
	return (
		<img
			className={clsx(
				"wg_userProfileAvatar__image",
				props.theme === "dark" && "wg_userProfileAvatar__image--dark",
			)}
			src={props.src}
		/>
	);
};

export const WgUserProfileCard = (props: WgUserProfileCardProps) => {
	return (
		<section>
			<WgUserProfileAvatar src={props.user.avatarUrl} theme={props.theme} />
		</section>
	);
};
```

### 5.3 Use Named Handlers Instead of Hiding Logic in JSX

**Rule:** `R05-03` · `composition-named-handlers-over-inline`

**Applies when:** TSX 이벤트 프롭의 인라인 콜백에 분기나 비동기 호출을 추가·수정할 때. 인라인 콜백에 여러 동작·부수효과나 읽어도 의도가 안 보이는 상태 전환이 들어갈 때. 제외: 인자 없이 핸들러 참조만 넘기는 경우.

**Requires selected:** `docs-require-jsdoc-on-key-declarations`, `events-curry-extra-handler-arguments` · 함께 적용

**Review with:** `events-run-user-actions-in-handlers-not-effects`, `typescript/functions-extract-helpers-only-when-the-boundary-is-real`

**Impact: MEDIUM (부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽습니다)**

JSX에는 이름 붙인 핸들러 참조만 넘깁니다.
분기, 비동기 호출, 여러 부수효과가 들어가면 핸들러로 분리합니다.

추가 인자를 넘기려고 `onClick={() => handleX(id)}` 같은 인라인 래퍼를 쓰지 않습니다.
그 자리는 `events-curry-extra-handler-arguments`가 커링으로 정합니다.

**Incorrect (분기와 비동기를 JSX 안에 숨김):**

```tsx
<UiButton
	onClick={async () => {
		if (!selectedProduct) {
			return;
		}

		await mutationProductRemove.mutateAsync({ params: { productId: selectedProduct.id } });
		void navigate({ to: "/products" });
	}}
>
	삭제
</UiButton>
```

**Correct (로직을 명명된 핸들러로 노출):**

```tsx
import type { MouseEventHandler } from "react";

/**
 * 선택된 product 삭제와 다음 화면 이동 처리
 */
const handleRemoveProductButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	if (!selectedProduct) {
		return;
	}

	await mutationProductRemove.mutateAsync({ params: { productId: selectedProduct.id } });
	void navigate({ to: "/products" });
};

<UiButton onClick={handleRemoveProductButtonClick}>삭제</UiButton>;
```

### 5.4 Open ref Props Only for Real Imperative Contracts

**Rule:** `R05-04` · `composition-open-ref-props-only-for-imperative-contracts`

**Applies when:** 컴포넌트에 `ref` 프롭을 추가하거나 공개할 대상을 바꿀 때. 제외: 이미 있는 `ref` 계약의 타입만 바꾸는 경우.

**Review with:** `typescript/docs-justify-convention-exceptions-with-a-reason-comment`, `typing-narrow-library-wrapper-contracts`

**Impact: MEDIUM-HIGH (쓰지도 않는 명령형 창구가 공용 컴포넌트마다 하나씩 늘어나는 것을 막습니다)**

`ref`는 밖에서 실제로 제어해야 하는 공개 명령형 계약입니다.
포커스, 스크롤, 측정처럼 사용처가 직접 다뤄야 하는 일이 있을 때만 엽니다.

- 지금 쓰는 사용처가 없으면 열지 않습니다.
  나중에 필요해지면 그때 엽니다.
- 열 때는 `ref`를 일반 프롭처럼 직접 받습니다.
  감싸는 래퍼를 새로 만들지 않습니다.
- 외부 패키지 타입 제약 때문에 래퍼가 필요하면 그 이유를 주석으로 남깁니다.
  주석의 위치와 근거 기준은
  `typescript/docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.

**Incorrect (`ref` 계약이 필요 없는 단순 화면 컴포넌트에도 습관적으로 `ref`를 노출):**

```tsx
import type { Ref } from "react";

export interface UiStatusBadgeProps {
	ref?: Ref<HTMLSpanElement>;
	label: string;
}

export const UiStatusBadge = (props: UiStatusBadgeProps) => {
	return <span ref={props.ref}>{props.label}</span>;
};
```

**Correct (`ref`가 실제로 필요한 공개 API일 때만 리액트 19 방식으로 직접 받음):**

```tsx
import type { ChangeEventHandler, Ref } from "react";

/**
 * 검색 입력 계약
 *
 * 결과 목록에서 검색어로 포커스를 되돌려야 해 `ref`를 연다.
 * 보이는 라벨을 둘 자리가 없어 이름은 `aria-label`로만 준다.
 */
export interface UiSearchInputProps {
	/**
	 * 사용처가 포커스를 옮길 때 쓰는 참조
	 */
	ref?: Ref<HTMLInputElement>;
	/**
	 * 스크린 리더가 읽을 이름
	 */
	label: string;
	/**
	 * 입력값
	 */
	value: string;
	/**
	 * 입력이 바뀔 때
	 */
	onChange: ChangeEventHandler<HTMLInputElement>;
}

export const UiSearchInput = (props: UiSearchInputProps) => {
	return (
		<input
			ref={props.ref}
			aria-label={props.label}
			onChange={props.onChange}
			value={props.value}
		/>
	);
};
```

**Correct (`ref`가 실제 계약이 아닐 때는 일반 프롭만 유지):**

```tsx
/**
 * 상태 배지 계약
 *
 * 밖에서 다룰 일이 없어 `ref`를 열지 않는다.
 */
export interface UiStatusBadgeProps {
	/**
	 * 배지에 표시할 상태 문구
	 */
	label: string;
}

export const UiStatusBadge = (props: UiStatusBadgeProps) => {
	return <span>{props.label}</span>;
};
```

### 5.5 Use Activity Only to Preserve Mounted Subtrees

**Rule:** `R05-05` · `composition-use-activity-only-to-preserve-mounted-subtrees`

**Applies when:** 조건부 렌더링과 `Activity` 사이를 오갈 때. `<Activity>`를 추가·삭제하거나 `mode`를 계산하는 표현식을 바꿀 때.

**Review with:** `composition-do-not-define-components-inside-components`

**Impact: HIGH (숨기기와 마운트 해제를 구분해 써서 되돌릴 때 상태가 사라지는 사고를 막습니다)**

기본은 조건부 렌더링입니다.
`<Activity>`는 **숨겼다 되돌릴 때 하위 트리 상태를 그대로 살려야 할 때만** 씁니다.

두 방식은 같은 일이 아닙니다.

| | 조건부 렌더링 | `<Activity mode="hidden">` |
| --- | --- | --- |
| 하위 트리 | 해제됩니다 | 마운트된 채 남습니다 |
| 상태 | 사라집니다 | 유지됩니다 |
| 이펙트 | 정리됩니다 | 정리됩니다 |
| 렌더 비용 | 없습니다 | 업데이트가 생기면 낮은 우선순위로 렌더됩니다 |
| DOM 노드 | 문서에서 사라집니다 | 문서에 남습니다 |

- 마운트와 해제 자체가 의미를 가지면 조건부 렌더링을 유지합니다.
  폼 초기화, 구독 해제, 첫 진입 애니메이션이 그런 경우입니다.
- 숨긴 하위 트리도 업데이트가 생기면 다시 렌더됩니다.
  무거운 트리를 습관적으로 감춰 두지 않습니다.
- 접근성을 이유로 `<Activity>`를 고르지 않습니다.
  리액트는 숨길 때 `display: none`만 걸고, 그 노드는 접근성 트리에서 빠집니다.
  스크린 리더에는 조건부 렌더링과 똑같이 없는 것으로 읽힙니다.
- `<Activity>`는 리액트 19.2 이상에만 있습니다.
  그보다 낮으면 조건부 렌더링만 씁니다.

**Incorrect (폼 초기화가 필요한 자리를 표시 방식으로 치환):**

```tsx
// 편집을 취소했다가 다시 들어가면 지난 입력이 그대로 남는다
return (
	<Fragment>
		<Activity mode={isEditing ? "visible" : "hidden"}>
			<PgProductEditorForm />
		</Activity>
		<Activity mode={isEditing ? "hidden" : "visible"}>
			<PgProductPreviewPane />
		</Activity>
	</Fragment>
);
```

**Correct (되돌릴 때 살려야 할 상태가 하위 트리에 있는 자리에만 사용):**

```tsx
const PgProductSidebar = () => {
	// 접어 둔 노드와 스크롤 위치가 사이드바 안에 있다. 닫았다 열면 그대로 있어야 한다
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

	return <UiTree expandedKeys={expandedKeys} onExpand={setExpandedKeys} />;
};
```

```tsx
return (
	<Activity mode={isSidebarOpen ? "visible" : "hidden"}>
		<PgProductSidebar />
	</Activity>
);
```

**Correct (마운트 의미가 있으면 조건부 렌더링을 유지):**

```tsx
return hasItems ? <PgProductList /> : <PgProductEmptyState />;
```

### 5.6 Declare Props Interfaces Above the Component

**Rule:** `R05-06` · `composition-declare-props-interface-above-the-component`

**Applies when:** 컴포넌트 프롭스 타입을 새로 선언할 때. 프롭스 타입의 위치나 공개 범위를 바꿀 때. 제외: 같은 파일에서만 쓰는 화면 지역 프롭스를 `export`하지 않는 경우.

**Review with:** `composition-read-props-without-destructuring`, `typescript/types-document-custom-types-and-shapes`

**Impact: MEDIUM (계약을 먼저 읽고 구현으로 내려가는 순서가 파일마다 같습니다)**

프롭스 타입은 `interface`로 선언하고 컴포넌트 선언 바로 위에 둡니다.
파일을 열면 계약이 먼저 보이고 구현이 그 아래 옵니다.

- 이름은 컴포넌트 이름에 `Props`를 붙입니다.
  `UiButton`이면 `UiButtonProps`입니다.
- 합성 부품 여럿이 형태가 완전히 같으면 공통 이름 하나로 선언해 나눠 씁니다.
  `UiSectionRoot`·`UiSectionHeader`·`UiSectionFooter`가 모두 `{children}`이면 `UiSectionProps` 하나입니다.
  같은 형태를 부품마다 다시 선언하면 `typescript/types-reuse-existing-contracts-before-new-types`가 걸립니다.
- 사용처가 이 계약을 참조할 수 있어야 하므로 `export`합니다.
  래퍼 사용처가 원본 라이브러리 프롭스를 보지 않게 하려는 것입니다.
  같은 파일 안에서만 쓰는 화면 지역 컴포넌트의 프롭스는 `export`하지 않습니다.
- 합성 부품 여럿이 하나를 나눠 쓰는 프롭스 `interface`는 첫 부품 위에 둡니다.
- 프롭스 타입은 파일 위쪽에 모으지 않습니다.
  컴포넌트가 여러 개면 각자 위에 둡니다.
  컴포넌트가 아닌 함수의 객체 매개변수 타입은
  `typescript/functions-use-named-object-params-for-complex-signatures`가 정합니다.
- 설명, `interface`, 컴포넌트 순서로 붙여 둡니다.
  컴포넌트가 무엇인지 설명하는 문서 주석은 컴포넌트가 아니라 `interface` 위에 둡니다.
  합성 공개 부품도 같은 순서입니다.
- 문서 주석에 무엇을 쓸지는 `typescript/types-document-custom-types-and-shapes`가 정합니다.

**Incorrect (파일 위쪽에 타입을 모으고 내보내지 않음):**

```tsx
interface UiBadgeProps {
	label: string;
}

interface UiChipProps {
	label: string;
}

const helperText = "…";

export const UiBadge = (props: UiBadgeProps) => {
	return <span className={clsx("ui_badge__root")}>{props.label}</span>;
};

export const UiChip = (props: UiChipProps) => {
	return <span className={clsx("ui_chip__root")}>{props.label}</span>;
};
```

**Incorrect (설명이 컴포넌트에 붙어 계약과 떨어짐):**

```tsx
export interface UiPanelHeaderProps {
	children: ReactNode;
}

/**
 * 패널 헤더 부품
 */
export const UiPanelHeader = (props: UiPanelHeaderProps) => {
	return <header className={clsx("ui_panel__header")}>{props.children}</header>;
};
```

**Correct (각 컴포넌트 바로 위에 선언하고 내보냄):**

```tsx
/**
 * 상태 배지 계약
 */
export interface UiBadgeProps {
	/**
	 * 배지에 표시할 문구
	 */
	label: string;
}

export const UiBadge = (props: UiBadgeProps) => {
	return <span className={clsx("ui_badge__root")}>{props.label}</span>;
};
```

**Correct (설명, 계약, 선언을 붙여 둠):**

```tsx
/**
 * 패널 헤더 부품
 *
 * 제목과 우측 동작 영역을 사용처가 직접 조립한다.
 */
export interface UiPanelHeaderProps {
	/**
	 * 헤더 줄에 늘어놓을 제목과 동작
	 */
	children: ReactNode;
}

export const UiPanelHeader = (props: UiPanelHeaderProps) => {
	return <header className={clsx("ui_panel__header")}>{props.children}</header>;
};
```

### 5.7 Write Fragments as `Fragment`, Not the Shorthand

**Rule:** `R05-07` · `composition-name-fragments-explicitly`

**Applies when:** JSX에서 여러 요소를 `Fragment`나 `<>`로 감싸는 문법을 추가·변경할 때. `Fragment`에 `key`를 붙이거나 떼어 낼 때.

**Impact: LOW (조각을 감싼 자리가 이름을 가져서 검색과 diff에 그대로 드러납니다)**

여러 요소를 감쌀 때는 `<Fragment>`를 `react`에서 직접 가져와 그대로 씁니다.
`<>`와 `</>`는 쓰지 않습니다.

- `<>`와 `</>`는 검색해도 어느 컴포넌트의 조각인지 가릴 수 없습니다.
  diff에도 이름 없는 줄로 남습니다.
- 목록에서 `key`가 필요해지면 어차피 `<Fragment key={…}>`로 바꿔야 합니다.
  한 형태로 끝냅니다.
- 가져오기는 `typescript/naming-use-direct-imports-and-public-entry-points`를 따라
  `import { Fragment } from "react";`로 적습니다.

`biome`의 `style/useFragmentSyntax`는 정반대를 강제하므로 켜지 않습니다.
설정은 `typescript/tooling-configure-biome-to-enforce-these-rules`에 적혀 있습니다.

**Incorrect (이름 없는 짧은 문법):**

```tsx
export const PgProductScreen = () => {
	return (
		<>
			<PgProductFilterSection />
			<PgProductTableSection />
		</>
	);
};
```

**Correct (`Fragment`를 그대로 씀):**

```tsx
import { Fragment } from "react";

export const PgProductScreen = () => {
	return (
		<Fragment>
			<PgProductFilterSection />
			<PgProductTableSection />
		</Fragment>
	);
};
```

**Correct (`key`가 필요해도 같은 형태를 유지):**

```tsx
import { Fragment } from "react";

export const PgProductRows = (props: PgProductRowsProps) => {
	return props.products.map((product) => (
		<Fragment key={product.id}>
			<PgProductRow product={product} />
			<PgProductRowDivider />
		</Fragment>
	));
};
```

### 5.8 Render a Single Branch With `&&`, Not a Ternary

**Rule:** `R05-08` · `composition-render-one-branch-with-and`

**Applies when:** JSX 안에 조건부 렌더링을 추가하거나 조건식을 바꿀 때. 기존 `조건 ? … : null`을 넣거나 뺄 때.

**Impact: HIGH (조건부 렌더링 형태가 하나로 고정되고 쓰지 않는 `: null`이 사라집니다)**

JSX 안에서 그릴 분기가 **하나면** `&&`를 씁니다.
`조건 ? <X /> : null`로 쓰지 않습니다.
`: null`은 아무것도 안 하면서 눈이 한 번 더 멈추는 자리를 만듭니다.

컴포넌트가 통째로 아무것도 안 그릴 때는 `&&`를 쓰지 않습니다.
`&&`는 조건이 거짓이면 `false`를 돌려주는데, 반환값 자리에서는 `null`이 뜻이 더 분명합니다.
조건을 이른 반환으로 먼저 걸러 냅니다.

**둘 중 하나를 그릴 때만** 삼항을 씁니다.
그때는 두 분기가 다 뜻을 갖습니다.

| 그리는 것 | 쓰는 것 |
| --- | --- |
| 조건이 참일 때만 | `{조건 && <X />}` |
| 참일 때와 거짓일 때 각각 | `{조건 ? <X /> : <Y />}` |

**`&&` 왼쪽에 숫자를 두지 않습니다.**
`0`은 거짓이지만 리액트가 화면에 `0`을 그대로 그립니다.
`NaN`도 `NaN`으로 그려집니다.
길이나 개수로 판단할 때는 비교식으로 바꿔 불리언을 만듭니다.

문자열과 객체는 왼쪽에 두어도 됩니다.
빈 문자열, `undefined`, `null`은 리액트가 아무것도 그리지 않습니다.

삼항을 여러 개 겹치지 않습니다.
분기가 셋 이상이면 조건을 이름 붙인 값으로 꺼내거나 섹션 컴포넌트로 나눕니다.
어느 쪽인지는 `screen-extract-local-section-components-for-runtime-boundaries`가 정합니다.

숨긴 하위 트리의 상태를 살려야 하면 `composition-use-activity-only-to-preserve-mounted-subtrees`를 봅니다.

**Incorrect (한 분기인데 삼항과 `: null`을 씀):**

```tsx
return (
	<section>
		{props.helperText ? <span className={clsx("pg_products__helper")}>{props.helperText}</span> : null}
		{responseProductListSuspense.isFetching ? <UiRefreshIndicator /> : null}
	</section>
);
```

**Incorrect (`&&` 왼쪽에 숫자를 둬서 `0`이 그려짐):**

```tsx
return <section>{selectedRows.length && <PgProductBulkActionBar />}</section>;
```

**Correct (한 분기는 `&&`, 왼쪽은 불리언):**

```tsx
return (
	<section>
		{props.helperText && <span className={clsx("pg_products__helper")}>{props.helperText}</span>}
		{selectedRows.length > 0 && <PgProductBulkActionBar selectedRows={selectedRows} />}
	</section>
);
```

**Correct (컴포넌트가 통째로 안 그리면 이른 반환):**

```tsx
const PgProductPanel = (props: PgProductPanelProps) => {
	if (!props.isVisible) {
		return null;
	}

	return <section className={clsx("pg_productPanel__root")}>{props.children}</section>;
};
```

**Correct (두 분기가 다 뜻을 가지면 삼항):**

```tsx
return filteredCategoryNodes.length > 0 ? (
	<UiTree treeData={filteredCategoryNodes} />
) : (
	<UiEmpty description="검색 결과가 없습니다" />
);
```

### 5.9 Order Hooks, Handlers, Effects, Then Return

**Rule:** `R05-09` · `composition-order-hooks-handlers-effects-then-return`

**Applies when:** 컴포넌트 본문에 훅·핸들러·이펙트를 추가하거나 자리를 옮길 때. 본문 선언이 아래 선언을 참조해 순서를 다시 잡을 때.

**Review with:** `events-run-user-actions-in-handlers-not-effects`, `screen-keep-derived-values-close`

**Impact: MEDIUM (어느 컴포넌트를 열어도 같은 자리에서 같은 종류를 찾습니다)**

컴포넌트 본문은 네 구획을 이 순서로 둡니다.

| 순서 | 구획 | 담는 것 |
| --- | --- | --- |
| 1 | 훅 | 라우터·스토어·쿼리·컨텍스트·커스텀 훅과 `useState`·`useRef` |
| 2 | 핸들러 | `handle*` 함수 |
| 3 | 이펙트 | `useEffect`·`useLayoutEffect` |
| 4 | 반환 | 조기 반환과 JSX |

본문은 렌더마다 위에서 아래로 실행되므로 앞 선언은 뒤 선언을 참조하지 못합니다.
이 순서는 그 제약을 그대로 따른 것입니다.

- 이펙트의 인자와 의존성 배열은 그 줄에서 바로 평가됩니다.
  이펙트를 마지막 훅으로 두면 본문의 어떤 선언이든 의존성에 넣을 수 있습니다.
- 조기 반환은 어떤 훅보다도 뒤에 옵니다.
  훅 호출 개수가 렌더마다 같아야 하기 때문입니다.
- 구획 안에서는 참조가 선언 뒤에 오게만 하고 순서를 더 정하지 않습니다.
- 파생 값은 구획이 아닙니다.
  `screen-keep-derived-values-close`대로 쓰는 자리에서 계산합니다.

**Incorrect (이펙트가 아래 선언을 의존성으로 참조해 초기화 전에 접근함):**

```tsx
export const PgOrderToolbar = () => {
	// selectedIds는 아직 초기화 전이라 의존성 배열을 평가하는 이 줄에서 깨진다
	useEffect(() => {
		document.title = `주문 ${selectedIds.length}건 선택`;
	}, [selectedIds]);

	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	return <section className={clsx("pg_orderToolbar__root")}>{/* ... */}</section>;
};
```

**Incorrect (같은 종류가 흩어져 위아래를 오가며 읽음):**

```tsx
export const PgOrderToolbar = () => {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const handleClearButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		setSelectedIds([]);
	};

	const [isPanelOpen, setIsPanelOpen] = useState(false);

	useEffect(() => {
		document.title = `주문 ${selectedIds.length}건 선택`;
	}, [selectedIds]);

	const handlePanelOpenButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		setIsPanelOpen(true);
	};

	return <section className={clsx("pg_orderToolbar__root")}>{/* ... */}</section>;
};
```

**Correct (네 구획이 순서대로 놓임):**

```tsx
export const PgOrderToolbar = () => {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [isPanelOpen, setIsPanelOpen] = useState(false);

	/**
	 * 비우기는 선택만 지우고 패널은 그대로 둔다
	 */
	const handleClearButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		setSelectedIds([]);
	};

	/**
	 * 필터 패널 열기
	 */
	const handlePanelOpenButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		setIsPanelOpen(true);
	};

	useEffect(() => {
		document.title = `주문 ${selectedIds.length}건 선택`;
	}, [selectedIds]);

	return (
		<section className={clsx("pg_orderToolbar__root")}>
			<UiButton onClick={handleClearButtonClick}>비우기</UiButton>
			<UiButton onClick={handlePanelOpenButtonClick}>필터</UiButton>
			{isPanelOpen && <PgOrderFilterPanel />}
		</section>
	);
};
```

## 6. Screen File Discipline

**Impact: MEDIUM-HIGH**

라우트 진입은 화면 흐름을 분명하게 보여 줘야 하고, 떼어 내는 것은 자기 상태나 비동기를 직접 가진 섹션뿐입니다. 파생값은 쓰는 자리에서 계산하고, 짐작으로 미리 빼내지 않습니다.

### 6.1 Keep Route Entry Files Focused on Screen Flow

**Rule:** `R06-01` · `screen-keep-route-flow-visible`

**Applies when:** 라우트 진입의 search 파라미터, 화면 이동, 쿼리, 뮤테이션, 화면 전체 이펙트를 옮기거나 나눌 때. 화면 섹션 조립의 순서나 소유자를 바꿀 때. 제외: 같은 소유자 안에서 표현만 바꾸는 경우.

**Review with:** `ownership-place-owner-files-in-role-folders`, `screen-extract-local-section-components-for-runtime-boundaries`

**Impact: MEDIUM-HIGH (진입 파일만 봐도 화면 흐름을 따라갈 수 있습니다)**

라우트 진입이 소유하는 것은 다음 다섯입니다.
다른 규칙이 이 목록을 가리킬 때는 여기가 정본입니다.

- search 파라미터와 화면 이동
- 화면 단위 쿼리와 뮤테이션, 그 무효화
- 화면 전체 이펙트
- 여러 섹션에 걸친 파생값
- 섹션 렌더 조립

비동기, 상태, 상호작용 경계가 있는 섹션을 분리해도 이 흐름 제어 자체는 라우트 진입에 남깁니다.

소유자가 그대로인 변경은 대상이 아닙니다.

- `query.select` 형태, 바인딩·별칭 정리, 파생 상태 이펙트를 렌더 계산으로 옮기는 것
- 순수 타입, 전송 값 조립 함수, 기본 설정을 형제 `.ts` 파일로 옮기는 것
  `typescript/functions-extract-helpers-only-when-the-boundary-is-real`이 담당합니다.

**Incorrect (흐름보다 분해 자체가 목적이 됨):**

```tsx
return (
	<PgProductShell>
		<PgProductHeaderSection />
		<PgProductContentSection />
		<PgProductFooterSection />
	</PgProductShell>
);
```

**Correct (라우트 진입에서 흐름이 보이고, 실제 경계가 있는 섹션만 분리):**

```tsx
const navigate = useNavigate();
const search = Route.useSearch();

/**
 * 표에 그릴 product를 route search의 page로 읽는다
 */
const responseProductListSuspense = useProductListSuspense(
	{page: search.page},
	{query: {select: (response) => ({products: response.data.list})}},
);

/**
 * 저장에 성공하면 첫 페이지로 돌려 새로 저장한 product가 목록 맨 앞에 오게 한다
 */
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: () => {
			void navigate({to: "/products", search: {...search, page: 1}});
		},
	},
});

/**
 * 폼 값을 전송 형태로 바꿔 저장만 부르고, 저장 뒤 흐름은 mutation 콜백이 이어 간다
 */
const handleProductSave: PgProductListSectionProps["onSubmit"] = () => {
	mutationProductSave.mutate({data: toProductSaveRequest(formValues)});
};

return (
	<Fragment>
		<PgProductFilterSection />
		<PgProductListSection
			products={responseProductListSuspense.data.products}
			onSubmit={handleProductSave}
		/>
	</Fragment>
);
```

### 6.2 Avoid Premature Abstraction in Screen Code

**Rule:** `R06-02` · `screen-avoid-premature-abstraction`

**Applies when:** 화면 코드를 보조 함수, 훅, 컴포넌트, 모듈로 추출할 때. 한 곳에서만 쓰는 기존 추상화를 다시 접어 넣을 때.

**Review with:** `screen-extract-local-section-components-for-runtime-boundaries`, `typescript/functions-extract-helpers-only-when-the-boundary-is-real`

**Impact: MEDIUM-HIGH (짐작으로 빼내지 않고 실제 재사용 경계에 맞춰 화면 코드를 둡니다)**

반복이 보인다는 이유만으로 공용 훅, 컴포넌트, 보조 함수를 만들지 않습니다.

추출 전에 먼저 시도할 방법:

- 한 함수 안에서 단계 변수, 섹션 주석, 내부 블록으로 정리
- 화면 지역 JSX에 남기고 흐름을 보이게 유지
- 작은 변환 함수, `href` 조립, 기본값 처리는 사용처에 유지

추출해도 되는 경계는 이 규칙이 정하지 않습니다.
컴포넌트는 `screen-extract-local-section-components-for-runtime-boundaries`가,
함수는 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`이 판정합니다.

먼저 시도한 뒤에도 남는 금지 구조:

- 한 컴포넌트, 한 핸들러, 한 쿼리 `select`만 쓰는 보조 함수를 보조 모듈에 쌓는 구조
- 내보낸 보조 함수가 다른 내보낸 보조 함수 하나만을 위해 존재하는 구조
- 이름이 그럴듯하다는 이유로 흐름을 파일 왕복 뒤에 숨기는 구조

**Incorrect (사용처가 한 화면뿐인데 공용 훅으로 먼저 빼냄):**

```ts
// hook/use-product-filter-form.ts
export const useProductFilterForm = () => {
	const [keyword, setKeyword] = useState("");
	const [categoryId, setCategoryId] = useState<string>();

	return {categoryId, keyword, setCategoryId, setKeyword};
};
```

```tsx
// page/products/pg-products.tsx: 이 훅을 부르는 화면은 여기 하나뿐이다
export const PgProducts = () => {
	const productFilterForm = useProductFilterForm();

	return <PgProductFilterSection keyword={productFilterForm.keyword} />;
};
```

**Incorrect (컴포넌트 하나만 쓰는 단계 보조 함수를 보조 모듈에 남김):**

```tsx
const toEditHref = ({editHrefBase, row}: {editHrefBase: string; row: ProductRow}) =>
	`${editHrefBase}${row.id}/`;

const toProductRows = (response: ProductListResponse) =>
	response.data.map((product) => ({id: product.id, title: product.title}));

export const PgProductTable = (props: PgProductTableProps) => {
	const responseProductListSuspense = useProductListSuspense({}, {query: {select: toProductRows}});

	return responseProductListSuspense.data.map((row) => (
		<a href={toEditHref({editHrefBase: props.editHrefBase, row})} key={row.id}>
			{row.title}
		</a>
	));
};
```

**Correct (두 화면이 같은 흐름을 부르게 된 뒤에 공용화):**

```ts
/**
 * 등록 화면과 수정 화면이 저장 실패를 같은 문구로 보여 줘야 해서 한 곳에 묶는다.
 * 두 화면이 모두 이 훅을 부르므로 한쪽만 고치면 표시가 갈린다
 */
export const useProductEditor = () => {
	const form = useForm<ProductEditorFormValues>();

	/**
	 * 저장 실패 문구를 이 훅이 함께 들고 있어야 해서 여기서 부른다
	 */
	const mutationProductSave = useProductSave();
	const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

	return {form, mutationProductSave, setSubmitErrorMessage, submitErrorMessage};
};
```

**Correct (여러 보조 함수 대신 한 함수 안에서 단계별로 정리):**

```ts
/**
 * 화면이 보낼 값 조립을 한 함수 안에서 끝낸다. 단계마다 보조 함수를 만들지 않는다
 */
export const toProductSaveRequest = (formValues: ProductFormValues) => {
	// 1. 사용자가 넣은 앞뒤 공백을 서버로 보내기 전에 정리한다
	const title = formValues.title.trim();
	const description = formValues.description.trim();

	// 2. API가 받는 payload 형태로 조립한다
	return {categoryId: formValues.categoryId, description, title};
};
```

**Correct (작은 쿼리 가공과 `href` 조립은 사용처에 둠):**

```tsx
export const PgProductTable = (props: PgProductTableProps) => {
	/**
	 * 링크에 필요한 두 필드만 남겨 표가 응답 구조를 모르게 한다
	 */
	const responseProductListSuspense = useProductListSuspense(
		{},
		{query: {select: (response) => response.data.map((product) => ({id: product.id, title: product.title}))}},
	);

	return responseProductListSuspense.data.map((row) => (
		<a href={`${props.editHrefBase}${row.id}/`} key={row.id}>
			{row.title}
		</a>
	));
};
```

### 6.3 Extract Local Section Components Only for Runtime Boundaries

**Rule:** `R06-03` · `screen-extract-local-section-components-for-runtime-boundaries`

**Applies when:** 화면 지역 섹션 컴포넌트를 새로 추출할 때. 기존 섹션에 비동기, 지역 상태, 프로바이더, 상호작용, 외부 위젯, 성능 처리를 넣거나 뺄 때.

**Impact: MEDIUM-HIGH (화면 흐름은 보이게 두고 자기 것을 직접 가진 부분만 떼어 냅니다)**

라우트 진입의 지역 컴포넌트는 그 조각이 **직접 소유하는 것이 있을 때만** 추출합니다.
감싸기만 하는 래퍼, `className` 묶기, 들여쓰기 감소만으로는 추출하지 않습니다.

떼어 낼 수 있는 경우는 그 섹션이 다음 중 하나를 직접 가질 때입니다.

- 비동기: `Suspense`, 스켈레톤, 로딩, 오류, 비었을 때 상태
- 상태, 프로바이더: 지역 상태, 이펙트 동기화, 폼 프로바이더, 컨텍스트, 범위를 좁힌 스토어
- 상호작용: 팝오버, 모달, 선택, 인라인 편집, 드래그, 펼치는 트리
- 라이브러리, 성능: 외부 위젯의 생명주기를 소유하는 어댑터, 가상 스크롤, 전환, 지연 값

흐름 제어는 섹션이 아니라 라우트 진입에 둡니다.
그 목록은 `screen-keep-route-flow-visible`이 정합니다.

지역 섹션 파일을 어느 폴더에 두는지는 `ownership-place-owner-files-in-role-folders`가 정합니다.
진입 파일의 JSX에 나타나지 않는 섹션이 다른 섹션 파일 안에서 렌더되면 과하게 쪼갠 것입니다.

**Incorrect (레이아웃 래퍼가 화면 단위 쿼리까지 삼켜 라우트 흐름이 안 보임):**

```tsx
const PgProductSidebarPanel = () => {
	const responseProductTreeSuspense = useProductTreeSuspense();

	return (
		<section className={clsx("pg_products__sidebar")}>
			<UiTree treeData={responseProductTreeSuspense.data.nodes} />
		</section>
	);
};

const PgProductDetailPanel = () => {
	const responseProductListSuspense = useProductListSuspense();

	return (
		<section className={clsx("pg_products__detail")}>
			<UiTable dataSource={responseProductListSuspense.data.list} />
		</section>
	);
};

export const PgProducts = () => {
	return (
		<div className={clsx("pg_products__layout")}>
			<PgProductSidebarPanel />
			<PgProductDetailPanel />
		</div>
	);
};
```

**Correct (지역 상태와 상호작용을 직접 가진 섹션만 화면 지역 컴포넌트로 추출):**

```tsx
interface PgProductTreeSectionProps {
	categoryNodes: ProductCategoryNode[];
	selectedCategoryId?: string;
	onCategorySelect: (categoryId: string) => void;
}

const PgProductTreeSection = (props: PgProductTreeSectionProps) => {
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
	const [treeSearchKeyword, setTreeSearchKeyword] = useState("");

	const filteredCategoryNodes = filterCategoryNodes(
		props.categoryNodes,
		treeSearchKeyword,
	);

	/**
	 * 검색어는 이 섹션 안에만 두고 route search로 올리지 않는다
	 */
	const handleTreeSearchKeywordChange: UiInputProps["onChange"] = (event) => {
		setTreeSearchKeyword(event.target.value);
	};

	/**
	 * UiTree가 넘기는 key 타입이 넓어서 문자열로 좁혀 담는다
	 */
	const handleTreeExpand: UiTreeProps["onExpand"] = (keys) => {
		setExpandedKeys(keys.map(String));
	};

	/**
	 * tree가 넘긴 key에서 접두사를 떼어 route search가 받는 categoryId로 만든다
	 */
	const handleTreeSelect: UiTreeProps["onSelect"] = (keys, _info) => {
		const selectedKey = keys[0];
		if (typeof selectedKey !== "string" || !selectedKey.startsWith("category:")) {
			return;
		}

		props.onCategorySelect(selectedKey.replace("category:", ""));
	};

	return (
		<section className={clsx("pg_products__sidebar")}>
			<UiInput value={treeSearchKeyword} onChange={handleTreeSearchKeywordChange} />

			{filteredCategoryNodes.length > 0 ? (
				<UiTree
					treeData={filteredCategoryNodes.map(toTreeData)}
					expandedKeys={expandedKeys}
					selectedKeys={props.selectedCategoryId ? [`category:${props.selectedCategoryId}`] : []}
					onExpand={handleTreeExpand}
					onSelect={handleTreeSelect}
				/>
			) : (
				<UiEmpty description="검색 결과가 없습니다" />
			)}
		</section>
	);
};
```

**Correct (라우트 진입이 흐름 제어를 계속 소유):**

```tsx
export const PgProducts = () => {
	const navigate = useNavigate();
	const search = Route.useSearch();

	/**
	 * 사이드바가 그릴 분류 노드만 남긴다. 트리 펼침 상태는 섹션이 따로 들고 있다
	 */
	const responseProductTreeSuspense = useProductTreeSuspense(
		{},
		{query: {select: (response) => ({categoryNodes: response.data.nodes})}},
	);

	/**
	 * 표가 쓰는 필드 이름으로 목록을 바꿔서 표가 응답 구조를 모르게 한다
	 */
	const responseProductListSuspense = useProductListSuspense(
		{},
		{query: {select: (response) => ({products: response.data.list})}},
	);

	/**
	 * 고른 분류를 route search에 적어 두어 새로 고침해도 같은 화면이 열리게 한다
	 */
	const handleCategorySelect: PgProductTreeSectionProps["onCategorySelect"] = (categoryId) => {
		void navigate({
			to: "/products",
			search: {page: search.page, size: search.size, categoryId},
		});
	};

	return (
		<div className={clsx("pg_products__layout")}>
			<PgProductTreeSection
				categoryNodes={responseProductTreeSuspense.data.categoryNodes}
				selectedCategoryId={search.categoryId}
				onCategorySelect={handleCategorySelect}
			/>
			<PgProductTableSection
				products={responseProductListSuspense.data.products}
			/>
		</div>
	);
};
```

### 6.4 Keep Derived Values Close to Where They Are Used

**Rule:** `R06-04` · `screen-keep-derived-values-close`

**Applies when:** 화면 진입 파일이나 섹션 최상단에 `const` 별칭, 플래그, 표시값을 추가·이동·제거할 때. 훅 인자, JSX 표시값, 이펙트 안 계산을 위쪽 `const`로 빼거나 되돌릴 때.

**Review with:** `data-preserve-origin-chaining`

**Impact: MEDIUM (출처가 남고 화면 진입 파일이 별칭과 준비 코드로 채워지지 않습니다)**

계산한 값은 실제 쓰는 자리에서 만듭니다.
화면 상단으로 끌어올리면 그 값이 어디서 왔는지 알 수 없게 됩니다.

여기서 보는 것은 `useState`와 프롭에서 나온 플래그, 표시값입니다.
응답과 스토어 출처는 `data-preserve-origin-chaining`이 정합니다.

어느 파일이 그 값을 소유하는지도 이 규칙이 정하지 않습니다.
`screen-extract-local-section-components-for-runtime-boundaries`가 정합니다.
여기서는 소유한 파일 안에서 얼마나 가까이 두는지만 봅니다.

- 조건 플래그와 표시 문구를 화면 상단에 미리 만들어 두지 않고 쓰는 자리에서 계산합니다.
  `let` 재할당과 배열 `push` 조립은 `typescript/functions-avoid-imperative-assembly-in-wide-scopes`가 봅니다.
- 훅 인자, JSX 표시값, 이펙트 내부 계산은 쓰는 자리의 좁은 스코프에서 직접 계산합니다.
- 이름을 붙일지 말지는 `typescript/functions-name-a-value-only-for-recompute-or-judgment`가 정합니다.
  여기서는 이름을 붙인 값을 화면 어디에 두는지만 봅니다.

**Incorrect (쓰는 자리에서 먼 화면 상단에 플래그와 표시값을 쌓음):**

```tsx
export const PgProductTableSection = (props: PgProductTableSectionProps) => {
	const [selectedRows, setSelectedRows] = useState<ProductRow[]>([]);

	// 아래 둘은 이름만 남기고 무엇에서 나온 값인지를 지운다
	const hasSelectedRows = selectedRows.length > 0;
	const bulkActionLabel = `${selectedRows.length}건 삭제`;

	return (
		<Fragment>
			<UiTable dataSource={props.products} onRowSelect={setSelectedRows} />

			{hasSelectedRows && <PgProductBulkActionBar label={bulkActionLabel} />}
		</Fragment>
	);
};
```

**Correct (선언을 그대로 두고 쓰는 자리에서 계산):**

```tsx
export const PgProductTableSection = (props: PgProductTableSectionProps) => {
	const [selectedRows, setSelectedRows] = useState<ProductRow[]>([]);

	/**
	 * 고른 행은 이 섹션 안에만 두고 route search로 올리지 않는다
	 */
	const handleTableRowSelect: UiTableProps["onRowSelect"] = (rows) => {
		setSelectedRows(rows);
	};

	return (
		<Fragment>
			<UiTable dataSource={props.products} onRowSelect={handleTableRowSelect} />

			{selectedRows.length > 0 && (
				<PgProductBulkActionBar label={`${selectedRows.length}건 삭제`} />
			)}
		</Fragment>
	);
};
```

## 7. Runtime Boundaries

**Impact: HIGH**

막는 로딩과 실패는 화면 본문이 아니라 경계가 받습니다. `Suspense` 경계와 오류 경계를 어느 층에 두는지, 본문에 남기지 않을 분기가 무엇인지를 여기서 정합니다.

### 7.1 Place Suspense Boundaries at the Section Owner

**Rule:** `R07-01` · `runtime-place-suspense-boundaries-at-the-section-owner`

**Applies when:** `Suspense` 쿼리를 쓰는 화면에서 로딩 대체 화면의 위치를 정할 때. `Suspense` 경계를 추가하거나 옮길 때.

**Requires selected:** `runtime-avoid-ad-hoc-loading-branches` · 함께 적용

**Review with:** `css/layout-keep-layout-intent-explicit`, `runtime-place-error-boundaries-by-blast-radius`, `screen-extract-local-section-components-for-runtime-boundaries`

**Impact: HIGH (막는 로딩을 화면 본문이 아니라 정해진 한 자리에서 처리합니다)**

`Suspense` 쿼리를 쓰는 컴포넌트마다 그 **바로 위 섹션 소유자**가 경계를 갖습니다.
경계와 대체 화면은 거기 한 곳에만 둡니다.
쿼리를 부르는 컴포넌트는 자기 자신을 감쌀 수 없으므로 경계를 갖지 않습니다.

- 섹션이 따로 없으면 라우트 진입이 경계를 갖습니다.
- 라우트 진입이 직접 쿼리를 부르면 그 라우트의 레이아웃이나 상위 라우트가 경계를 갖습니다.
- 한 화면에 경계를 여러 겹 쌓지 않습니다.
  섹션이 독립적으로 채워져야 할 때만 나눕니다.

대체 화면의 컨테이너와 높이는 `css/layout-keep-layout-intent-explicit`이 정합니다.

경계가 있으므로 화면 본문에는 로딩 분기가 남지 않습니다.
그 판정은 `runtime-avoid-ad-hoc-loading-branches`가 합니다.

**Incorrect (진입에 경계가 없어 화면 전체가 함께 멈춤):**

```tsx
// 진입 파일: PgProductTreeSection이 Suspense 쿼리를 부르는데 감싸는 경계가 없다
return <PgProductTreeSection />;
```

**Correct (섹션 소유자가 경계와 대체 화면을 가짐):**

```tsx
// 진입 파일: 쿼리를 부르는 섹션을 경계로 감싼다
return (
	<Suspense fallback={<PgProductTreeSkeleton />}>
		<PgProductTreeSection />
	</Suspense>
);
```

```tsx
// 섹션: 자기 자신을 감쌀 수 없으므로 경계 없이 쿼리만 부른다
export const PgProductTreeSection = () => {
	/**
	 * 사이드바 분류 트리를 읽는다. 이 쿼리가 멈추는 동안은 진입 파일의 경계가 받는다
	 */
	const responseProductTreeSuspense = useProductTreeSuspense();

	return <UiTree treeData={responseProductTreeSuspense.data.categoryNodes} />;
};
```

### 7.2 Avoid Ad-hoc Loading Branches in Screen Bodies

**Rule:** `R07-02` · `runtime-avoid-ad-hoc-loading-branches`

**Applies when:** `Suspense` 쿼리를 쓰는 화면 본문에 초기 로딩 반환을 추가·변경할 때. `isFetching`이나 뮤테이션 `isPending`으로 화면을 가리는 분기를 넣을 때. 제외: 선택 값에 기본값을 채우는 것만 바꾸는 경우.

**Review with:** `data-preserve-origin-chaining`, `screen-keep-derived-values-close`, `typescript/absence-expose-optional-values-instead-of-silent-fallbacks`

**Impact: HIGH (초기 로딩과 실패는 경계가 맡고 화면 본문에는 데이터가 있는 경로만 남습니다)**

`Suspense` 쿼리를 쓰는 화면은 본문에서 초기 로딩을 다시 분기하지 않습니다.
막는 로딩은 `Suspense` 경계나 상위 레이아웃이 이미 처리합니다.

- `isFetching`은 이미 그려진 화면을 보조할 때만 씁니다.
  `Suspense` 쿼리의 `isPending`은 타입이 `false`로 고정되어 분기 자체가 죽은 코드입니다.
  뮤테이션의 `isPending`은 씁니다.
  버튼 비활성화, 백그라운드 다시 불러오기 표시, 저장 중 배지가 그런 예입니다.
- 실패도 본문에서 `isError`로 다시 분기하지 않습니다.
  받을 자리는 `runtime-place-error-boundaries-by-blast-radius`가 정합니다.
- 가리는 분기는 가리지 않으면 외부 SDK나 폼이 잘못된 값으로 초기화되는 경우에만 씁니다.
  그때 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 이유를 남깁니다.

값이 없을 수 있다는 사실을 기본값으로 덮는 문제는 이 규칙이 아니라
`typescript/absence-expose-optional-values-instead-of-silent-fallbacks`가 판정합니다.

**Incorrect (다시 불러오는 중에 화면 전체를 가림):**

```tsx
if (responseUserGetItemSuspense.isFetching) {
	return <UiSpinner />;
}

return <UiUserName value={responseUserGetItemSuspense.data.name} />;
```

**Correct (로딩과 갱신 상태는 보조 UI에만 사용):**

```tsx
return (
	<Fragment>
		<UiUserName value={responseUserGetItemSuspense.data.name} />
		<UiButton disabled={mutationUserSave.isPending}>저장</UiButton>
		{responseUserGetItemSuspense.isFetching && <UiRefreshIndicator />}
	</Fragment>
);
```

**Correct (가리지 않으면 외부 SDK가 잘못 초기화되어 이유를 남기고 가림):**

```tsx
// 결제 위젯은 마운트할 때 금액을 한 번만 읽는다. 다시 불러오는 중에 그리면 옛 금액으로 초기화된다
if (responseOrderAmountSuspense.isFetching) {
	return <PgOrderAmountLoadingScreen />;
}

return <PgPaymentWidgetSection amount={responseOrderAmountSuspense.data.confirmedAmount} />;
```

### 7.3 Place Error Boundaries by How Much Should Survive

**Rule:** `R07-03` · `runtime-place-error-boundaries-by-blast-radius`

**Applies when:** 오류 경계를 추가하거나 옮길 때. 화면 본문에 `isError` 분기나 실패 대체 화면 반환을 넣을 때.

**Requires selected:** `runtime-place-suspense-boundaries-at-the-section-owner` · 함께 적용

**Impact: HIGH (쿼리가 실패해도 받을 곳이 있고 화면 본문이 실패 분기로 채워지지 않습니다)**

`Suspense` 쿼리는 실패하면 던집니다.
받을 경계가 없으면 화면 전체가 빈 채로 남습니다.

**자리는 "여기가 죽으면 무엇이 같이 죽는가"로 정합니다.** 세 층을 둡니다.

| 층 | 두는 곳 | 이 층이 잡으면 살아남는 것 |
| --- | --- | --- |
| 앱 | 루트 한 번 | 없음. 마지막 안전망이라 하나는 반드시 둠 |
| 화면 | 라우트 진입 | 내비게이션과 레이아웃 셸 |
| 섹션 | `Suspense` 경계와 같은 소유자 | 같은 화면의 다른 섹션 |

섹션 층은 **그 섹션만 죽어도 나머지가 쓸모 있을 때만** 둡니다.
목록이 실패했는데 옆 필터가 살아 있어도 할 수 있는 게 없으면 화면 층으로 충분합니다.

경계 하나가 로딩과 실패를 함께 맡습니다.
`Suspense`와 오류 경계를 같은 소유자에 두면 대체 화면 두 개가 한 자리에 모입니다.
로딩 경계 자리는 `runtime-place-suspense-boundaries-at-the-section-owner`가 정합니다.

화면 본문에 실패 분기를 남기지 않는 판정은 `runtime-avoid-ad-hoc-loading-branches`가 로딩과 함께 봅니다.

**경계가 못 잡는 것이 있습니다.**
이벤트 핸들러와 비동기 콜백에서 난 오류는 렌더 중에 난 것이 아니어서 경계를 그냥 지나칩니다.
사용자 액션의 실패는 `data-handle-mutation-failure-where-it-is-called`가 정합니다.

라우터가 화면 층 경계를 얹는 API를 제공하면 그것을 쓰고, 없으면 라우트 진입 컴포넌트를 직접 감쌉니다.
어느 쪽이든 경계를 어느 층에 두는지는 위 표가 정합니다.

다시 시도를 열려면 대체 화면에 그 버튼을 두고, React Query의 `QueryErrorResetBoundary`와 함께 씁니다.
경계 안에서 상태를 되살릴 수 없으므로 다시 시도는 하위 트리를 새로 마운트합니다.

**Incorrect (경계 없이 화면 본문에서 실패를 분기):**

```tsx
export const PgProducts = () => {
	const responseProductListSuspense = useProductListSuspense();

	if (responseProductListSuspense.isError) {
		return <UiErrorState />;
	}

	return <UiTable dataSource={responseProductListSuspense.data.products} />;
};
```

**Correct (화면 층 경계가 받고 셸은 살아남음):**

```tsx
// widget/app-shell/wg-app-shell.tsx
export const WgAppShell = (props: WgAppShellProps) => {
	return (
		<div className={clsx("wg_appShell__root")}>
			<WgAppNavigation />

			<main className={clsx("wg_appShell__main")}>
				<ErrorBoundary fallback={<UiScreenErrorState />}>
					<Suspense fallback={<UiScreenSkeleton />}>{props.children}</Suspense>
				</ErrorBoundary>
			</main>
		</div>
	);
};
```

```tsx
// page/products/pg-products.tsx
export const PgProducts = () => {
	/**
	 * 실패하면 셸이 가진 화면 층 경계가 받는다. 본문은 성공 경로만 그린다
	 */
	const responseProductListSuspense = useProductListSuspense();

	return <UiTable dataSource={responseProductListSuspense.data.products} />;
};
```

**Correct (섹션이 따로 죽어도 나머지가 쓸모 있을 때만 섹션 층):**

```tsx
export const PgProducts = () => {
	return (
		<div className={clsx("pg_products__layout")}>
			<PgProductTreeSection />

			{/* 추천 목록이 실패해도 본문 표는 그대로 쓸 수 있다 */}
			<ErrorBoundary fallback={<UiInlineErrorState />}>
				<Suspense fallback={<UiRecommendationSkeleton />}>
					<PgProductRecommendationSection />
				</Suspense>
			</ErrorBoundary>

			<PgProductTableSection />
		</div>
	);
};
```

## 8. State Ownership and Updates

**Impact: HIGH**

상태는 값의 수명과 소유자에 맞는 도구로 고르고, 파생값은 저장하지 않고 렌더에서 계산해야 합니다. 여러 화면이 함께 쓰는 판단만 전역 스토어로 올리고, 이전 상태에 기대는 갱신은 함수형으로 씁니다. 이펙트 콜백은 반응성이 필요한 값만 의존성으로 받아야 합니다.

### 8.1 Calculate Derived Values During Rendering

**Rule:** `R08-01` · `state-calculate-derived-values-during-render`

**Applies when:** 현재 프롭스, 상태, search 파라미터, 응답에서 계산 가능한 값을 별도 상태와 이펙트로 동기화할 때. 파생값 동기화 이펙트를 제거할 때.

**Review with:** `screen-keep-derived-values-close`

**Impact: HIGH (지금 입력으로 구할 수 있는 값을 상태로 두고 이펙트로 맞추지 않습니다)**

현재 프롭스, 상태, search 파라미터, 응답에서 바로 계산할 수 있는 값은
`useEffect`와 `useState`로 다시 동기화하지 않습니다.
렌더 중에 계산하면 추가 렌더와 어긋남이 줄고, 이펙트 의존성도 억지로 늘어나지 않습니다.

파생값은 렌더 중에 만들고 쓰는 자리 가까이에 둡니다.
배치 기준은 `screen-keep-derived-values-close`가 함께 정합니다.

**Incorrect (파생값을 이펙트로 다시 상태에 동기화):**

```ts
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [selectedCount, setSelectedCount] = useState(0);

useEffect(() => {
	setSelectedCount(selectedIds.length);
}, [selectedIds]);
```

**Correct (같은 `selectedIds`에서 렌더 중에 바로 계산):**

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);

return <UiSelectedCountBadge count={selectedIds.length} />;
```

### 8.2 Choose State Tools by Source of Truth

**Rule:** `R08-02` · `state-choose-state-tools-by-source-of-truth`

**Applies when:** 로컬 UI·전역 클라이언트·서버 데이터를 새 상태 도구로 옮길 때. 합성 컴포넌트나 컴포넌트 묶음에 공유 상태를 넣을 때. 서로 다른 진짜 출처 사이에 값을 복제하거나 동기화할 때.

**Review with:** `state-store-derived-authority`, `strategy-choose-single-composition-compound-and-variants`

**Impact: HIGH (로컬 UI 상태, 전역 상태, 서버 상태가 서로 섞이지 않습니다)**

상태 도구는 값의 수명과 소유자를 기준으로 고릅니다.

| 상태의 소유자 | 기본 도구 |
| --- | --- |
| 로컬 UI | `useState` 또는 `useReducer` |
| 한 컴포넌트 묶음 안에서 공유하는 UI | `useState` + `Context` |
| 전역 클라이언트 | `Zustand` |
| 서버 | `@tanstack/react-query` |
| 링크를 공유해도 같은 화면이 열려야 하는 값 | 라우트 search 파라미터 |

이 기준으로 고르면 화면 파일이 더 읽기 쉬워지고 중복 동기화가 줄어듭니다.

표의 마지막 행을 자주 놓칩니다.
목록의 필터, 정렬, 페이지, 고른 행처럼 새로고침·뒤로 가기·링크 공유로 살아남아야 하는 값은
`useState`가 아니라 search 파라미터가 소유합니다.
열림과 닫힘, 마우스 올림, 입력 중인 임시 값은 주소에 올리지 않습니다.
search 파라미터를 `useState`로 복제해 출처를 둘로 만들지 않습니다.

`Context`는 전역 상태 도구가 아니라 **한 컴포넌트 묶음 안에서 프롭 전달을 줄이는 수단**입니다.
합성 컴포넌트가 부품끼리 상태를 나눠 쓸 때, 작은 컴포넌트 묶음이 두세 단계 아래로 값을 내릴 때 씁니다.
`strategy-choose-single-composition-compound-and-variants`가 상태가 있는 합성으로 확장하라고 할 때
그 상태를 담는 자리가 여기입니다.

- 값의 출처는 여전히 `useState`입니다.
  `Context`는 그 값을 아래로 나르는 수단일 뿐입니다.
- 묶음 밖에서도 필요해지면 `Context`를 위로 올리지 않고 전역 스토어로 옮깁니다.
  묶음 밖의 화면이나 레이아웃이 같은 값을 읽거나 바꾸면 옮길 때입니다.
  탭 `selectedId`처럼 파생이 아닌 공유 UI 상태도 이 기준으로 봅니다.

프로젝트가 이미 다른 전역 스토어나 서버 상태 도구를 표준으로 쓴다면 그것을 유지합니다.
`Zustand`나 `react-query`를 새로 들여오지 말고 진짜 출처 원칙만 지킵니다.

**Incorrect (서버 상태를 로컬 상태로 복제):**

```ts
const responseUserGetItemSuspense = useUserGetItemSuspense();
const [userName, setUserName] = useState(responseUserGetItemSuspense.data.name);
```

**Correct (도구를 진짜 출처에 맞춤):**

```ts
const [isOpen, setIsOpen] = useState(false);
const themeStore = useThemeStore();

/**
 * 사용자 상세 조회 API
 */
const responseUserGetItemSuspense = useUserGetItemSuspense();
```

**Correct (합성 컴포넌트 안에서 부품끼리 나눠 쓰는 상태는 `Context`로 내려보냄):**

```tsx
/**
 * 탭 부품끼리 나눠 쓰는 값
 */
interface UiTabsContextValue {
	/**
	 * 지금 열린 탭 식별자
	 */
	selectedId: string;
	/**
	 * 탭을 고를 때
	 */
	onSelect: (id: string) => void;
}

const UiTabsContext = createContext<UiTabsContextValue | null>(null);

/**
 * 탭 묶음 루트 입력 계약
 */
interface UiTabsRootProps {
	/**
	 * 처음 열어 둘 탭 식별자
	 */
	defaultId: string;
	/**
	 * 탭 목록과 패널 부품
	 */
	children: ReactNode;
}

export const UiTabsRoot = (props: UiTabsRootProps) => {
	const [selectedId, setSelectedId] = useState(props.defaultId);

	return <UiTabsContext value={{ selectedId, onSelect: setSelectedId }}>{props.children}</UiTabsContext>;
};
```

### 8.3 Store Shared Derived Decisions Only When They Are Truly Shared

**Rule:** `R08-03` · `state-store-derived-authority`

**Applies when:** 여러 화면·메뉴·라우트 가드가 쓰는 접근 권한 같은 파생 판단을 스토어에 저장·동기화할 때. 단일 화면에서만 쓰는 값까지 스토어로 올리려 할 때.

**Review with:** `docs-require-jsdoc-on-key-declarations`, `state-calculate-derived-values-during-render`

**Impact: HIGH (같은 도메인 판별 로직이 여러 화면에 퍼지지 않습니다)**

여러 화면, 메뉴, 라우트 가드에서 반복해서 필요한 파생 판단만 스토어로 올립니다.
단일 화면에서 한두 번 읽는 쿼리 필드까지 스토어로 복제하지 않습니다.

스토어에 올리기로 했다면 문자열 비교나 도메인 판별은 초기화나 레이아웃 같은 한 경계에만 모으고,
화면은 `accessStore.canEditRecord` 같은 결과만 참조합니다.
쿼리에는 `onSuccess` 같은 성공 콜백이 없어서 스토어를 채우는 일은 이펙트가 맡습니다.
소유자가 분명한 경계에서만 `useEffect`로 채우고, 그 근거는
`typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 주석으로 남깁니다.

여러 소유자가 읽는 판단을 한 경계에서 채우는 것은 `state-calculate-derived-values-during-render`의 예외입니다.
같은 판별을 화면마다 되풀이하지 않으려면 한 곳에서 한 번은 채워야 합니다.

채우는 이펙트가 스토어에서 꺼내 쓸 것은 스토어 객체가 아니라 `set` 함수입니다.
선택자로 그 함수만 꺼내고, 값 의존성은 평소대로 적습니다.
스토어 전체를 넣으면 `set`이 상태를 바꿀 때 참조가 달라져 이펙트가 다시 실행됩니다.

**Incorrect (스토어 전체를 의존성에 넣어 갱신이 이펙트를 다시 돌리고 단일 화면용 값까지 복제):**

```ts
const accessStore = useAccessStore();
const canEditRecord = responseRecordGetItemSuspense.data.ownerId === currentUserId;

useEffect(() => {
	accessStore.setCanEditRecord(canEditRecord);
}, [accessStore, canEditRecord]);
```

**Correct (화면은 스토어에 채워진 결과만 참조):**

```ts
const accessStore = useAccessStore();

if (accessStore.canEditRecord) {
	// ...
}
```

**Correct (소유자가 분명한 한 경계에서만 채우고 의존성에는 `set` 함수만 넣음):**

```ts
/**
 * bootstrap capability 응답을 access store에 동기화
 */
const setCapabilities = useAccessStore((state) => state.setCapabilities);

useEffect(() => {
	setCapabilities(responseAccessBootstrapSuspense.data.capabilities);
}, [setCapabilities, responseAccessBootstrapSuspense.data]);
```

### 8.4 Use Functional setState Updates When Based on Previous State

**Rule:** `R08-04` · `state-use-functional-setstate-updates`

**Applies when:** 다음 상태가 현재 상태에 의존하는 갱신을 추가·변경할 때. 핸들러·비동기 콜백·연속 호출에서 `setState` 방식을 바꿀 때.

**Impact: HIGH (다음 값이 현재 상태에 달려 있을 때 낡은 값을 붙잡는 버그를 막습니다)**

다음 상태가 현재 상태 값에 의존하면 바깥 변수를 직접 읽지 않고 함수형 업데이터를 씁니다.

실제로 결과가 갈리는 자리는 셋입니다.

- 한 이벤트 안에서 같은 상태를 두 번 이상 갱신할 때
- `await` 뒤에 갱신할 때
- 구독이나 타이머처럼 오래 사는 클로저 안에서 갱신할 때

클릭 핸들러에서 한 번만 부르는 갱신은 두 형태가 같은 결과를 냅니다.
그 렌더의 클로저가 읽는 값이 아직 최신 커밋 값이기 때문입니다.
그래도 형태를 하나로 고정해 자리마다 다시 판단하지 않습니다.

**Incorrect (현재 상태를 바깥 클로저에서 직접 읽음):**

```tsx
// 한 이벤트에서 두 번 갱신한다. 둘 다 같은 렌더의 selectedUserIds를 읽어 첫 갱신이 지워진다
const handleSelectRange = (fromUserId: string, toUserId: string) => {
	setSelectedUserIds([...selectedUserIds, fromUserId]);
	setSelectedUserIds([...selectedUserIds, toUserId]);
};
```

**Correct (함수형 업데이터로 항상 최신 상태를 기준으로 갱신):**

```tsx
const handleSelectRange = (fromUserId: string, toUserId: string) => {
	// 두 번째 갱신이 첫 갱신 결과를 받아야 해서 함수형 업데이터를 쓴다
	setSelectedUserIds((currentUserIds) => [...currentUserIds, fromUserId]);
	setSelectedUserIds((currentUserIds) => [...currentUserIds, toUserId]);
};
```

### 8.5 Use useEffectEvent for Non-reactive Effect Callbacks

**Rule:** `R08-05` · `state-use-effectevent-for-non-reactive-effect-callbacks`

**Applies when:** 구독 이펙트가 최신 프롭·상태 콜백을 읽어야 할 때. ref 동기화 우회, 의존성 재설치, `useEffectEvent`를 추가·변경할 때.

**Review with:** `docs-require-jsdoc-on-key-declarations`, `events-curry-extra-handler-arguments`, `events-run-user-actions-in-handlers-not-effects`

**Impact: MEDIUM-HIGH (핸들러 로직은 최신으로 읽고 이펙트는 실제 구독에만 반응합니다)**

이펙트 안에서 최신 프롭이나 상태를 읽어야 하는데 그 값이 바뀔 때마다 구독을 다시 설치하면 안 됩니다.
이때 `ref` 우회 대신 `useEffectEvent`를 씁니다.

이벤트 핸들러를 이펙트로 옮기라는 뜻이 아닙니다.
실제 구독·연결 이펙트 안에서만 쓰고, 클릭·제출 같은 사용자 액션은 이름 붙인 핸들러에 둡니다.

`useEffectEvent`는 리액트 19.2 이상에만 있습니다.
그보다 낮으면 이 규칙을 적용하지 않고, 아래 Incorrect의 `ref` 동기화가 유일한 대안입니다.

린터 버전도 함께 확인합니다.
리액트 19.2 문서는 `eslint-plugin-react-hooks`를 최신 버전으로 올리라고 요구하고,
`typescript/tooling-configure-biome-to-enforce-these-rules`가 설정하는 `biome`도
최근 버전에서야 `useEffectEvent`를 인식합니다.
낡은 버전에서는 아래 Correct 예제가 훅 규칙 위반으로 표시됩니다.

`useEffectEvent`로 감싼 콜백에는 DOM 이벤트 매개변수나 커링을 덧붙이지 않습니다.
그래서 `typing-take-handler-types-from-existing-contracts`의 리액트 핸들러 타입 규칙은 이 자리에 적용하지 않습니다.
이펙트 안에서만 부르는 콜백이고 JSX 이벤트 프롭에 전달되지 않기 때문입니다.

**Incorrect (최신 콜백을 위해 `ref`를 수동 동기화):**

```tsx
const onMessageRef = useRef(onMessage);

useEffect(() => {
	onMessageRef.current = onMessage;
}, [onMessage]);

useEffect(() => {
	const unsubscribe = socket.subscribe((message) => {
		onMessageRef.current(message);
	});

	return unsubscribe;
}, [socket]);
```

**Correct (non-reactive 콜백은 `useEffectEvent`로 분리):**

```tsx
/**
 * socket message 수신 시 최신 onMessage 로직 실행
 */
const handleMessage = useEffectEvent((message: SocketMessage) => {
	onMessage(message);
});

/**
 * socket subscription lifecycle 유지
 */
useEffect(() => {
	const unsubscribe = socket.subscribe((message) => {
		handleMessage(message);
	});

	return unsubscribe;
}, [socket]);
```

## 9. Events and Interaction Flow

**Impact: HIGH**

이벤트 핸들러는 이름이 예측 가능하고 추가 인자를 커링으로 넘겨야 하며, 사용자 액션은 이펙트가 아니라 핸들러에서 실행해야 합니다. 핸들러 흐름은 재사용 근거가 생길 때까지 그 자리에 둡니다.

### 9.1 Name Handlers Predictably

**Rule:** `R09-01` · `events-name-handlers-predictably`

**Applies when:** 이벤트 핸들러를 새로 만들 때. 핸들러 이름이나 대상, 이벤트 표기를 바꿀 때.

**Review with:** `events-curry-extra-handler-arguments`, `typescript/naming-use-consistent-file-and-symbol-naming`

**Impact: MEDIUM (이벤트 흐름을 이름으로 검색할 수 있습니다)**

이벤트 핸들러는 `handle` 접두사와 역할명을 씁니다.

| 상황 | 이름 |
| --- | --- |
| DOM 이벤트 | `handle + Target + Event` |
| 그 동작을 일으키는 요소가 컴포넌트에 하나뿐일 때 | `handle + DomainAction` |

- `on*`은 프롭 이름입니다.
  구현에는 쓰지 않습니다.
  `onClick`을 받아 처리하는 함수는 `handleRowClick`입니다.
- 같은 컴포넌트에 같은 이름의 핸들러를 두지 않습니다.
  대상이 다르면 대상 이름을 넣습니다.
- 추가 인자를 어떻게 넘길지는 `events-curry-extra-handler-arguments`가 정합니다.

**Incorrect (구현에 `on*`을 쓰고 대상이 이름에 없어 같은 이름이 겹침):**

```ts
import type {MouseEvent} from "react";

// 목록 항목과 저장 버튼 둘 다 클릭을 받는데 이름에 대상이 없어 뒤에 번호가 붙었다
const onClick = (event: MouseEvent<HTMLLIElement>) => {
	toggleSelection();
};

const onClick2 = (event: MouseEvent<HTMLButtonElement>) => {
	event.preventDefault();
};
```

**Correct (`handle` 접두사와 대상·이벤트가 드러나는 이름):**

```ts
import type {MouseEventHandler} from "react";

/**
 * 이미 고른 항목을 다시 누르면 선택을 해제한다
 */
const handleListItemClick: MouseEventHandler<HTMLLIElement> = (_event) => {
	toggleSelection();
};

/**
 * 폼 기본 제출을 막는다. 저장은 mutation 콜백이 이어서 한다
 */
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
	event.preventDefault();
};
```

### 9.2 Curry Extra Arguments Into DOM Event Handlers

**Rule:** `R09-02` · `events-curry-extra-handler-arguments`

**Applies when:** DOM 이벤트 프롭에 추가 인자를 넘기는 핸들러를 추가·변경할 때. 인라인 래퍼로 인자를 넘기던 자리를 바꿀 때. 제외: 이벤트 객체를 받지 않는 프롭 콜백인 경우.

**Requires selected:** `typing-take-handler-types-from-existing-contracts` · 함께 적용

**Review with:** `composition-named-handlers-over-inline`

**Impact: LOW (JSX에 인자만 넘기려고 만든 래퍼 화살표가 쌓이지 않습니다)**

`onClick`, `onChange`처럼 이벤트 객체를 받는 자리에 추가 인자가 필요하면
팩토리가 인자를 받고 안쪽 함수가 이벤트를 받습니다.
반환값을 JSX에 그대로 전달합니다.
`onClick={() => handleSelectionToggle(id)}`처럼 감싸는 화살표를 만들지 않습니다.

- 팩토리 이름은 안쪽 핸들러 이름 뒤에 커링으로 받는 값을 붙여 짓습니다.
  `handleListItemClick`은 이벤트만 받는 핸들러이고,
  그것을 만드는 팩토리는 `handleListItemClickWithProductId`입니다.
- 팩토리 반환 타입은 `typing-take-handler-types-from-existing-contracts`를 따라 리액트 별칭으로 고정합니다.
- 이벤트 객체를 받지 않는 프롭 콜백은 대상이 아닙니다.
  `(id) => void` 계약이면 이름 붙인 핸들러를 그대로 넘깁니다.
- `useEffectEvent`로 만든 함수에는 DOM 이벤트 매개변수나 커링을 덧붙이지 않습니다.

**Incorrect (인라인 래퍼로 인자를 넘김):**

```tsx
const handleSelectionToggle = (id: string) => {
	toggleSelection(id);
};

<li onClick={() => handleSelectionToggle(product.id)} />;
```

**Correct (추가 인자는 바깥 함수, 이벤트는 안쪽 함수):**

```tsx
import type {MouseEventHandler} from "react";

/**
 * 클릭한 항목을 이벤트 대신 팩토리 인자로 받아 어느 product인지 알아낸다
 */
const handleListItemClickWithProductId =
	(productId: string): MouseEventHandler<HTMLLIElement> =>
	(_event) => {
		toggleSelection(productId);
	};
```

```tsx
<li onClick={handleListItemClickWithProductId(product.id)} />;
```

### 9.3 Run User Actions in Handlers, Not Effects

**Rule:** `R09-03` · `events-run-user-actions-in-handlers-not-effects`

**Applies when:** 제출, 저장, 삭제, 닫기 같은 한 번뿐인 사용자 액션을 핸들러와 상태+이펙트 사이에서 옮길 때. 이펙트 안에서 뮤테이션이나 화면 이동을 호출하는 코드를 넣을 때.

**Impact: HIGH (한 번뿐인 동작을 상태와 이펙트 재실행으로 대신하지 않습니다)**

제출, 저장, 삭제, 닫기 같은 사용자 액션은 해당 핸들러 안에서 바로 실행합니다.
액션 자체를 상태로 올린 뒤 `useEffect`가 나중에 실행하게 만들면 무관한 의존성 변화에도 재실행되기 쉽고,
흐름도 읽기 어려워집니다.

**Incorrect (사용자 액션을 상태 + 이펙트로 모델링):**

```tsx
const [shouldSubmit, setShouldSubmit] = useState(false);

useEffect(() => {
	if (!shouldSubmit) {
		return;
	}

	mutationProductCreate.mutate({data: toProductCreateRequest(formValues)});
}, [mutationProductCreate, formValues, shouldSubmit]);

const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	setShouldSubmit(true);
};
```

**Correct (사용자 액션은 핸들러 안에서 바로 수행):**

```tsx
/**
 * 생성에 성공하면 목록으로 돌아간다. 이 흐름은 화면 이동까지 한 번에 끝난다
 */
const mutationProductCreate = useProductCreate({
	mutation: {
		onSuccess: () => {
			void navigate({to: "/products"});
		},
	},
});

/**
 * 버튼을 누른 그 자리에서 생성을 부른다. 상태로 올려 이펙트가 대신 부르게 하지 않는다
 */
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	mutationProductCreate.mutate({data: toProductCreateRequest(formValues)});
};
```

## 10. Render Performance

**Impact: MEDIUM**

메모이제이션은 확인한 이유가 있을 때만 손댑니다. 실제로 무거운 초기화와 갱신만 초기화 함수, 전환, 지연 값으로 미룹니다.

### 10.1 Do Not Memoize Without a Confirmed Reason

**Rule:** `R10-01` · `perf-avoid-defensive-memoization`

**Applies when:** `useMemo`·`useCallback`을 추가하거나 제거할 때. 참조 동일성·실측 병목·무거운 지연 계산을 이유로 수동 메모이제이션을 검토할 때.

**Review with:** `perf-defer-heavy-renders-with-measured-evidence`

**Impact: MEDIUM (효과를 확인하지 않은 방어적 `useMemo`, `useCallback`을 막습니다)**

`useMemo`와 `useCallback`은 기본적으로 쓰지 않습니다.
쓰는 경우는 다음 셋뿐입니다.
어느 경우든 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 이유를 남깁니다.

- 외부 라이브러리가 참조 동일성에 민감할 때
- 이펙트 의존성으로 들어가는 객체나 배열이어서 감싸지 않으면 이펙트가 매 렌더 다시 돌 때
- 병목이 실제로 측정됐을 때

이펙트 의존성을 이유로 감쌀 때는 성능이 아니라 정합성 때문입니다.
객체와 배열은 렌더마다 새 참조라 의존성 비교가 늘 어긋납니다.

`perf-defer-heavy-renders-with-measured-evidence`를 따라 지연 값 기준으로 다시 계산하는 자리는
측정 사유에 듭니다.

리액트 컴파일러를 켜지 않은 프로젝트도 같습니다.
"컴파일러가 없으니 다 감싼다"는 이유는 이 셋에 없습니다.
자리마다 위 셋 중 하나가 있어야 합니다.

**Incorrect (단순 가공을 관성적으로 메모이제이션):**

```ts
const columns = useMemo(() => toTableColumns(response.data.columns), [response.data.columns]);
```

**Correct (근거가 없으면 감싸지 않고 그대로 계산):**

```ts
const columns = toTableColumns(response.data.columns);
```

**Correct (외부 패키지 제약을 가리키는 근거를 적고 사용):**

```ts
// ag-grid는 columnDefs 참조가 바뀌면 컬럼 폭·정렬 상태를 초기화한다. 참조를 고정해야 한다.
const columns = useMemo(() => toTableColumns(response.data.columns), [response.data.columns]);
```

**Correct (이펙트 의존성이라 참조를 고정):**

```ts
// 이 배열이 매 렌더 새 참조면 아래 이펙트가 매번 다시 구독한다.
const watchedProductIds = useMemo(
	() => responseProductListSuspense.data.products.map((product) => product.id),
	[responseProductListSuspense.data.products],
);

useEffect(() => {
	return subscribeToProductChanges(watchedProductIds);
}, [watchedProductIds]);
```

### 10.2 Use Lazy State Initializers for Expensive Defaults

**Rule:** `R10-02` · `perf-use-lazy-state-initializers-for-expensive-defaults`

**Applies when:** `useState` 초기값에 `localStorage` 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용이 큰 계산을 넣을 때. 제외: 숫자·문자열 같은 단순 값이나 프롭을 그대로 초기값에 넣는 경우.

**Review with:** `perf-avoid-defensive-memoization`

**Impact: MEDIUM (초기 상태 계산이 무거울 때 준비 작업이 렌더마다 되풀이되지 않습니다)**

`useState` 초기값이 `localStorage` 파싱, 인덱스 생성,
큰 배열 정규화처럼 무거운 계산이라면 값을 바로 넣지 말고 초기화 함수로 감쌉니다.
숫자나 문자열 같은 단순 값이나 프롭을 그대로 넘기는 자리는 감싸지 않습니다.

**Incorrect (비싼 초기화가 렌더마다 다시 평가됨):**

```tsx
const [searchIndex] = useState(toSearchIndex(productList));
const [draftFilter] = useState(JSON.parse(localStorage.getItem("product-filter") ?? "{}"));
```

**Correct (비싼 초기화는 최초 렌더에서만 수행):**

```tsx
const [searchIndex] = useState(() => toSearchIndex(productList));
const [draftFilter] = useState(() => JSON.parse(localStorage.getItem("product-filter") ?? "{}"));
```

### 10.3 Defer Heavy Renders Only With Measured Evidence

**Rule:** `R10-03` · `perf-defer-heavy-renders-with-measured-evidence`

**Applies when:** `startTransition`·`useTransition`·`useDeferredValue`를 추가·삭제할 때. 목록이나 표가 커져 입력 반응이 늦다는 보고를 받았을 때.

**Review with:** `perf-avoid-defensive-memoization`

**Impact: MEDIUM (무겁다고 짐작해서 전환과 지연 값으로 감싸지 않고 실제로 무거운 자리만 미룹니다)**

렌더를 미루는 도구는 `startTransition`, `useTransition`, `useDeferredValue`입니다.
**먼저 미룰 만큼 무거운지 확인합니다.**

`perf-avoid-defensive-memoization`이 메모이제이션에 요구하는 것과 같은 근거가 필요합니다.
목록이 몇 줄인지, 어느 조작이 몇 밀리초 걸렸는지 확인한 뒤에 씁니다.
"목록이 커질 것 같아서"는 근거가 아닙니다.

미루기로 했으면 원인이 어디에 있느냐에 따라 도구가 갈립니다.

| 원인 | 쓰는 것 |
| --- | --- |
| 내가 부르는 `setState`가 무거운 렌더를 일으킴 | `startTransition`으로 그 호출을 감쌉니다 |
| 값은 즉시 반응해야 하는데 그 값에서 파생되는 렌더가 무거움 | `useDeferredValue`로 한 박자 지연 값을 만듭니다 |

`set` 함수가 내 것이 아니면 `startTransition`을 쓸 수 없습니다.
그때는 `useDeferredValue`입니다.

- 입력값 자체, 폼 오류, 즉시 비활성화처럼 급한 반응은 전환에 넣지 않습니다.
- `startTransition`은 대기 상태를 알려 주지 않습니다.
  진행 표시가 필요하면 `useTransition`의 `isPending`을 씁니다.
- `await` 뒤에 상태를 갱신하면 그 갱신을 다시 `startTransition`으로 감쌉니다.
  `await` 뒤에는 전환 범위가 끊깁니다.
  리액트가 비동기 문맥을 이어가지 못하기 때문입니다.
- 무거운 하위 트리의 렌더를 늦추려면 지연 값을 받는 컴포넌트가 `memo`여야 합니다.
  `memo`가 아니면 부모가 다시 렌더할 때 그 트리도 함께 다시 렌더합니다.
- 무거운 것이 하위 트리 렌더가 아니라 계산이면 `memo`가 필요 없습니다.
  `useMemo`가 지연 값에서만 다시 계산하므로 급한 입력 렌더는 그 계산을 건너뜁니다.
- 지연 값 기준 재계산에 `useMemo`를 함께 쓰는 것은 `perf-avoid-defensive-memoization`의 허용 사유에 듭니다.
  그때도 측정한 근거를 주석으로 남깁니다.

**Incorrect (행 20개 목록을 다시 그리는 갱신까지 전환으로 감쌈):**

```tsx
const [selectedTagId, setSelectedTagId] = useState("all");
const tagRows = responseTagListSuspense.data.tags.slice(0, 20);

const handleTagClick = (nextTagId: string) => {
	startTransition(() => {
		setSelectedTagId(nextTagId);
	});
};

return <UiTagRows rows={tagRows} selectedTagId={selectedTagId} />;
```

**Incorrect (입력과 무거운 파생 렌더를 같은 값에 묶음):**

```tsx
const [keyword, setKeyword] = useState("");
const filteredRows = rows.filter((row) => fuzzyMatchRow(row, keyword));
```

**Correct (측정 근거가 있는 갱신만 전환으로 감싸고 행 20개 목록은 그대로 둠):**

```tsx
const handleTagClick = (nextTagId: string) => {
	setSelectedTagId(nextTagId);
};

const handleStatusFilterChange = (nextStatus: ProductStatusFilter) => {
	// 행 12,000개에서 필터 전환에 320ms가 걸려 클릭이 밀렸다.
	startTransition(() => {
		setStatusFilter(nextStatus);
	});
};
```

**Correct (입력은 즉시 반응하고 무거운 파생 계산만 늦춤):**

```tsx
const [keyword, setKeyword] = useState("");
const deferredKeyword = useDeferredValue(keyword);

// 행 12,000개에서 매 렌더 필터링이 180ms로 측정됐다. 늦춘 검색어에만 다시 계산한다.
const filteredRows = useMemo(() => {
	return rows.filter((row) => fuzzyMatchRow(row, deferredKeyword));
}, [deferredKeyword, rows]);

return <PgProductRows rows={filteredRows} />;
```

## 11. Accessibility

**Impact: HIGH**

누르고 입력하는 요소는 스크린 리더와 테스트가 이름으로 찾을 수 있어야 합니다. 보이는 글자가 곧 그 이름이고, 글자가 없으면 대체 이름을 따로 답니다.

### 11.1 Give Interactive Elements an Accessible Name

**Rule:** `R11-01` · `a11y-give-interactive-elements-an-accessible-name`

**Applies when:** 클릭이나 입력을 받는 요소를 새로 만들 때. 글자 없이 아이콘만 있는 버튼을 추가할 때.

**Impact: HIGH (스크린 리더와 테스트가 요소를 이름으로 찾을 수 있습니다)**

클릭이나 입력을 받는 요소는 접근 가능한 이름을 갖습니다.

| 요소 | 이름을 붙이는 방법 |
| --- | --- |
| 글자가 들어 있는 버튼 | 그 글자가 이름입니다. 따로 붙이지 않습니다 |
| 아이콘만 있는 버튼 | `aria-label`로 붙입니다 |
| 입력 | `<label htmlFor>`로 잇습니다. 라벨을 안 보이게 할 때만 `aria-label`을 씁니다 |

누르는 것은 `button`으로 만듭니다.
`div`나 `span`에 `onClick`을 달면 키보드로 못 누르고 이름도 안 생깁니다.
누르면 이동하는 것은 `a`나 라우터 링크입니다.

이름은 화면에 보이는 글자와 같게 씁니다.
보이는 글자와 `aria-label`이 다르면 음성으로 조작하는 사용자가 부르는 이름과 화면이 어긋납니다.

`aria-*`를 스타일 훅으로 쓰지 않습니다.
`css/selector-use-pseudo-classes-for-dom-owned-states`가 그 자리를 정합니다.

이 이름은 테스트가 요소를 찾는 근거이기도 합니다.
`getByRole`이나 `getByLabel`로 요소를 찾으려면 이름이 있어야 합니다.
이름이 없으면 테스트가 클래스나 DOM 순서를 붙잡게 되고, 그건 마크업을 고칠 때마다 깨집니다.

포커스를 어디로 옮길지는 이 규칙이 정하지 않습니다.

**Incorrect (누르는 `div`와 이름 없는 아이콘 버튼):**

```tsx
<Fragment>
	<div className={clsx("pg_products__filterToggle")} onClick={handleFilterToggleClick}>
		<UiFilterIcon />
	</div>

	<input value={props.keyword} onChange={props.onKeywordChange} />
</Fragment>
```

**Correct (`button`으로 만들고 이름을 붙임):**

```tsx
<Fragment>
	<button
		type="button"
		className={clsx("pg_products__filterToggle")}
		aria-label="필터 열기"
		onClick={handleFilterToggleClick}
	>
		<UiFilterIcon />
	</button>

	<label className={clsx("pg_products__keywordLabel")} htmlFor="product-keyword">
		검색어
	</label>
	<input id="product-keyword" value={props.keyword} onChange={props.onKeywordChange} />
</Fragment>
```

## 12. Documentation and Comments

**Impact: MEDIUM**

문서 주석의 형식과 태그, 그리고 어느 선언에 붙일지의 기본 목록은 동반 스킬인 `convention-typescript`가 정합니다. 여기서는 그 목록에 리액트만 아는 대상을 더합니다.

### 12.1 Require Doc Comments on React Hooks, Handlers, and Key Declarations

**Rule:** `R12-01` · `docs-require-jsdoc-on-key-declarations`

**Applies when:** 쿼리·뮤테이션이나 읽어도 의도가 안 보이는 핸들러·이펙트를 추가·변경할 때. 내보낸 보조 함수·훅·스토어 선언을 추가·변경할 때.

**Requires selected:** `typescript/docs-require-header-jsdoc-on-key-declarations` · 함께 적용

**Review with:** `typescript/types-document-custom-types-and-shapes`

**Impact: MEDIUM (리액트에만 있는 경계 선언을 동반 스킬 목록에 더해 빠뜨리지 않습니다)**

문서 주석은 경계를 설명할 때만 붙입니다.
코드만 봐도 아는 지역 변수에는 강제하지 않습니다.

`type`과 `interface` 문서화는 `typescript/types-document-custom-types-and-shapes`가 정합니다.
내보냈는지와 무관하게 그 규칙을 따르고, 여기서 다시 판정하지 않습니다.

필수 대상은 `typescript/docs-require-header-jsdoc-on-key-declarations`가 정한 목록에 다음 셋을 더한 것입니다.

- 합성 컴포넌트의 공개 부품
- 정리 함수가 있거나 의존성이 둘 이상인 `useEffect`
- 화면 이동이나 쿼리 무효화를 하는 이벤트 핸들러.
  동작이 그 하나뿐이어도 대상입니다.

쿼리·뮤테이션 바인딩, 핸들러, 내보낸 보조 함수와 훅, 스토어 선언에 붙이는 기준은
`typescript/docs-require-header-jsdoc-on-key-declarations`가 정한 것을 그대로 씁니다.
여기서 다시 정하지 않습니다.

합성 공개 부품의 설명을 어디 두는지는
`composition-declare-props-interface-above-the-component`가 정합니다.

규칙이 허용한 예외에 붙이는 근거 주석은
`typescript/docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.

형식과 태그 기준은 `typescript/docs-write-doc-comments-as-multiline-blocks`가 정합니다.

**Incorrect (읽어도 의도가 안 보이는 경계 선언에 설명이 없음):**

```ts
const handleRemoveProductButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	if (!selectedProduct) {
		return;
	}

	await mutationProductRemove.mutateAsync({ params: { productId: selectedProduct.id } });
};

useEffect(() => {
	resetForm(userData);
}, [userData, resetForm]);
```

**Correct (선언 의도를 바로 위에 여러 줄 블록으로 문서화):**

```ts
/**
 * product 삭제 API
 */
const mutationProductRemove = useProductRemove();

/**
 * 선택된 product 삭제와 다음 화면 이동 처리
 */
const handleRemoveProductButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	if (!selectedProduct) {
		return;
	}

	await mutationProductRemove.mutateAsync({ params: { productId: selectedProduct.id } });
};

/**
 * 사용자 데이터 변경 시 폼 상태 동기화
 */
useEffect(() => {
	resetForm(userData);
}, [userData, resetForm]);

/**
 * product 저장 요청 payload 생성
 */
export const toProductSaveRequest = (formValues: ProductFormValues) => {
	return {
		title: formValues.title.trim(),
	};
};
```

## 13. Tooling

**Impact: MEDIUM**

리액트 전용 검사 중 `biome`이 잡을 수 있는 것은 도메인 설정으로 고정하고, 잡을 수 없는 것은 리뷰가 담당한다는 것을 명시해야 사람이 검사할 목록이 좁아집니다.

### 13.1 Enable the Biome React Domain

**Rule:** `R13-01` · `tooling-enable-the-biome-react-domain`

**Applies when:** 프로젝트에 `biome` 설정을 처음 넣거나 lint 규칙을 바꿀 때. `biome.json`의 `linter.domains`나 `linter.rules`에 항목을 추가·삭제할 때.

**Impact: MEDIUM (리액트 전용 검사를 기계가 맡아 리뷰는 판단이 필요한 규칙만 봅니다)**

`biome` 2.x에는 **도메인**이 있습니다.
`linter.domains`에 `react`를 켜면 `package.json`에 `react@>=16`이 있을 때만 리액트 검사가 붙습니다.
`typescript/tooling-configure-biome-to-enforce-these-rules`가 세우는 설정 위에 이 항목을 더합니다.

| `biome` 규칙 | 담당 컨벤션 |
| --- | --- |
| `correctness/noNestedComponentDefinitions` | `react/composition-do-not-define-components-inside-components` |
| `correctness/useExhaustiveDependencies` | `react/state-use-effectevent-for-non-reactive-effect-callbacks`의 의존성 |
| `correctness/useJsxKeyInIterable` | `react/composition-name-fragments-explicitly`의 `key` |
| `a11y/*` 묶음 | `react/a11y-give-interactive-elements-an-accessible-name`의 일부 |
| `style/noRestrictedImports`의 `../` 패턴 | `react/ownership-keep-component-imports-flowing-downward`의 `../` 금지 |

`noNestedComponentDefinitions`는 도메인의 `recommended`에 없어 따로 켭니다.
`react/composition-do-not-define-components-inside-components`와 판정 대상이 같아 이 규칙을 통째로 기계에 넘깁니다.

`a11y` 묶음은 도메인이 아니라 `preset: "recommended"`가 이미 켭니다.
`useButtonType`, `useAltText`, `useValidAnchor`, `useKeyWithClickEvents`, `useSemanticElements`가 그것입니다.
접근 가능한 이름을 실제로 붙였는지는 기계가 못 보고 리뷰가 봅니다.

`typescript/tooling-configure-biome-to-enforce-these-rules`가 세운 `noRestrictedImports`에 패턴 하나를 더합니다.
`../**`를 막고 `function`, `type`, `config`, `hook` 폴더만 부정 패턴으로 되돌리는 항목입니다.
되돌리는 넷은 `ownership-keep-component-imports-flowing-downward`가 예외로 두는 역할 폴더입니다.
`@/page/**` 패턴과 같은 배열에 나란히 두면 절대경로와 상대경로 양쪽이 한 규칙으로 막힙니다.

기계가 끝까지 못 가는 자리가 있습니다.
아래 항목은 리뷰가 봅니다.

- 형제 가져오기는 어떤 설정으로도 못 잡습니다.
  `./pg-summary-band`는 소유자가 쓰는 정당한 경로와 문자열이 같습니다.
  `ownership-keep-component-imports-flowing-downward`의 형제 금지는 리뷰가 봅니다.
- `useExhaustiveDependencies`는 의존성 배열이 빠졌는지만 봅니다.
  그 콜백을 `useEffectEvent`로 감싸야 하는지는 리뷰가 봅니다.
- `useJsxKeyInIterable`은 `key`가 있는지만 봅니다.
  `<>` 대신 `Fragment`를 썼는지는 리뷰가 봅니다.

따로 켜지 않는 규칙이 둘 있습니다.

- `style/useFragmentSyntax`는 조각을 `<>`로 바꾸라고 합니다.
  `recommended`에 없어 따로 켜야 하는데, 켜지 않습니다.
  `react/composition-name-fragments-explicitly`가 `Fragment`를 쓰라고 정하기 때문입니다.
- `nursery/useReactFunctionComponents`는 도메인 `all`에만 있습니다.
  `nursery`는 규칙이 바뀔 수 있어 켜지 않습니다.

**Incorrect (도메인을 켜지 않아 리액트 검사가 통째로 빠짐):**

```json
{
	"linter": {
		"enabled": true,
		"rules": {"preset": "recommended"}
	}
}
```

**Correct (도메인을 켜고 `all`에만 있는 항목과 `../` 패턴을 따로 적음):**

```json
{
	"linter": {
		"enabled": true,
		"domains": {"react": "recommended"},
		"rules": {
			"preset": "recommended",
			"correctness": {"noNestedComponentDefinitions": "error"},
			"style": {
				"noRestrictedImports": {
					"level": "error",
					"options": {
						"patterns": [
							{"group": ["@/page/**"], "message": "화면 내부는 절대경로로 가져오지 않습니다."},
							{
								"group": ["../**", "!../**/function/**", "!../**/type/**", "!../**/config/**", "!../**/hook/**"],
								"message": "컴포넌트는 `../`로 가져오지 않습니다."
							}
						]
					}
				}
			}
		}
	}
}
```

## 참고 자료

- https://react.dev
- https://tanstack.com/query/latest
- https://zustand.docs.pmnd.rs

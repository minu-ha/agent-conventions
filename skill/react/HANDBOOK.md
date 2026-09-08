# React 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 9월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.companions`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=react`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 React 코딩 컨벤션입니다. `ui`·`widget`·`page` 세 레이어의 소유 경계, 컴포넌트 조립, 핸들러와 프롭 계약, 서버 데이터와 상태의 출처, 렌더와 이펙트의 수명, 성능 판단과 문서화를 다룹니다. TypeScript 규칙을 항상 함께 따르고, 클래스 계약이나 스타일시트를 바꿀 때는 CSS 규칙도 함께 봅니다. React 19·19.2 전용 API는 프로젝트의 지원 버전을 확인한 뒤 적용합니다. 규칙 본문의 정본은 `rules/*.md`입니다.

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
    - 3.3 [Open DOM Props in Three Steps](#33-open-dom-props-in-three-steps)
    - 3.4 [Choose the Wrapper Shape and Forward Props Accordingly](#34-choose-the-wrapper-shape-and-forward-props-accordingly)
4. [Composition Strategy](#4-composition-strategy) — **MEDIUM**
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
    - 5.8 [Render JSX Branches With Explicit Conditions](#58-render-jsx-branches-with-explicit-conditions)
    - 5.9 [Order Hooks, Handlers, Effects, Then Return](#59-order-hooks-handlers-effects-then-return)
    - 5.10 [Split Owner Parts Only for Runtime Boundaries](#510-split-owner-parts-only-for-runtime-boundaries)
6. [Screen File Discipline](#6-screen-file-discipline) — **MEDIUM**
    - 6.1 [Keep Route Entry Files Focused on Screen Flow](#61-keep-route-entry-files-focused-on-screen-flow)
    - 6.2 [Avoid Premature Abstraction in Screen Code](#62-avoid-premature-abstraction-in-screen-code)
    - 6.3 [Extract Local Section Components Only for Runtime Boundaries](#63-extract-local-section-components-only-for-runtime-boundaries)
    - 6.4 [Keep Derived Values Close to Where They Are Used](#64-keep-derived-values-close-to-where-they-are-used)
7. [Runtime Boundaries](#7-runtime-boundaries) — **HIGH**
    - 7.1 [Place Suspense Boundaries at the Section Owner](#71-place-suspense-boundaries-at-the-section-owner)
    - 7.2 [Avoid Ad-hoc Loading and Failure Branches in Screen Bodies](#72-avoid-ad-hoc-loading-and-failure-branches-in-screen-bodies)
    - 7.3 [Place Error Boundaries by How Much Should Survive](#73-place-error-boundaries-by-how-much-should-survive)
8. [State Ownership and Updates](#8-state-ownership-and-updates) — **HIGH**
    - 8.1 [Calculate Derived Values During Rendering](#81-calculate-derived-values-during-rendering)
    - 8.2 [Choose State Tools by Source of Truth](#82-choose-state-tools-by-source-of-truth)
    - 8.3 [Store Shared Derived Decisions Only When They Are Truly Shared](#83-store-shared-derived-decisions-only-when-they-are-truly-shared)
    - 8.4 [Use Functional setState Updates When Based on Previous State](#84-use-functional-setstate-updates-when-based-on-previous-state)
    - 8.5 [Use useEffectEvent for Non-reactive Effect Callbacks](#85-use-useeffectevent-for-non-reactive-effect-callbacks)
    - 8.6 [Name URL State Bindings as a Set](#86-name-url-state-bindings-as-a-set)
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
    - 12.2 [Write JSX Comments as Multiline Blocks](#122-write-jsx-comments-as-multiline-blocks)
13. [Tooling](#13-tooling) — **MEDIUM**
    - 13.1 [Enable the Biome React Domain](#131-enable-the-biome-react-domain)

---

## 1. Ownership and Boundaries

**Impact: CRITICAL**

`ui`, `widget`, `page` 세 레이어의 소유 경계가 분명해야 코드를 예측 가능하게 배치할 수 있습니다. 레이어와 역할에 맞춰 이름과 폴더를 정하고, 가져오기는 하위 레이어로만 향합니다. 생명주기는 해당 컴포넌트가 관리하고 순수 계산은 훅으로 감싸지 않습니다.

### 1.1 Keep UI, Widget, and Page Ownership Separate

**Rule:** `R01-01` · `ownership-layer-component-boundaries`

**Applies when:** 컴포넌트를 `ui`, `widget`, `page` 중 어느 소유 레이어에 둘지 정할 때. 컴포넌트를 레이어 사이에서 옮기거나 공용화할 때.

**Review with:** `css/ownership-choose-scope-prefix-by-owner-layer`, `ownership-place-owner-files-in-role-folders`

**Impact: CRITICAL (공용 책임과 화면 전용 책임이 같은 레이어에 섞이지 않습니다)**

컴포넌트의 레이어는 사용 횟수나 조립 규모가 아니라 **무엇을 아는지**로 나눕니다.
먼저 `page` 조건을 확인하고, 해당하지 않으면 도메인 지식으로 구분합니다.

| 순서 | 조건 | 레이어 |
| --- | --- | --- |
| 1 | 화면의 응답·뷰모델 타입이나 라우트 search 파라미터를 프롭스 타입에서 참조합니다 | `page` |
| 1 | 쿼리·뮤테이션·라우터 훅·화면 스토어를 직접 호출합니다 | `page` |
| 1 | 해당 화면의 `Suspense` 경계·폼 프로바이더·모달을 여는 조건을 소유합니다 | `page` |
| 2 | 화면은 모르고 도메인만 압니다 | `widget`. 이름에 도메인 단어가 남아도 됩니다 |
| 2 | 도메인도 화면도 모릅니다 | `ui` |

`children`과 공용 계약만 받아 경계를 제공하는 범용 셸·대화상자는 그 이유만으로 `page`가 되지 않습니다.
특정 화면의 데이터나 흐름을 아는지 확인합니다.

| 혼동하기 쉬운 경우 | 판정 |
| --- | --- |
| 한 화면에서만 사용합니다 | `page` 조건에 해당하지 않으면 사용 횟수만으로 레이어를 바꾸지 않습니다 |
| 여러 `ui` 부품을 조립합니다 | 도메인을 모르면 `ui`입니다. 조립 규모로 `widget`을 고르지 않습니다 |

레이어를 정한 뒤 파일명과 심볼에는 `ownership-prefix-layer-names-on-files-and-symbols`를 적용합니다.

**Incorrect (공용 레이어에 화면 전용 로직이 섞입니다):**

```tsx
// component/ui/delete-product-button/ui-delete-product-button.tsx
export const UiDeleteProductButton = () => {
	const navigate = useNavigate();

	/**
	 * 삭제 후 목록으로 이동
	 */
	const handleDeleteButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		void navigate("/products");
	};

	return <UiButton onClick={handleDeleteButtonClick}>삭제</UiButton>;
};
```

**Correct (라우터 훅을 호출하는 코드는 화면 레이어에 둡니다):**

```tsx
// page/products/_pg-delete-product-button.tsx
export const PgDeleteProductButton = () => {
	const navigate = useNavigate();

	/**
	 * 삭제 후 목록으로 이동
	 */
	const handleDeleteButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		void navigate("/products");
	};

	return <UiButton onClick={handleDeleteButtonClick}>삭제</UiButton>;
};
```

**Incorrect (화면 타입·훅과 무관한 부품을 사용 횟수만으로 화면 레이어에 둡니다):**

```tsx
// page/detail/_pg-sales-legend-glyph.tsx
// 프롭스가 도메인 타입 하나만 받고 훅도 부르지 않는다. 이 화면에서만 쓴다는 이유로 남아 있다.
export const PgSalesLegendGlyph = (props: PgSalesLegendGlyphProps) => {
	return <svg className={clsx("pg_salesLegendGlyph__root")}>{props.children}</svg>;
};
```

**Correct (화면 타입·훅과 무관한 도메인 부품은 `widget`에 둡니다):**

```tsx
// component/widget/sales-legend-glyph/wg-sales-legend-glyph.tsx
export const WgSalesLegendGlyph = (props: WgSalesLegendGlyphProps) => {
	return <svg className={clsx("wg_salesLegendGlyph__root")}>{props.children}</svg>;
};
```

**Incorrect (도메인을 모르는 조합을 조립 규모만 보고 `widget`에 둡니다):**

```tsx
// component/widget/line-chart/wg-line-chart.tsx
// 프롭스가 좌표 배열만 받고 도메인 타입을 모른다. ui 부품을 조립했다는 이유로 widget에 있다.
export const WgLineChart = (props: WgLineChartProps) => {
	return <svg className={clsx("wg_lineChart__root")}>{props.children}</svg>;
};
```

**Correct (도메인 지식이 없는 조합은 `ui`, 있는 조합은 `widget`에 둡니다):**

```tsx
// component/ui/line-chart/ui-line-chart.tsx
export const UiLineChart = (props: UiLineChartProps) => {
	return <svg className={clsx("ui_lineChart__root")}>{props.children}</svg>;
};

// component/widget/sales-window-chart/wg-sales-window-chart.tsx
export const WgSalesWindowChart = (props: WgSalesWindowChartProps) => {
	return <UiLineChart points={toChartPoints(props.readings)} />;
};
```

### 1.2 Prefix Layer Names on Files and Symbols

**Rule:** `R01-02` · `ownership-prefix-layer-names-on-files-and-symbols`

**Applies when:** 컴포넌트 파일이나 심볼 이름을 새로 지을 때. 컴포넌트를 다른 레이어로 옮기면서 이름을 바꿀 때. 부품이나 하위 소유자의 이름을 짓거나 바꿀 때.

**Review with:** `ownership-layer-component-boundaries`, `typescript/naming-use-consistent-file-and-symbol-naming`

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

### 1.3 Place Owner Files in Role Folders

**Rule:** `R01-03` · `ownership-place-owner-files-in-role-folders`

**Applies when:** 소유자 아래 `_constant`·`_function`·`_hook`·`_type` 폴더나 하위 소유자 폴더를 만들거나 옮길 때. 추출한 컴포넌트·함수·타입의 배치 위치를 정할 때. 제외: 기존 파일 내부 구현만 바꾸는 경우.

**Review with:** `css/ownership-choose-scope-prefix-by-owner-layer`, `ownership-keep-component-imports-flowing-downward`

**Impact: HIGH (추출한 파일의 소유자와 역할을 경로에서 확인할 수 있습니다)**

추출한 파일은 소유자 폴더에 두고, 역할과 공개 범위에 맞춰 이름을 정합니다.
호출 계층은 폴더를 중첩하지 않고 진입 파일의 조립으로 드러냅니다.

| 구분 | 배치와 이름 |
| --- | --- |
| 소유자 | 자기만 쓰는 파일이 있는 컴포넌트는 자기 이름의 폴더를 갖습니다. 하위 컴포넌트 하나만 있어도 같고, 라우트는 항상 소유자입니다 |
| 진입 파일 | 레이어 접두사를 뺀 이름을 폴더와 맞춥니다. 한 폴더에 라우트가 여럿이면 첫 진입은 `pg-<folder>`, 나머지는 `pg-<folder>-<변형>`입니다 |
| 하위 컴포넌트 | 역할 폴더에 넣지 않고 소유자 폴더의 `_` 파일로 둡니다. 동반 `.css`도 같은 이름을 씁니다 |
| 하위 소유자 | 소유자 폴더 안에 한 겹만 두고, 이름은 `panel`처럼 역할 낱말 하나로 짓지 않습니다. 역할 폴더 네 개를 제외한 폴더는 모두 하위 소유자이며, 더 깊어지면 형제로 올리거나 `widget`으로 분리할지 판단합니다 |
| 역할 폴더 | 필요한 것만 만들고 파일이 하나여도 유지합니다. 아래 네 종류만 허용합니다 |
| 함수의 보조 파일 | 전용 보조 파일이 있는 함수만 `_function` 아래 자기 이름 폴더를 갖습니다. 보조 파일은 `_`로 시작하며 그 안에 역할 폴더를 다시 만들지 않습니다 |

| 역할 폴더 | 담는 것 |
| --- | --- |
| `_constant` | 입력을 받지 않는 상수·기본값·기준값·파서 묶음 등 선언형 계약 |
| `_function` | 이름 붙여 내보낸 도메인 계산 |
| `_hook` | 실제 상태·이펙트·컨텍스트를 소유한 커스텀 훅 |
| `_type` | 여러 파일이 공유하는 계약. 개별 컴포넌트의 프롭스는 해당 TSX에 둡니다 |

소유자 폴더에서 `_`가 없는 이름은 진입 파일과 하위 소유자 폴더뿐입니다.
`_`는 둘에 해당하지 않는다는 표식이며, 정렬상 하위 소유자 폴더보다 앞에 놓입니다.
`_` 파일은 같은 폴더에서만 가져오고, 역할 폴더는 외부에서도 가져올 수 있는 공개 영역입니다.
가져오기 경계는 `ownership-keep-component-imports-flowing-downward`를 따릅니다.

폴더 이름은 단수로 쓰되 프레임워크가 강제하는 이름은 예외입니다.
소유자 아래에 `component`·`util`·`helper`·`config`·`constants`·`common`·`shared` 폴더를 만들지 않습니다.
루트의 `constant`·`type`·`hook`은 프로젝트가 소유하는 역할 폴더이므로 같은 규칙을 따르되 `_`를 붙이지 않습니다.

| 함께 판단할 내용 | 기준 |
| --- | --- |
| 보조 함수 추출과 배치 | `typescript/functions-extract-helpers-only-when-the-boundary-is-real`, `typescript/functions-give-each-function-its-own-file` |
| 파일명과 심볼의 접두사 | `ownership-prefix-layer-names-on-files-and-symbols` |
| 루트에만 두는 `util`과 `config` | `typescript/functions-promote-owner-free-functions-to-root-util`, `typescript/naming-read-environment-values-through-config-env` |

**Incorrect (단순 컴포넌트에 역할 폴더를 미리 다 만듭니다):**

```txt
component/ui/button/
├── ui-button.tsx
├── ui-button.css
├── _constant/
├── _function/
├── _hook/
└── _type/
```

**Correct (지원 코드가 없으면 폴더 없이 파일만 둡니다):**

```txt
component/ui/button/
├── ui-button.tsx
└── ui-button.css
```

**Incorrect (범용 이름 폴더를 섞어 쓰고 하위 소유자 안에 소유자를 다시 둡니다):**

```txt
page/detail/
├── pg-detail.tsx
├── components/
├── constants/
├── utils/
├── helpers/
└── sales-trend-panel/
    ├── pg-sales-trend-panel.tsx
    └── detection/
        ├── pg-detection.tsx
        └── _function/
            └── to-detection-rows.ts
```

**Correct (필요한 역할 폴더만 만들고 하위 컴포넌트는 파일로 둡니다):**

```txt
page/detail/
├── pg-detail.tsx
├── pg-detail.css
├── _pg-summary-band.tsx           자기만 쓰는 파일이 없어 파일로 둠
├── _pg-summary-band.css
├── _function/
│   ├── to-product-summary.ts
│   └── to-sales-chart/                자기만 쓰는 보조가 있어 폴더
│       ├── to-sales-chart.ts
│       └── _to-chart-window.ts        toSalesChart 만 부름
├── _type/
│   └── detail-view-model.ts
└── sales-trend-panel/             자기만 쓰는 파일이 있어 하위 소유자 폴더가 됨
    ├── pg-sales-trend-panel.tsx
    ├── pg-sales-trend-panel.css
    ├── _pg-detection-section.tsx
    └── _function/
        └── to-chart-viewport.ts
```

### 1.4 Keep Component Imports Flowing Downward

**Rule:** `R01-04` · `ownership-keep-component-imports-flowing-downward`

**Applies when:** 소유자 폴더 안의 컴포넌트 파일을 가져올 때. 다른 소유자나 다른 라우트의 파일을 가져오려 할 때. 여러 자식이 같은 컴포넌트를 써야 해서 배치를 다시 정할 때. 제외: 같은 소유자 안에서 `_function`·`_type`·`_constant`·`_hook` 파일을 가져오는 경우.

**Requires selected:** `typescript/naming-import-by-absolute-path` · 함께 적용

**Review with:** `ownership-layer-component-boundaries`

**Impact: CRITICAL (공개 범위를 벗어난 가져오기를 막아 컴포넌트의 소유 관계를 유지합니다)**

가져오기는 아래 레이어 방향과 소유자 경계를 **모두** 지킵니다.
모든 경로가 `@/`로 시작하므로 경로 모양이 아니라 가져오는 파일의 위치로 판정합니다.
소유자·진입 파일·역할 폴더의 정의는 `ownership-place-owner-files-in-role-folders`를 따릅니다.

| 가져오는 쪽 | 가져올 수 있는 레이어 |
| --- | --- |
| 루트 레이어 | 루트 레이어 |
| `component/ui` | 루트 레이어, `ui` |
| `component/widget` | 루트 레이어, `ui`, `widget` |
| `page` | 루트 레이어, `ui`, `widget` |
| 라우터와 앱 진입 파일 | 전부 |

루트 레이어는 `util`·`constant`·`type`·`hook`·`store`·`service`·`config`·`asset`입니다.
같은 레이어의 공개 컴포넌트끼리 조립할 수 있지만 순환 가져오기는 만들지 않습니다.

| 가져오려는 대상 | 가져올 수 있는 파일 |
| --- | --- |
| `ui`, `widget`의 진입 파일 | 레이어 방향을 지키는 파일 |
| 라우트 진입 파일 `page/<route>/pg-<route>` | 라우터 |
| 다른 라우트 안의 파일 | 없음 |
| 하위 소유자의 진입 파일 | 그 하위 소유자를 담은 소유자 폴더 아래의 파일 |
| `_`로 시작하는 파일 | 같은 폴더의 파일 |
| `_function`, `_type`, `_constant`, `_hook`의 파일 | 레이어 방향을 지키는 파일. 다른 라우트의 역할 폴더는 제외합니다 |

`_` 컴포넌트 파일의 프롭스 타입은 예외로, 어디서든 `import type`으로 가져옵니다.
역할 폴더는 소유자의 공개 영역이므로 외부에서 쓴다는 이유만으로 루트로 옮기지 않습니다.
배치는 `typescript/naming-place-project-constants-in-the-root-constant-folder`와
`typescript/functions-promote-owner-free-functions-to-root-util`을 따릅니다.
`_hook`도 `ownership-keep-lifecycle-in-the-owning-component`에 따라 여러 소유자가 공유하는 생명주기를 공개합니다.

여러 자식이 같은 컴포넌트를 쓰면 부모가 조립해 프롭·`children`으로 내려보내거나,
화면 조립에 종속되지 않을 때 `ui`·`widget`으로 옮깁니다. 짧은 조각은 중복해서 써도 됩니다.
세 자식 이상이 공유해야 하는데 공용 레이어로 옮길 수도 없다면 자식 분리 자체를 다시 봅니다.

**Incorrect (다른 폴더의 `_` 컴포넌트 파일을 가져옵니다):**

```tsx
// page/detail/sales-trend-panel/pg-sales-trend-panel.tsx
import {PgSectionHeading} from "@/page/detail/_pg-section-heading";
```

**Correct (`_` 파일과 같은 폴더에 있는 진입 파일이 조립해서 프롭으로 내려보냅니다):**

```tsx
// page/detail/pg-detail.tsx
import {PgSectionHeading} from "@/page/detail/_pg-section-heading";
import {PgSalesTrendPanel} from "@/page/detail/sales-trend-panel/pg-sales-trend-panel";
import {PgSummaryBand} from "@/page/detail/summary-band/pg-summary-band";

export const PgDetail = () => {
	return (
		<main className={clsx("pg_detail__root")}>
			<PgSalesTrendPanel heading={<PgSectionHeading title="매출 추이" />} />
			<PgSummaryBand heading={<PgSectionHeading title="요약" />} />
		</main>
	);
};
```

**Incorrect (다른 라우트 안의 컴포넌트를 가져옵니다):**

```tsx
// page/index/pg-index.tsx
import {PgSalesTrendPanel} from "@/page/detail/sales-trend-panel/pg-sales-trend-panel";
```

**Correct (두 라우트가 공유하는 화면 독립 컴포넌트는 공용 레이어에 둡니다):**

```tsx
// component/widget/sales-trend-panel/wg-sales-trend-panel.tsx
export const WgSalesTrendPanel = (props: WgSalesTrendPanelProps) => {
	return <section className={clsx("wg_salesTrendPanel__root")}>{props.children}</section>;
};

// page/index/pg-index.tsx
import {WgSalesTrendPanel} from "@/component/widget/sales-trend-panel/wg-sales-trend-panel";
```

**Incorrect (`ui`가 `widget`을 가져옵니다):**

```tsx
// component/ui/legend/ui-legend.tsx
import {WgLegendPanel} from "@/component/widget/legend-panel/wg-legend-panel";
```

**Correct (방향을 뒤집어 `widget`이 `ui`를 가져옵니다):**

```tsx
// component/widget/legend-panel/wg-legend-panel.tsx
import {UiLegend} from "@/component/ui/legend/ui-legend";
```

**Incorrect (외부에서 사용한다는 이유만으로 역할 폴더의 파일을 루트로 옮깁니다):**

```ts
// type/chart-series.ts
// component/ui/chart/_type 에 있던 것을 page 에서도 쓴다고 루트로 옮겼다
export interface ChartSeries {
	/**
	 * 선 하나가 그리는 좌표
	 */
	points: ChartPoint[];
}

// page/detail/sales-trend-panel/_function/to-chart-option.ts
import type {ChartSeries} from "@/type/chart-series";
```

**Correct (역할 폴더의 파일은 레이어 방향만 지키면 밖에서도 가져옵니다):**

```ts
// page/detail/sales-trend-panel/_function/to-chart-option.ts
import type {ChartSeries} from "@/component/ui/chart/_type/chart-series";
import {chart_series_line} from "@/component/ui/chart/_constant/series";
```

### 1.5 Do Not Create Screen-local Custom Hooks for Pure Logic

**Rule:** `R01-05` · `ownership-prefer-plain-ts-for-local-react-helpers`

**Applies when:** 화면 전용 계산·정규화·전송 값 조립을 커스텀 훅으로 추출하려 할 때. 화면 전용 순수 로직을 별도 보조 모듈로 옮기려 할 때. 화면 지역 함수에 `use` 접두사를 붙이거나 커스텀 훅 이름을 바꿀 때. 제외: 상태·컨텍스트·다른 훅 호출 순서를 실제로 캡슐화하는 경우.

**Review with:** `ownership-keep-lifecycle-in-the-owning-component`, `ownership-place-owner-files-in-role-folders`, `typescript/functions-extract-helpers-only-when-the-boundary-is-real`, `typescript/naming-use-direct-imports-and-public-entry-points`

**Impact: HIGH (실제 상태·생명주기·컨텍스트가 필요한 경우에만 리액트 훅을 사용합니다)**

화면 전용 계산·정규화·전송 값 조립처럼 순수한 로직은 커스텀 훅으로 감싸지 않습니다.
화면 지역 훅은 상태·컨텍스트·훅 호출 순서를 실제로 캡슐화할 때만 허용합니다.

| 대상 | 처리 |
| --- | --- |
| 순수 계산 | `use` 접두사를 붙이지 않습니다. 함수 추출 여부는 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`을 따릅니다 |
| 여러 쿼리를 합친 결과 | 값을 그리는 섹션이 `combine`을 소유합니다. 여러 소유자가 같은 조합을 호출할 때만 `_hook`으로 옮깁니다 |
| 실제 커스텀 훅 | 기능을 나타내는 `use<Capability>`로 이름 짓습니다. `useData`, `useLogic`처럼 구현 범주만 적지 않습니다 |
| 생명주기가 있는 로직 | 분량을 줄이기 위한 추출은 허용하지 않습니다. `ownership-keep-lifecycle-in-the-owning-component`를 따릅니다 |

추출한 파일의 배치는 `ownership-place-owner-files-in-role-folders`를,
내보내기와 가져오기 형태는 `typescript/naming-use-direct-imports-and-public-entry-points`를 따릅니다.

**Incorrect (순수 지역 계산을 커스텀 훅으로 감쌉니다):**

```tsx
// page/products/_hook/use-media-upload-payload.ts
export const useMediaUploadPayload = (files: File[]) => {
	return files.map((file) => ({name: file.name, size: file.size}));
};

// page/products/_pg-media-upload-panel.tsx
export const PgMediaUploadPanel = (props: PgMediaUploadPanelProps) => {
	const mediaUploadPayload = useMediaUploadPayload(props.files);

	/**
	 * 업로드를 확정할 때 이미 만들어 둔 값을 보냄
	 */
	const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		mutationMediaSave.mutate({data: mediaUploadPayload});
	};

	return <UiButton onClick={handleSaveButtonClick}>저장</UiButton>;
};
```

**Correct (순수 계산은 소유자의 `_function` 폴더에 두고 핸들러가 직접 부릅니다):**

```tsx
// page/products/_function/to-media-upload-payload.ts
/**
 * 업로드 파일 목록으로 저장 요청 본문을 조립
 */
export const toMediaUploadPayload = (files: File[]) => {
	return files.map((file) => ({name: file.name, size: file.size}));
};

// page/products/_pg-media-upload-panel.tsx
import {toMediaUploadPayload} from "@/page/products/_function/to-media-upload-payload";

export const PgMediaUploadPanel = (props: PgMediaUploadPanelProps) => {
	/**
	 * 업로드를 확정할 때만 정규화해서 보냄. 렌더 중에는 계산하지 않는다
	 */
	const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		mutationMediaSave.mutate({data: toMediaUploadPayload(props.files)});
	};

	return <UiButton onClick={handleSaveButtonClick}>저장</UiButton>;
};
```

### 1.6 Keep Library Lifecycle in the Owning Component

**Rule:** `R01-06` · `ownership-keep-lifecycle-in-the-owning-component`

**Applies when:** 외부 라이브러리 인스턴스 생성·크기 변경·구독·정리를 한 컴포넌트가 소유할 때. 생명주기 코드를 커스텀 훅으로 옮겨 파일을 줄이려 할 때. 제외: 여러 소유자가 같은 생명주기 계약을 실제로 호출하는 경우.

**Review with:** `ownership-prefer-plain-ts-for-local-react-helpers`

**Impact: MEDIUM (외부 라이브러리의 생명주기와 실행 흐름을 소유 컴포넌트에서 확인할 수 있습니다)**

외부 라이브러리의 인스턴스 생성·크기 변경·이벤트 구독·정리는 하위 트리를 소유한 컴포넌트에 둡니다.
파일 분량을 줄이려고 생명주기를 커스텀 훅으로 옮기지 않습니다.

| 상황 | 처리 |
| --- | --- |
| 한 소유자만 쓰는 생명주기 | 해당 컴포넌트의 이펙트에 둡니다 |
| 여러 소유자가 같은 생명주기 계약을 실제로 호출함 | 훅으로 추출합니다 |
| 파일이 길어짐 | 생명주기 대신 도메인 계산을 `_function`으로 분리합니다 |
| 이펙트 정리·재설치 | 정리할 때 인스턴스 참조를 비우고 다시 설치할 때 새로 만듭니다. 상태에 남은 폐기된 인스턴스를 재사용하지 않습니다 |

순수 계산을 훅으로 감싸는 문제는 `ownership-prefer-plain-ts-for-local-react-helpers`를 따릅니다.

**Incorrect (파일 분량을 줄이려고 생명주기를 훅으로 옮깁니다):**

```tsx
// component/widget/chart/chart-root/wg-chart-root.tsx
// 생성·resize·정리가 _hook/use-chart-instance.ts로 빠져 이 파일에서는 실행 흐름이 보이지 않는다
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

**Correct (생명주기를 소유 컴포넌트가 직접 가집니다):**

```tsx
// component/widget/chart/chart-root/wg-chart-root.tsx
export const WgChartRoot = (props: WgChartRootProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<ChartInstance | null>(null);

	/**
	 * container mount 시 chart instance를 만들고 resize·dispose까지 소유
	 */
	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		// 외부 차트 라이브러리 인스턴스. 만든 컴포넌트가 resize 와 dispose 까지 책임진다
		const instance = mountChart(containerRef.current);
		const handleResize = () => {
			instance.resize();
		};

		window.addEventListener("resize", handleResize);
		chartRef.current = instance;

		return () => {
			chartRef.current = null;
			window.removeEventListener("resize", handleResize);
			instance.dispose();
		};
	}, []);

	/**
	 * option이 바뀌면 기존 instance에 다시 반영
	 */
	useEffect(() => {
		chartRef.current?.setOption(props.option);
	}, [props.option]);

	return <div ref={containerRef} className={clsx("wg_chart__canvas")} />;
};
```

## 2. Server Data Flow

**Impact: HIGH**

쿼리와 뮤테이션의 바인딩 이름에 API 출처를 드러냅니다. 응답 가공은 `query.select`처럼 출처에 가까운 곳에서 처리하고, 실패 처리와 무효화는 호출한 곳에서 맡습니다.

### 2.1 Name Query and Mutation Bindings Consistently

**Rule:** `R02-01` · `data-name-query-and-mutation-bindings-consistently`

**Applies when:** React Query 쿼리·뮤테이션 훅의 지역 바인딩을 추가하거나 이름을 바꿀 때. 쿼리나 뮤테이션 훅의 반환값을 새 지역 변수에 담을 때.

**Requires selected:** `docs-require-jsdoc-on-key-declarations`, `typescript/naming-use-consistent-file-and-symbol-naming` · 함께 적용

**Review with:** `data-preserve-origin-chaining`

**Impact: MEDIUM (지역 바인딩 이름으로 생성된 API 훅을 쉽게 찾을 수 있습니다)**

쿼리와 뮤테이션의 지역 바인딩 이름은 생성된 훅 이름에서 만듭니다.

| 바인딩 | 이름 |
| --- | --- |
| 생성된 단일 API 훅 | `use`와 요청 종류만 나타내는 앞부분을 `response` 또는 `mutation`으로 바꾸고 나머지 이름을 유지합니다 |
| 여러 쿼리를 합친 바인딩 | `response` 뒤에 결과 이름을 씁니다. `useSuspenseQueries`를 사용하면 끝에 `Suspense`를 유지합니다 |

**Incorrect (쿼리와 뮤테이션 바인딩 이름이 제각각입니다):**

```ts
const responseGetProductListSuspense = useGetProductListSuspense();
const removeApi = useProductRemove();
```

**Correct (지역 바인딩 접두사를 통일합니다):**

```ts
/**
 * 표에 그릴 product를 읽는다. 멈추는 동안은 섹션 소유자의 경계가 받는다
 */
const responseProductListSuspense = useGetProductListSuspense();

/**
 * 표에서 고른 product를 지운다. 성공 뒤 무효화는 부르는 화면이 맡는다
 */
const mutationProductRemove = useProductRemove();
```

### 2.2 Shape React Query Data in query.select

**Rule:** `R02-02` · `data-shape-query-data-with-select`

**Applies when:** 서버 응답의 목록·항목·메타 등을 렌더에서 가공하거나 반복 소비할 때. React Query `select`의 결과 형태를 추가·변경할 때. 제외: 이미 가공한 항목을 `.map`으로 JSX 요소에 대응시키기만 하는 경우.

**Requires selected:** `docs-require-jsdoc-on-key-declarations` · 함께 적용

**Review with:** `data-name-query-and-mutation-bindings-consistently`, `data-preserve-origin-chaining`

**Impact: HIGH (응답 가공을 쿼리에 모아 화면이 원본 구조에 의존하지 않게 합니다)**

서버 응답은 `query.select`에서 도메인 필드로 가공하고, 화면에서는 그 결과를 렌더합니다.

| 작업 | 처리 위치 |
| --- | --- |
| `.map`, `.filter`·필드 이름 변경 등 응답 가공 | `query.select` |
| 가공한 항목을 `.map`으로 JSX에 대응시키기 | 화면 렌더. JSX 요소와 클릭 핸들러를 `select` 결과에 넣지 않습니다 |
| 여러 쿼리 결과를 함께 가공 | `data-combine-multiple-queries-with-combine`. `select`는 자기 쿼리 데이터만 받습니다 |

`select`는 인라인으로 적습니다. 해당 구독자가 읽는 결과만 바꾸며 쿼리 캐시의 원본을 덮어쓰지 않습니다.
기본 구조 공유는 JSON으로 표현할 수 있는 데이터에서 바뀌지 않은 부분의 참조를 유지합니다.
인라인 함수는 참조가 달라져 다시 실행될 수 있으며, 구조 공유가 계산 자체를 생략하지는 않습니다.
재실행만을 이유로 `useCallback`·`useMemo`를 더하지 않고,
실측 병목이 있을 때만 `perf-avoid-defensive-memoization`의 예외 기준을 따릅니다.

`select` 내부 변환은 이 규칙이 담당합니다. 별도 함수나 보조 모듈 경계가 없으면
`typescript/functions-extract-helpers-only-when-the-boundary-is-real`은 적용하지 않습니다.

**Incorrect (렌더에서 응답 원본 구조를 가공합니다):**

```tsx
const responseProductListSuspense = useProductListSuspense();

<UiTable
	rows={responseProductListSuspense.data.list.map((product) => ({
		id: product.id,
		label: product.title,
	}))}
/>;
```

**Correct (`query.select`에서 화면에 필요한 형태로 가공합니다):**

```tsx
/**
 * 표가 그대로 쓰는 필드 이름으로 목록을 바꿔서 화면이 응답 구조를 모르게 한다
 */
const responseProductListSuspense = useProductListSuspense(
	{},
	{
		query: {
			select: (response) => ({
				items: response.data.list.map((product) => ({id: product.id, label: product.title})),
			}),
		},
	},
);

<UiTable rows={responseProductListSuspense.data.items} />;
```

### 2.3 Combine Multiple Queries With `combine`

**Rule:** `R02-03` · `data-combine-multiple-queries-with-combine`

**Applies when:** 쿼리 결과 둘 이상을 하나의 값으로 합치는 코드를 추가·변경할 때. 화면 본문에서 두 `data`를 꺼내 함께 계산하는 코드를 넣거나 뺄 때. 여러 쿼리의 병렬 실행과 앞 응답에 의존하는 순차 실행을 바꿀 때.

**Review with:** `data-shape-query-data-with-select`, `screen-keep-derived-values-close`

**Impact: MEDIUM (여러 응답의 가공 위치를 통일하고 화면 본문의 별칭을 줄입니다)**

둘 이상의 쿼리 결과를 하나로 합칠 때는 값을 그리는 섹션에서 `combine`을 인라인으로 씁니다.
결과를 합칠 필요와 요청을 병렬로 시작할 필요는 따로 판단합니다.

| 상황 | 선택 |
| --- | --- |
| Suspense 쿼리 결과를 합침 | `useSuspenseQueries` + `combine`. `isPending`을 만들어 내보내지 않습니다 |
| 일반 쿼리 결과를 합침 | `useQueries` + `combine`. 실제 대기·실패 상태도 함께 다룹니다 |
| 결과를 각각 렌더함 | 합친 값을 만들지 않습니다. Suspense 병렬 실행이 필요하면 `useSuspenseQueries`에서 결과를 따로 읽습니다 |
| 일반 쿼리의 뒤 요청이 앞 결과를 입력으로 받음 | `enabled`로 입력이 준비된 뒤 실행합니다 |
| Suspense 쿼리의 뒤 요청이 앞 결과를 입력으로 받음 | 같은 컴포넌트에서 `useSuspenseQuery`를 순서대로 호출합니다 |

`useSuspenseQuery`·`useSuspenseQueries`는 `enabled`를 받지 않습니다.
필수 입력이 없으면 쿼리를 호출하는 자식의 렌더를 보류합니다.
독립적인 Suspense 쿼리도 같은 컴포넌트에서 따로 호출하면 앞 요청부터 순서대로 진행됩니다.
Suspense의 불필요한 대기 분기는 `runtime-avoid-ad-hoc-loading-branches`를 따릅니다.

| 함께 판단할 내용 | 기준 |
| --- | --- |
| 한 쿼리만 가공함 | 자기 쿼리 데이터만 받는 `select`를 씁니다. `data-shape-query-data-with-select`를 따릅니다 |
| 화면 본문에서 두 `data`를 꺼내 합침 | 출처를 잃는 상단 별칭을 만들지 않습니다. `screen-keep-derived-values-close`를 따릅니다 |
| 라우트 진입이 데이터 소유자를 겸함 | `screen-keep-route-flow-visible`의 작은 화면 예외를 따릅니다 |
| 조합을 커스텀 훅으로 추출함 | 여러 소유자가 같은 조합을 호출할 때만 `_hook`으로 옮깁니다. 파일 분량은 근거가 아닙니다 |

구조 공유는 합친 결과에서 바뀌지 않은 부분의 참조를 유지하지만 계산을 생략하지는 않습니다.
인라인 함수는 렌더마다 참조가 달라져 다시 계산될 수 있습니다.
재실행만을 이유로 `useCallback`·`useMemo`를 더하지 않고,
실측 병목이 있을 때만 `perf-avoid-defensive-memoization`의 예외 기준을 따릅니다.
반복 조회 인덱스는 `typescript/values-use-set-and-map-for-repeated-lookups`를 따릅니다.

**Incorrect (화면 본문에서 두 응답을 꺼내 합칩니다):**

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

**Correct (값을 그리는 섹션이 인라인 `combine`으로 합칩니다):**

```tsx
export const PgProductTableSection = () => {
	/**
 * 분류 이름이 목록 응답에 없어서 표 한 행에 두 응답을 함께 담는다
	 */
	const responseProductRowsSuspense = useSuspenseQueries({
		queries: [productListQueryOptions(), categoryListQueryOptions()],
		combine: ([productResult, categoryResult]) => {
			// 분류 응답의 id는 유일하다. 모든 행이 같은 분류 목록을 찾아 Map을 한 번 만든다
			const categoryById = new Map(categoryResult.data.categories.map((category) => [category.id, category]));

			return {
				rows: productResult.data.products.map((product) => ({
					id: product.id,
					categoryName: categoryById.get(product.categoryId)?.name,
				})),
			};
		},
	});

	return <UiTable rows={responseProductRowsSuspense.rows} />;
};
```

### 2.4 Preserve Response and Store Origin Down to the JSX

**Rule:** `R02-04` · `data-preserve-origin-chaining`

**Applies when:** 응답, 뮤테이션, 스토어에서 값을 꺼내 쓰는 코드를 추가·변경할 때. 원본을 별칭으로 끊고 값 접근 방식을 바꿀 때.

**Review with:** `data-shape-query-data-with-select`, `screen-keep-derived-values-close`

**Impact: CRITICAL (별칭을 추적하지 않고 사용하는 곳에서 값의 출처를 확인할 수 있습니다)**

`response...`·`mutation...`·`*Store`는 JSX까지 원본 이름으로 읽습니다.
핸들러·이펙트 안에서도 `responseProductSearchSuspense.data.products`처럼 출처를 유지합니다.

| 필요한 판단 | 기준 |
| --- | --- |
| 객체 구조분해와 별칭 | `typescript/values-read-objects-through-chains` |
| 쿼리 결과 가공 | `data-shape-query-data-with-select`에 따라 `query.select`에서 처리합니다. 받는 쪽의 별칭은 깊이를 줄이지 못하고 출처만 지웁니다 |
| 프롭스 접근 | `composition-read-props-without-destructuring` |

**Incorrect (구조분해로 출처가 흐려집니다):**

```tsx
const {products, selectedProduct} = responseProductListSuspense.data;

<Fragment>
	<UiList rows={products} />
	<UiTable rows={selectedProduct.fields} />
</Fragment>;
```

**Correct (원본 객체의 속성을 직접 읽어 출처를 유지합니다):**

```tsx
<Fragment>
	<UiList rows={responseProductListSuspense.data.products} />
	<UiTable rows={responseProductListSuspense.data.selectedProduct.fields} />
</Fragment>;
```

**Incorrect (이펙트 의존성도 구조분해한 이름으로 적어 출처가 드러나지 않습니다):**

```ts
const {products} = responseProductSearchSuspense.data;

useEffect(() => {
	if (products.length > 0) {
		return;
	}

	reportEmptySearch(urlParams.keyword);
}, [products, urlParams.keyword]);
```

**Correct (이펙트 안에서도 원본 이름 그대로 씁니다):**

```ts
/**
 * 검색 결과가 있으면 빈 검색 보고를 건너뛴다. 결과가 없을 때만 한 번 보고한다
 */
useEffect(() => {
	if (responseProductSearchSuspense.data.products.length > 0) {
		return;
	}

	reportEmptySearch(urlParams.keyword);
}, [responseProductSearchSuspense.data, urlParams.keyword]);
```

### 2.5 Handle Mutation Failure Where the Mutation Is Called

**Rule:** `R02-05` · `data-handle-mutation-failure-where-it-is-called`

**Applies when:** 뮤테이션을 부르는 코드를 추가·변경할 때. `mutate`와 `mutateAsync` 사이를 오갈 때.

**Review with:** `data-invalidate-queries-the-mutation-changed`, `events-run-user-actions-in-handlers-not-effects`

**Impact: HIGH (저장 실패를 놓치지 않고 호출한 자리에서 처리합니다)**

뮤테이션 실패는 입력 문맥을 유지할 수 있도록 호출한 자리에서 처리합니다.
기본은 `mutate`와 `useMutation`의 `onError`·`onSuccess`이며, 핸들러에서는 호출만 합니다.

| 상황 | 선택 |
| --- | --- |
| 호출 뒤 핸들러가 더 할 일이 없음 | `mutate` + `onError`, `onSuccess` |
| 결과를 기다린 뒤 핸들러가 계속 실행되어야 함 | `mutateAsync` + `try`/`catch` |

거부된 `mutateAsync` Promise는 오류 경계가 자동으로 받지 않습니다.
`await` 뒤의 코드는 실행되지 않으므로 반드시 `catch`에서 실패를 표시하거나 다시 던집니다.
`throwOnError`로 렌더에서 오류를 다시 던지는 경우는 `runtime-place-error-boundaries-by-blast-radius`를 따릅니다.

| 확인할 내용 | 기준 |
| --- | --- |
| 같은 뮤테이션의 호출 방식 | 호출하는 곳마다 `mutate`와 `mutateAsync`를 섞지 않습니다 |
| 실패 처리 | 빈 `catch`로 삼키지 않습니다. 표시할 내용은 제품에 맞게 정합니다 |
| 중복 실행 방지 | 버튼을 `isPending`으로 `disabled` 처리하고, 핸들러 첫 줄에서도 `isPending`이면 이른 반환합니다 |
| 성공 뒤 캐시 갱신 | `data-invalidate-queries-the-mutation-changed`를 따릅니다 |

**Incorrect (`await`만 쓰고 거부된 Promise를 처리하지 않습니다):**

```tsx
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	await mutationProductSave.mutateAsync({data: toProductSaveRequest(formValues)});
	void navigate("/products");
};
```

**Correct (후속 작업이 없는 호출은 성공·실패 콜백으로 처리합니다):**

```tsx
/**
 * 저장에 성공하면 목록 화면으로 돌아간다. 실패 문구는 폼 위에 남긴다
 */
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: () => {
			void navigate("/products");
		},
		onError: (error) => {
			setSubmitErrorMessage(toSubmitErrorMessage(error));
		},
	},
});

const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	if (mutationProductSave.isPending) {
		return;
	}

	mutationProductSave.mutate({data: toProductSaveRequest(formValues)});
};
```

**Correct (버튼과 핸들러 첫 줄에서 중복 저장을 막습니다):**

```tsx
/**
 * 버튼 disabled와 별개로 겹쳐 들어온 저장을 한 번 더 막는다
 */
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	if (mutationProductSave.isPending) {
		return;
	}

	mutationProductSave.mutate({data: toProductSaveRequest(formValues)});
};

<UiButton disabled={mutationProductSave.isPending} onClick={handleSaveButtonClick}>
	저장
</UiButton>;
```

**Correct (결과를 기다리는 후속 작업에는 `try`/`catch`를 씁니다):**

```tsx
/**
 * 첨부를 먼저 올린 뒤 그 식별자로 product를 저장한다
 */
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	if (mutationAttachmentUpload.isPending || mutationProductSave.isPending) {
		return;
	}

	try {
		const uploaded = await mutationAttachmentUpload.mutateAsync({files: draftFiles});

		await mutationProductSave.mutateAsync({
			data: toProductSaveRequest(formValues, uploaded.attachmentIds),
		});

		void navigate("/products");
	} catch (error) {
		setSubmitErrorMessage(toSubmitErrorMessage(error));
	}
};
```

### 2.6 Invalidate the Queries a Mutation Changed

**Rule:** `R02-06` · `data-invalidate-queries-the-mutation-changed`

**Applies when:** 뮤테이션 성공 뒤 서버 상태를 다시 맞추는 코드를 추가·변경할 때. 저장 결과를 캐시에 직접 쓰거나 `refetch`로 맞추는 코드를 넣을 때. 제외: 사용자 새로 고침 버튼이나 요청 전 낙관적 갱신만 바꾸는 경우.

**Review with:** `data-handle-mutation-failure-where-it-is-called`

**Impact: HIGH (저장으로 바뀐 서버 상태를 관련 쿼리에 반영합니다)**

뮤테이션이 바꾼 서버 상태는 해당 데이터를 소유한 쿼리 키로 `invalidateQueries`하여 다시 맞춥니다.
낙관적 갱신과 사용자가 누르는 새로 고침 버튼은 이 규칙의 대상이 아닙니다.

| 성공 뒤 갱신 방법 | 판정 |
| --- | --- |
| `invalidateQueries` | 변경된 서버 상태를 가리키는 관련 키들을 함께 지정합니다 |
| `setQueryData`로 응답을 목록에 직접 반영 | 쓰지 않습니다. 화면에서 대신 계산한 정렬·집계가 서버와 어긋날 수 있습니다 |
| 현재 키의 `refetch()` | 관련 키 전체를 맞추는 수단으로 쓰지 않습니다. 다른 필터·페이지 키와 요약 쿼리는 남습니다 |

같은 `QueryClient`의 같은 키를 구독하면 `refetch()` 결과도 함께 받습니다.
무효화를 고르는 기준은 구독자 수가 아니라 관련 키의 범위입니다.
`invalidateQueries`는 일치하는 쿼리를 오래된 상태로 표시하고 기본적으로 활성 쿼리를 다시 불러옵니다.
비활성 쿼리까지 즉시 요청한다고 가정하지 않습니다.

| 호출 조건 | 처리 |
| --- | --- |
| 쿼리 키 지정 | 문자열을 직접 적지 않고 쿼리 훅이 내보낸 키를 씁니다 |
| 무효화 대상이 여럿임 | 성공 콜백에서 나란히 호출합니다 |
| 다시 읽기를 마쳐야 저장 중 표시나 후속 동작을 끝낼 수 있음 | 성공 콜백에서 무효화 Promise를 반환하거나 `await`합니다 |
| 호출 위치 | `data-handle-mutation-failure-where-it-is-called`를 따릅니다. `events-run-user-actions-in-handlers-not-effects`에 따라 이펙트로 옮기지 않습니다 |

**Incorrect (캐시를 손으로 조립하고 키를 문자열로 적습니다):**

```tsx
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: (saved) => {
			queryClient.setQueryData(["products"], (previous = []) => [...previous, saved]);
		},
	},
});
```

**Incorrect (현재 목록 키만 다시 읽어 다른 목록 조건과 요약 키를 놓칩니다):**

```tsx
const mutationProductSave = useProductSave({
	mutation: {
		onSuccess: () => {
			void responseProductListSuspense.refetch();
		},
	},
});
```

**Correct (바뀐 데이터를 소유한 키를 무효화합니다):**

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

리액트 핸들러 타입과 래퍼가 제공하는 프롭 계약을 선언에 명시합니다. 라이브러리 래퍼는 허용할 프롭 범위를 좁히고 구조에 맞는 방법으로 전달합니다. 일반 TypeScript 타입 규칙은 동반 스킬이 다루고 여기서는 리액트 문맥만 봅니다.

### 3.1 Take React Handler and Wrapper Prop Types From Existing Contracts

**Rule:** `R03-01` · `typing-take-handler-types-from-existing-contracts`

**Applies when:** 커링 팩토리가 돌려주는 리액트 핸들러의 타입을 정할 때. `Ui*` 래퍼 사용처에서 프롭스 타입을 참조할 때. 제외: `query.select` 같은 훅 옵션의 일회성 문맥 콜백인 경우.

**Requires selected:** `typescript/types-prefer-function-variable-types-over-parameter-annotations` · 함께 적용

**Impact: MEDIUM (같은 시그니처를 직접 다시 적어 생기는 계약 불일치를 막습니다)**

리액트 핸들러와 래퍼 프롭스의 타입은 기존 계약에서 가져옵니다.
타입을 붙이는 기본 위치는 `typescript/types-prefer-function-variable-types-over-parameter-annotations`를 따릅니다.

| 자리 | 타입 출처 |
| --- | --- |
| 커링 팩토리가 반환하는 핸들러 | `MouseEventHandler<...>` 같은 리액트 별칭을 팩토리 반환 타입에 적습니다 |
| `Ui*` 래퍼 사용처 | 내부 라이브러리의 원본 타입 대신 래퍼가 내보낸 `Ui*Props`를 가져옵니다 |

JSX에 직접 쓴 화살표 함수와 달리, 팩토리가 반환하는 함수에는 리액트의 문맥 타입이 붙지 않습니다.
반환 타입을 생략하면 안쪽 매개변수가 암시적 `any`가 되어 `strict`에서 컴파일 오류가 납니다.
래퍼 타입을 사용하면 래퍼가 좁히거나 추가한 계약도 사용처에 반영됩니다.

`query.select` 같은 훅 옵션의 일회성 문맥 콜백은 리액트 핸들러 구현이 아니므로 대상에서 제외합니다.

**Incorrect (팩토리 반환 타입을 적지 않아 이벤트가 암시적 `any`가 됩니다):**

```ts
const handleRowSelectToggle = (rowId: string) => (event) => {
	event.preventDefault();
	toggleSelection(rowId);
};
```

**Correct (팩토리 반환 타입을 기존 별칭으로 고정합니다):**

```ts
import type {MouseEventHandler} from "react";

/**
 * 행 id를 커링으로 고정해 목록 JSX에 인라인 래퍼를 두지 않게 한다
 */
const handleRowSelectToggle =
	(rowId: string): MouseEventHandler<HTMLButtonElement> =>
	(event) => {
		event.preventDefault();
		toggleSelection(rowId);
	};
```

**Incorrect (래퍼를 쓰면서 라이브러리 원본 프롭스를 참조합니다):**

```ts
import type {ButtonProps} from "@mui/material";

const handleSubmitClick: ButtonProps["onClick"] = (event) => {
	event.preventDefault();
};
```

**Correct (래퍼가 노출한 계약을 참조합니다):**

```ts
import type {UiButtonProps} from "@/component/ui/button/ui-button";

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

**Review with:** `typescript/docs-justify-convention-exceptions-with-a-reason-comment`, `typing-choose-wrapper-shape-and-forwarding`, `typing-open-dom-props-in-three-steps`, `typing-take-handler-types-from-existing-contracts`

**Impact: CRITICAL (화면의 라이브러리 의존성을 제한하고 교체 시 수정 범위를 줄입니다)**

라이브러리 컴포넌트는 화면에서 직접 쓰지 않고 `Ui*` 래퍼를 거칩니다.
업그레이드·교체 시 수정 범위를 래퍼에 모으고, 화면에 필요한 계약만 엽니다.

| 프롭 종류 | 선언 방법 |
| --- | --- |
| 라이브러리에 이미 있는 표시 프롭 (`color`, `padding`, `size`) | `ButtonProps["color"]`처럼 인덱스 접근으로 하나씩 엽니다 |
| 안쪽 컴포넌트가 받지 않는 자기 프롭 (`icon`, `label`, `helperText`) | 타입을 직접 적습니다 |
| 라이브러리 스타일 주입 프롭 (테마 스타일·클래스 맵·렌더 태그 교체) | 선언하지 않습니다 |
| DOM 속성 | `typing-open-dom-props-in-three-steps`를 따릅니다 |

`export type UiButtonProps = ButtonProps`처럼 원본 프롭스 전체를 공개하지 않습니다.
스타일 주입 지점까지 열면 `css/composition-inject-classes-only-at-the-entry-point`의 경계를 지킬 수 없습니다.

자기 프롭은 이름이 아니라 **안쪽 컴포넌트가 받는지**로 구분합니다.
`UiIconButtonProps`의 `icon`은 자기 프롭이지만, 안쪽 컴포넌트도 받는 `UiTableRowProps`의 `selected`는 아닙니다.
인덱스 접근은 이미 있는 프롭을 그대로 열 때만 쓰며, 상속된 프롭도 바깥 타입 이름으로 접근합니다.

| 추가 판단 | 기준 |
| --- | --- |
| 값을 직접 적어 계약을 좁힘 | 의도적으로 좁힐 때만 허용하며 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`에 따라 이유를 남깁니다 |
| `ref` 공개 | `composition-open-ref-props-only-for-imperative-contracts` |
| 프롭 전달 방식 | `typing-choose-wrapper-shape-and-forwarding` |

**Incorrect (라이브러리 타입을 그대로 내보냅니다):**

```tsx
export type UiTableCellProps = TableCellProps;

export const UiTableCell = (props: UiTableCellProps) => {
	return <TableCell {...props} />;
};
```

**Correct (표시 프롭은 인덱스 접근으로 열고 DOM 속성은 세 단계 기준을 따릅니다):**

```tsx
import type {TdHTMLAttributes} from "react";
import type {TableCellProps} from "@mui/material";

/**
 * 표 셀에서 정렬과 여백만 여는 계약
 *
 * 라이브러리 셀의 나머지 표시 프롭은 표 소유자가 정하므로 열지 않는다.
 * align의 inherit은 DOM td 타입에 없어 그 이름만 빼고 다시 연다.
 */
export interface UiTableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
	/**
	 * 내용 가로 정렬
	 */
	align?: TableCellProps["align"];
	/**
	 * 셀 여백
	 */
	padding?: TableCellProps["padding"];
}

export const UiTableCell = (props: UiTableCellProps) => {
	return <TableCell {...props} />;
};
```

### 3.3 Open DOM Props in Three Steps

**Rule:** `R03-03` · `typing-open-dom-props-in-three-steps`

**Applies when:** 래퍼 프롭스가 `HTMLAttributes`를 `extends` 하거나 그 상속을 뗄 때. 라이브러리 프롭과 DOM 프롭의 이름이 부딪혀 컴파일이 막힐 때. 제외: DOM 프롭이 아닌 표시 프롭만 더하거나 빼는 경우.

**Review with:** `css/composition-do-not-style-through-the-style-attribute`, `typescript/types-reuse-existing-contracts-before-new-types`, `typing-narrow-library-wrapper-contracts`

**Impact: HIGH (프롭 타입 충돌을 해결하면서 필요한 DOM 속성과 이벤트를 유지합니다)**

`typing-narrow-library-wrapper-contracts`로 공개할 계약을 정한 뒤, DOM 속성은 아래 순서로 엽니다.
같은 요소로 `{...props}`를 전달하는 래퍼는 1·2단계 중 컴파일되는 형태를 씁니다.

| 단계 | 조건 | 형태 |
| --- | --- | --- |
| 1 | DOM 계약과 호환됨 | `extends <요소>HTMLAttributes<T>` |
| 2 | 같은 이름 프롭의 타입이 DOM 계약과 호환되지 않음 | `extends Omit<<요소>HTMLAttributes<T>, "size">`처럼 충돌하는 이름만 빼고, 그 프롭을 인덱스 접근으로 다시 엽니다 |
| 3 | 감싸는 요소와 이벤트 대상이 다르거나 자기 프롭을 하나씩 전달함 | `extends` 없이 전달할 DOM 프롭만 선언합니다 |

| 확인할 내용 | 기준 |
| --- | --- |
| 요소 전용 인터페이스 | 버튼은 `ButtonHTMLAttributes`, 입력은 `InputHTMLAttributes`, 셀은 `TdHTMLAttributes`를 씁니다. `HTMLAttributes`만 쓰면 `disabled`, `type`, `colSpan` 같은 전용 속성을 잃습니다 |
| 전용 인터페이스가 없는 요소 | `tr`처럼 전용 타입이 없을 때만 `HTMLAttributes`를 씁니다 |
| 호환되는 좁히기 | `string`을 문자열 리터럴 유니언으로 좁히면 1단계가 컴파일됩니다. 숫자 `size`를 문자열 크기 이름으로 바꾸는 경우에는 2단계가 필요합니다 |
| 요소 타입이 다름 | 겉은 `div`, 이벤트 대상은 `input`이면 `Omit`만으로 해결하지 않습니다. 필요한 DOM 프롭을 `string`, `ChangeEventHandler<HTMLInputElement>` 같은 플랫폼 타입으로 적습니다 |

`value`·`onChange`처럼 DOM이 정한 이름은 라이브러리 고유 계약이 아닙니다.
자기 프롭과 전달 방식은 `typing-choose-wrapper-shape-and-forwarding`을 따릅니다.
DOM 속성은 리액트가 추가한 속성도 받아야 하는 열린 집합이므로, 충돌한 이름만 `Omit`으로 뺍니다.
나머지를 직접 나열하지 않는 이 방식은 `typescript/types-reuse-existing-contracts-before-new-types`가 허용합니다.

선언되지 않은 `aria-*`·`data-*`는 JSX의 하이픈 이름이라 오류 없이 통과할 수 있지만,
이미 선언된 속성의 값은 타입 검사를 받습니다. 컴파일 결과뿐 아니라 실제 DOM 전달 코드도 확인합니다.
`HTMLAttributes`를 상속하면 `style`도 열리므로,
사용 여부는 `css/composition-do-not-style-through-the-style-attribute`를 따릅니다.

**Incorrect (프롭 타입 하나의 충돌 때문에 DOM 속성 전체를 제외합니다):**

```tsx
// id·role·tabIndex·aria-*·이벤트를 전부 잃고 다섯 개만 남았다
export interface UiButtonProps {
	className?: string;
	children?: ReactNode;
	color?: ButtonProps["color"];
	disabled?: ButtonProps["disabled"];
	onClick?: MouseEventHandler<HTMLButtonElement>;
}
```

**Correct (DOM 프롭의 선언 방식을 조건에 따라 고릅니다):**

```txt
래퍼 프롭스에 DOM 속성을 연다
│
├ extends <요소>HTMLAttributes<T> 가 컴파일됨 ──→ 1단계. 그대로 둔다
│
├ 같은 이름 프롭의 값이 부딪혀 막힘 ──────────→ 2단계. 그 이름만 Omit 하고
│                                               인덱스 접근으로 다시 연다
│
└ 감싸는 요소와 이벤트 대상 요소가 서로 다름 ─→ 3단계. extends 없이 필요한 것만
```

**Correct (1단계 — 같은 이름의 프롭도 호환되면 그대로 상속합니다):**

```tsx
import {Button} from "@mui/material";
import type {ButtonProps} from "@mui/material";
import {clsx} from "clsx";
import type {ButtonHTMLAttributes} from "react";

/**
 * 라이브러리 버튼의 강조 단계를 여는 계약
 *
 * color의 문자열 리터럴들은 DOM의 string에 할당할 수 있어 Omit이 필요 없다.
 */
export interface UiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/**
	 * 강조 단계
	 */
	color?: ButtonProps["color"];
}

export const UiButton = (props: UiButtonProps) => {
	return <Button {...props} className={clsx("ui_button__root", props.className)} />;
};
```

**Correct (2단계 — 호환되지 않는 정렬 프롭만 빼고 다시 엽니다):**

```tsx
import {TableCell} from "@mui/material";
import type {TableCellProps} from "@mui/material";
import {clsx} from "clsx";
import type {TdHTMLAttributes} from "react";

/**
 * 라이브러리 셀의 정렬과 여백을 여는 계약
 *
 * align의 inherit은 DOM td 타입에 없어 그 이름만 빼고 다시 연다.
 */
export interface UiTableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
	/**
	 * 내용 가로 정렬
	 */
	align?: TableCellProps["align"];
	/**
	 * 셀 여백
	 */
	padding?: TableCellProps["padding"];
}

export const UiTableCell = (props: UiTableCellProps) => {
	return <TableCell {...props} className={clsx("ui_tableCell__root", props.className)} />;
};
```

**Correct (3단계 — 요소 타입이 달라 필요한 프롭만 선언합니다):**

```tsx
import {TextField} from "@mui/material";
import type {TextFieldProps} from "@mui/material";
import {clsx} from "clsx";
import type {ChangeEventHandler} from "react";

/**
 * 라벨과 값을 받는 한 줄 입력 계약
 *
 * 겉은 `div`인데 이벤트는 안쪽 `input`이 받아 요소 전용 인터페이스를 그대로 못 쓴다.
 * 입력 이름을 반드시 보여 주려고 label은 선택적인 ReactNode 대신 필수 문자열로 좁힌다.
 */
export interface UiTextFieldProps {
	/**
	 * 입력 위에 보이는 이름
	 */
	label: string;
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
	error?: TextFieldProps["error"];
}

export const UiTextField = (props: UiTextFieldProps) => {
	return (
		<TextField
			className={clsx("ui_textField__root", props.className)}
			id={props.id}
			label={props.label}
			value={props.value}
			onChange={props.onChange}
			error={props.error}
		/>
	);
};
```

### 3.4 Choose the Wrapper Shape and Forward Props Accordingly

**Rule:** `R03-04` · `typing-choose-wrapper-shape-and-forwarding`

**Applies when:** 래퍼가 받은 프롭을 안쪽 컴포넌트나 요소로 넘기는 코드를 추가·변경할 때. 래퍼에 자기 프롭을 더하거나 안쪽 요소를 늘릴 때.

**Requires selected:** `typing-narrow-library-wrapper-contracts` · 함께 적용

**Review with:** `typescript/values-avoid-lookup-tables-for-simple-choices`

**Impact: HIGH (각 프롭이 전달되는 요소를 코드에서 확인할 수 있습니다)**

기본은 프롭을 이름으로 하나씩 전달하는 것입니다.
`{...props}`는 아래 세 조건을 **모두** 만족할 때만 씁니다.

| 조건 | 확인 방법 |
| --- | --- |
| 안쪽 요소가 하나임 | 반환하는 JSX에 요소가 하나입니다 |
| 자기 프롭이 없음 | 선언한 프롭을 안쪽 컴포넌트가 전부 받습니다. 구분은 `typing-narrow-library-wrapper-contracts`를 따릅니다 |
| DOM 속성을 `extends`로 열 수 있음 | `typing-open-dom-props-in-three-steps`의 1·2단계입니다 |

자기 프롭이 있으면 3단계처럼 전달할 DOM 프롭만 선언하고, 전부 이름으로 넘깁니다.
스프레드는 초과 프롭을 검사하지 않으므로 리뷰에서 확인합니다.
안쪽 라이브러리가 걸러 주지 않으면 `icon` 같은 자기 프롭이 DOM에 새거나 잘못된 값 경고가 날 수 있습니다.

| 계약이 커지는 상황 | 처리 |
| --- | --- |
| 라이브러리 API를 따라 프롭이 서른 개로 늘어날 것 같음 | 우리 어휘로 계약을 다시 쓰고 라이브러리 어휘는 구현 안에 둡니다 |
| 그래도 프롭 수가 줄지 않음 | `strategy-choose-single-composition-compound-and-variants`에 따라 쓰임새별 변형으로 나눕니다 |
| 안쪽 부품을 외부에서 조립해야 함 | `headerProps`, `buttonProps` 같은 내부 프롭 묶음을 만들지 않고 `strategy-prefer-children-over-render-props`에 따라 `children`으로 엽니다 |

내부 프롭 묶음을 공개하면 사용처가 안쪽 구조에 의존해 내부 변경 때 함께 깨집니다.
구조분해 기준은 `composition-read-props-without-destructuring`을 따릅니다.

**Incorrect (자기 프롭까지 스프레드로 전달합니다):**

```tsx
export interface UiIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	icon: ReactNode;
}

// 안쪽 컴포넌트가 걸러 주지 않으면 icon이 DOM까지 내려간다. 컴파일은 통과한다
export const UiIconButton = (props: UiIconButtonProps) => {
	return (
		<Button {...props}>
			{props.icon}
			{props.children}
		</Button>
	);
};
```

**Correct (자기 프롭이 있으므로 프롭을 이름으로 전달합니다):**

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
	disabled?: ButtonProps["disabled"];
	/**
	 * 눌렀을 때
	 */
	onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const UiIconButton = (props: UiIconButtonProps) => {
	return (
		<Button
			className={clsx("ui_iconButton__root", props.className)}
			aria-label={props.label}
			disabled={props.disabled}
			onClick={props.onClick}
		>
			{props.icon}
		</Button>
	);
};
```

**Correct (서로 다른 요소에 프롭을 이름으로 전달합니다):**

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
			<input id={props.inputId} value={props.value} onChange={props.onChange} />
			{props.helperText && <span className={clsx("ui_field__helper")}>{props.helperText}</span>}
		</div>
	);
};
```

**Correct (세 조건을 모두 만족하여 스프레드로 전달합니다):**

```tsx
/**
 * 표 줄
 *
 * 감싸는 컴포넌트의 프롭이 DOM 계약과 호환되어 `HTMLAttributes`를 그대로 받을 수 있다.
 */
export interface UiTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
	/**
	 * 선택된 줄로 표시할지
	 */
	selected?: TableRowProps["selected"];
}

export const UiTableRow = (props: UiTableRowProps) => {
	return (
		<TableRow {...props} className={clsx("ui_tableRow__root", props.className)} />
	);
};
```

## 4. Composition Strategy

**Impact: MEDIUM**

공용 컴포넌트는 단일·합성·명시적 변형 중 구조를 먼저 고르고 공개할 부품을 정합니다. 불리언 프롭으로 모드를 늘리지 않고, 정적 조립에는 렌더 프롭 대신 `children`을 씁니다.

### 4.1 Choose Single Components, Compound Components, and Variants Deliberately

**Rule:** `R04-01` · `strategy-choose-single-composition-compound-and-variants`

**Applies when:** 내보낸 공용 컴포넌트에 슬롯, 공개 부품, 공용 컨텍스트나 동작을 추가할 때. 반복되는 기본 설정이나 모드 API를 추가할 때. 공용 컴포넌트의 조립 구조를 재설계할 때.

**Review with:** `screen-avoid-premature-abstraction`, `strategy-avoid-boolean-prop-proliferation`, `strategy-expose-only-assembled-compound-parts`, `strategy-prefer-children-over-render-props`

**Impact: MEDIUM (필요한 확장 범위에 맞춰 단순한 컴포넌트 구조를 선택합니다)**

공용 컴포넌트는 프롭스보다 구조를 먼저 고릅니다.
표를 위에서부터 읽어 현재 필요한 단계까지만 적용합니다.

| 상황 | 선택 |
| --- | --- |
| 고정 UI | 단일 컴포넌트. 화면 지역 JSX로 둘지는 `screen-extract-local-section-components-for-runtime-boundaries`를 따릅니다 |
| 부품 조립만 필요함 | 상태 없는 합성 |
| 여러 부품이 같은 상태·동작·컨텍스트를 읽음 | 상태 있는 합성 |
| 같은 합성 조합이 반복됨 | 조합을 한 이름으로 감싼 변형 |

아래 예시는 같은 대화상자를 필요에 따라 확장합니다.
합성에 상태를 추가해도 사용처의 공개 이름은 유지하고, 반복되는 조합은 변형으로 감쌉니다.
합성 진입 파일은 부품을 `{Root, Header, Body} as const` 객체 하나로 내보냅니다.
상태 있는 합성은 `Root`가 상태를 소유해 부품에 컨텍스트로 내립니다.
렌더 프롭은 `strategy-prefer-children-over-render-props`를,
공개 부품의 범위는 `strategy-expose-only-assembled-compound-parts`를 따릅니다.

**Incorrect (단일·합성·변형을 구분하지 않고 한 컴포넌트에 모두 구현합니다):**

```tsx
export interface WgProfileDialogProps {
	isCompact?: boolean;
	showActivity?: boolean;
	showFocus?: boolean;
	dialogTitle?: string;
	renderFooter?: () => ReactNode;
}

export const WgProfileDialog = (props: WgProfileDialogProps) => {
	return (
		<section className={props.isCompact ? "dialog dialog--compact" : "dialog"}>
			<header>
				<h3>{props.dialogTitle}</h3>
			</header>
			<WgProfileSummary />
			{props.showActivity && <WgProfileActivityPanel />}
			{props.showFocus && <WgProfileFocusPanel />}
			<footer>{props.renderFooter?.()}</footer>
		</section>
	);
};
```

**Correct (1단계 — 확장이 필요 없으면 단일 컴포넌트로 둡니다):**

```tsx
/**
 * 프로필 요약만 보여 주는 고정 구조 대화상자
 *
 * 사용처가 끼워 넣을 자리가 없어 부품으로 쪼개지 않는다.
 */
export interface WgProfileDialogProps {
	/**
	 * 헤더에 그릴 제목
	 */
	title: string;
	/**
	 * 요약 영역에 그릴 프로필
	 */
	profile: Profile;
}

export const WgProfileDialog = (props: WgProfileDialogProps) => {
	return (
		<section className={clsx("wg_profileDialog__root")}>
			<header className={clsx("wg_profileDialog__header")}>
				<h3>{props.title}</h3>
			</header>
			<WgProfileSummary profile={props.profile} />
		</section>
	);
};
```

**Correct (2단계 — 사용처가 부품을 조립해야 하면 상태 없는 합성으로 엽니다):**

```txt
component/widget/profile-dialog/
├── wg-profile-dialog.tsx              진입. 부품을 모아 내보냅니다
├── _wg-profile-dialog-root.tsx
├── _wg-profile-dialog-header.tsx
├── _wg-profile-dialog-body.tsx
└── _type/
    └── profile-dialog-part.ts         세 부품이 나눠 쓰는 계약
```

```tsx
// component/widget/profile-dialog/_type/profile-dialog-part.ts
/**
 * 대화상자 부품 셋이 나눠 쓰는 계약
 *
 * 세 부품 모두 받는 것이 `children` 하나뿐이라 형태를 하나로 둔다.
 */
export interface WgProfileDialogPartProps {
	/**
	 * 그 부품 자리에 사용처가 넣을 내용
	 */
	children: ReactNode;
}
```

```tsx
// component/widget/profile-dialog/_wg-profile-dialog-root.tsx
import {clsx} from "clsx";

import type {WgProfileDialogPartProps} from "@/component/widget/profile-dialog/_type/profile-dialog-part";

/**
 * 대화상자 틀. 나머지 부품은 이 안에서만 그린다
 */
export const WgProfileDialogRoot = (props: WgProfileDialogPartProps) => {
	return <section className={clsx("wg_profileDialog__root")}>{props.children}</section>;
};
```

```tsx
// component/widget/profile-dialog/wg-profile-dialog.tsx
import {WgProfileDialogBody} from "@/component/widget/profile-dialog/_wg-profile-dialog-body";
import {WgProfileDialogHeader} from "@/component/widget/profile-dialog/_wg-profile-dialog-header";
import {WgProfileDialogRoot} from "@/component/widget/profile-dialog/_wg-profile-dialog-root";

export const WgProfileDialog = {
	Root: WgProfileDialogRoot,
	Header: WgProfileDialogHeader,
	Body: WgProfileDialogBody,
} as const;
```

**Correct (3단계 — 부품이 같은 상태를 읽으면 공개 이름을 그대로 두고 컨텍스트만 더합니다):**

```ts
// component/widget/profile-dialog/_hook/use-profile-dialog.ts
/**
 * 대화상자 부품이 나눠 읽는 접힘 상태
 */
interface WgProfileDialogContextValue {
	/**
	 * 본문이 펼쳐져 있는지
	 */
	isBodyOpen: boolean;
	/**
	 * 헤더가 부르는 접기 토글
	 */
	toggleBody: () => void;
}

export const WgProfileDialogContext = createContext<WgProfileDialogContextValue | null>(null);
```

```tsx
// component/widget/profile-dialog/_wg-profile-dialog-root.tsx
/**
 * 대화상자 틀. 접힘 상태를 소유해 부품에 컨텍스트로 내린다
 */
export const WgProfileDialogRoot = (props: WgProfileDialogPartProps) => {
	const [isBodyOpen, setIsBodyOpen] = useState(true);

	/**
	 * 헤더가 부를 접기 토글. 이전 값에 기대므로 함수형으로 갱신한다
	 */
	const toggleBody = () => {
		setIsBodyOpen((previous) => !previous);
	};

	// Header 는 useContext(WgProfileDialogContext) 로 읽어 toggleBody 를 부른다. 공개 이름은 2단계와 같다
	return (
		<WgProfileDialogContext value={{isBodyOpen, toggleBody}}>
			<section className={clsx("wg_profileDialog__root")}>{props.children}</section>
		</WgProfileDialogContext>
	);
};
```

**Correct (4단계 — 같은 조합이 반복되면 이름 붙인 변형으로 감쌉니다):**

```tsx
/**
 * 읽기 전용 프로필 대화상자
 *
 * 세 화면이 같은 조합을 쓰고 있어 조립을 한 이름 뒤로 고정한다.
 */
export interface WgReadOnlyProfileDialogProps {
	/**
	 * 요약 영역에 그릴 프로필
	 */
	profile: Profile;
}

export const WgReadOnlyProfileDialog = (props: WgReadOnlyProfileDialogProps) => {
	return (
		<WgProfileDialog.Root>
			<WgProfileDialog.Header>프로필 보기</WgProfileDialog.Header>
			<WgProfileDialog.Body>
				<WgProfileSummary profile={props.profile} />
			</WgProfileDialog.Body>
		</WgProfileDialog.Root>
	);
};
```

### 4.2 Expose Only Compound Parts the Consumer Assembles

**Rule:** `R04-02` · `strategy-expose-only-assembled-compound-parts`

**Applies when:** 합성 컴포넌트의 공개 부품 목록에 부품을 넣거나 뺄 때.

**Review with:** `css/composition-do-not-add-wrapper-elements-for-styling`, `strategy-choose-single-composition-compound-and-variants`

**Impact: MEDIUM (내부 구조를 공개 계약과 분리해 이후 변경 범위를 줄입니다)**

합성 컴포넌트의 공개 부품은 사용처가 직접 조립해야 하는 영역만 엽니다.

| 영역 | 공개 여부 |
| --- | --- |
| 부품이 없으면 사용처가 자기 JSX를 넣을 수 없는 자리 | 공개합니다 |
| 공용 컨텍스트나 동작을 직접 쓰는 자리 | 공개합니다 |
| 단순 `className` 래퍼와 그 밖의 내부 구조 | 공개하지 않습니다 |
| 여백 보정용 DOM | `css/composition-do-not-add-wrapper-elements-for-styling`에 따라 만들지 않습니다 |

상태 없는 합성에 상태를 추가할 때의 공개 이름은
`strategy-choose-single-composition-compound-and-variants`를 따릅니다.

**Incorrect (내부 구조를 전부 공개해 계약으로 굳힙니다):**

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

**Correct (조립에 필요한 것만 공개합니다):**

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

**Applies when:** `ui`나 `widget` 컴포넌트에 불리언 모드·표시 프롭을 추가할 때. 기존 불리언 프롭 조합과 JSX 분기가 늘어날 때. 제외: 라우트 진입 파일 안에서만 쓰는 일회성 분기인 경우. 제외: `disabled`·`checked` 같은 독립 상태 프롭만 여는 경우.

**Review with:** `strategy-expose-only-assembled-compound-parts`

**Impact: MEDIUM (모드별 분기와 조합을 컴포넌트 구조에서 확인할 수 있습니다)**

여러 파일·레이어에서 재사용하는 공용 `ui`·`widget`은 모드별 불리언 조합 대신 구조를 드러냅니다.
`isCompact`·`isEditing`·`showSearch`가 늘어나면 가능한 조합과 JSX·스타일 분기도 함께 늘어납니다.

| 조건 | 판단 |
| --- | --- |
| 모양이나 모드를 정하는 불리언이 둘 이상임 | 변형 또는 합성 컴포넌트로 구조를 다시 고릅니다 |
| 같은 불리언을 JSX 분기와 클래스 조건에 함께 사용함 | 변형 또는 합성 컴포넌트로 구조를 다시 고릅니다 |
| `disabled`, `checked`, `selected`, `open`처럼 독립 상태를 나타냄 | 유지합니다. 불리언이라는 이유만으로 없애지 않습니다 |

불리언 개수 자체보다 서로 배타적인 모드를 조합으로 표현하는지 확인합니다.
공개 부품을 `.Root`처럼 묶는 형태는 `strategy-choose-single-composition-compound-and-variants`를 따릅니다.

**Incorrect (불리언 프롭 조합으로 공용 컴포넌트가 비대해집니다):**

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

**Correct (모드를 변형 컴포넌트와 상태 없는 합성으로 분리합니다):**

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

**Applies when:** 공용 컴포넌트에 헤더·푸터·동작 같은 정적 슬롯을 추가·변경할 때. 렌더 프롭을 추가·변경하는데 실행 환경 데이터 주입이 꼭 필요한지 불분명할 때. `ReactNode` 슬롯이나 렌더 함수 계약에 이름을 붙이거나 바꿀 때.

**Impact: MEDIUM (실행 문맥이 필요 없는 조립을 JSX 구조로 바로 읽을 수 있습니다)**

상태 없는 합성으로 충분한 공용 컴포넌트는 렌더 프롭보다 `children`을 우선합니다.

| 상황 | 선택 |
| --- | --- |
| 부모가 자식 자리만 열어 줌 | `children`과 네임스페이스 슬롯 부품 |
| 부모가 항목·순번·상태 같은 실행 문맥을 자식에게 전달해야 함 | 이때만 `renderHeader`, `renderFooter` 같은 렌더 프롭을 씁니다 |

| 별도 이름이 필요한 계약 | 이름 |
| --- | --- |
| `ReactNode` 값 | `<Owner>Slot` |
| 실행 문맥을 받아 `ReactNode`를 만드는 함수 | `<Owner>Renderer` |

한 번만 쓰는 익명 형태에 접미사를 붙이려고 새 타입을 만들지는 않습니다.

**Incorrect (정적인 구조를 렌더 프롭으로 조립합니다):**

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

**Correct (`children`과 네임스페이스 슬롯 부품으로 구조를 드러냅니다):**

```tsx
/**
 * 패널 부품 셋이 나눠 쓰는 계약
 *
 * 세 부품 모두 받는 것이 `children` 하나뿐이라 형태를 하나로 둔다.
 */
export interface UiPanelPartProps {
	/**
	 * 그 부품 자리에 사용처가 넣을 내용
	 */
	children: ReactNode;
}

/**
 * 패널 틀
 */
const UiPanelRoot = (props: UiPanelPartProps) => {
	return <section className={clsx("ui_panel__root")}>{props.children}</section>;
};

/**
 * 패널 위쪽 제목 자리
 */
const UiPanelHeader = (props: UiPanelPartProps) => {
	return <header className={clsx("ui_panel__header")}>{props.children}</header>;
};

/**
 * 패널 아래쪽 동작 자리
 */
const UiPanelFooter = (props: UiPanelPartProps) => {
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

프롭스 계약은 컴포넌트 바로 위에 선언하고 값은 `props.`로 읽어 출처를 남깁니다. 본문은 훅, 핸들러, 이펙트, 반환 순으로 읽힙니다. JSX 안에는 동작을 숨기지 않고, 컴포넌트를 컴포넌트 안에서 정의하지 않습니다. `ref`는 실제 명령형 계약이 있을 때만 열고, `Activity`는 숨긴 상태와 DOM을 보존해야 할 때만 씁니다. 조각과 조건부 렌더링은 형태를 하나로 고정합니다.

### 5.1 Read Props Through the Props Object Without Destructuring

**Rule:** `R05-01` · `composition-read-props-without-destructuring`

**Applies when:** 함수 컴포넌트의 시그니처나 본문에서 프롭스를 읽는 코드를 추가·변경할 때. 컴포넌트 안에서 `props`를 구조분해하는 줄을 넣거나 뺄 때.

**Review with:** `data-preserve-origin-chaining`, `screen-keep-derived-values-close`, `typescript/values-read-objects-through-chains`

**Impact: HIGH (값이 프롭스에서 왔다는 사실이 쓰는 자리마다 그대로 남습니다)**

컴포넌트는 `props` 전체를 받고, 사용하는 곳에서 `props.id`처럼 읽습니다.
시그니처·본문·중첩 함수 어디에서도 구조분해하지 않습니다.
객체 출처를 유지하는 기본 기준은 `typescript/values-read-objects-through-chains`를 따릅니다.

| 상황 | 처리 |
| --- | --- |
| `{...props}`로 그대로 전달함 | 구조분해가 아니며 출처도 유지됩니다. 허용 조건은 `typing-choose-wrapper-shape-and-forwarding`을 따릅니다 |
| 선택 프롭에 기본값이 필요함 | `typescript/absence-expose-optional-values-instead-of-silent-fallbacks`를 따릅니다. 사용하는 곳에서 값을 직접 비교하면 기본값이 필요하지 않습니다 |

**Incorrect (시그니처에서 구조분해합니다):**

```tsx
const WgUserCard = ({ label, onSave }: WgUserCardProps) => {
	return <button onClick={onSave}>{label}</button>;
};
```

**Incorrect (본문 첫 줄에서 구조분해합니다):**

```tsx
const WgUserCard = (props: WgUserCardProps) => {
	const { label, onSave } = props;
	return <button onClick={onSave}>{label}</button>;
};
```

**Correct (`props`로 읽어 출처를 남깁니다):**

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
부모가 다시 렌더될 때마다 자식 컴포넌트 타입이 새로 만들어집니다.
그래서 재마운트, 포커스 초기화, 애니메이션 재시작, 이펙트 재실행이 생깁니다.

로컬에서 JSX 조각을 재사용하려면 독립 컴포넌트로 빼고 프롭스로 전달합니다.

**Incorrect (렌더마다 새 컴포넌트 타입을 만듭니다):**

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
				alt={props.user.name}
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

**Correct (컴포넌트를 바깥으로 분리하고 프롭스로 넘깁니다):**

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
	/**
	 * 아바타로 구분하는 사용자 이름
	 */
	alt: string;
}

export const WgUserProfileAvatar = (props: WgUserProfileAvatarProps) => {
	return (
		<img
			className={clsx(
				"wg_userProfileAvatar__image",
				props.theme === "dark" && "wg_userProfileAvatar__image--dark",
			)}
			src={props.src}
			alt={props.alt}
		/>
	);
};

export const WgUserProfileCard = (props: WgUserProfileCardProps) => {
	return (
		<section>
			<WgUserProfileAvatar src={props.user.avatarUrl} alt={props.user.name} theme={props.theme} />
		</section>
	);
};
```

### 5.3 Use Named Handlers Instead of Hiding Logic in JSX

**Rule:** `R05-03` · `composition-named-handlers-over-inline`

**Applies when:** TSX 이벤트 프롭의 인라인 콜백에 분기나 비동기 호출을 추가·수정할 때. 인라인 콜백에 여러 동작·부수효과나 읽어도 의도가 안 보이는 상태 전환이 들어갈 때. 제외: 인자 없이 핸들러 참조만 넘기는 경우.

**Requires selected:** `docs-require-jsdoc-on-key-declarations` · 함께 적용

**Review with:** `events-curry-extra-handler-arguments`, `events-run-user-actions-in-handlers-not-effects`, `typescript/functions-extract-helpers-only-when-the-boundary-is-real`

**Impact: MEDIUM (부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽습니다)**

JSX에는 이름 붙인 핸들러 참조만 넘깁니다.
분기, 비동기 호출, 여러 부수효과가 들어가면 핸들러로 분리합니다.

추가 인자를 넘기려고 `onClick={() => handleX(id)}` 같은 인라인 래퍼를 쓰지 않습니다.
그 자리는 `events-curry-extra-handler-arguments`가 커링으로 정합니다.

**Incorrect (분기와 비동기를 JSX 안에 숨깁니다):**

```tsx
<UiButton
	onClick={() => {
		if (!selectedProduct) {
			return;
		}

		mutationProductRemove.mutate({params: {productId: selectedProduct.id}});
	}}
>
	삭제
</UiButton>
```

**Correct (로직을 이름 붙인 핸들러로 뺍니다):**

```tsx
import type {MouseEventHandler} from "react";

/**
 * 선택된 product 를 지운다. 성공 뒤 이동은 mutation 콜백이 이어 간다
 */
const handleRemoveProductButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	if (!selectedProduct) {
		return;
	}

	mutationProductRemove.mutate({params: {productId: selectedProduct.id}});
};

<UiButton onClick={handleRemoveProductButtonClick}>삭제</UiButton>;
```

### 5.4 Open ref Props Only for Real Imperative Contracts

**Rule:** `R05-04` · `composition-open-ref-props-only-for-imperative-contracts`

**Applies when:** 컴포넌트에 `ref` 프롭을 추가하거나 공개할 대상을 바꿀 때. `useImperativeHandle`로 노출하는 명령형 계약 타입을 만들거나 이름을 바꿀 때. 제외: DOM 요소를 그대로 가리키는 기존 `ref` 계약의 타입만 바꾸는 경우.

**Review with:** `typescript/docs-justify-convention-exceptions-with-a-reason-comment`, `typing-narrow-library-wrapper-contracts`

**Impact: MEDIUM (사용하지 않는 명령형 계약이 공용 컴포넌트에 늘어나는 것을 막습니다)**

`ref`는 사용처가 포커스·스크롤·측정 등을 직접 제어해야 할 때만 엽니다.
현재 사용처가 없으면 미리 공개하지 않습니다.

| 조건 | 처리 |
| --- | --- |
| 리액트 19 이상만 지원함 | `forwardRef`로 감싸지 않고 `ref`를 일반 프롭으로 받습니다 |
| 리액트 18 이하도 지원함 | `forwardRef` 계약을 유지합니다. 지원 버전을 바꾸지 않고 일괄 전환하지 않습니다 |
| `useImperativeHandle`로 명령 메서드를 공개함 | 계약 이름을 `<Owner>Handle`로 짓습니다 |
| DOM 요소를 직접 가리킴 | 별도 `Handle` 타입을 만들지 않습니다 |
| 외부 패키지 타입 제약으로 래퍼가 필요함 | `typescript/docs-justify-convention-exceptions-with-a-reason-comment`에 따라 이유를 남깁니다 |

**Incorrect (`ref` 계약이 필요 없는 단순 화면 컴포넌트에도 습관적으로 `ref`를 노출합니다):**

```tsx
import type {Ref} from "react";

export interface UiStatusBadgeProps {
	ref?: Ref<HTMLSpanElement>;
	label: string;
}

export const UiStatusBadge = (props: UiStatusBadgeProps) => {
	return <span ref={props.ref}>{props.label}</span>;
};
```

**Correct (`ref`가 실제로 필요한 공개 API일 때만 리액트 19 방식으로 직접 받습니다):**

```tsx
import type {ChangeEventHandler, Ref} from "react";

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

**Correct (`ref`가 실제 계약이 아닐 때는 일반 프롭만 둡니다):**

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

**Correct (명령 메서드 묶음을 노출할 때만 `useImperativeHandle`과 `<Owner>Handle` 계약을 만듭니다):**

```tsx
/**
 * 검색 입력이 밖에 여는 명령. 결과 목록이 포커스와 선택을 되돌릴 때 부른다
 */
export interface UiSearchInputHandle {
	/**
	 * 입력에 포커스를 두고 글자를 전부 선택한다
	 */
	focusAndSelect: () => void;
}

export interface UiSearchInputProps {
	/**
	 * 명령 계약. 사용처가 포커스를 되돌릴 때만 넘긴다
	 */
	ref?: Ref<UiSearchInputHandle>;
}

export const UiSearchInput = (props: UiSearchInputProps) => {
	const inputRef = useRef<HTMLInputElement>(null);

	useImperativeHandle(props.ref, () => ({
		focusAndSelect: () => {
			inputRef.current?.focus();
			inputRef.current?.select();
		},
	}));

	return <input ref={inputRef} className={clsx("ui_searchInput__root")} aria-label="검색어" />;
};
```

### 5.5 Use Activity Only to Preserve Mounted Subtrees

**Rule:** `R05-05` · `composition-use-activity-only-to-preserve-mounted-subtrees`

**Applies when:** 조건부 렌더링과 `Activity` 사이를 오갈 때. `<Activity>`를 추가·삭제하거나 `mode`를 계산하는 표현식을 바꿀 때.

**Review with:** `composition-do-not-define-components-inside-components`

**Impact: HIGH (상태 보존과 초기화 요구에 맞는 렌더 방식을 선택합니다)**

기본은 조건부 렌더링입니다. 리액트 19.2 이상에서 숨겼다 다시 보여 줄 때
하위 트리 상태를 보존해야 하는 경우에만 `<Activity>`를 씁니다. 이전 버전은 조건부 렌더링을 씁니다.

| 비교 항목 | 조건부 렌더링으로 제거 | `<Activity mode="hidden">` |
| --- | --- | --- |
| 상태와 DOM | 버립니다 | 보존합니다 |
| 이펙트 | 정리하고 다시 마운트할 때 설치합니다 | 숨길 때 정리하고 다시 보일 때 설치합니다 |
| 숨긴 동안 렌더 | 없습니다 | 업데이트가 생기면 낮은 우선순위로 렌더합니다 |
| 접근성 트리 | 빠집니다 | `display: none`이 적용되어 빠집니다 |

| 확인할 조건 | 처리 |
| --- | --- |
| 편집 취소 뒤 폼처럼 상태와 DOM을 초기화해야 함 | 조건부 렌더링을 유지합니다 |
| 구독 해제나 접근성이 목적임 | 두 방식의 차이가 아니므로 `<Activity>`를 고르는 근거로 삼지 않습니다 |
| 이펙트 정리와 재설치가 반복됨 | 상태가 남아 있어도 정상 동작하도록 작성합니다 |
| 동영상 재생 등 DOM 자체 동작을 멈춰야 함 | DOM 보존으로 계속될 수 있으므로 이펙트 정리에서 명시적으로 멈춥니다 |
| 하위 트리가 무거움 | 숨겨도 업데이트 시 렌더되므로 습관적으로 보존하지 않습니다 |

**Incorrect (초기화해야 할 폼을 숨겨 상태를 보존합니다):**

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

**Correct (폼 초기화가 필요하면 조건부 렌더링을 유지합니다):**

```tsx
// 편집을 취소하면 폼이 해제돼서 다시 들어갈 때 빈 입력으로 시작한다
return (
	<Fragment>
		{isEditing && <PgProductEditorForm />}
		{!isEditing && <PgProductPreviewPane />}
	</Fragment>
);
```

**Incorrect (다시 보여 줄 때 필요한 상태를 조건부 렌더링으로 잃습니다):**

```tsx
// 사이드바: 접어 둔 노드와 스크롤 위치를 자기 상태로 갖는다
const PgProductSidebar = () => {
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

	return <UiTree expandedKeys={expandedKeys} onExpand={setExpandedKeys} />;
};

// 사이드바를 소유한 화면: 닫으면 해제돼서 접어 둔 노드와 스크롤 위치가 사라진다
return isSidebarOpen && <PgProductSidebar />;
```

**Correct (다시 보여 줄 때 하위 트리 상태를 보존해야 하는 경우에만 씁니다):**

```tsx
// 사이드바: 접어 둔 노드와 스크롤 위치를 자기 상태로 갖는다
const PgProductSidebar = () => {
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

	return <UiTree expandedKeys={expandedKeys} onExpand={setExpandedKeys} />;
};

// 사이드바를 소유한 화면: 닫아도 상태와 DOM을 보존하고 이펙트는 정리한다
return (
	<Activity mode={isSidebarOpen ? "visible" : "hidden"}>
		<PgProductSidebar />
	</Activity>
);
```

### 5.6 Declare Props Interfaces Above the Component

**Rule:** `R05-06` · `composition-declare-props-interface-above-the-component`

**Applies when:** 컴포넌트 프롭스 타입을 새로 선언할 때. 프롭스 타입의 위치나 공개 범위를 바꿀 때. 제외: 같은 파일에서만 쓰는 화면 지역 프롭스를 `export`하지 않는 경우.

**Review with:** `composition-read-props-without-destructuring`, `typescript/types-document-custom-types-and-shapes`

**Impact: MEDIUM (계약과 구현을 일정한 순서로 읽을 수 있습니다)**

프롭스는 `<컴포넌트 이름>Props`라는 `interface`로 선언하고 해당 컴포넌트 바로 위에 둡니다.
`UiButton`이면 `UiButtonProps`이며, 파일 상단에 프롭스 타입을 따로 모으지 않습니다.

| 상황 | 선언과 공개 위치 |
| --- | --- |
| 다른 파일에서 사용하는 컴포넌트 | 사용처가 계약을 참조하도록 프롭스 `interface`를 `export`합니다 |
| 같은 파일 안에서만 쓰는 화면 지역 컴포넌트 | 프롭스 `interface`를 `export`하지 않습니다 |
| 합성 부품의 프롭스 형태가 완전히 같음 | 공통 이름 하나로 공유합니다. 모두 `{children}`인 `UiSectionRoot`, `UiSectionHeader`, `UiSectionFooter`는 `UiSectionProps`를 씁니다 |
| 공유하는 부품이 한 파일에 있음 | 공유 `interface`를 첫 부품 위에 둡니다 |
| 공유하는 부품이 여러 파일에 나뉨 | 공유 `interface`를 소유자 `_type` 폴더에 둡니다 |

문서 주석 → `interface` → 컴포넌트 순서로 붙여 계약을 먼저 읽게 합니다. 합성 공개 부품도 같습니다.
공유 `interface`를 쓰는 부품의 개별 설명은 각 컴포넌트 위에 둡니다.

| 관련 판단 | 기준 |
| --- | --- |
| 같은 형태의 중복 선언 | `typescript/types-reuse-existing-contracts-before-new-types` |
| 컴포넌트가 아닌 함수의 객체 매개변수 | `typescript/functions-use-named-object-params-for-complex-signatures` |
| 문서 주석 내용 | `typescript/types-document-custom-types-and-shapes` |

**Incorrect (파일 위쪽에 타입을 모으고 내보내지 않습니다):**

```tsx
interface UiBadgeProps {
	label: string;
}

interface UiChipProps {
	label: string;
}

export const UiBadge = (props: UiBadgeProps) => {
	return <span className={clsx("ui_badge__root")}>{props.label}</span>;
};

export const UiChip = (props: UiChipProps) => {
	return <span className={clsx("ui_chip__root")}>{props.label}</span>;
};
```

**Correct (각 컴포넌트 바로 위에 선언하고 내보냅니다):**

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

/**
 * 선택 칩 계약
 */
export interface UiChipProps {
	/**
	 * 칩에 표시할 문구
	 */
	label: string;
}

export const UiChip = (props: UiChipProps) => {
	return <span className={clsx("ui_chip__root")}>{props.label}</span>;
};
```

**Incorrect (설명이 컴포넌트에 붙어 계약과 떨어집니다):**

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

**Correct (설명, 계약, 선언을 붙여 둡니다):**

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

**Impact: MEDIUM (Fragment를 검색하고 변경 내역에서 식별하기 쉽습니다)**

여러 요소를 감쌀 때는 `react`에서 가져온 `<Fragment>`를 쓰고 `<>`·`</>`는 쓰지 않습니다.
검색과 diff에 이름을 남기고, 목록에서 `key`가 필요해져도 `<Fragment key={…}>` 형태를 유지합니다.

가져오기는 `typescript/naming-use-direct-imports-and-public-entry-points`에 따라
`import {Fragment} from "react";`로 적습니다.
`<>`를 강제하는 `biome`의 `style/useFragmentSyntax`는 켜지 않습니다.
설정은 `typescript/tooling-configure-biome-to-enforce-these-rules`를 따릅니다.

**Incorrect (`Fragment` 단축 문법을 씁니다):**

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

**Correct (`Fragment`를 그대로 씁니다):**

```tsx
import {Fragment} from "react";

export const PgProductScreen = () => {
	return (
		<Fragment>
			<PgProductFilterSection />
			<PgProductTableSection />
		</Fragment>
	);
};
```

**Incorrect (목록에서도 짧은 문법을 써서 `key`를 붙일 자리가 없습니다):**

```tsx
export const PgProductRows = (props: PgProductRowsProps) => {
	return props.products.map((product) => (
		<>
			<PgProductRow product={product} />
			<PgProductRowDivider />
		</>
	));
};
```

**Correct (`key`가 필요해도 같은 형태를 씁니다):**

```tsx
import {Fragment} from "react";

export const PgProductRows = (props: PgProductRowsProps) => {
	return props.products.map((product) => (
		<Fragment key={product.id}>
			<PgProductRow product={product} />
			<PgProductRowDivider />
		</Fragment>
	));
};
```

### 5.8 Render JSX Branches With Explicit Conditions

**Rule:** `R05-08` · `composition-render-one-branch-with-and`

**Applies when:** JSX 안에 조건부 렌더링을 추가하거나 조건식을 바꿀 때. 기존 JSX 삼항이나 `조건 && …`을 넣거나 뺄 때.

**Impact: HIGH (각 요소 바로 앞에 표시 조건이 남아 화면 분기를 바로 읽을 수 있습니다)**

JSX 분기는 각 요소 바로 앞에 표시 조건이 드러나도록 적습니다.

| 표현할 내용 | 형태 |
| --- | --- |
| 조건에 따라 JSX 요소를 표시함 | 분기마다 `&&`를 따로 씁니다. 참·거짓 요소를 삼항 하나로 묶지 않습니다 |
| 컴포넌트 전체를 표시하지 않음 | `&&` 대신 이른 반환으로 `null`을 반환합니다 |
| 문자열·숫자·프롭 등 값 하나를 고름 | 이때만 삼항을 씁니다 |

서로 다른 분기는 같은 판별값을 기준으로 조건이 겹치지 않게 적습니다.
숨긴 하위 트리의 상태를 보존해야 하면 `composition-use-activity-only-to-preserve-mounted-subtrees`를 따릅니다.

`&&` 왼쪽에는 숫자를 두지 않습니다. 거짓으로 평가되는 `0`과 `NaN`도 화면에 그대로 렌더됩니다.
길이·개수는 비교식으로 바꿔 불리언으로 판단합니다.

**Incorrect (JSX 두 분기를 삼항 하나로 묶습니다):**

```tsx
return (
	<section>
		{props.view === "chart" ? <PgChart /> : <PgTable />}
	</section>
);
```

**Correct (각 JSX 요소 앞에 표시 조건을 둡니다):**

```tsx
return (
	<section>
		{props.view === "chart" && <PgChart />}
		{props.view === "table" && <PgTable />}
	</section>
);
```

**Incorrect (`&&` 왼쪽에 숫자를 둬서 `0`이 그려집니다):**

```tsx
return <section>{selectedRows.length && <PgProductBulkActionBar />}</section>;
```

**Correct (`&&` 왼쪽에 불리언 비교식을 씁니다):**

```tsx
return <section>{selectedRows.length > 0 && <PgProductBulkActionBar selectedRows={selectedRows} />}</section>;
```

**Incorrect (컴포넌트 전체를 표시하지 않을 때 `&&`를 씁니다):**

```tsx
const PgProductPanel = (props: PgProductPanelProps) => {
	return props.isVisible && <section className={clsx("pg_productPanel__root")}>{props.children}</section>;
};
```

**Correct (컴포넌트 전체를 표시하지 않으면 이른 반환합니다):**

```tsx
const PgProductPanel = (props: PgProductPanelProps) => {
	if (!props.isVisible) {
		return null;
	}

	return <section className={clsx("pg_productPanel__root")}>{props.children}</section>;
};
```

**Correct (프롭 값 하나는 삼항으로 고릅니다):**

```tsx
return <UiBadge tone={props.isSelected ? "accent" : "neutral"} />;
```

### 5.9 Order Hooks, Handlers, Effects, Then Return

**Rule:** `R05-09` · `composition-order-hooks-handlers-effects-then-return`

**Applies when:** 컴포넌트 본문에 훅·핸들러·이펙트를 추가하거나 자리를 옮길 때. 본문 선언이 아래 선언을 참조해 순서를 다시 잡을 때.

**Review with:** `events-run-user-actions-in-handlers-not-effects`, `screen-keep-derived-values-close`

**Impact: HIGH (컴포넌트마다 훅·핸들러·이펙트를 같은 순서로 찾을 수 있습니다)**

컴포넌트 본문은 아래 네 구획 순서로 작성합니다.
렌더 중에 읽는 값은 사용 위치보다 위에서 선언합니다.

| 순서 | 구획 | 내용 |
| --- | --- | --- |
| 1 | 훅 | 라우터·스토어·쿼리·컨텍스트·커스텀 훅과 `useState`, `useRef` |
| 2 | 핸들러 | `handle*` 함수 |
| 3 | 이펙트 | `useEffect`, `useLayoutEffect` |
| 4 | 반환 | 이른 반환과 JSX |

이펙트의 인자와 의존성 배열은 해당 줄에서 평가되므로, 이펙트를 마지막 훅으로 두어 앞선 선언을 참조합니다.
이른 반환은 모든 훅 뒤에 두어 렌더마다 훅 호출 개수를 유지합니다.
구획 안에서는 선언 뒤에 참조한다는 조건만 지키고 별도 순서를 강제하지 않습니다.
파생 값은 별도 구획으로 모으지 않고 `screen-keep-derived-values-close`에 따라 사용하는 곳에서 계산합니다.

**Incorrect (같은 종류가 흩어지고 이펙트가 아래 선언을 의존성으로 참조합니다):**

```tsx
export const PgOrderToolbar = () => {
	// selectedIds는 아직 초기화 전이라 의존성 배열을 평가하는 이 줄에서 깨진다
	useEffect(() => {
		document.title = `주문 ${selectedIds.length}건 선택`;
	}, [selectedIds]);

	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const handleClearButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		setSelectedIds([]);
	};

	const [isPanelOpen, setIsPanelOpen] = useState(false);

	const handlePanelOpenButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		setIsPanelOpen(true);
	};

	return <section className={clsx("pg_orderToolbar__root")}>{props.children}</section>;
};
```

**Correct (네 구획이 순서대로 놓입니다):**

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

### 5.10 Split Owner Parts Only for Runtime Boundaries

**Rule:** `R05-10` · `composition-split-owner-parts-only-for-runtime-boundaries`

**Applies when:** 위젯이나 ui 컴포넌트 안에서 JSX 일부를 별도 컴포넌트 파일로 떼거나 되돌릴 때. 제외: 라우트 진입 파일의 섹션을 나누는 경우.

**Review with:** `ownership-place-owner-files-in-role-folders`, `screen-extract-local-section-components-for-runtime-boundaries`, `strategy-expose-only-assembled-compound-parts`

**Impact: HIGH (자체 책임이 있는 부품만 분리해 소유자 안 파일 수와 구조를 읽기 쉽게 유지합니다)**

위젯과 ui 컴포넌트 안의 부품은 아래 책임 중 하나를 직접 소유할 때만 파일로 뗍니다.
단순 래퍼, `className` 묶음, 들여쓰기 감소, 파일이 길다는 느낌은 분리 근거가 아닙니다.

| 책임 | 예 |
| --- | --- |
| 비동기 | `Suspense`·스켈레톤·로딩·오류·빈 상태 |
| 상태와 프로바이더 | 지역 상태·이펙트 동기화·폼 프로바이더·컨텍스트 |
| 상호작용 | 팝오버·모달·선택·인라인 편집·드래그·펼치는 트리 |
| 라이브러리와 성능 | 외부 위젯 생명주기 어댑터·가상 스크롤·전환·지연 값 |
| 재사용 | 같은 소유자 안 두 곳 이상이 같은 부품을 렌더 |
| 조립 | 사용처가 넣고 빼거나 스타일을 바꾸도록 공개하는 합성 부품 |

컨텍스트를 읽어 분기만 하는 부품은 진입 파일에 남깁니다.
라우트 진입 파일의 섹션은 `screen-extract-local-section-components-for-runtime-boundaries`가 같은 기준으로 판단합니다.
뗀 파일의 이름은 `ownership-prefix-layer-names-on-files-and-symbols`를 따릅니다.
자리는 `ownership-place-owner-files-in-role-folders`를 따릅니다.

**Incorrect (컨텍스트를 읽어 분기만 하는 래퍼를 파일로 뗍니다):**

```tsx
// component/widget/chatbot/_wg-chat-content.tsx: 어느 화면을 그릴지 고르기만 하고 상태를 소유하지 않는다
export const WgChatContent = () => {
	const chat = useChatContext();

	return (
		<Fragment>
			{chat.isEmpty && <p className={clsx("wg_chatbot__empty")}>{chat.emptyMessage}</p>}
			{!chat.isEmpty && <WgChatMessages messages={chat.messages} />}
		</Fragment>
	);
};
```

**Correct (분기는 진입 파일에 남기고 상태를 소유한 부품만 뗍니다):**

```tsx
// component/widget/chatbot/wg-chatbot.tsx
/**
 * 챗봇 위젯 진입. 대화 목록과 입력 폼을 조립한다
 */
export const WgChatbot = () => {
	const chat = useChatContext();

	return (
		<section className={clsx("wg_chatbot__root")}>
			{/**
			 * 대화 목록. 비어 있으면 안내 문구를 그린다
			 */}
			{chat.isEmpty && <p className={clsx("wg_chatbot__empty")}>{chat.emptyMessage}</p>}
			{!chat.isEmpty && <WgChatMessages messages={chat.messages} />}
			{/**
			 * 입력 폼. 전송 중 상태와 폼 프로바이더를 소유해 _wg-chat-composer.tsx 로 뗐다
			 */}
			<WgChatComposer onSubmit={chat.send} />
		</section>
	);
};
```

## 6. Screen File Discipline

**Impact: MEDIUM**

라우트 진입 파일에 화면 흐름을 드러내고, 상태나 비동기를 직접 소유한 섹션만 추출합니다. 파생값은 사용처에서 계산하고 필요가 확인되기 전에 분리하지 않습니다.

### 6.1 Keep Route Entry Files Focused on Screen Flow

**Rule:** `R06-01` · `screen-keep-route-flow-visible`

**Applies when:** 라우트 진입의 search 파라미터, 화면 이동, 쿼리, 뮤테이션, 화면 전체 이펙트를 옮기거나 나눌 때. 화면 섹션 조립의 순서나 소유자를 바꿀 때. 제외: 같은 소유자 안에서 표현만 바꾸는 경우.

**Review with:** `ownership-place-owner-files-in-role-folders`, `screen-extract-local-section-components-for-runtime-boundaries`

**Impact: HIGH (진입 파일만 봐도 화면 흐름을 따라갈 수 있습니다)**

라우트 진입은 화면 흐름을 조립하고, 데이터와 동작은 사용하는 컴포넌트가 소유합니다.
다른 규칙이 참조하는 라우트 진입의 책임은 아래 표를 기준으로 합니다.

| 라우트 진입의 책임 | 범위 |
| --- | --- |
| 섹션 조립과 `Suspense` 경계 | 경계 수는 `runtime-place-suspense-boundaries-at-the-section-owner`를 따릅니다 |
| 화면 전체 이펙트 | 화면 전체에 걸친 동기화를 소유합니다 |
| 라우트 사이의 이동 흐름 결정 | `useNavigate` 호출은 실제 동작을 일으키는 컴포넌트가 맡습니다 |

| 데이터·동작 | 소유 위치 |
| --- | --- |
| 서버 응답 | 데이터를 그리는 컴포넌트가 같은 `key`로 직접 읽습니다 |
| 뮤테이션 | 동작을 일으키는 컴포넌트가 소유합니다 |
| 라우트 params·search 파라미터 | 사용하는 곳에서 `useParams`와 URL 파서 묶음으로 읽고 씁니다 |
| 여러 응답을 합친 파생값 | 값을 그리는 섹션이 인라인 `combine`을 소유합니다 |

독립 섹션이 없는 작은 화면은 진입 컴포넌트가 데이터 소유자를 겸할 수 있습니다.
이때만 쿼리를 직접 호출하고 경계는 상위 레이아웃에 둡니다. 경계만을 위한 빈 섹션은 만들지 않습니다.
비동기·상태·상호작용 경계로 섹션을 분리해도 위 표의 화면 흐름 제어는 라우트 진입에 남깁니다.

같은 데이터가 여러 섹션에 필요해도 프롭으로 내리지 않습니다.
같은 `QueryClient`와 `key`는 캐시·진행 중인 요청을 공유하지만,
마운트·포커스 복귀·무효화 시에는 stale 상태와 옵션에 따라 다시 요청할 수 있습니다.
요청이 늘면 `staleTime`·`refetchOnMount`·실제 키를 먼저 확인합니다.
부모의 대기로 자식 요청이 늦어지면 대기 전에 실행되는 소유자에서 같은 `key`를 `usePrefetchQuery`로 먼저 요청합니다.

소유자가 바뀌지 않는 `query.select`·바인딩·별칭 정리와 파생 상태 이펙트의 렌더 계산 전환은 대상이 아닙니다.
순수 타입·전송 값 조립 함수·기본 설정의 형제 `.ts` 추출은
`typescript/functions-extract-helpers-only-when-the-boundary-is-real`을 따릅니다.

**Incorrect (라우트 진입이 쿼리를 대신 읽어 프롭으로 내립니다):**

```tsx
// page/products/pg-products.tsx
export const PgProducts = () => {
	const [urlParams] = useQueryStates(productUrlParsers);
	const responseProductListSuspense = useProductListSuspense({page: urlParams.page});

	return (
		<Fragment>
			<PgProductFilterSection />
			<PgProductListSection products={responseProductListSuspense.data.list} />
		</Fragment>
	);
};
```

**Correct (라우트 진입은 조립과 경계를 맡고, 섹션은 자신의 쿼리 키로 데이터를 읽습니다):**

```tsx
// page/products/pg-products.tsx
export const PgProducts = () => {
	return (
		<Fragment>
			<PgProductFilterSection />
			<Suspense fallback={<UiLoadingFallback ariaLabel="product 목록을 불러오는 중" />}>
				<PgProductListSection />
			</Suspense>
		</Fragment>
	);
};

// page/products/_pg-product-list-section.tsx
export const PgProductListSection = () => {
	const [urlParams, setUrlParams] = useQueryStates(productUrlParsers);

	/**
	 * 표에 그릴 product를 URL의 page로 읽는다
	 */
	const responseProductListSuspense = useProductListSuspense(
		{page: urlParams.page},
		{query: {select: (response) => ({products: response.data.list})}},
	);

	const queryClient = useQueryClient();

	/**
	 * 저장에 성공하면 목록을 다시 읽고 첫 페이지로 돌려 새 product가 맨 앞에 오게 한다
	 */
	const mutationProductSave = useProductSave({
		mutation: {
			onSuccess: () => {
				void queryClient.invalidateQueries({queryKey: productListQueryKey()});
				void setUrlParams({page: 1});
			},
		},
	});

	/**
	 * 폼 값을 전송 형태로 바꿔 저장만 부르고, 저장 뒤 흐름은 mutation 콜백이 이어 간다
	 */
	const handleProductSave: UiTableProps["onSave"] = () => {
		mutationProductSave.mutate({data: toProductSaveRequest(formValues)});
	};

	return <UiTable rows={responseProductListSuspense.data.products} onSave={handleProductSave} />;
};
```

### 6.2 Avoid Premature Abstraction in Screen Code

**Rule:** `R06-02` · `screen-avoid-premature-abstraction`

**Applies when:** 화면 코드를 보조 함수, 훅, 컴포넌트, 모듈로 추출할 때. 한 곳에서만 쓰는 기존 추상화를 다시 접어 넣을 때.

**Review with:** `screen-extract-local-section-components-for-runtime-boundaries`, `typescript/functions-extract-helpers-only-when-the-boundary-is-real`

**Impact: HIGH (추측에 따른 추출을 줄이고 실제 재사용 경계에 맞춰 코드를 배치합니다)**

반복이 보인다는 이유만으로 공용 훅·컴포넌트·보조 함수를 추출하지 않습니다.
먼저 흐름을 같은 파일에서 읽을 수 있도록 정리합니다.

| 먼저 시도할 방법 | 유지할 위치 |
| --- | --- |
| 단계 변수·섹션 주석·내부 블록으로 정리 | 한 함수 안 |
| 화면 흐름이 보이도록 JSX 정리 | 화면 지역 JSX |
| 작은 변환·`href` 조립·기본값 처리 | 사용처 |

한 컴포넌트·핸들러·쿼리 `select`만 쓰는 보조 함수를 별도 모듈에 쌓지 않습니다.
한 대표 함수만 호출하는 보조도 `_function` 바로 아래에 공개하지 않습니다.
그 배치는 `typescript/functions-give-each-function-its-own-file`을 따릅니다.
이름을 붙이기 좋다는 이유만으로 흐름을 여러 파일에 나누지 않습니다.

| 추출 대상 | 허용 경계 |
| --- | --- |
| 컴포넌트 | `screen-extract-local-section-components-for-runtime-boundaries` |
| 함수 | `typescript/functions-extract-helpers-only-when-the-boundary-is-real` |
| 훅 | `ownership-prefer-plain-ts-for-local-react-helpers` |

**Incorrect (컴포넌트 하나만 쓰는 단계 보조 함수를 보조 모듈에 남깁니다):**

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

**Correct (작은 쿼리 가공과 `href` 조립은 사용처에 둡니다):**

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

**Incorrect (사용처가 한 화면뿐인데 공용 훅으로 먼저 빼냅니다):**

```ts
// _hook/use-product-filter-form.ts
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

**Correct (한 화면만 쓰는 동안은 화면 안에 그대로 둡니다):**

```tsx
// page/products/pg-products.tsx
export const PgProducts = () => {
	const [keyword, setKeyword] = useState("");
	const [categoryId, setCategoryId] = useState<string>();

	return <PgProductFilterSection keyword={keyword} />;
};
```

**Correct (두 화면이 같은 흐름을 부르게 된 뒤에 공용화합니다):**

```ts
/**
 * 등록 화면과 수정 화면이 저장 실패를 같은 문구로 보여 줘야 해서 한 곳에 묶는다.
 * 두 화면이 모두 이 훅을 부르므로 한쪽만 고치면 표시가 갈린다
 */
export const useProductEditor = () => {
	const form = useForm<ProductEditorFormValues>();
	const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

	/**
	 * 저장 실패 문구를 이 훅이 함께 들고 있어야 해서 여기서 받는다
	 */
	const mutationProductSave = useProductSave({
		mutation: {
			onError: (error) => {
				setSubmitErrorMessage(toSubmitErrorMessage(error));
			},
		},
	});

	return {form, mutationProductSave, submitErrorMessage};
};
```

**Correct (여러 보조 함수 대신 한 함수 안에서 단계별로 정리합니다):**

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

### 6.3 Extract Local Section Components Only for Runtime Boundaries

**Rule:** `R06-03` · `screen-extract-local-section-components-for-runtime-boundaries`

**Applies when:** 화면 지역 섹션 컴포넌트를 새로 추출할 때. 기존 섹션에 비동기, 지역 상태, 프로바이더, 상호작용, 외부 위젯, 성능 처리를 넣거나 뺄 때.

**Impact: HIGH (화면 흐름을 유지하면서 자체 책임이 있는 섹션만 분리합니다)**

라우트 진입의 지역 컴포넌트는 아래 책임 중 하나를 **직접 소유할 때만** 추출합니다.
단순 래퍼·`className` 묶음·들여쓰기 감소는 추출 근거가 아닙니다.

| 책임 | 예 |
| --- | --- |
| 비동기 | `Suspense`·스켈레톤·로딩·오류·빈 상태 |
| 상태와 프로바이더 | 지역 상태·이펙트 동기화·폼 프로바이더·컨텍스트·범위를 좁힌 스토어 |
| 상호작용 | 팝오버·모달·선택·인라인 편집·드래그·펼치는 트리 |
| 라이브러리와 성능 | 외부 위젯 생명주기 어댑터·가상 스크롤·전환·지연 값 |

화면 흐름 제어는 `screen-keep-route-flow-visible`에 따라 라우트 진입에 남깁니다.
추출한 파일의 배치는 `ownership-place-owner-files-in-role-folders`를 따릅니다.
진입 파일의 JSX에 나타나지 않는 섹션을 다른 섹션 파일 안에서 렌더하면 과하게 나눈 것입니다.

**Incorrect (감싸기만 하는 래퍼를 섹션으로 추출합니다):**

```tsx
const PgProductSidebarPanel = (props: PgProductSidebarPanelProps) => {
	return <section className={clsx("pg_products__sidebar")}>{props.children}</section>;
};

const PgProductDetailPanel = (props: PgProductDetailPanelProps) => {
	return <section className={clsx("pg_products__detail")}>{props.children}</section>;
};
```

**Correct (데이터·상태·상호작용을 소유한 섹션만 추출하고 자신의 쿼리 키로 읽습니다):**

```tsx
// page/products/_pg-product-tree-section.tsx
export const PgProductTreeSection = () => {
	const [urlParams, setUrlParams] = useQueryStates(productUrlParsers);
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

	/**
	 * 사이드바가 그릴 분류 노드만 남긴다. 트리 펼침 상태는 이 섹션이 따로 들고 있다
	 */
	const responseProductTreeSuspense = useProductTreeSuspense(
		{},
		{query: {select: (response) => ({categoryNodes: response.data.nodes.map(toTreeData)})}},
	);

	/**
	 * UiTree가 넘기는 key 타입이 넓어서 문자열로 좁혀 담는다
	 */
	const handleTreeExpand: UiTreeProps["onExpand"] = (keys) => {
		setExpandedKeys(keys.map(String));
	};

	/**
	 * 고른 분류를 URL에 적어 두어 새로 고침해도 같은 화면이 열리게 한다
	 */
	const handleTreeSelect: UiTreeProps["onSelect"] = (keys) => {
		const selectedKey = keys[0];

		if (selectedKey === undefined) {
			return;
		}

		void setUrlParams({categoryId: String(selectedKey)});
	};

	return (
		<section className={clsx("pg_products__sidebar")}>
			{responseProductTreeSuspense.data.categoryNodes.length > 0 && (
				<UiTree
					items={responseProductTreeSuspense.data.categoryNodes}
					expandedKeys={expandedKeys}
					selectedKeys={urlParams.categoryId ? [urlParams.categoryId] : []}
					onExpand={handleTreeExpand}
					onSelect={handleTreeSelect}
				/>
			)}
			{responseProductTreeSuspense.data.categoryNodes.length === 0 && <UiEmpty description="분류가 없습니다" />}
		</section>
	);
};
```

### 6.4 Keep Derived Values Close to Where They Are Used

**Rule:** `R06-04` · `screen-keep-derived-values-close`

**Applies when:** 화면 진입 파일이나 섹션 최상단에 `const` 별칭, 플래그, 표시값을 추가·이동·제거할 때. 훅 인자, JSX 표시값, 이펙트 안 계산을 위쪽 `const`로 빼거나 되돌릴 때.

**Review with:** `data-preserve-origin-chaining`

**Impact: MEDIUM (파생값의 출처를 유지하고 화면 상단의 별칭과 준비 코드를 줄입니다)**

`useState`와 프롭스에서 나온 조건 플래그·표시값은 사용하는 곳에서 계산합니다.
화면 상단에 준비 코드로 모으지 않고, 훅 인자·JSX·이펙트 내부의 좁은 스코프에 둡니다.

| 관련 판단 | 기준 |
| --- | --- |
| 응답과 스토어의 출처 유지 | `data-preserve-origin-chaining` |
| 값을 소유할 파일 선택 | `screen-extract-local-section-components-for-runtime-boundaries` |
| `let` 재할당·배열 `push`로 조립 | `typescript/functions-avoid-imperative-assembly-in-wide-scopes` |
| 계산한 값에 이름을 붙일지 결정 | `typescript/functions-name-a-value-only-for-recompute-or-judgment` |

이 규칙은 소유 파일 안에서 계산 위치를 정합니다. 소유자나 이름을 새로 정하는 기준은 위 규칙을 따릅니다.

**Incorrect (쓰는 자리에서 먼 화면 상단에 플래그와 표시값을 쌓습니다):**

```tsx
export const PgProductTableSection = () => {
	const responseProductListSuspense = useProductListSuspense();
	const [selectedRows, setSelectedRows] = useState<ProductRow[]>([]);

	/**
	 * 고른 행은 이 섹션 안에만 두고 route search로 올리지 않는다
	 */
	const handleTableRowSelect: UiTableProps["onRowSelect"] = (rows) => {
		setSelectedRows(rows);
	};

	// 아래 둘은 이름만 남기고 무엇에서 나온 값인지를 지운다
	const hasSelectedRows = selectedRows.length > 0;
	const bulkActionLabel = `${selectedRows.length}건 삭제`;

	return (
		<Fragment>
			<UiTable rows={responseProductListSuspense.data.products} onRowSelect={handleTableRowSelect} />

			{hasSelectedRows && <PgProductBulkActionBar label={bulkActionLabel} />}
		</Fragment>
	);
};
```

**Correct (선언을 그대로 두고 쓰는 자리에서 계산합니다):**

```tsx
export const PgProductTableSection = () => {
	const responseProductListSuspense = useProductListSuspense();
	const [selectedRows, setSelectedRows] = useState<ProductRow[]>([]);

	/**
	 * 고른 행은 이 섹션 안에만 두고 route search로 올리지 않는다
	 */
	const handleTableRowSelect: UiTableProps["onRowSelect"] = (rows) => {
		setSelectedRows(rows);
	};

	return (
		<Fragment>
			<UiTable rows={responseProductListSuspense.data.products} onRowSelect={handleTableRowSelect} />

			{selectedRows.length > 0 && (
				<PgProductBulkActionBar label={`${selectedRows.length}건 삭제`} />
			)}
		</Fragment>
	);
};
```

## 7. Runtime Boundaries

**Impact: HIGH**

화면 표시를 막는 로딩과 오류는 경계에서 처리합니다. `Suspense`와 오류 경계의 위치를 정하고, 경계가 처리할 분기는 화면 본문에 남기지 않습니다.

### 7.1 Place Suspense Boundaries at the Section Owner

**Rule:** `R07-01` · `runtime-place-suspense-boundaries-at-the-section-owner`

**Applies when:** `Suspense` 쿼리를 쓰는 화면에서 로딩 대체 화면의 위치를 정할 때. `Suspense` 경계를 추가하거나 옮길 때.

**Requires selected:** `runtime-avoid-ad-hoc-loading-branches` · 함께 적용

**Review with:** `css/layout-keep-layout-intent-explicit`, `runtime-place-error-boundaries-by-blast-radius`, `screen-extract-local-section-components-for-runtime-boundaries`

**Impact: HIGH (초기 로딩을 섹션 소유자의 경계에서 처리합니다)**

`Suspense` 쿼리를 쓰는 컴포넌트의 바로 위 섹션 소유자에 경계와 대체 화면을 둡니다.
쿼리를 호출하는 컴포넌트는 자기 자신을 경계로 감쌀 수 없습니다.

| 상황 | 경계 위치 |
| --- | --- |
| 섹션이 따로 없음 | 라우트 진입 |
| 라우트 진입이 직접 쿼리를 호출함 | 해당 라우트의 레이아웃 또는 상위 라우트 |
| 섹션이 독립적으로 채워져야 함 | 이때만 경계를 나눕니다. 한 화면에 불필요하게 여러 겹 쌓지 않습니다 |

대체 화면의 컨테이너·높이는 `css/layout-keep-layout-intent-explicit`을 따릅니다.
본문에 남은 로딩 분기는 `runtime-avoid-ad-hoc-loading-branches`로 판단합니다.

**Incorrect (진입에 경계가 없어 화면 전체가 함께 멈춥니다):**

```tsx
// 진입 파일: PgProductTreeSection이 Suspense 쿼리를 부르는데 감싸는 경계가 없다
return <PgProductTreeSection />;
```

**Correct (섹션 소유자가 경계와 대체 화면을 가집니다):**

```tsx
// 진입 파일: 쿼리를 부르는 섹션을 경계로 감싼다
return (
	<Suspense fallback={<PgProductTreeSkeleton />}>
		<PgProductTreeSection />
	</Suspense>
);

// 섹션: 자기 자신을 감쌀 수 없으므로 경계 없이 쿼리만 부른다
export const PgProductTreeSection = () => {
	/**
	 * 사이드바 분류 트리를 읽는다. 이 쿼리가 멈추는 동안은 진입 파일의 경계가 받는다
	 */
	const responseProductTreeSuspense = useProductTreeSuspense();

	return <UiTree items={responseProductTreeSuspense.data.categoryNodes} />;
};
```

**Correct (라우트 진입이 직접 쿼리를 부르면 진입을 감싸는 레이아웃이 경계를 가집니다):**

```tsx
// page/products/pg-products.tsx: 섹션이 따로 없어 진입이 쿼리를 부른다. 경계는 이 진입을 그리는 셸이 갖는다
export const PgProducts = () => {
	const responseProductListSuspense = useProductListSuspense();

	return <UiTable rows={responseProductListSuspense.data.products} />;
};
```

**Incorrect (한 화면에 경계를 여러 겹 쌓습니다):**

```tsx
// 진입 파일이 이미 경계를 갖는데 섹션 안에서 같은 쿼리를 다시 감싼다
export const PgProductTreeSection = () => {
	return (
		<Suspense fallback={<PgProductTreeSkeleton />}>
			<PgProductTreeInner />
		</Suspense>
	);
};
```

### 7.2 Avoid Ad-hoc Loading and Failure Branches in Screen Bodies

**Rule:** `R07-02` · `runtime-avoid-ad-hoc-loading-branches`

**Applies when:** `Suspense` 쿼리를 쓰는 화면 본문에 초기 로딩 반환을 추가·변경할 때. `isFetching`이나 뮤테이션 `isPending`으로 화면을 가리는 분기를 넣을 때. 제외: 선택 값에 기본값을 채우는 것만 바꾸는 경우.

**Review with:** `data-preserve-origin-chaining`, `screen-keep-derived-values-close`, `typescript/absence-expose-optional-values-instead-of-silent-fallbacks`

**Impact: HIGH (초기 로딩과 실패는 경계가 맡고 화면 본문에는 데이터가 있는 경로만 남습니다)**

`Suspense` 쿼리의 초기 로딩은 경계나 상위 레이아웃이 처리하므로 화면 본문에서 다시 분기하지 않습니다.

| 플래그 | 사용 기준 |
| --- | --- |
| Suspense 쿼리의 `isPending` | 타입이 `false`로 고정되어 분기가 죽은 코드입니다 |
| 쿼리의 `isFetching` | 백그라운드 재조회 표시처럼 이미 그려진 화면을 보조할 때만 씁니다 |
| 쿼리의 `isError` | 초기 실패 대체 화면을 본문에 만들지 않습니다. 캐시가 있는 재조회 실패는 `runtime-place-error-boundaries-by-blast-radius`를 따릅니다 |
| 뮤테이션의 `isPending` | 버튼 비활성화·저장 중 배지 등에 씁니다 |

화면을 가리지 않으면 외부 SDK나 폼이 잘못된 값으로 초기화될 때만 본문에 가림 분기를 둡니다.
이 예외는 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`에 따라 이유를 남깁니다.
없는 값을 기본값으로 덮는 문제는 `typescript/absence-expose-optional-values-instead-of-silent-fallbacks`를 따릅니다.

**Incorrect (`Suspense` 쿼리의 `isPending`을 다시 분기합니다. 타입이 `false`라 죽은 코드입니다):**

```tsx
if (responseUserGetItemSuspense.isPending) {
	return <UiSpinner />;
}

return <UiUserName value={responseUserGetItemSuspense.data.name} />;
```

**Correct (초기 로딩은 경계가 받으므로 본문은 데이터가 있는 경로만 그립니다):**

```tsx
return <UiUserName value={responseUserGetItemSuspense.data.name} />;
```

**Incorrect (다시 불러오는 중에 화면 전체를 가립니다):**

```tsx
if (responseUserGetItemSuspense.isFetching) {
	return <UiSpinner />;
}

return <UiUserName value={responseUserGetItemSuspense.data.name} />;
```

**Correct (갱신 상태는 이미 그려진 화면을 보조하는 표시에만 씁니다):**

```tsx
return (
	<Fragment>
		<UiUserName value={responseUserGetItemSuspense.data.name} />
		{responseUserGetItemSuspense.isFetching && <UiRefreshIndicator />}
	</Fragment>
);
```

**Correct (외부 SDK가 잘못 초기화되므로 이유 주석을 남기고 로딩 동안 가립니다):**

```tsx
// 결제 위젯은 마운트할 때 금액을 한 번만 읽는다. 다시 불러오는 중에 그리면 옛 금액으로 초기화된다
if (responseOrderAmountSuspense.isFetching) {
	return <PgOrderAmountLoadingScreen />;
}

return <PgPaymentWidgetSection amount={responseOrderAmountSuspense.data.confirmedAmount} />;
```

### 7.3 Place Error Boundaries by How Much Should Survive

**Rule:** `R07-03` · `runtime-place-error-boundaries-by-blast-radius`

**Applies when:** 오류 경계를 추가하거나 옮길 때. 화면 본문에 `isError` 분기나 실패 대체 화면 반환을 넣을 때. 캐시가 있는 쿼리의 재조회 실패 처리나 오류 경계의 다시 시도 연결을 바꿀 때.

**Requires selected:** `runtime-place-suspense-boundaries-at-the-section-owner` · 함께 적용

**Impact: HIGH (쿼리 실패를 정해진 경계에서 처리하고 필요한 화면을 유지합니다)**

오류 경계는 실패 후에도 남겨야 할 화면 범위로 정합니다.
초기 실패를 받을 경계가 없으면 화면 전체가 빈 채로 남을 수 있으므로 앱 경계는 반드시 둡니다.

| 층 | 위치 | 오류 뒤 남는 화면 |
| --- | --- | --- |
| 앱 | 루트에 한 번 | 없음. 마지막 안전망입니다 |
| 화면 | 라우트 진입 | 내비게이션과 레이아웃 셸 |
| 섹션 | `Suspense` 경계와 같은 소유자 | 같은 화면의 다른 섹션 |

섹션 경계는 나머지 섹션만으로도 쓸모가 있을 때만 둡니다.
목록 실패 후 옆 필터로 할 수 있는 일이 없다면 화면 경계로 충분합니다.
로딩·오류 경계는 같은 소유자가 조립하며, 위치는 `runtime-place-suspense-boundaries-at-the-section-owner`를 따릅니다.

| 실패 상황 | 처리 |
| --- | --- |
| Suspense 쿼리에 표시할 캐시 데이터가 없음 | 렌더 중 던진 오류를 경계가 받습니다 |
| 기존 데이터가 있는 재조회 실패 | 기본적으로 데이터를 계속 보여 줍니다. 모든 실패를 경계로 보내야 할 때만 재조회가 끝난 뒤 명시적으로 던집니다 |
| 일반 이벤트 핸들러·비동기 콜백 오류 | 경계가 자동으로 받지 않습니다. 사용자 액션은 `data-handle-mutation-failure-where-it-is-called`를 따릅니다 |
| 트랜지션 Action 오류·라이브러리가 렌더에서 다시 던진 오류 | 일반 핸들러 오류와 구분합니다 |

본문의 실패 분기는 `runtime-avoid-ad-hoc-loading-branches`를 따릅니다.
오류 경계 클래스는 `ui`의 `UiErrorBoundary` 하나에 둡니다. 리액트 오류 경계 구현에는 클래스가 필요합니다.
화면 경계는 `react-router` 라우트 설정의 `errorElement`로 두고,
라우트 밖에서 감싸야 하면 `UiErrorBoundary`로 진입 컴포넌트를 감쌉니다.

재시도 버튼은 대체 화면에서 오류 경계의 재시도 함수를 호출합니다.
경계의 `onReset`에는 `@tanstack/react-query`의 `useQueryErrorResetBoundary`가 주는 `reset`을 연결합니다.
쿼리 오류만 초기화하면 대체 화면을 벗어나지 못합니다. 재시도는 하위 트리를 새로 마운트하므로 상태도 되살리지 못합니다.

**Incorrect (경계 없이 화면 본문에서 실패를 분기합니다):**

```tsx
export const PgProducts = () => {
	const responseProductListSuspense = useProductListSuspense();

	if (responseProductListSuspense.isError) {
		return <UiErrorState />;
	}

	return <UiTable rows={responseProductListSuspense.data.products} />;
};
```

**Correct (화면 경계가 오류를 처리하고 셸을 유지합니다):**

```tsx
// component/widget/app-shell/wg-app-shell.tsx
export const WgAppShell = (props: WgAppShellProps) => {
	return (
		<div className={clsx("wg_appShell__root")}>
			<WgAppNavigation />

			<main className={clsx("wg_appShell__main")}>
				<UiErrorBoundary fallback={<UiScreenErrorState />}>
					<Suspense fallback={<UiScreenSkeleton />}>{props.children}</Suspense>
				</UiErrorBoundary>
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

	return <UiTable rows={responseProductListSuspense.data.products} />;
};
```

**Correct (나머지 섹션만으로도 쓸모가 있을 때만 섹션 경계를 둡니다):**

```tsx
export const PgProducts = () => {
	return (
		<div className={clsx("pg_products__layout")}>
			<PgProductTreeSection />

			{/**
			 * 추천 목록이 실패해도 본문 표는 그대로 쓸 수 있다
			 */}
			<UiErrorBoundary fallback={<UiInlineErrorState />}>
				<Suspense fallback={<UiRecommendationSkeleton />}>
					<PgProductRecommendationSection />
				</Suspense>
			</UiErrorBoundary>

			<PgProductTableSection />
		</div>
	);
};
```

**Correct (재시도는 오류 경계와 쿼리 오류를 초기화하고 하위 트리를 다시 마운트합니다):**

```tsx
export const PgProductRecommendationBoundary = () => {
	const queryErrorResetBoundary = useQueryErrorResetBoundary();

	return (
		<UiErrorBoundary
			onReset={queryErrorResetBoundary.reset}
			fallbackRender={(fallbackProps) => (
				<UiInlineErrorState
					retryLabel="다시 불러오기"
					onRetry={fallbackProps.resetErrorBoundary}
				/>
			)}
		>
			<Suspense fallback={<UiRecommendationSkeleton />}>
				<PgProductRecommendationSection />
			</Suspense>
		</UiErrorBoundary>
	);
};
```

**Incorrect (캐시가 있는 재조회 실패도 자동으로 경계에 전달된다고 가정합니다):**

```tsx
// 이 화면은 낡은 추천을 계속 보여 주면 안 되지만 재조회 실패를 던지지 않는다
return <UiProductRecommendations items={responseProductRecommendationsSuspense.data.items} />;
```

**Correct (낡은 데이터를 허용하지 않는 화면만 재조회 실패를 경계로 보냅니다):**

```tsx
// 추천을 확정하는 화면은 재조회 실패 시 이전 추천을 계속 선택하게 두지 않는다
if (responseProductRecommendationsSuspense.error && !responseProductRecommendationsSuspense.isFetching) {
	throw responseProductRecommendationsSuspense.error;
}

return <UiProductRecommendations items={responseProductRecommendationsSuspense.data.items} />;
```

## 8. State Ownership and Updates

**Impact: HIGH**

상태는 값의 수명과 소유자에 맞는 도구로 고르고, 파생값은 저장하지 않고 렌더에서 계산해야 합니다. 여러 화면이 공유하는 판단만 전역 스토어에 두고, 이전 상태에 의존하는 갱신은 함수형으로 씁니다. 이펙트의 반응형 값은 의존성에 남기고, 최신 값을 읽기만 하는 콜백은 `useEffectEvent`로 분리합니다. URL 상태의 바인딩 이름을 통일해 서버 응답과 구분합니다.

### 8.1 Calculate Derived Values During Rendering

**Rule:** `R08-01` · `state-calculate-derived-values-during-render`

**Applies when:** 현재 프롭스, 상태, search 파라미터, 응답에서 계산 가능한 값을 별도 상태와 이펙트로 동기화할 때. 파생값 동기화 이펙트를 제거할 때.

**Review with:** `screen-keep-derived-values-close`, `state-store-derived-authority`

**Impact: HIGH (지금 입력으로 구할 수 있는 값은 상태에 두지 않고 렌더에서 계산합니다)**

현재 프롭스·상태·search 파라미터·응답으로 계산할 수 있는 값은 렌더 중에 구합니다.
`useState`에 복제해 `useEffect`로 동기화하면 추가 렌더와 값의 어긋남이 생기기 쉽습니다.

계산 위치는 `screen-keep-derived-values-close`에 따라 사용하는 곳 가까이에 둡니다.
여러 화면이 공유하는 파생 판단을 스토어에 채우는 이펙트만 예외이며,
허용 조건은 `state-store-derived-authority`를 따릅니다.

**Incorrect (파생값을 이펙트로 다시 상태에 동기화합니다):**

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [selectedCount, setSelectedCount] = useState(0);

useEffect(() => {
	setSelectedCount(selectedIds.length);
}, [selectedIds]);
```

**Correct (같은 `selectedIds`에서 렌더 중에 바로 계산합니다):**

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);

return <UiSelectedCountBadge count={selectedIds.length} />;
```

### 8.2 Choose State Tools by Source of Truth

**Rule:** `R08-02` · `state-choose-state-tools-by-source-of-truth`

**Applies when:** 로컬 UI·전역 클라이언트·서버 데이터를 새 상태 도구로 옮길 때. 합성 컴포넌트나 컴포넌트 묶음에 공유 상태를 넣을 때. 서로 다른 진짜 출처 사이에 값을 복제하거나 동기화할 때.

**Review with:** `state-store-derived-authority`, `strategy-choose-single-composition-compound-and-variants`

**Impact: HIGH (로컬·공유·서버·URL 상태의 소유자를 구분합니다)**

상태 도구는 값의 수명과 소유자로 고릅니다.
표를 아래에서부터 읽어 처음 해당하는 행을 적용합니다.

| 상태의 소유자 | 기본 도구 |
| --- | --- |
| 로컬 UI | `useState` 또는 `useReducer` |
| 한 컴포넌트 묶음에서 공유하는 UI | `useState` + `Context` |
| 전역 클라이언트 | `Zustand` |
| 서버 | `@tanstack/react-query` |
| 링크를 공유해도 같은 화면이 열려야 하는 값 | 라우트 search 파라미터(`nuqs`의 `useQueryStates`) |

| 혼동하기 쉬운 상태 | 소유 기준 |
| --- | --- |
| 새로고침·뒤로 가기·링크 공유로 유지할 필터·정렬·페이지·선택 행 | search 파라미터에 두고 `useState`로 복제하지 않습니다 |
| 열림·닫힘·마우스 올림·입력 중인 임시 값 | 주소에 올리지 않습니다 |
| 합성 부품이나 작은 묶음의 두세 단계 아래에서 공유하는 UI | `useState`가 소유하고 `Context`로 전달합니다 |
| 묶음 밖의 화면·레이아웃에서도 읽거나 바꾸는 UI | `Context`를 위로 올리지 않고 전역 스토어로 옮깁니다. 파생값이 아닌 탭 `selectedId`도 같습니다 |

서버 상태와 search 파라미터는 사용하는 컴포넌트가 같은 `key`로 직접 읽고 부모 프롭으로 전달하지 않습니다.
소유 위치는 `screen-keep-route-flow-visible`을 따릅니다.
`Context`는 전역 상태 도구가 아니라 묶음 안의 전달 수단입니다.
`strategy-choose-single-composition-compound-and-variants`의 상태 있는 합성도 이 방식으로 상태를 공유합니다.

**Incorrect (전역 값과 서버 값까지 `useState`가 소유합니다):**

```ts
const [isOpen, setIsOpen] = useState(false);
const [theme, setTheme] = useState<Theme>("light");

/**
 * 사용자 상세 조회 API
 */
const responseUserGetItemSuspense = useUserGetItemSuspense();
const [userName, setUserName] = useState(responseUserGetItemSuspense.data.name);
```

**Correct (값의 소유자에 맞는 도구를 씁니다):**

```ts
const [isOpen, setIsOpen] = useState(false);
const themeStore = useThemeStore();

/**
 * 사용자 상세 조회 API
 */
const responseUserGetItemSuspense = useUserGetItemSuspense();
```

**Incorrect (링크 공유로 유지할 목록 필터를 `useState`에 둡니다):**

```ts
const [keyword, setKeyword] = useState("");
const [page, setPage] = useState(1);
```

**Correct (주소가 소유한 값은 search 파라미터로 읽고 씁니다):**

```ts
const [urlParams, setUrlParams] = useQueryStates(productUrlParsers);
```

**Incorrect (묶음 밖의 화면이 읽는 값을 `Context`로 앱 루트까지 올려 전역 스토어처럼 씁니다):**

```tsx
// 테마는 레이아웃과 모든 화면이 읽는데 Context 를 루트에 두고 화면마다 Provider 를 찾아 올라간다
const ThemeContext = createContext<Theme>("light");
```

**Correct (묶음 밖에서도 읽는 값은 전역 스토어가 소유합니다):**

```ts
const themeStore = useThemeStore();
```

**Correct (합성 컴포넌트 안에서 부품끼리 나눠 쓰는 상태는 `Context`로 내려보냅니다):**

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

여러 화면·메뉴·라우트 가드가 반복해서 쓰는 파생 판단만 스토어로 올립니다.
단일 화면에서 한두 번 읽는 쿼리 필드는 복제하지 않습니다.

| 작업 | 기준 |
| --- | --- |
| 도메인 판별 | 초기화·레이아웃 등 한 경계에 모으고 화면은 `accessStore.canEditRecord` 같은 결과만 읽습니다 |
| 스토어 채우기 | 쿼리에는 `onSuccess` 같은 성공 콜백이 없으므로 소유자가 분명한 경계의 `useEffect`에서 처리합니다 |
| 이펙트 예외 근거 | `state-calculate-derived-values-during-render`의 예외이므로 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`에 따라 공유 이유를 남깁니다 |
| 이펙트의 스토어 접근 | 선택자로 `set` 함수만 꺼내고 값 의존성은 그대로 적습니다 |

같은 판별을 화면마다 반복하지 않도록 한 곳에서 스토어를 채웁니다.
이펙트가 스토어 객체 전체에 의존하면 `set`으로 참조가 바뀔 때 다시 실행되므로 피합니다.

**Incorrect (개별 화면이 도메인 판별을 수행하고 스토어에 저장합니다):**

```ts
const accessStore = useAccessStore();
const canEditRecord = responseRecordGetItemSuspense.data.ownerId === currentUserId;

useEffect(() => {
	accessStore.setCanEditRecord(canEditRecord);
}, [accessStore, canEditRecord]);
```

**Correct (화면은 스토어에 채워진 결과만 참조합니다):**

```ts
const accessStore = useAccessStore();

if (accessStore.canEditRecord) {
	// ...
}
```

**Incorrect (스토어 전체에 의존하는 이펙트가 `set`마다 다시 실행됩니다):**

```ts
// page/_layout/pg-app-layout.tsx
const accessStore = useAccessStore();

/**
 * 부트스트랩 응답의 권한 목록으로 수정 가능 여부를 채운다
 */
useEffect(() => {
	accessStore.setCanEditRecord(responseAccessBootstrapSuspense.data.capabilities.includes("record:edit"));
}, [accessStore, responseAccessBootstrapSuspense.data]);
```

**Correct (초기화 경계에서 스토어를 채우고 스토어에서는 `set` 함수만 선택합니다):**

```ts
// page/_layout/pg-app-layout.tsx
const setCanEditRecord = useAccessStore((state) => state.setCanEditRecord);

/**
 * 부트스트랩 응답의 권한 목록으로 수정 가능 여부를 채운다. 여러 화면과 라우트 가드가 이 결과를 읽는다
 */
useEffect(() => {
	// state-calculate-derived-values-during-render 예외: 화면 여럿이 같은 판단을 읽어 경계에서 한 번 채운다
	setCanEditRecord(responseAccessBootstrapSuspense.data.capabilities.includes("record:edit"));
}, [setCanEditRecord, responseAccessBootstrapSuspense.data]);
```

### 8.4 Use Functional setState Updates When Based on Previous State

**Rule:** `R08-04` · `state-use-functional-setstate-updates`

**Applies when:** 다음 상태가 현재 상태에 의존하는 갱신을 추가·변경할 때. 핸들러·비동기 콜백·연속 호출에서 `setState` 방식을 바꿀 때.

**Impact: HIGH (이전 상태에 의존하는 갱신에서 오래된 값을 사용하는 오류를 막습니다)**

다음 상태가 현재 상태 값에 의존하면 바깥 변수를 직접 읽지 않고 함수형 업데이터를 씁니다.

한 이벤트 안에서 두 번 갱신하거나, `await` 뒤나 오래 사는 클로저 안에서 갱신하면 결과가 갈립니다.
한 번만 부르는 갱신은 두 형태가 같은 결과를 내지만, 형태를 하나로 고정해 자리마다 다시 판단하지 않습니다.

**Incorrect (오래 사는 콜백이 등록 시점의 상태를 붙잡습니다):**

```tsx
/**
 * 새 참여자가 들어오면 선택 목록에 더한다
 */
useEffect(() => {
	// 콜백은 등록 시점의 selectedUserIds 를 붙잡는다. 나중에 도착한 참여자가 옛 목록에 더해져 그사이 고른 항목이 지워진다
	return subscribeToUserJoined((joinedUserId) => {
		setSelectedUserIds([...selectedUserIds, joinedUserId]);
	});
}, []);
```

**Correct (함수형 업데이터로 항상 최신 상태를 기준으로 갱신합니다):**

```tsx
/**
 * 새 참여자가 들어오면 선택 목록에 더한다
 */
useEffect(() => {
	return subscribeToUserJoined((joinedUserId) => {
		setSelectedUserIds((currentUserIds) => [...currentUserIds, joinedUserId]);
	});
}, []);
```

### 8.5 Use useEffectEvent for Non-reactive Effect Callbacks

**Rule:** `R08-05` · `state-use-effectevent-for-non-reactive-effect-callbacks`

**Applies when:** 구독 이펙트가 최신 프롭·상태 콜백을 읽어야 할 때. ref 동기화 우회, 의존성 재설치, `useEffectEvent`를 추가·변경할 때.

**Review with:** `docs-require-jsdoc-on-key-declarations`, `events-curry-extra-handler-arguments`, `events-run-user-actions-in-handlers-not-effects`

**Impact: MEDIUM (콜백은 최신 값을 읽고 이펙트는 구독 조건의 변화에만 반응합니다)**

구독 이펙트의 콜백이 최신 프롭스·상태를 읽되 그 값 때문에 재구독할 필요가 없다면 `useEffectEvent`를 씁니다.
연결 대상·구독 조건처럼 바뀌면 재설치해야 하는 값은 이펙트 의존성에 남깁니다.

| 조건 | 처리 |
| --- | --- |
| 리액트 19.2 이상 | 비반응형 콜백에 `ref` 우회 대신 `useEffectEvent`를 씁니다 |
| 리액트 19.2 미만 | 의존성에 따른 재구독을 먼저 검토하고, 최신 콜백만 바꿔야 할 때 `ref` 동기화를 검토합니다 |
| 클릭·제출 등 사용자 액션 | 이름 붙인 핸들러에 둡니다. 이펙트로 옮기지 않습니다 |
| Effect Event 호출 | 같은 컴포넌트의 이펙트나 다른 Effect Event 안에서만 호출합니다 |
| Effect Event 전달 | 다른 컴포넌트·훅·JSX 이벤트 프롭에 넘기지 않습니다 |

반환 함수는 참조 동일성을 보장하지 않으며 이펙트 의존성에 넣지 않습니다.
DOM 이벤트 매개변수나 커링을 덧붙이지 않고,
`typing-take-handler-types-from-existing-contracts`의 리액트 핸들러 타입 규칙도 적용하지 않습니다.
의존성 경고를 없애려고 반응해야 할 값까지 감싸지 않습니다.

린터의 인식 여부도 확인합니다. 리액트 19.2 문서가 요구하는 최신 `eslint-plugin-react-hooks`를 사용하고,
`biome`도 `useEffectEvent`를 인식하는 최근 버전을 씁니다. 이전 버전은 아래 Correct 예제를 훅 규칙 위반으로 표시합니다.
설정은 `typescript/tooling-configure-biome-to-enforce-these-rules`를 따릅니다.

**Incorrect (최신 콜백을 읽기 위해 `ref`를 직접 동기화합니다):**

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

**Correct (비반응형 콜백은 `useEffectEvent`로 분리합니다):**

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

### 8.6 Name URL State Bindings as a Set

**Rule:** `R08-06` · `state-name-url-state-bindings-as-a-set`

**Applies when:** 라우트 search 파라미터를 읽거나 쓰는 바인딩을 추가·변경할 때. search 파라미터 파서 묶음을 만들거나 옮길 때. 제외: 서버 요청 쿼리·뮤테이션 바인딩만 바꾸는 경우.

**Requires selected:** `typescript/naming-place-owner-constants-in-the-owner-constant-folder` · 함께 적용

**Review with:** `state-choose-state-tools-by-source-of-truth`

**Impact: MEDIUM (주소가 소유한 상태, 플랫폼 객체, 서버 응답이 이름만으로 구분됩니다)**

라우트 search 파라미터는 파싱 전 원본·파싱 결과·서버 응답이 구분되도록 이름을 고정합니다.

| 대상 | 이름과 위치 |
| --- | --- |
| 파라미터별 파싱 함수 묶음 | `<범위>UrlParsers`. 화면의 URL 계약이므로 소유자 `_constant`에 둡니다 |
| 파싱 결과와 갱신 함수 | `urlParams`, `setUrlParams` |
| 플랫폼 `URLSearchParams` 객체 | `searchParams`. 파싱 결과에는 쓰지 않습니다 |

`query`가 들어간 이름은 서버 요청 바인딩에만 씁니다.
해당 이름은 `data-name-query-and-mutation-bindings-consistently`를 따릅니다.
파서 배치는 `typescript/naming-place-owner-constants-in-the-owner-constant-folder`를,
파일명·심볼 표기는 `typescript/naming-use-consistent-file-and-symbol-naming`을 따릅니다.
값을 주소에 둘지는 `state-choose-state-tools-by-source-of-truth`로 판단합니다.

**Incorrect (파서 묶음의 역할이 이름에 드러나지 않습니다):**

```ts
// page/products/_constant/product-search.ts
export const productSearch = {
	page: parseAsInteger.withDefault(pagination_default_page),
	keyword: parseAsString,
};
```

**Correct (파서 묶음은 `<범위>UrlParsers`로 소유자 `_constant` 폴더에 둡니다):**

```ts
// page/products/_constant/product-url-parsers.ts
/**
 * product 목록 화면이 주소에 올린 상태의 파서 묶음
 */
export const productUrlParsers = {
	page: parseAsInteger.withDefault(pagination_default_page),
	keyword: parseAsString,
};
```

**Incorrect (파싱 결과에 플랫폼 객체와 서버 요청용 이름을 섞어 씁니다):**

```tsx
const [searchParams, setSearchParams] = useQueryStates(productUrlParsers);
const query = searchParams.keyword;

<UiSearchInput value={query} />;
```

**Correct (파싱을 거친 값은 `urlParams`이고 별칭 없이 체인으로 읽습니다):**

```tsx
const [urlParams, setUrlParams] = useQueryStates(productUrlParsers);

<UiSearchInput value={urlParams.keyword} />;
```

**Correct (플랫폼 `URLSearchParams` 객체만 `searchParams`입니다):**

```tsx
const [searchParams] = useSearchParams();

<UiShareLinkButton href={`/products?${searchParams.toString()}`} />;
```

## 9. Events and Interaction Flow

**Impact: HIGH**

이벤트 핸들러는 정해진 이름을 쓰고 추가 인자는 커링으로 전달합니다. 사용자 동작에 따른 처리는 이펙트가 아닌 핸들러에서 실행합니다.

### 9.1 Name Handlers Predictably

**Rule:** `R09-01` · `events-name-handlers-predictably`

**Applies when:** 이벤트 핸들러를 새로 만들 때. 핸들러 이름이나 대상, 이벤트 표기를 바꿀 때.

**Review with:** `events-curry-extra-handler-arguments`, `typescript/naming-use-consistent-file-and-symbol-naming`

**Impact: MEDIUM (이벤트 흐름을 이름으로 검색할 수 있습니다)**

이벤트 핸들러는 `handle` 접두사에 대상과 역할을 붙입니다.
표를 위에서부터 읽어 처음 해당하는 형태를 씁니다.

| 상황 | 이름 |
| --- | --- |
| DOM 이벤트 객체를 받음 | `handle + Target + Event` |
| 이벤트 객체를 받지 않는 도메인 콜백 | `handle + DomainAction` |

`on*`은 프롭 이름에만 씁니다. `onClick`을 처리하는 구현은 `handleRowClick`처럼 이름 짓습니다.
같은 컴포넌트에서 이름이 겹치지 않도록 대상이 다르면 대상 이름을 넣습니다.
추가 인자 전달은 `events-curry-extra-handler-arguments`를 따릅니다.

**Incorrect (구현에 `on*`을 쓰고 대상이 이름에 없어 같은 이름이 겹칩니다):**

```ts
import type {MouseEventHandler} from "react";

// 목록 항목과 저장 버튼 둘 다 클릭을 받는데 이름에 대상이 없어 뒤에 번호가 붙었다
/**
 * 이미 고른 항목을 다시 누르면 선택을 해제한다
 */
const onClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	toggleSelection();
};

/**
 * 폼 기본 제출을 막는다. 저장은 mutation 콜백이 이어서 한다
 */
const onClick2: MouseEventHandler<HTMLButtonElement> = (event) => {
	event.preventDefault();
};
```

**Correct (`handle` 접두사와 대상·이벤트가 드러나는 이름을 씁니다):**

```ts
import type {MouseEventHandler} from "react";

/**
 * 이미 고른 항목을 다시 누르면 선택을 해제한다
 */
const handleListItemClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
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

**Impact: MEDIUM (추가 인자 전달만을 위한 JSX 인라인 래퍼를 줄입니다)**

`onClick`·`onChange`처럼 이벤트 객체를 받는 자리에 추가 인자가 필요하면 커링합니다.
팩토리가 추가 인자를 받고, 안쪽 함수가 이벤트를 받으며, 반환한 함수를 JSX에 직접 전달합니다.
`onClick={() => handleSelectionToggle(id)}` 같은 인라인 래퍼는 만들지 않습니다.

| 작성할 부분 | 기준 |
| --- | --- |
| 팩토리 이름 | 커링 없는 핸들러처럼 `handle*`을 씁니다. 호출 인자로 용도를 알 수 있으므로 `With<인자>`는 붙이지 않습니다 |
| 반환 타입 | `typing-take-handler-types-from-existing-contracts`에 따라 리액트 별칭을 씁니다 |
| 함수 형태 | 화살표 두 단계로 적고, 안쪽 함수에 별도 이름을 붙여 반환하지 않습니다 |
| 반환 전 준비 계산이 있음 | 이때만 바깥 블록 본문을 엽니다. 반환하는 화살표는 이름을 붙이지 않습니다 |
| 이벤트를 받지 않는 `(id) => void` 프롭 콜백 | 커링하지 않고 이름 붙인 핸들러를 그대로 넘깁니다 |
| `useEffectEvent` 반환 함수 | DOM 이벤트 매개변수나 커링을 덧붙이지 않습니다 |

안쪽 핸들러에 이름을 붙이면 팩토리 이름을 반복하고 같은 반환 타입도 두 번 적게 됩니다.

**Incorrect (인라인 래퍼로 인자를 넘깁니다):**

```tsx
<UiButton onClick={() => handleListItemClick(product.id)}>{product.name}</UiButton>;
```

**Correct (JSX에는 팩토리 호출만 두고 감싸는 화살표를 만들지 않습니다):**

```tsx
<UiButton onClick={handleListItemClick(product.id)}>{product.name}</UiButton>;
```

**Incorrect (안쪽 핸들러에 별도 이름을 붙이고 팩토리에 `With` 접미사를 붙입니다):**

```tsx
const handleListItemClickWithProductId = (productId: string): MouseEventHandler<HTMLButtonElement> => {
	const handleListItemClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
		toggleSelection(productId);
	};

	return handleListItemClick;
};
```

**Correct (추가 인자는 바깥 함수, 이벤트는 안쪽 함수입니다):**

```tsx
import type {MouseEventHandler} from "react";

/**
 * 클릭한 항목을 이벤트 대신 팩토리 인자로 받아 어느 product인지 알아낸다
 */
const handleListItemClick =
	(productId: string): MouseEventHandler<HTMLButtonElement> =>
	(_event) => {
		toggleSelection(productId);
	};
```

### 9.3 Run User Actions in Handlers, Not Effects

**Rule:** `R09-03` · `events-run-user-actions-in-handlers-not-effects`

**Applies when:** 제출, 저장, 삭제, 닫기 같은 한 번뿐인 사용자 액션을 핸들러와 상태+이펙트 사이에서 옮길 때. 이펙트 안에서 뮤테이션이나 화면 이동을 호출하는 코드를 넣을 때.

**Impact: HIGH (사용자 액션이 무관한 이펙트 재실행으로 반복되는 것을 막습니다)**

제출, 저장, 삭제, 닫기 같은 사용자 액션은 해당 핸들러 안에서 바로 실행합니다.
액션 자체를 상태로 올린 뒤 `useEffect`가 나중에 실행하게 만들지 않습니다.
그렇게 하면 무관한 의존성 변화에도 재실행되기 쉽고 흐름도 읽기 어려워집니다.

**Incorrect (사용자 액션을 상태 + 이펙트로 모델링합니다):**

```tsx
/**
 * 생성에 성공하면 목록으로 돌아간다
 */
const mutationProductCreate = useProductCreate({
	mutation: {
		onSuccess: () => {
			void navigate("/products");
		},
	},
});

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

**Correct (사용자 액션은 핸들러 안에서 바로 수행합니다):**

```tsx
/**
 * 생성에 성공하면 목록으로 돌아간다
 */
const mutationProductCreate = useProductCreate({
	mutation: {
		onSuccess: () => {
			void navigate("/products");
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

메모이제이션은 필요를 확인한 경우에만 적용합니다. 실제로 무거운 초기화와 갱신만 초기화 함수, 트랜지션, 지연 값으로 미룹니다.

### 10.1 Do Not Memoize Without a Confirmed Reason

**Rule:** `R10-01` · `perf-avoid-defensive-memoization`

**Applies when:** `useMemo`·`useCallback`을 추가하거나 제거할 때. `memo`로 컴포넌트를 감싸거나 벗길 때. 참조 동일성·실측 병목·무거운 지연 계산을 이유로 수동 메모이제이션을 검토할 때.

**Review with:** `perf-defer-heavy-renders-with-measured-evidence`

**Impact: HIGH (효과를 확인하지 않은 방어적 `useMemo`, `useCallback`, `memo`를 막습니다)**

`useMemo`·`useCallback`·`memo`는 아래 네 경우에만 씁니다.
어느 경우든 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`에 따라 이유를 남깁니다.

| 허용 근거 | 확인할 내용 |
| --- | --- |
| 외부 라이브러리의 참조 계약 | 참조 변경이 상태 초기화나 구독 재설치로 이어집니다 |
| 불필요한 이펙트 재구독 | 객체·배열이 이펙트 밖에서도 필요하며, 재구독이 확인됐고 의존성을 더 단순하게 만들 수 없습니다 |
| 실측 병목 | 계산이나 렌더 비용을 실제로 측정했습니다 |
| 지연 값을 받는 하위 트리 | `perf-defer-heavy-renders-with-measured-evidence`에서 `memo`를 요구합니다 |

계산이나 함수가 다시 실행된다는 사실만으로 메모이제이션하지 않습니다.
이펙트에서만 쓰는 객체·배열은 이펙트 안에서 만들고 원본 값에 의존합니다.

리액트는 `useMemo`·`useCallback` 캐시를 버릴 수 있으므로 정확성을 캐시에 의존하지 않습니다.
다시 계산되거나 이펙트가 재설치되어도 동작해야 합니다.
외부 인스턴스의 수명은 소유 이펙트가, 렌더 사이에 보존할 값은 상태나 `ref`가 관리합니다.

리액트 컴파일러가 없어도 같은 기준을 적용합니다.
컴파일러가 같은 최적화를 이미 제공하면 수동 메모이제이션을 더하지 않습니다.

**Incorrect (단순 가공을 습관적으로 메모이제이션합니다):**

```ts
const columns = useMemo(() => {
	return toTableColumns(props.columns);
}, [props.columns]);
```

**Correct (근거가 없으면 감싸지 않고 그대로 계산합니다):**

```ts
const columns = toTableColumns(props.columns);
```

**Correct (측정한 계산 비용을 근거로 메모이제이션합니다):**

```ts
// 열 2,000개의 표시 계약 변환이 입력마다 45ms로 측정됐다. 같은 columns의 반복 계산을 건너뛴다.
const columns = useMemo(() => {
	return toTableColumns(props.columns);
}, [props.columns]);
```

**Correct (이펙트에서만 쓰는 배열은 안에서 만들고 원본 값에 의존합니다):**

```ts
/**
 * 입력된 product 목록이 바뀔 때만 변경 알림을 다시 구독한다
 */
useEffect(() => {
	return subscribeToProductChanges(props.products.map((product) => product.id));
}, [props.products]);
```

### 10.2 Use Lazy State Initializers for Expensive Defaults

**Rule:** `R10-02` · `perf-use-lazy-state-initializers-for-expensive-defaults`

**Applies when:** `useState` 초기값에 `localStorage` 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용이 큰 계산을 넣을 때. 제외: 숫자·문자열 같은 단순 값이나 프롭을 그대로 초기값에 넣는 경우.

**Review with:** `perf-avoid-defensive-memoization`

**Impact: MEDIUM (무거운 초기 상태 계산이 이후 렌더에서 반복되지 않습니다)**

`useState`의 초기값 계산이 무거우면 값을 직접 넣지 않고 초기화 함수로 전달합니다.
이후 렌더의 반복 계산을 피하는 용도이므로 별도 측정 근거는 요구하지 않습니다.

| 초기값 | 형태 |
| --- | --- |
| `localStorage` 파싱·인덱스 생성·큰 배열 정규화 | 초기화 함수로 감쌉니다 |
| 단순 숫자·문자열 또는 그대로 전달하는 프롭 | 감싸지 않습니다 |
| 이후 프롭스 변화를 따라가야 하는 값 | 초기 상태로 복제하지 않습니다 |

개발 환경의 `StrictMode`에서는 초기화 함수를 두 번 호출할 수 있고, 다시 마운트하면 새로 초기화합니다.
초기화 함수에 저장·구독 같은 부수효과를 넣지 않습니다.
`localStorage`는 클라이언트에서만 읽습니다. 서버 렌더링과 hydration에서는 서버와 최초 클라이언트 렌더가 같아야 하므로,
저장소를 읽는 시점은 화면의 클라이언트 초기화 계약을 따릅니다.

**Incorrect (무거운 초기값 계산이 렌더마다 반복됩니다):**

```tsx
const [searchIndex] = useState(toSearchIndex(product_catalog));
const [draftFilter] = useState(parseStoredProductFilter(localStorage.getItem("product-filter")));
```

**Correct (초기화 함수로 넘겨 이후 렌더에서 다시 계산하지 않습니다):**

```tsx
const [searchIndex] = useState(() => toSearchIndex(product_catalog));
// 서버 렌더링을 하지 않는 클라이언트 전용 화면에서만 저장소를 초기값으로 읽는다
const [draftFilter] = useState(() => parseStoredProductFilter(localStorage.getItem("product-filter")));
```

### 10.3 Defer Heavy Renders Only With Measured Evidence

**Rule:** `R10-03` · `perf-defer-heavy-renders-with-measured-evidence`

**Applies when:** `startTransition`·`useTransition`·`useDeferredValue`를 추가·삭제할 때. 목록이나 표가 커져 입력 반응이 늦다는 보고를 받았을 때.

**Review with:** `perf-avoid-defensive-memoization`

**Impact: MEDIUM (측정한 렌더 병목에만 트랜지션과 지연 값을 적용합니다)**

`startTransition`·`useTransition`·`useDeferredValue`는 렌더 비용을 측정한 뒤 사용합니다.
목록 행 수와 조작별 소요 시간을 확인하고, `perf-avoid-defensive-memoization`의 예외나 예상 규모만 근거로 삼지 않습니다.

| 상황 | 선택 |
| --- | --- |
| 직접 호출하는 상태 갱신이 무거운 렌더를 일으킴 | `startTransition`으로 호출을 감쌉니다. 프롭으로 받은 갱신 함수도 같습니다 |
| 값은 즉시 반응해야 하지만 파생 렌더는 미룰 수 있음 | `useDeferredValue`로 지연 값을 만듭니다 |
| 갱신 함수를 호출할 수 없고 프롭·훅 반환값만 받음 | `useDeferredValue`를 씁니다 |
| 트랜지션 진행 표시가 필요함 | 대기 상태를 주지 않는 `startTransition` 대신 `useTransition`의 `isPending`을 씁니다 |

입력값 자체·폼 오류·즉시 비활성화 같은 급한 반응은 트랜지션에 넣지 않습니다.
`await` 뒤에는 리액트가 트랜지션 문맥을 이어가지 못하므로 상태 갱신을 다시 `startTransition`으로 감쌉니다.

| 무거운 작업 | 최적화 조건 |
| --- | --- |
| 하위 트리 렌더 | 같은 프롭이면 렌더를 건너뛸 수 있어야 합니다. 컴파일러가 이를 제공하지 않으면 지연 값을 받는 컴포넌트를 `memo`로 감쌉니다 |
| 함께 전달하는 객체·콜백 | 매번 달라지면 `memo`가 있어도 다시 렌더되므로 참조를 확인합니다 |
| 지연 값에서 파생되는 계산 | 컴포넌트 `memo` 대신 `useMemo`로 지연 값이 바뀔 때만 재계산합니다. 측정 근거를 주석으로 남깁니다 |

지연 값 기준 재계산은 `perf-avoid-defensive-memoization`의 허용 사유에 해당합니다.
`startTransition`의 콜백은 즉시 실행되며, 안쪽의 무거운 동기 계산이나 네트워크 요청 자체를 미루지 않습니다.
`useDeferredValue`는 고정 지연 시간이 없고 요청 횟수를 줄이는 디바운스도 아닙니다.
긴 동기 계산 하나는 실행 도중 중단되지 않으므로 렌더 지연만으로 입력 지연이 사라진다고 가정하지 않습니다.

**Incorrect (행 20개 목록을 다시 그리는 갱신까지 트랜지션으로 감쌉니다):**

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

**Correct (측정 근거가 있는 갱신만 트랜지션으로 감싸고 행 20개 목록은 그대로 둡니다):**

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

**Incorrect (입력과 무거운 파생 렌더를 같은 값에 묶습니다):**

```tsx
const [keyword, setKeyword] = useState("");
const filteredRows = rows.filter((row) => fuzzyMatchRow(row, keyword));
```

**Correct (입력은 즉시 반응하고 무거운 파생 계산만 늦춥니다):**

```tsx
const [keyword, setKeyword] = useState("");
const deferredKeyword = useDeferredValue(keyword);

// 행 12,000개에서 매 렌더 필터링이 180ms로 측정됐다. 늦춘 검색어에만 다시 계산한다.
const filteredRows = useMemo(() => {
	return rows.filter((row) => fuzzyMatchRow(row, deferredKeyword));
}, [deferredKeyword, rows]);

return <PgProductRows rows={filteredRows} />;
```

**Correct (진행 표시가 필요하면 `useTransition`의 `isPending`을 씁니다):**

```tsx
const [isPending, startTransition] = useTransition();

const handleStatusFilterChange = (nextStatus: ProductStatusFilter) => {
	// 행 12,000개에서 필터 전환에 320ms가 걸려 클릭이 밀렸다.
	startTransition(() => {
		setStatusFilter(nextStatus);
	});
};

return <UiFilterBar isBusy={isPending} onStatusChange={handleStatusFilterChange} />;
```

**Correct (`await` 뒤의 상태 갱신은 다시 `startTransition`으로 감쌉니다):**

```tsx
const handleStatusFilterChange = (nextStatus: ProductStatusFilter) => {
	startTransition(async () => {
		const nextRows = await fetchFilteredRows(nextStatus);

		// await 뒤에는 트랜지션 범위가 끊겨 다시 감싸야 급하지 않은 갱신으로 남는다
		startTransition(() => {
			setRows(nextRows);
		});
	});
};
```

**Correct (지연 값을 받는 무거운 하위 트리는 `memo`로 감쌉니다):**

```tsx
// 행 12,000개 표. 부모가 입력값으로 다시 렌더할 때 이 트리까지 따라 그리지 않도록 memo 로 감싼다
export const PgProductRows = memo((props: PgProductRowsProps) => {
	return <UiTable rows={props.rows} />;
});
```

## 11. Accessibility

**Impact: HIGH**

조작할 수 있는 요소에는 스크린 리더와 테스트가 찾을 수 있는 이름을 제공합니다. 보이는 글자를 이름으로 사용하고, 글자가 없으면 대체 이름을 지정합니다.

### 11.1 Give Interactive Elements an Accessible Name

**Rule:** `R11-01` · `a11y-give-interactive-elements-an-accessible-name`

**Applies when:** 클릭이나 입력을 받는 요소를 추가·변경할 때. 글자 없이 아이콘만 있는 버튼을 추가할 때.

**Impact: HIGH (스크린 리더와 테스트가 요소를 이름으로 찾을 수 있습니다)**

클릭·입력을 받는 요소에는 접근 가능한 이름을 붙이고, 동작에 맞는 HTML 요소를 씁니다.
이름은 화면에 보이는 글자와 맞춰 음성 조작 시에도 같은 말로 찾을 수 있게 합니다.

| 요소 | 이름과 동작 |
| --- | --- |
| 글자가 있는 버튼 | 글자를 이름으로 쓰고 별도 이름을 붙이지 않습니다 |
| 아이콘만 있는 버튼 | `aria-label`을 붙입니다 |
| 입력 | `<label htmlFor>`로 연결합니다. 보이는 라벨을 둘 수 없으면 숨긴 라벨이나 `aria-label`을 씁니다 |
| 누르면 동작을 실행함 | `button`을 쓰고, 폼을 제출하지 않으면 `type="button"`을 지정합니다 |
| 누르면 이동함 | `a`나 라우터 링크를 쓰고, `a`에는 실제 목적지 `href`를 지정합니다 |

`div`·`span`에 `onClick`만 달면 키보드 조작과 접근 가능한 이름이 생기지 않습니다.
같은 입력 컴포넌트를 여러 번 렌더하면 `useId`나 사용처의 고유 식별자로 `id` 중복을 막습니다.
`aria-*`를 스타일 훅으로 쓰는 문제는 `css/selector-use-pseudo-classes-for-dom-owned-states`를 따릅니다.

테스트에서는 `getByRole`의 `name` 조건이나 `getByLabelText`로 목적에 맞는 요소를 찾습니다.
역할만으로 찾는 테스트가 통과해도 접근 가능한 이름이 있다는 뜻은 아닙니다.
포커스 이동 위치는 이 규칙의 대상이 아닙니다.

**Incorrect (클릭 가능한 `div`와 이름 없는 아이콘 버튼을 씁니다):**

```tsx
<Fragment>
	<div className={clsx("pg_products__filterToggle")} onClick={handleFilterToggleClick}>
		<UiFilterIcon />
	</div>

	<input value={props.keyword} onChange={props.onKeywordChange} />
</Fragment>
```

**Correct (`button`으로 만들고 이름을 붙입니다):**

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

문서 주석의 형식과 태그, 그리고 어느 선언에 붙일지는 동반 스킬인 `convention-typescript`가 정합니다. 이 섹션에서는 리액트 전용 선언의 문서화와 JSX 자식 위치의 주석 형식을 정합니다.

### 12.1 Require Doc Comments on React Hooks, Handlers, and Key Declarations

**Rule:** `R12-01` · `docs-require-jsdoc-on-key-declarations`

**Applies when:** 쿼리·뮤테이션이나 읽어도 의도가 안 보이는 핸들러·이펙트를 추가·변경할 때. 내보낸 보조 함수·훅·스토어 선언을 추가·변경할 때.

**Requires selected:** `typescript/docs-require-header-jsdoc-on-key-declarations` · 함께 적용

**Review with:** `typescript/types-document-custom-types-and-shapes`

**Impact: MEDIUM (공통 문서화 기준에 리액트 전용 선언을 추가해 누락을 막습니다)**

`typescript/docs-require-header-jsdoc-on-key-declarations`의 필수 대상에 아래 리액트 선언을 추가합니다.

| 추가 대상 | 조건 |
| --- | --- |
| 합성 컴포넌트 | 공개 부품 |
| `useEffect` | 정리 함수가 있거나 의존성이 둘 이상임 |
| 이벤트 핸들러 | 화면 이동이나 쿼리 무효화를 수행함. 동작이 하나뿐이어도 포함합니다 |

| 관련 판단 | 기준 |
| --- | --- |
| `type`, `interface` 문서화 | 내보내기 여부와 관계없이 `typescript/types-document-custom-types-and-shapes`를 따릅니다 |
| 쿼리·뮤테이션 바인딩, 핸들러, 내보낸 보조 함수·훅, 스토어 선언 | `typescript/docs-require-header-jsdoc-on-key-declarations` |
| 합성 공개 부품의 설명 위치 | `composition-declare-props-interface-above-the-component` |
| 허용된 예외의 근거 주석 | `typescript/docs-justify-convention-exceptions-with-a-reason-comment` |
| 문서 주석 형식과 태그 | `typescript/docs-write-doc-comments-as-multiline-blocks` |

**Incorrect (주요 경계 선언에 의도 설명이 없습니다):**

```ts
const handleBackButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	void navigate("/products");
};

useEffect(() => {
	return subscribeToProductChanges(watchedProductIds);
}, [watchedProductIds]);
```

**Correct (선언 의도를 바로 위에 여러 줄 블록으로 적습니다):**

```ts
/**
 * 저장하지 않고 목록으로 돌아간다. 입력 중인 값은 버린다
 */
const handleBackButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
	void navigate("/products");
};

/**
 * 표에 보이는 product 의 변경 알림을 구독한다. 목록이 바뀌면 다시 구독한다
 */
useEffect(() => {
	return subscribeToProductChanges(watchedProductIds);
}, [watchedProductIds]);
```

### 12.2 Write JSX Comments as Multiline Blocks

**Rule:** `R12-02` · `docs-write-jsx-comments-as-multiline-blocks`

**Applies when:** JSX 자식 자리에 주석을 새로 쓰거나 기존 주석의 형식을 바꿀 때. 화면을 구역으로 나누고 그 구역이 무엇을 담당하는지 적을 때. JSX에 여러 줄로 펼쳐진 형제 블록을 새로 만들거나 나눌 때.

**Review with:** `typescript/docs-write-doc-comments-as-multiline-blocks`, `typescript/docs-write-korean-comments-about-purpose-and-constraints`

**Impact: HIGH (JSX 주석 형식을 통일해 화면 구역의 역할을 쉽게 읽을 수 있습니다)**

JSX 자식 자리의 주석은 여러 줄 블록으로 씁니다.
`{/**`·` * 내용`·` */}`을 각각 다른 줄에 두어 접었다 펼칠 때 주석과 블록이 한 덩이로 움직이게 합니다.
여러 줄로 펼쳐진 형제 블록이 둘 이상이면 블록마다 그 앞에 한 문장으로 적습니다.
한 줄 요소와 블록 하나뿐인 반환에는 달지 않습니다.

| 주석 내용 | 기준 |
| --- | --- |
| 화면 구역의 역할 | 해당 구역이 맡은 책임을 설명합니다 |
| 규칙이 허용한 예외의 이유 | `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따르되, `//` 한 줄 대신 JSX 블록을 씁니다 |
| 마크업이나 바로 아래 컴포넌트 이름 반복 | 새 정보가 없으므로 적지 않습니다 |

**Incorrect (주석을 한 줄로 접고 마크업 이름을 되풀이합니다):**

```tsx
<div className={clsx("pg_products__root")}>
	{/* 검색 구역 */}
	<PgProductSearchSection />
	{/* PgProductTable */}
	<PgProductTable rows={rows} />
</div>;
```

**Correct (구역이 무엇을 담당하는지 여러 줄 블록으로 적습니다):**

```tsx
<div className={clsx("pg_products__root")}>
	{/**
	 * 검색 구역: 키워드와 카테고리로 목록 질의를 좁히는 이 화면 전용 입력
	 */}
	<PgProductSearchSection />
	<PgProductTable rows={rows} />
</div>;
```

**Incorrect (예외 이유를 한 줄로 접습니다):**

```tsx
{/* LegacyDatePicker는 className을 받지 않아 배치용 래퍼가 필요하다 */}
<div className={clsx("pg_products__datePicker")}>
	<LegacyDatePicker value={value} onChange={handleChange} />
</div>;
```

**Correct (예외 이유도 같은 블록 형태로 적습니다):**

```tsx
{/**
 * LegacyDatePicker는 className을 받지 않아 배치용 래퍼가 필요하다
 */}
<div className={clsx("pg_products__datePicker")}>
	<LegacyDatePicker value={value} onChange={handleChange} />
</div>;
```

**Incorrect (여러 줄 블록 셋 중 하나에만 주석을 둡니다):**

```tsx
<section className={clsx("wg_driverTable__root")}>
	{/**
	 * 헤더 행. 정렬 기준과 단위를 보여 준다
	 */}
	<WgDriverTableHeader sort={sort} />
	{rows.map((row) => (
		<WgDriverTableRow key={row.id} row={row} />
	))}
	{expandedRows.map((row) => (
		<WgDriverTableChildRow key={row.id} row={row} />
	))}
</section>;
```

**Correct (여러 줄 블록마다 주석을 두어 블록과 함께 접히게 합니다):**

```tsx
<section className={clsx("wg_driverTable__root")}>
	{/**
	 * 헤더 행. 정렬 기준과 단위를 보여 준다
	 */}
	<WgDriverTableHeader sort={sort} />
	{/**
	 * 드라이버 행. 상세 버튼과 accordion 을 가진 기본 행
	 */}
	{rows.map((row) => (
		<WgDriverTableRow key={row.id} row={row} />
	))}
	{/**
	 * 펼친 자식 driver 행. 상세 버튼과 accordion 없이 같은 칸 구성을 반복한다
	 */}
	{expandedRows.map((row) => (
		<WgDriverTableChildRow key={row.id} row={row} />
	))}
</section>;
```

## 13. Tooling

**Impact: MEDIUM**

리액트 전용 검사는 `biome` 도메인 설정으로 지정하고, 도구가 판단하지 못하는 항목은 리뷰에서 확인합니다.

### 13.1 Enable the Biome React Domain

**Rule:** `R13-01` · `tooling-enable-the-biome-react-domain`

**Applies when:** 프로젝트에 `biome` 설정을 처음 넣거나 lint 규칙을 바꿀 때. `biome.json`의 `linter.domains`나 `linter.rules`에 항목을 추가·삭제할 때.

**Impact: MEDIUM (자동 검사 범위와 리뷰에서 판단할 범위를 구분합니다)**

`biome` 2.x의 `linter.domains`에서 `react`를 켭니다. `package.json`에 `react@>=16`이 있을 때 리액트 검사가 적용됩니다.
기본 설정은 `typescript/tooling-configure-biome-to-enforce-these-rules`를 따릅니다.

| 검사 | 컨벤션 적용 범위 | 추가 설정·리뷰 |
| --- | --- | --- |
| `correctness/noNestedComponentDefinitions` | `react/composition-do-not-define-components-inside-components` 전체 | 도메인 `recommended`에 없어 별도로 켭니다 |
| `correctness/useExhaustiveDependencies` | `react/state-use-effectevent-for-non-reactive-effect-callbacks`의 누락된 의존성 검사 | `useEffectEvent`로 분리할지는 리뷰에서 판단합니다 |
| `correctness/useJsxKeyInIterable` | `react/composition-name-fragments-explicitly`의 `key` 유무 | `<>` 대신 `Fragment`를 썼는지는 리뷰에서 확인합니다 |
| `a11y/*` | `react/a11y-give-interactive-elements-an-accessible-name`의 일부 | 도메인이 아닌 `preset: "recommended"`가 켭니다. 실제 이름은 리뷰에서 확인합니다 |
| `style/noRestrictedImports` + `overrides` | `react/ownership-keep-component-imports-flowing-downward`의 레이어·라우트 방향 | 아래 경로 설정을 추가합니다. 소유자 경계는 별도 판단합니다 |

`a11y` 검사는 `useButtonType`·`useAltText`·`useValidAnchor`·`useKeyWithClickEvents`·`useSemanticElements`·
`noStaticElementInteractions`·`useFocusableInteractive`를 포함합니다.

| `noRestrictedImports` 적용 위치 | 차단할 경로 |
| --- | --- |
| `src/component/ui/**` | `@/component/widget/**`, `@/page/**` |
| `src/component/widget/**` | `@/page/**` |
| 각 `src/page/<route>/**` | `@/page/**`를 막고 `!@/page/<route>/**`로 자기 라우트만 허용합니다 |

라우트가 늘면 해당 `overrides`도 추가합니다.
`overrides`는 규칙 옵션을 통째로 바꾸므로 기본 설정의 경로 패턴을 각 항목에 함께 적습니다.
소유자 경계는 import 문자열만으로 판정하지 못합니다. `@/page/detail/_pg-summary-band`도 가져오는 파일의 위치에 따라
허용 여부가 달라지므로, 위치를 비교하는 `eslint` 규칙이나 리뷰에서 확인합니다.

| 켜지 않는 규칙 | 이유 |
| --- | --- |
| `style/useFragmentSyntax` | `recommended`에 없으며, 켜면 `Fragment`를 요구하는 `react/composition-name-fragments-explicitly`와 충돌합니다 |
| `style/useReactFunctionComponents` | 도메인 `all`에만 있고 기본 심각도가 `info`라 통과 여부를 판정하지 못합니다 |

**Incorrect (리액트 도메인 설정이 없습니다):**

```json
{
	"linter": {
		"enabled": true,
		"rules": {"preset": "recommended"}
	}
}
```

**Correct (도메인과 추가 검사를 켜고 레이어·라우트 `overrides`를 설정합니다):**

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
						"patterns": [{"group": ["../**", "./**", "!./*.css"], "message": "가져오기는 절대경로로 씁니다. 심볼 없이 파일만 불러오는 줄만 같은 폴더를 ./ 로 씁니다."}]
					}
				}
			}
		}
	},
	"overrides": [
		{
			"includes": ["src/component/ui/**"],
			"linter": {
				"rules": {
					"style": {
						"noRestrictedImports": {
							"level": "error",
							"options": {
								"patterns": [
									{
										"group": ["../**", "./**", "!./*.css"],
										"message": "가져오기는 절대경로로 씁니다. 심볼 없이 파일만 불러오는 줄만 같은 폴더를 ./ 로 씁니다."
									},
									{
										"group": ["@/component/widget/**", "@/page/**"],
										"message": "`ui`는 `widget`과 `page`를 가져오지 않습니다."
									}
								]
							}
						}
					}
				}
			}
		},
		{
			"includes": ["src/component/widget/**"],
			"linter": {
				"rules": {
					"style": {
						"noRestrictedImports": {
							"level": "error",
							"options": {
								"patterns": [
									{
										"group": ["../**", "./**", "!./*.css"],
										"message": "가져오기는 절대경로로 씁니다. 심볼 없이 파일만 불러오는 줄만 같은 폴더를 ./ 로 씁니다."
									},
									{"group": ["@/page/**"], "message": "`widget`은 `page`를 가져오지 않습니다."}
								]
							}
						}
					}
				}
			}
		},
		{
			"includes": ["src/page/detail/**"],
			"linter": {
				"rules": {
					"style": {
						"noRestrictedImports": {
							"level": "error",
							"options": {
								"patterns": [
									{
										"group": ["../**", "./**", "!./*.css"],
										"message": "가져오기는 절대경로로 씁니다. 심볼 없이 파일만 불러오는 줄만 같은 폴더를 ./ 로 씁니다."
									},
									{"group": ["@/page/**", "!@/page/detail/**"], "message": "다른 라우트 안의 것은 가져오지 않습니다."}
								]
							}
						}
					}
				}
			}
		}
	]
}
```

## 참고 자료

- https://react.dev
- https://tanstack.com/query/latest
- https://zustand.docs.pmnd.rs

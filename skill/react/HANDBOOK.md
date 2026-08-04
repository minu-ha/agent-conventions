# React 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.companions`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=react`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 React 코딩 컨벤션입니다. shared와 route-local 소유 경계, composition 전략, React handler/prop 계약, 화면 흐름, state 오리진, React 19 component/effect/transition 패턴과 문서화를 다룹니다. TypeScript 규칙을 항상 함께 따르고, class contract나 stylesheet를 바꿀 때는 CSS 규칙도 함께 봅니다. `rules/` 아래 rule 파일이 source of truth입니다.

이 문서에는 React 컨벤션 규칙만 담겨 있습니다. 아래 규칙도 함께 따릅니다.

---

## 함께 따르는 규칙

- [TypeScript Convention](../typescript/HANDBOOK.md) — 항상 함께 적용합니다.
- [CSS Convention](../css/HANDBOOK.md) — 다음 조건에서 함께 적용합니다. class contract, stylesheet 또는 styling surface를 변경한다.

---

## 목차

1. [Ownership and Boundaries](#1-ownership-and-boundaries) — **CRITICAL**
    - 1.1 [Do Not Create Screen-local Custom Hooks for Pure Logic](#11-do-not-create-screen-local-custom-hooks-for-pure-logic)
    - 1.2 [Keep UI, Widget, and Page Ownership Separate](#12-keep-ui-widget-and-page-ownership-separate)
    - 1.3 [Prefix Layer Names on Files and Symbols](#13-prefix-layer-names-on-files-and-symbols)
    - 1.4 [Place Owner Files in Role Folders](#14-place-owner-files-in-role-folders)
    - 1.5 [Keep Component Imports Flowing Downward](#15-keep-component-imports-flowing-downward)
    - 1.6 [Keep Library Lifecycle in the Owning Component](#16-keep-library-lifecycle-in-the-owning-component)
2. [Typing and Contracts](#2-typing-and-contracts) — **HIGH**
    - 2.1 [Pin React Handler and Wrapper Prop Types at the Declaration](#21-pin-react-handler-and-wrapper-prop-types-at-the-declaration)
3. [Composition Strategy](#3-composition-strategy) — **HIGH**
    - 3.1 [Avoid Boolean Prop Proliferation in Shared Components](#31-avoid-boolean-prop-proliferation-in-shared-components)
    - 3.2 [Choose Single Components, Compound Components, and Variants Deliberately](#32-choose-single-components-compound-components-and-variants-deliberately)
    - 3.3 [Expose Only Compound Parts the Consumer Assembles](#33-expose-only-compound-parts-the-consumer-assembles)
    - 3.4 [Prefer Children Over Render Props for Static Composition](#34-prefer-children-over-render-props-for-static-composition)
4. [Component Structure and JSX](#4-component-structure-and-jsx) — **HIGH**
    - 4.1 [Accept props as a Whole and Destructure Inside the Component](#41-accept-props-as-a-whole-and-destructure-inside-the-component)
    - 4.2 [Do Not Define Components Inside Components](#42-do-not-define-components-inside-components)
    - 4.3 [Use Named Handlers Instead of Hiding Logic in JSX](#43-use-named-handlers-instead-of-hiding-logic-in-jsx)
    - 4.4 [Open ref Props Only for Real Imperative Contracts](#44-open-ref-props-only-for-real-imperative-contracts)
    - 4.5 [Use Activity Only to Preserve Mounted Subtrees](#45-use-activity-only-to-preserve-mounted-subtrees)
    - 4.6 [Declare and Export Props Interfaces Above the Component](#46-declare-and-export-props-interfaces-above-the-component)
5. [Screen File Discipline](#5-screen-file-discipline) — **HIGH**
    - 5.1 [Avoid Premature Abstraction in Screen Code](#51-avoid-premature-abstraction-in-screen-code)
    - 5.2 [Extract Route-local Section Components Only for Runtime Boundaries](#52-extract-route-local-section-components-only-for-runtime-boundaries)
    - 5.3 [Keep Derived Values Close to Where They Are Used](#53-keep-derived-values-close-to-where-they-are-used)
    - 5.4 [Keep Route Entry Files Focused on Screen Flow](#54-keep-route-entry-files-focused-on-screen-flow)
    - 5.5 [Place Suspense Boundaries at the Section Owner](#55-place-suspense-boundaries-at-the-section-owner)
    - 5.6 [Avoid Ad-hoc Loading Branches in Screen Bodies](#56-avoid-ad-hoc-loading-branches-in-screen-bodies)
6. [Events and Interaction Flow](#6-events-and-interaction-flow) — **MEDIUM-HIGH**
    - 6.1 [Keep Screen-specific Handler Flow Local Until a Real Utility Emerges](#61-keep-screen-specific-handler-flow-local-until-a-real-utility-emerges)
    - 6.2 [Name Handlers Predictably](#62-name-handlers-predictably)
    - 6.3 [Curry Extra Arguments Into DOM Event Handlers](#63-curry-extra-arguments-into-dom-event-handlers)
    - 6.4 [Run User Actions in Handlers, Not Effects](#64-run-user-actions-in-handlers-not-effects)
7. [Server Data Flow](#7-server-data-flow) — **CRITICAL**
    - 7.1 [Name Query and Mutation Bindings Consistently](#71-name-query-and-mutation-bindings-consistently)
    - 7.2 [Preserve Response and Store Origin in Wide Scopes](#72-preserve-response-and-store-origin-in-wide-scopes)
    - 7.3 [Shape React Query Data in query.select](#73-shape-react-query-data-in-query-select)
8. [State Ownership and Updates](#8-state-ownership-and-updates) — **HIGH**
    - 8.1 [Calculate Derived Values During Rendering](#81-calculate-derived-values-during-rendering)
    - 8.2 [Choose State Tools by Source of Truth](#82-choose-state-tools-by-source-of-truth)
    - 8.3 [Store Shared Derived Decisions Only When They Are Truly Shared](#83-store-shared-derived-decisions-only-when-they-are-truly-shared)
    - 8.4 [Use Functional setState Updates When Based on Previous State](#84-use-functional-setstate-updates-when-based-on-previous-state)
    - 8.5 [Use useEffectEvent for Non-reactive Effect Callbacks](#85-use-useeffectevent-for-non-reactive-effect-callbacks)
9. [Render Performance](#9-render-performance) — **MEDIUM-HIGH**
    - 9.1 [Do Not Memoize Without a Confirmed Reason](#91-do-not-memoize-without-a-confirmed-reason)
    - 9.2 [Use Lazy State Initializers for Expensive Defaults](#92-use-lazy-state-initializers-for-expensive-defaults)
    - 9.3 [Use startTransition for Non-urgent Visual Updates](#93-use-starttransition-for-non-urgent-visual-updates)
    - 9.4 [Use useDeferredValue for Heavy Derived Renders](#94-use-usedeferredvalue-for-heavy-derived-renders)
10. [Documentation and Comments](#10-documentation-and-comments) — **MEDIUM**
    - 10.1 [Require Doc Comments on React Hooks, Handlers, and Key Declarations](#101-require-doc-comments-on-react-hooks-handlers-and-key-declarations)
    - 10.2 [Document Compound Parts Above the Props Interface](#102-document-compound-parts-above-the-props-interface)

---

## 1. Ownership and Boundaries

**Impact: CRITICAL**

`ui`, `widget`, `page` 세 레이어의 소유 경계가 분명해야 코드를 예측 가능하게 배치할 수 있습니다. 레이어 판정과 이름 표기, 역할 폴더, 하향 단방향 가져오기, 생명주기 소유가 이 경계를 지탱하고, 순수 계산을 훅으로 감싸지 않는 규율도 여기에 속합니다.

### 1.1 Do Not Create Screen-local Custom Hooks for Pure Logic

**Rule:** `R01` · `ownership-prefer-plain-ts-for-local-react-helpers`

**Applies when:** 화면 전용 계산·정규화·전송 값 조립을 커스텀 훅으로 추출하려 할 때. 화면 전용 순수 로직을 별도 보조 모듈로 옮기려 할 때.

**Review with:** `ownership-keep-lifecycle-in-the-owning-component`, `ownership-place-owner-files-in-role-folders`, `typescript/functions-extract-helpers-only-when-the-boundary-is-real`

**Impact: HIGH (리액트 전용 추상을 실제 생명주기나 문맥이 얽힌 자리로만 한정합니다)**

화면 하나에 종속된 계산, 정규화, 전송 값 조립은 커스텀 훅으로 포장하지 않습니다.
일반 함수로 둡니다.

- 이 규칙은 훅으로 감쌀지만 판정합니다.
  그 함수를 아예 밖으로 뺄지는 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`가,
  뺀 결과를 어디 둘지는 `ownership-place-owner-files-in-role-folders`가 정합니다.
- 화면 지역 커스텀 훅은 상태, 컨텍스트, 다른 훅 호출 순서를 실제로 캡슐화할 때만 허용합니다.
- 보조 모듈을 네임스페이스 객체로 감싸지 않고 이름 붙인 내보내기로 둡니다.
- 생명주기가 실제로 있어도 파일 분량을 줄이려는 추출은 허용하지 않습니다.
  그 판단은 `ownership-keep-lifecycle-in-the-owning-component`가 담당합니다.
- 단순 계산을 훅처럼 보이게 만드는 추상화는 피합니다.

**Incorrect (로컬 계산을 습관적으로 훅으로 포장):**

```ts
export const useMediaUploadPayload = (files: UploadFile[]) => {
	return files.map((file) => ({ uid: file.uid }));
};
```

**Incorrect (보조 모듈을 불필요한 네임스페이스 객체로 감쌈):**

```ts
export const page = {
	buildMediaUploadPayload(files: UploadFile[]) {
		return files.map((file) => ({ uid: file.uid }));
	},
};
```

**Correct (순수 계산은 소유자의 `function` 폴더에서 이름 붙인 내보내기로 유지):**

```ts
// page/entries/function/build-media-upload-payload.ts
/**
 * 업로드 파일 목록을 저장 payload로 정규화
 */
export const buildMediaUploadPayload = (files: UploadFile[]) => {
	return files.map((file) => ({ uid: file.uid }));
};
```

**Correct (이름 붙인 내보내기를 직접 가져옴):**

```tsx
import { buildMediaUploadPayload } from "./function/build-media-upload-payload";

const request = buildMediaUploadPayload(files);
```

### 1.2 Keep UI, Widget, and Page Ownership Separate

**Rule:** `R02` · `ownership-layer-component-boundaries`

**Applies when:** 컴포넌트를 ui·widget·page 중 어느 소유 레이어에 둘지 정할 때. 컴포넌트를 레이어 사이에서 옮기거나 공용화할 때.

**Review with:** `css/ownership-choose-scope-prefix-by-reuse-range`, `ownership-place-owner-files-in-role-folders`

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

### 1.3 Prefix Layer Names on Files and Symbols

**Rule:** `R03` · `ownership-prefix-layer-names-on-files-and-symbols`

**Applies when:** 컴포넌트 파일이나 심볼 이름을 새로 지을 때. 컴포넌트를 다른 레이어로 옮기면서 이름을 바꿀 때.

**Review with:** `ownership-layer-component-boundaries`, `typescript/naming-use-consistent-file-and-symbol-naming`

**Impact: HIGH (파일 하나만 봐도 어느 레이어 소유인지 드러납니다)**

세 레이어 모두 파일명과 심볼에 계층 접두사를 붙입니다. 예외를 두지 않습니다.

| 레이어 | 파일 | 심볼 | CSS 식별자 |
| --- | --- | --- | --- |
| `ui` | `ui-button.tsx` | `UiButton` | `ui_button` |
| `widget` | `wg-chart.tsx` | `WgChart` | `wg_chart` |
| `page` | `pg-detail.tsx` | `PgDetail` | `pg_detail` |

- 폴더에는 붙이지 않습니다. 상위 계층 폴더가 이미 계층을 말합니다.
- 접두사가 말하는 부분을 이름에서 되풀이하지 않습니다.
  `ui/button/ui-button.tsx`이고 `ui-button-button.tsx`가 아닙니다.
- 어느 레이어인지 정하는 것은 `ownership-layer-component-boundaries`가 먼저 판정합니다.
  이 규칙은 그 결과를 이름에 적는 것만 봅니다.

**Incorrect (화면 컴포넌트에만 접두사를 빼먹음):**

```tsx
// page/detail/component/spike-pattern-panel.tsx
export const SpikePatternPanel = (props: SpikePatternPanelProps) => {
	return <section className="pg_spikePatternPanel__root">{/* ... */}</section>;
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
// page/detail/component/pg-spike-pattern-panel.tsx
export const PgSpikePatternPanel = (props: PgSpikePatternPanelProps) => {
	return <section className="pg_spikePatternPanel__root">{/* ... */}</section>;
};
```

### 1.4 Place Owner Files in Role Folders

**Rule:** `R04` · `ownership-place-owner-files-in-role-folders`

**Applies when:** 소유자 아래 `component`·`config`·`function`·`hook`·`type` 폴더를 만들거나 옮길 때. 추출한 컴포넌트·함수·타입의 배치 위치를 정할 때. 제외: 기존 파일 내부 구현만 바꾸는 경우.

**Review with:** `css/ownership-choose-scope-prefix-by-reuse-range`, `ownership-keep-component-imports-flowing-downward`

**Impact: CRITICAL (빼낸 파일이 소유자를 따라가 예상한 자리에 놓입니다)**

라우트와 복잡한 컴포넌트가 소유자이고, 추출한 파일은 그 소유자 아래 역할 폴더에 둡니다.
소유자 이름이 폴더 이름이므로 위치만 보고 소유자를 알 수 있습니다.

역할 폴더는 다음 다섯 개뿐이고 새 역할 폴더를 발명하지 않습니다.

| 폴더 | 담는 것 |
| --- | --- |
| `component` | 이 소유자만 쓰는 하위 컴포넌트 |
| `config` | 입력을 받지 않는 선언형 설정, 기본 설정, 기준값 |
| `function` | 대표 내보낸 도메인 연산 |
| `hook` | 실제 상태·이펙트·컨텍스트를 소유한 커스텀 훅 |
| `type` | 여러 파일이 공유하는 계약 |

`util`, `helper`, `constant`, `common`, `shared` 같은 폴더는 만들지 않습니다.
폴더 이름은 단수로 쓰고 프레임워크가 강제하는 이름만 예외로 둡니다.

배치 기준입니다.

- 필요한 역할 폴더만 그때 만듭니다. 빈 폴더를 미리 만들어 두지 않습니다.
- 파일이 하나뿐인 역할 폴더도 그대로 둡니다. 형제 `.ts` 하나로 대신하지 않습니다.
- 자기 역할 폴더가 필요한 컴포넌트만 자기 폴더를 갖고, 말단은 `component` 아래 파일로 둡니다.
- 프롭스는 해당 TSX에 두고 여러 파일이 공유하는 계약만 `type`으로 옮깁니다.
- 컴포넌트 파일명에는 계층 접두사를 붙이고 폴더명에는 붙이지 않습니다.
- 소유자 중첩이 3단계에 닿으면 분리가 맞는지 `widget`으로 나갈 대상인지 다시 봅니다.

무엇을 추출할지는 이 규칙이 정하지 않습니다.
`typescript/functions-extract-helpers-only-when-the-boundary-is-real`가 추출 여부를 먼저 판정하고
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

**Correct (필요한 역할 폴더만 만들고 말단은 파일로 둠):**

```txt
page/detail/
├── pg-detail.tsx
├── pg-detail.css
├── function/
│   └── map-api-response-to-view-model.ts
├── type/
│   └── detail-view-model.ts
└── component/
    ├── pg-summary-band.tsx
    ├── pg-summary-band.css
    └── spike-pattern-panel/
        ├── pg-spike-pattern-panel.tsx
        ├── pg-spike-pattern-panel.css
        └── function/
            └── resolve-chart-viewport.ts
```

**Correct (지원 코드가 없으면 폴더 없이 파일만 둠):**

```txt
ui/button/
├── ui-button.tsx
└── ui-button.css
```

### 1.5 Keep Component Imports Flowing Downward

**Rule:** `R05` · `ownership-keep-component-imports-flowing-downward`

**Applies when:** `component` 폴더 안의 파일을 다른 파일에서 가져오기할 때. `../`나 `@/page` 경로로 컴포넌트를 가져오려 할 때. 여러 자식이 같은 컴포넌트를 필요로 해 배치를 다시 정할 때.

**Requires selected:** `typescript/naming-use-direct-imports-and-public-entry-points` · 함께 적용

**Review with:** `ownership-layer-component-boundaries`

**Impact: CRITICAL (비공개 컴포넌트를 형제나 위쪽에서 되짚어 소유 관계가 무너지지 않습니다)**

컴포넌트 가져오기는 소유 관계를 따라 아래로만 흐릅니다.

- `component` 폴더 안의 파일은 그 폴더의 소유자만 가져오기합니다.
- 형제끼리는 가져오기하지 않습니다.
- `../`로 컴포넌트를 가져오지 않습니다.
- 절대경로 별칭의 허용 범위는 `typescript/naming-use-direct-imports-and-public-entry-points`가 정합니다.

여러 자식이 같은 컴포넌트를 필요로 하면 셋 중 하나로 해소합니다.

1. 부모가 조립해서 프롭이나 `children`으로 내려보냅니다.
2. 화면 조립을 전제하지 않는 컴포넌트면 `ui` 또는 `widget`으로 올립니다.
3. 짧은 조각이면 그대로 중복해서 씁니다.

세 자식 이상이 같은 것을 필요로 하는데 올릴 수도 없으면 자식 분리가 잘못됐다는 신호입니다.
`function`, `type`, `config`는 렌더 트리를 만들지 않으므로 소유자 안에서 공유하고 이 방향 제약을 받지 않습니다.

**Incorrect (형제 컴포넌트를 직접 가져와 소유 관계가 사라짐):**

```tsx
// page/detail/component/spike-pattern-panel/component/pg-detection-section.tsx
import { PgLegendRow } from "./pg-legend-row";
import { SectionHeading } from "../../section-heading/section-heading";
```

**Incorrect (절대경로로 다른 화면 내부를 가져옴):**

```tsx
import { PgSpikeChartCard } from "@/page/detail/component/spike-pattern-panel/component/pg-spike-chart-card";
```

**Correct (부모가 조립해서 내려보냄):**

```tsx
// page/detail/component/spike-pattern-panel/pg-spike-pattern-panel.tsx
import { UiSectionHeading } from "@/ui/section-heading/ui-section-heading";

import { PgDetectionSection } from "./component/pg-detection-section";
import { PgSummaryBand } from "./component/pg-summary-band";

export const PgSpikePatternPanel = (props: PgSpikePatternPanelProps) => {
	const { legendItems } = props;

	return (
		<section className="pg_spikePatternPanel__root">
			<PgDetectionSection heading={<UiSectionHeading title="상단 이탈 감지" />} legendItems={legendItems} />
			<PgSummaryBand heading={<UiSectionHeading title="요약" />} />
		</section>
	);
};
```

**Correct (맥락 독립 컴포넌트는 전역 레이어에서 가져옴):**

```tsx
// page/detail/component/spike-pattern-panel/component/pg-detection-section.tsx
import { WgLegendPanel } from "@/widget/legend-panel/wg-legend-panel";
```

### 1.6 Keep Library Lifecycle in the Owning Component

**Rule:** `R06` · `ownership-keep-lifecycle-in-the-owning-component`

**Applies when:** 외부 라이브러리 인스턴스 생성·크기 변경·구독·정리를 한 컴포넌트가 소유할 때. 생명주기 코드를 커스텀 훅으로 옮겨 파일을 줄이려 할 때. 제외: 여러 소유자가 같은 생명주기 계약을 실제로 호출하는 경우.

**Review with:** `ownership-prefer-plain-ts-for-local-react-helpers`

**Impact: HIGH (파일 길이를 줄이려고 생명주기를 훅 뒤로 숨겨 실행 흐름이 사라지지 않습니다)**

외부 라이브러리의 인스턴스 생성, 크기 변경, 이벤트 구독, 정리는 그 하위 트리를 소유한 컴포넌트가 직접 가집니다.
파일이 길어졌다는 이유만으로 커스텀 훅을 만들어 생명주기를 숨기지 않습니다.

- 한 소유자만 쓰는 생명주기는 그 컴포넌트 안의 이펙트로 둡니다.
- 줄 수 감소는 추출 근거가 아닙니다. 읽는 사람이 파일을 왕복하게 만들 뿐입니다.
- 여러 소유자가 같은 생명주기 계약을 실제로 호출할 때만 훅으로 올립니다.
- 파일이 길면 생명주기를 옮기기보다 도메인 계산을 `function`으로 분리합니다.

`ownership-prefer-plain-ts-for-local-react-helpers`는 순수 계산을 훅으로 포장하는 것을 막고,
이 규칙은 반대로 실제 생명주기가 있어도 분량 때문에 훅으로 옮기는 것을 막습니다.

**Incorrect (줄 수를 줄이려고 생명주기를 훅 뒤로 옮김):**

```tsx
// component/chart-root/use-chart-instance.ts
export const useChartInstance = (containerRef: RefObject<HTMLDivElement>) => {
	const [chart, setChart] = useState<EChartsType | null>(null);

	useEffect(() => {
		const instance = init(containerRef.current);
		const handleResize = () => instance.resize();

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
// component/chart-root/chart-root.tsx
export const ChartRoot = (props: ChartRootProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const chart = useChartInstance(containerRef);

	return <div ref={containerRef} className="wg_chart__canvas" />;
};
```

**Correct (생명주기를 소유 컴포넌트가 직접 가짐):**

```tsx
// component/chart-root/chart-root.tsx
export const ChartRoot = (props: ChartRootProps) => {
	const { option } = props;
	const containerRef = useRef<HTMLDivElement>(null);
	const [chart, setChart] = useState<EChartsType | null>(null);

	/**
	 * container mount 시 chart instance를 만들고 resize·dispose까지 소유
	 */
	useEffect(() => {
		if (!containerRef.current) return;

		const instance = init(containerRef.current);
		const handleResize = () => instance.resize();

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
		chart?.setOption(option);
	}, [chart, option]);

	return <div ref={containerRef} className="wg_chart__canvas" />;
};
```

## 2. Typing and Contracts

**Impact: HIGH**

리액트 핸들러 타입과 래퍼가 노출한 프롭 계약은 선언 자리에서 바로 드러나야 합니다. 일반 TypeScript 타입 규칙은 동반 스킬이 다루고 여기서는 리액트 문맥만 봅니다.

### 2.1 Pin React Handler and Wrapper Prop Types at the Declaration

**Rule:** `R07` · `typing-function-type-first`

**Applies when:** 커링 팩토리가 돌려주는 리액트 핸들러의 타입을 정할 때. `Ui*` 래퍼 사용처에서 프롭스 타입을 참조할 때. 제외: `query.select` 같은 훅 옵션의 일회성 문맥 콜백인 경우.

**Requires selected:** `typescript/types-reuse-callback-signatures-from-existing-contracts` · 함께 적용

**Review with:** `typescript/types-prefer-function-variable-types-over-parameter-annotations`

**Impact: HIGH (핸들러 시그니처와 래퍼가 좁힌 계약이 선언 자리에서 바로 드러납니다)**

매개변수마다 타입을 붙이지 않고 함수 변수 타입을 쓰는 일반 규칙은
`typescript/types-prefer-function-variable-types-over-parameter-annotations`가 정합니다.
여기서는 그 규칙이 다루지 않는 리액트 두 자리만 봅니다.

**커링 팩토리의 반환 함수도 리액트 핸들러입니다.**
JSX가 나중에 문맥 타입을 준다는 이유로 반환 타입을 생략하지 않고,
`MouseEventHandler<...>` 같은 기존 별칭으로 팩토리 반환 타입을 고정합니다.

**`Ui*` 래퍼를 쓸 때는 라이브러리 원본 프롭스를 참조하지 않습니다.**
래퍼가 노출한 `Ui*Props`를 참조합니다.
래퍼가 의도적으로 좁히거나 보강한 계약이 사용처로 새지 않게 하려는 것입니다.

`query.select` 같은 훅 옵션의 일회성 문맥 콜백은 리액트 핸들러 구현이 아니라 대상이 아닙니다.

**Incorrect (팩토리 반환 타입을 JSX 문맥에 떠넘김):**

```ts
const handleRowSelectToggle = (rowId: string) => (event: MouseEvent<HTMLLIElement>) => {
  event.preventDefault();
  toggleSelection(rowId);
};
```

**Correct (팩토리 반환 타입을 기존 별칭으로 고정):**

```ts
import type { MouseEventHandler } from "react";

/**
 * 행 선택 토글 핸들러 팩토리
 */
const handleRowSelectToggle =
  (rowId: string): MouseEventHandler<HTMLLIElement> =>
  (_event) => {
    toggleSelection(rowId);
  };
```

**Incorrect (래퍼를 쓰면서 라이브러리 원본 프롭스를 참조):**

```ts
import type { ButtonProps } from "antd";

const handleSubmitClick: ButtonProps["onClick"] = (event) => {
  event.preventDefault();
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

## 3. Composition Strategy

**Impact: HIGH**

공용 컴포넌트는 단일 컴포넌트, 합성 컴포넌트, 드러난 변형 중 어떤 구조를 쓸지 먼저 결정하고, 그다음 무엇을 공개 부품으로 열지 정합니다. 합성 컴포넌트는 상태 없는 조립에서 시작해 같은 공개 이름을 유지한 채 상태를 가진 구조로 확장될 수 있어야 합니다.

### 3.1 Avoid Boolean Prop Proliferation in Shared Components

**Rule:** `R08` · `strategy-avoid-boolean-prop-proliferation`

**Applies when:** 여러 곳에서 쓰는 공용 컴포넌트에 불리언 모드·표시 프롭을 추가할 때. 기존 불리언 프롭 조합과 JSX 분기가 늘어날 때.

**Impact: HIGH (공용 컴포넌트가 숨은 조합을 쌓지 않고 구조를 드러냅니다)**

여러 파일과 레이어에서 재사용되는 공용 컴포넌트에 `isCompact`, `isEditing`, `showSearch` 같은
불리언 프롭을 늘리지 않습니다.

두 신호 중 하나라도 보이면 구조를 다시 고릅니다.

- 모양이나 모드를 정하는 불리언 프롭이 둘 이상입니다.
- 불리언 프롭 두 개가 조합되어 JSX 분기를 만듭니다.
불리언이 늘어날수록 가능한 조합이 급증하고, JSX 분기와 스타일 조건도 함께 불어납니다.

- 라우트 진입 안의 일회성 분기는 로컬에서 유지해도 됩니다.
- 공용 `ui`나 `widget`는 드러난 변형 컴포넌트나 합성 컴포넌트로 드러냅니다.
- `.Root` 같은 네임스페이스 부품 문법은 권장 예시일 뿐입니다.
  본질은 불리언을 없애고 구조를 명시적으로 드러내는 데 있습니다.

**Incorrect (불리언 프롭 조합으로 공용 컴포넌트가 비대해짐):**

```tsx
export interface WgEntryToolbarProps {
	isCompact?: boolean;
	isEditing?: boolean;
	showSearch?: boolean;
}

export const WgEntryToolbar = (props: WgEntryToolbarProps) => {
	const { isCompact, isEditing, showSearch } = props;

	return (
		<header>
			{showSearch ? <EntrySearchField /> : null}
			{isEditing ? <EntryEditActions compact={isCompact} /> : <EntryBrowseActions compact={isCompact} />}
		</header>
	);
};
```

**Correct (변형을 드러난 컴포넌트와 상태 없는 합성 컴포넌트로 분리):**

```tsx
const WgEntryToolbarRoot = (props: { children: ReactNode }) => {
	const { children } = props;
	return <header>{children}</header>;
};

export const WgEntryToolbar = {
	Root: WgEntryToolbarRoot,
	Search: EntrySearchField,
	BrowseActions: EntryBrowseActions,
	EditActions: EntryEditActions,
} as const;

export const WgEntryBrowseToolbar = () => {
	return (
		<WgEntryToolbar.Root>
			<WgEntryToolbar.Search />
			<WgEntryToolbar.BrowseActions />
		</WgEntryToolbar.Root>
	);
};

export const WgEntryEditToolbar = () => {
	return (
		<WgEntryToolbar.Root>
			<WgEntryToolbar.EditActions />
		</WgEntryToolbar.Root>
	);
};
```

### 3.2 Choose Single Components, Compound Components, and Variants Deliberately

**Rule:** `R09` · `strategy-choose-single-composition-compound-and-variants`

**Applies when:** 내보낸 공용 컴포넌트에 슬롯·공개 부품·공용 컨텍스트/동작을 추가할 때. 반복되는 기본 설정이나 모드 API를 추가할 때. 공용 컴포넌트의 조립 구조를 재설계할 때.

**Review with:** `screen-avoid-premature-abstraction`, `strategy-avoid-boolean-prop-proliferation`, `strategy-expose-only-assembled-compound-parts`, `strategy-prefer-children-over-render-props`

**Impact: HIGH (필요한 확장점은 열면서 가장 단순한 구조를 고르게 돕습니다)**

공용 컴포넌트는 프롭스보다 구조를 먼저 고릅니다.
고정 UI, 공개 부품 조립, 공용 상태/동작/컨텍스트, 반복 기본 설정 중 무엇이 필요한지 순서대로 봅니다.

**빠른 선택표**

| 상황 | 선택 |
| --- | --- |
| 고정 UI | `single component` 또는 화면 지역 JSX |
| 부품 조립만 필요함 | `stateless compound component` |
| 여러 부품이 같은 상태/동작/컨텍스트를 읽음 | `stateful compound component` |
| 같은 합성 조합이 반복됨 | `explicit variant component` |

렌더 프롭을 쓸 자리인지는 `strategy-prefer-children-over-render-props`가 따로 판정합니다.

무엇을 공개 부품으로 열지는 `strategy-expose-only-assembled-compound-parts`가 정합니다.

**Incorrect (단일·합성·드러난 변형의 경계를 구분하지 않고 한 컴포넌트에 몰아넣음):**

```tsx
export interface ProfileDialogProps {
	isCompact?: boolean;
	showActivity?: boolean;
	showFocus?: boolean;
	dialogTitle?: string;
	renderFooter?: () => ReactNode;
}

export const ProfileDialog = (props: ProfileDialogProps) => {
	const { isCompact, showActivity, showFocus, dialogTitle, renderFooter } = props;

	return (
		<section className={isCompact ? "dialog dialog--compact" : "dialog"}>
			<header>
				<h3>{dialogTitle ?? "Profile"}</h3>
			</header>
			<ProfileSummary />
			{showActivity ? <ActivityPanel /> : null}
			{showFocus ? <FocusPanel /> : null}
			<footer>{renderFooter?.()}</footer>
		</section>
	);
};
```

**Correct (고정 구조면 단일 컴포넌트로 유지):**

```tsx
export interface EmptyStateProps {
	title: string;
	description: string;
}

export const EmptyState = (props: EmptyStateProps) => {
	const { title, description } = props;

	return (
		<section className="empty-state">
			<EmptyFolderIllustration />
			<h2>{title}</h2>
			<p>{description}</p>
		</section>
	);
};
```

**Correct (구조를 열어야 하면 상태 없는 합성 컴포넌트로 시작):**

```tsx
export interface SectionProps {
	children: ReactNode;
}

const SectionRoot = (props: SectionProps) => {
	const { children } = props;
	return <section className="section">{children}</section>;
};

const SectionHeader = (props: SectionProps) => {
	const { children } = props;
	return <header className="section__header">{children}</header>;
};

const SectionFooter = (props: SectionProps) => {
	const { children } = props;
	return <footer className="section__footer">{children}</footer>;
};

export const Section = {
	Root: SectionRoot,
	Header: SectionHeader,
	Footer: SectionFooter,
} as const;
```

**Correct (여러 부품이 상태를 공유하면 상태를 가진 합성 컴포넌트로 확장):**

```tsx
const TabsContext = createContext<TabsContextValue | null>(null);

const TabsRoot = (props: TabsRootProps) => {
	const { defaultValue, children } = props;
	const [activeValue, setActiveValue] = useState(defaultValue);

	return (
		<TabsContext value={{ activeValue, setActiveValue }}>
			<section>{children}</section>
		</TabsContext>
	);
};

const TabsTrigger = (props: TabsTriggerProps) => {
	const { value, children } = props;
	const tabs = useTabsContext();
	return <button onClick={() => tabs.setActiveValue(value)}>{children}</button>;
};

const TabsPanel = (props: TabsPanelProps) => {
	const { value, children } = props;
	const tabs = useTabsContext();
	return tabs.activeValue === value ? <section>{children}</section> : null;
};
```

**Correct (같은 계열 조합이 반복되면 드러난 변형으로 감쌈):**

```tsx
export const ReadOnlyProfileDialog = () => {
	return (
		<Dialog.Root>
			<Dialog.Trigger>View profile</Dialog.Trigger>
			<Dialog.Content>...</Dialog.Content>
		</Dialog.Root>
	);
};
```

### 3.3 Expose Only Compound Parts the Consumer Assembles

**Rule:** `R10` · `strategy-expose-only-assembled-compound-parts`

**Applies when:** 합성 컴포넌트의 공개 부품 목록에 부품을 넣거나 뺄 때. 상태 없는 합성에 상태를 넣으면서 공개 이름을 바꾸려 할 때.

**Review with:** `css/composition-do-not-add-wrapper-elements-for-styling`, `strategy-choose-single-composition-compound-and-variants`

**Impact: HIGH (내부 구조가 공개 계약이 되지 않아 나중에 바꿀 수 있습니다)**

공개 부품은 두 경우만 엽니다.

- 소비자가 이름으로 직접 조립해야 하는 영역
- 공용 컨텍스트나 동작을 직접 쓰는 영역

그 밖은 숨깁니다. 특히 다음 셋은 공개하지 않습니다.

- 단순 `className` 래퍼
- 여백 보정용 DOM. `css/composition-do-not-add-wrapper-elements-for-styling`가 애초에 만들지 말라고 합니다.
- 내부 레이아웃 보조 함수

상태 없는 합성에 상태가 필요해지면 공개 이름은 그대로 두고 컨텍스트만 추가합니다.
공개 이름이 바뀌면 소비자 코드가 모두 바뀝니다.

**Incorrect (내부 구조를 전부 공개해 계약으로 굳힘):**

```tsx
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
export const UiPanel = {
	Root: UiPanelRoot,
	Header: UiPanelHeader,
	Body: UiPanelBody,
} as const;
```

### 3.4 Prefer Children Over Render Props for Static Composition

**Rule:** `R11` · `strategy-prefer-children-over-render-props`

**Applies when:** 공용 컴포넌트에 머리말·꼬리말·동작 같은 정적 슬롯을 추가·변경할 때. 렌더 프롭을 추가·변경하는데 실행 환경 데이터 주입이 꼭 필요한지 불분명할 때.

**Impact: MEDIUM (부모가 콜백으로 값을 내려보낼 필요가 없으면 조립이 읽기 쉬워집니다)**

공용 컴포넌트가 `stateless compound component`로 충분할 때는 `renderHeader`,
`renderFooter` 같은 렌더 프롭보다 `children`과 네임스페이스 슬롯 부품을 우선합니다.
렌더 프롭은 부모가 자식에 항목, 순번, 상태 같은 실행 환경 데이터를 전달해야 할 때만 사용합니다.

**Incorrect (정적인 구조를 렌더 프롭으로 조립):**

```tsx
export interface PanelProps {
	renderHeader?: () => ReactNode;
	renderFooter?: () => ReactNode;
}

export const Panel = (props: PanelProps) => {
	const { renderHeader, renderFooter } = props;

	return (
		<section className="panel">
			{renderHeader?.()}
			<ItemList />
			{renderFooter?.()}
		</section>
	);
};
```

**Correct (`children`과 네임스페이스 슬롯 부품으로 구조를 드러냄):**

```tsx
export interface PanelProps {
	children: ReactNode;
}

const PanelRoot = (props: PanelProps) => {
	const { children } = props;
	return <section className="panel">{children}</section>;
};

const PanelHeader = (props: PanelProps) => {
	const { children } = props;
	return <header className="panel__header">{children}</header>;
};

const PanelFooter = (props: PanelProps) => {
	const { children } = props;
	return <footer className="panel__footer">{children}</footer>;
};

export const Panel = {
	Root: PanelRoot,
	Header: PanelHeader,
	Footer: PanelFooter,
} as const;

export const EntryScreen = () => {
	return (
		<>
			<Panel.Root>
				<Panel.Header>
					<h2>Entries</h2>
					<EntrySearchField />
				</Panel.Header>
				<EntryList />
				<Panel.Footer>
					<Pagination />
				</Panel.Footer>
			</Panel.Root>

			<Panel.Root>
				<Panel.Header>
					<h2>Create entry</h2>
				</Panel.Header>
				<EntryCreateForm />
			</Panel.Root>
		</>
	);
};
```

## 4. Component Structure and JSX

**Impact: HIGH**

프롭스 계약은 컴포넌트 바로 위에서 읽히고, JSX 안에는 동작을 숨기지 않아야 합니다. 컴포넌트를 컴포넌트 안에서 정의하지 않고, `ref` 와 `Activity` 처럼 밖으로 여는 창구는 실제 계약이 있을 때만 엽니다.

### 4.1 Accept props as a Whole and Destructure Inside the Component

**Rule:** `R12` · `composition-destructure-props-inside`

**Applies when:** 프롭스를 받는 함수 컴포넌트의 시그니처나 구조분해 방식을 추가·변경할 때. 프롭스를 받는 컴포넌트를 다른 파일로 옮기거나 이름을 바꿀 때.

**Impact: MEDIUM (컴포넌트 계약은 시그니처에 남고 실제 사용은 본문 가까이 옵니다)**

컴포넌트 시그니처는 `props` 전체를 받고, 함수 본문 첫 줄에서 구조분해합니다.
시그니처에서 계약을 한눈에 읽고, 본문에서 실제 쓰는 값을 좁은 스코프에 둘 수 있습니다.

- 컴포넌트를 다른 파일로 옮기거나 이름을 바꾸는 것도 시그니처를 다시 쓰는 작업입니다.
  프롭스 필드가 그대로여도 이 형태를 다시 확인합니다.
- 프롭스가 없는 컴포넌트 이동만으로는 이 규칙이 걸리지 않습니다.

**Incorrect (시그니처에서 바로 구조분해):**

```tsx
const UserCard = ({ id, onSave }: UserCardProps) => {
  return <button onClick={onSave}>{id}</button>;
};
```

**Correct (계약과 사용 위치를 분리):**

```tsx
const UserCard = (props: UserCardProps) => {
  const { id, onSave } = props;
  return <button onClick={onSave}>{id}</button>;
};
```

### 4.2 Do Not Define Components Inside Components

**Rule:** `R13` · `composition-do-not-define-components-inside-components`

**Applies when:** 컴포넌트 본문 안에 JSX를 반환하는 로컬 함수·컴포넌트를 추가하거나 옮길 때. 재렌더 시 재마운트·focus 초기화 징후를 다룰 때.

**Impact: HIGH (렌더마다 컴포넌트 타입을 다시 만들어 생기는 재마운트와 상태 초기화를 막습니다)**

컴포넌트 본문 안에서 다른 컴포넌트를 새로 정의하지 않습니다.
부모가 다시 렌더될 때마다 자식 컴포넌트 타입도 새로 만들어져
재마운트, 포커스 초기화, 애니메이션 재시작, 이펙트 재실행이 생깁니다.

로컬에서 JSX 조각을 재사용하려면 보조 함수 호출로 남기거나,
독립 컴포넌트로 빼고 프롭스를 전달합니다.

**Incorrect (렌더마다 새 컴포넌트 타입을 생성):**

```tsx
export const UserProfileCard = (props: UserProfileCardProps) => {
	const { theme, user } = props;

	const Avatar = () => {
		return <img className={theme === "dark" ? "avatar-dark" : "avatar-light"} src={user.avatarUrl} />;
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
export interface UserProfileAvatarProps {
	theme: "dark" | "light";
	src: string;
}

export const UserProfileAvatar = (props: UserProfileAvatarProps) => {
	const { theme, src } = props;
	return <img className={theme === "dark" ? "avatar-dark" : "avatar-light"} src={src} />;
};

export const UserProfileCard = (props: UserProfileCardProps) => {
	const { theme, user } = props;

	return (
		<section>
			<UserProfileAvatar src={user.avatarUrl} theme={theme} />
		</section>
	);
};
```

### 4.3 Use Named Handlers Instead of Hiding Logic in JSX

**Rule:** `R14` · `composition-named-handlers-over-inline`

**Applies when:** TSX 이벤트 프롭의 인라인 콜백에 분기나 비동기 호출을 추가·수정할 때. 인라인 콜백에 여러 동작·부수효과나 비자명한 상태 전환이 들어갈 때. 제외: 인자 없이 핸들러 참조만 넘기는 경우.

**Requires selected:** `docs-require-jsdoc-on-key-declarations`, `events-curry-extra-handler-arguments` · 함께 적용

**Review with:** `events-keep-handler-flow-inline`, `events-run-user-actions-in-handlers-not-effects`

**Impact: HIGH (부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽습니다)**

JSX에는 이름 붙인 핸들러 참조만 넘깁니다.
분기, 비동기 호출, 여러 부수효과가 들어가면 핸들러로 분리합니다.

추가 인자를 넘기려고 `onClick={() => handleX(id)}` 같은 인라인 래퍼를 쓰지 않습니다.
그 자리는 `events-curry-extra-handler-arguments`가 커링으로 정합니다.

**Incorrect (분기와 비동기를 JSX 안에 숨김):**

```tsx
<UiButton
  onClick={async () => {
    if (!selectedEntry) {
      return;
    }

    await mutationEntryRemove.mutateAsync({ params: { entryId: selectedEntry.id } });
    void navigate({ to: "/next" });
  }}
/>
```

**Correct (로직을 명명된 핸들러로 노출):**

```tsx
/**
 * 선택된 entry 삭제와 다음 화면 이동 처리
 */
const handleRemoveEntryButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  // ...
};

<UiButton onClick={handleRemoveEntryButtonClick} />;
```

### 4.4 Open ref Props Only for Real Imperative Contracts

**Rule:** `R15` · `composition-open-ref-props-only-for-imperative-contracts`

**Applies when:** 컴포넌트에 `ref` 프롭을 추가하거나 공개할 대상을 바꿀 때. 제외: 이미 있는 `ref` 계약의 타입만 바꾸는 경우.

**Review with:** `strategy-avoid-boolean-prop-proliferation`

**Impact: MEDIUM-HIGH (쓰지도 않는 명령형 창구가 공용 컴포넌트마다 하나씩 늘어나는 것을 막습니다)**

`ref`는 밖에서 실제로 제어해야 하는 공개 명령형 계약입니다.
포커스, 스크롤, 측정처럼 호출부가 직접 다뤄야 하는 일이 있을 때만 엽니다.

- 지금 쓰는 호출부가 없으면 열지 않습니다. 나중에 필요해지면 그때 엽니다.
- 열 때는 `ref`를 일반 프롭처럼 직접 받습니다. 감싸는 래퍼를 새로 만들지 않습니다.
- 외부 패키지 타입 제약 때문에 래퍼가 필요하면 그 이유를 바로 위에 한국어 주석으로 남깁니다.

**Incorrect (`ref` 계약이 필요 없는 단순 화면 컴포넌트에도 습관적으로 `ref`를 노출):**

```tsx
import type { Ref } from "react";

export interface UiStatusBadgeProps {
	ref?: Ref<HTMLSpanElement>;
	label: string;
}

export const UiStatusBadge = (props: UiStatusBadgeProps) => {
	const { ref, label } = props;
	return <span ref={ref}>{label}</span>;
};
```

**Correct (`ref`가 실제로 필요한 공개 API일 때만 리액트 19 방식으로 직접 받음):**

```tsx
import type { ChangeEventHandler, Ref } from "react";

export interface UiSearchInputProps {
	ref?: Ref<HTMLInputElement>;
	value: string;
	onChange: ChangeEventHandler<HTMLInputElement>;
}

export const UiSearchInput = (props: UiSearchInputProps) => {
	const { ref, value, onChange } = props;
	return <input ref={ref} onChange={onChange} value={value} />;
};
```

**Correct (`ref`가 실제 계약이 아닐 때는 일반 프롭만 유지):**

```tsx
export interface UiStatusBadgeProps {
	label: string;
}

export const UiStatusBadge = (props: UiStatusBadgeProps) => {
	const { label } = props;
	return <span>{label}</span>;
};
```

### 4.5 Use Activity Only to Preserve Mounted Subtrees

**Rule:** `R16` · `composition-use-activity-only-to-preserve-mounted-subtrees`

**Applies when:** 조건부 렌더링과 `Activity` 사이를 오갈 때. 숨겼다 되돌릴 때 하위 트리 상태를 살릴지 정할 때.

**Review with:** `composition-do-not-define-components-inside-components`

**Impact: MEDIUM (감추기와 해제가 다른 일이라는 것이 화면마다 같은 방식으로 남습니다)**

기본은 조건부 렌더링입니다.
`<Activity>`는 **숨겼다 되돌릴 때 하위 트리 상태를 그대로 살려야 할 때만** 씁니다.

두 방식은 같은 일이 아닙니다.

| | 조건부 렌더링 | `<Activity mode="hidden">` |
| --- | --- | --- |
| 하위 트리 | 해제됩니다 | 마운트된 채 남습니다 |
| 상태 | 사라집니다 | 유지됩니다 |
| 이펙트 | 정리됩니다 | 정리됩니다 |
| 렌더 비용 | 없습니다 | 낮은 우선순위로 계속 듭니다 |
| 보조 기술 | 없는 것으로 읽힙니다 | 숨겨진 것으로 읽힙니다 |

- 마운트와 해제 자체가 의미를 가지면 조건부 렌더링을 유지합니다.
  폼 초기화, 구독 해제, 첫 진입 애니메이션이 그런 경우입니다.
- 숨긴 하위 트리도 렌더 비용이 계속 듭니다. 무거운 트리를 습관적으로 감춰 두지 않습니다.
- `<Activity>`는 리액트 19.2 이상에만 있습니다. 그보다 낮으면 조건부 렌더링만 씁니다.

**Incorrect (생명주기 의미가 다른 분기를 표시 방식으로 치환):**

```tsx
return (
  <>
    <Activity mode={isEditing ? "visible" : "hidden"}>
      <EditorForm />
    </Activity>
    <Activity mode={isEditing ? "hidden" : "visible"}>
      <PreviewPane />
    </Activity>
  </>
);
```

**Correct (되돌릴 때 상태를 살려야 하는 자리에만 사용):**

```tsx
return (
  <Activity mode={isSidebarOpen ? "visible" : "hidden"}>
    <PgEntrySidebar />
  </Activity>
);
```

**Correct (마운트 의미가 있으면 조건부 렌더링을 유지):**

```tsx
return hasItems ? <PgEntryList /> : <PgEntryEmptyState />;
```

### 4.6 Declare and Export Props Interfaces Above the Component

**Rule:** `R17` · `composition-declare-props-interface-above-the-component`

**Applies when:** 컴포넌트 프롭스 타입을 새로 선언할 때. 프롭스 타입의 위치나 공개 범위를 바꿀 때.

**Review with:** `composition-destructure-props-inside`, `typescript/types-document-custom-types-and-shapes`

**Impact: MEDIUM (계약을 먼저 읽고 구현으로 내려가는 순서가 파일마다 같습니다)**

프롭스 타입은 `interface`로 선언하고 컴포넌트 선언 바로 위에 둡니다.
파일을 열면 계약이 먼저 보이고 구현이 그 아래 옵니다.

- 이름은 컴포넌트 이름에 `Props`를 붙입니다. `UiButton`이면 `UiButtonProps`입니다.
- 사용처가 이 계약을 참조할 수 있어야 하므로 `export`합니다.
  래퍼 사용처가 원본 라이브러리 프롭스를 보지 않게 하려는 것입니다.
- 파일 위쪽에 타입을 모아 두지 않습니다. 컴포넌트가 여러 개면 각자 위에 둡니다.
- 문서 주석은 `typescript/types-document-custom-types-and-shapes`가 정합니다.

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
  const { label } = props;
  return <span className="ui_badge__root">{label}</span>;
};

export const UiChip = (props: UiChipProps) => {
  const { label } = props;
  return <span className="ui_chip__root">{label}</span>;
};
```

**Correct (각 컴포넌트 바로 위에 선언하고 내보냄):**

```tsx
/**
 * 상태 배지 프롭스
 */
export interface UiBadgeProps {
  /**
   * 배지에 표시할 문구
   */
  label: string;
}

export const UiBadge = (props: UiBadgeProps) => {
  const { label } = props;
  return <span className="ui_badge__root">{label}</span>;
};
```

## 5. Screen File Discipline

**Impact: HIGH**

라우트 진입은 화면 흐름을 분명하게 보여줘야 하며, 실행 환경 경계를 소유한 섹션만 떼어냅니다. 파생값은 쓰는 자리에서 계산하고, 막는 로딩은 화면 본문이 아니라 섹션 소유자의 `Suspense` 경계가 처리합니다.

### 5.1 Avoid Premature Abstraction in Screen Code

**Rule:** `R18` · `screen-avoid-premature-abstraction`

**Applies when:** 화면 코드를 보조 함수·훅·컴포넌트·모듈으로 추출할 때. 한 곳에서만 쓰는 기존 추상화를 다시 접어 넣을 때.

**Review with:** `screen-extract-local-section-components-for-runtime-boundaries`, `typescript/functions-extract-helpers-only-when-the-boundary-is-real`

**Impact: HIGH (짐작으로 빼내지 않고 실제 재사용 경계에 맞춰 화면 코드를 둡니다)**

반복이 보인다는 이유만으로 공용 훅, 컴포넌트, 보조 함수를 만들지 않습니다.

추출 전에 먼저 시도할 방법:

- 한 함수 안에서 단계 변수, 섹션 주석, 내부 블록으로 정리
- 화면 지역 JSX에 남기고 흐름을 보이게 유지
- 작은 변환 함수, `href` 조립, 기본값 처리는 호출 위치에 유지

추출해도 되는 경계는 이 규칙이 정하지 않습니다.
컴포넌트는 `screen-extract-local-section-components-for-runtime-boundaries`가,
함수는 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`가 판정합니다.

먼저 시도한 뒤에도 남는 금지 구조:

- 한 컴포넌트, 한 핸들러, 한 질의 `select`만 쓰는 보조 함수를 보조 모듈에 쌓는 구조
- 내보내기 보조 함수가 다른 내보내기 보조 함수 하나만 위해 존재하는 구조
- 이름이 그럴듯하다는 이유로 흐름을 파일 왕복 뒤에 숨기는 구조

**Incorrect (반복만 보고 성급하게 추상화):**

```ts
const useEntryAccessA = () => {
  // 유사 로직
};

const useEntryAccessB = () => {
  // 유사 로직
};
```

**Incorrect (컴포넌트 하나만 쓰는 단계 보조 함수를 보조 모듈에 남김):**

```tsx
const buildEditHref = ({ editHrefBase, row }: { editHrefBase: string; row: EntryRow }) =>
	`${editHrefBase}${row.id}/`;

const mapResponseToRows = (response: EntryListResponse) =>
	response.data.map((entry) => ({ id: entry.id, title: entry.title }));

export const EntryTable = (props: EntryTableProps) => {
	const responseEntriesQuery = useListEntriesSuspense<EntryRow[]>({}, {
		query: { select: mapResponseToRows },
	});

	return responseEntriesQuery.data.map((row) => (
		<a href={buildEditHref({ editHrefBase: props.editHrefBase, row })} key={row.id}>
			{row.title}
		</a>
	));
};
```

**Correct (계약이 생긴 뒤에 공용화):**

```ts
/**
 * form state, 저장 mutation, 오류 노출을 함께 오케스트레이션하는 editor contract
 */
export const useEntryEditor = () => {
  const form = useForm<EntryEditorFormValues>();

  /**
   * entry 저장 API
   */
  const mutationEntrySave = useEntrySave();
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  return { form, mutationEntrySave, setSubmitErrorMessage, submitErrorMessage };
};
```

**Correct (여러 보조 함수 대신 한 함수 안에서 단계별로 정리):**

```ts
/**
 * entry form values를 API payload로 조립
 */
export const buildEntryPayload = (formValues: EntryFormValues) => {
	// 1. 공통 문자열 값 정규화
	// 2. API payload 형태로 조립
	// 3. 결과 반환
};
```

**Correct (작은 질의 가공과 `href` 조립은 사용 지점에 둠):**

```tsx
export const EntryTable = (props: EntryTableProps) => {
	const responseEntriesQuery = useListEntriesSuspense<EntryRow[]>(
		{},
		{
			query: {
				select: (response) =>
					response.data.map((entry) => ({ id: entry.id, title: entry.title })),
			},
		},
	);

	return responseEntriesQuery.data.map((row) => (
		<a href={`${props.editHrefBase}${row.id}/`} key={row.id}>
			{row.title}
		</a>
	));
};
```

### 5.2 Extract Route-local Section Components Only for Runtime Boundaries

**Rule:** `R19` · `screen-extract-local-section-components-for-runtime-boundaries`

**Applies when:** 화면 지역 섹션 컴포넌트를 새로 추출할 때. 기존 섹션이 비동기·상태·프로바이더·상호작용·라이브러리·성능 경계를 소유하는지 바꿀 때.

**Impact: HIGH (화면 흐름은 보이게 두고 실제 실행 경계가 있는 부분만 떼어 냅니다)**

라우트 진입의 지역 컴포넌트는 `runtime boundary`가 있을 때만 추출합니다.
단순 레이아웃 래퍼, `className` 묶기, 들여쓰기 감소만으로는 추출하지 않습니다.

추출 가능한 경계:

- 비동기: `Suspense`, 스켈레톤, 로딩, 오류, 비었을 때 상태
- 상태, 프로바이더: 지역 상태, 이펙트 동기화, 폼 프로바이더, 컨텍스트, 범위를 좁힌 스토어
- 상호작용: 팝오버, 모달, 선택, 인라인 편집, 드래그, 펼치는 트리
- 라이브러리, 성능: 촘촘한 위젯 어댑터, 가상 스크롤, 전환, 지연 값

검색 매개변수, 화면 이동, 화면 단위 질의/변경 요청, 화면 전체 이펙트, 무효화, 이동,
여러 섹션에 걸친 파생값은 라우트 진입에 둡니다.

호출 계층은 폴더 깊이가 아니라 진입 파일의 조립이 드러냅니다.
"어느 컴포넌트가 이걸 쓰는지"를 폴더 경로로 표현하려고 중첩을 늘리지 않습니다.
진입의 JSX와 가져오기 목록을 위에서 아래로 읽으면 답이 나와야 하고, 그러지 않으면 섹션을 과하게 쪼갠 것입니다.

**Incorrect (레이아웃 래퍼만 분리해 라우트 흐름을 숨김):**

```tsx
const PgEntrySidebarPanel = () => {
	return (
		<section className="entry-layout__sidebar">
			<SidebarStats />
			<SearchField />
			<EntryTree />
		</section>
	);
};

const PgEntryDetailPanel = () => {
	return (
		<section className="entry-layout__detail">
			<DetailHeader />
			<EntryTable />
		</section>
	);
};

export const PgEntries = () => {
	const responseEntryTreeSuspense = useEntryTreeSuspense();
	const responseEntryListSuspense = useEntryListSuspense();

	return (
		<div className="entry-layout">
			<PgEntrySidebarPanel />
			<PgEntryDetailPanel />
		</div>
	);
};
```

**Correct (실행 환경 경계를 소유하는 섹션만 화면 지역 컴포넌트로 추출):**

```tsx
interface PgEntryTreeSectionProps {
	categoryNodes: EntryCategoryNode[];
	selectedCategoryId?: string;
	onCategorySelect: (categoryId: string) => void;
}

const PgEntryTreeSection = (props: PgEntryTreeSectionProps) => {
	const { categoryNodes, selectedCategoryId, onCategorySelect } = props;
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
	const [treeSearchKeyword, setTreeSearchKeyword] = useState("");

	const filteredCategoryNodes = getFilteredCategoryNodes(
		categoryNodes,
		treeSearchKeyword,
	);

	/**
	 * tree에서 선택한 category key를 route search용 categoryId로 변환
	 */
	const handleTreeSelect: UiTreeProps["onSelect"] = (keys, _info) => {
		const selectedKey = keys[0];
		if (typeof selectedKey !== "string" || !selectedKey.startsWith("category:")) {
			return;
		}

		onCategorySelect(selectedKey.replace("category:", ""));
	};

	return (
		<section className="entry-layout__sidebar">
			<UiInput
				value={treeSearchKeyword}
				onChange={(event) => setTreeSearchKeyword(event.target.value)}
			/>

			<Activity mode={filteredCategoryNodes.length > 0 ? "visible" : "hidden"}>
				<UiTree
					treeData={filteredCategoryNodes.map(mapEntryNodeToTreeData)}
					expandedKeys={expandedKeys}
					selectedKeys={selectedCategoryId ? [`category:${selectedCategoryId}`] : []}
					onExpand={(keys) => setExpandedKeys(keys.map(String))}
					onSelect={handleTreeSelect}
				/>
			</Activity>

			<Activity mode={filteredCategoryNodes.length > 0 ? "hidden" : "visible"}>
				<UiEmpty description="No matching results" />
			</Activity>
		</section>
	);
};
```

**Correct (라우트 진입이 흐름 제어를 계속 소유):**

```tsx
export const PgEntries = () => {
	const navigate = useNavigate();
	const search = Route.useSearch();

	/**
	 * tree sidebar 조회 API
	 */
	const responseEntryTreeSuspense = useEntryTreeSuspense<EntryTreeSelectData>();

	/**
	 * entry 목록 조회 API
	 */
	const responseEntryListSuspense = useEntryListSuspense<EntryListSelectData>();

	/**
	 * tree에서 선택한 category로 route search를 갱신
	 */
	const handleCategorySelect: PgEntryTreeSectionProps["onCategorySelect"] = (categoryId) => {
		void navigate({
			to: "/entries",
			search: { page: search.page, size: search.size, categoryId },
		});
	};

	return (
		<div className="entry-layout">
			<PgEntryTreeSection
				categoryNodes={responseEntryTreeSuspense.data.categoryNodes}
				selectedCategoryId={search.categoryId}
				onCategorySelect={handleCategorySelect}
			/>
			<PgEntryTableSection
				entries={responseEntryListSuspense.data?.entries}
			/>
		</div>
	);
};
```

### 5.3 Keep Derived Values Close to Where They Are Used

**Rule:** `R20` · `screen-keep-derived-values-close`

**Applies when:** 오리진을 끊는 별칭·플래그·표시값을 넓은 화면 범위에 추가·이동·제거할 때. `let` 재할당이나 배열 `push` 기반 조립을 바꿀 때.

**Impact: HIGH (출처가 남고 화면 진입 파일이 별칭과 준비 코드로 채워지지 않습니다)**

파생값은 실제 쓰는 자리에서 계산합니다.
화면 상단으로 끌어올리면 값의 출처를 잃습니다.

- 오리진을 잃는 별칭 상수, `let` 재할당, 배열 `push` 기반 명령형 조립을 새로 만들지 않고
  기존 항목은 제거합니다.
- 훅 파라미터, JSX 표시값, 이펙트 내부 계산은 쓰는 자리의 좁은 스코프에서 직접 계산합니다.
- JSX 전용 표시값은 화면 상단 `const`로 빼지 말고 원본 체이닝으로 직접 참조합니다.

**Incorrect (화면 상단에서 파생값과 별칭을 누적):**

```ts
const entrySchemaData = responseEntrySchema.data;
const hasSelectedRows = selectedRows.length > 0;
const selectedCategoryIdForQuery = selectedCategoryState.selectedCategoryNode?.id;
```

**Correct (사용 지점 가까이에서 계산):**

```ts
/**
 * entry 목록 조회 API
 */
const responseEntryListSuspense = useEntryListSuspense({
  categoryId: selectedCategoryState.selectedCategoryNode?.id,
});
```

```tsx
<Activity mode={selectedRows.length > 0 ? "visible" : "hidden"}>
  <PgEntryBulkActionBar selectedRows={selectedRows} />
</Activity>
```

```tsx
return <UiInput value={selectedNodeContext?.node?.name} />;
```

### 5.4 Keep Route Entry Files Focused on Screen Flow

**Rule:** `R21` · `screen-keep-route-flow-visible`

**Applies when:** 라우트 진입의 검색·화면 이동·질의·변경 요청·화면 전체 이펙트를 옮기거나 나눌 때. page 섹션 조립의 순서나 소유자를 바꿀 때. 제외: 같은 소유자 안에서 표현만 바꾸는 경우.

**Review with:** `ownership-place-owner-files-in-role-folders`, `screen-extract-local-section-components-for-runtime-boundaries`

**Impact: HIGH (진입 파일만 봐도 화면 흐름을 따라갈 수 있습니다)**

라우트 진입은 검색, 화면 이동, 페이지 질의·변경 요청, 화면 전체 이펙트와 렌더 조립을 보여줍니다.
비동기·상태·상호작용 경계를 가진 섹션을 분리해도 이 흐름 제어 자체는 라우트 진입에 남깁니다.

소유자가 그대로인 변경은 대상이 아닙니다.

- `query.select` 형태, 바인딩·별칭 정리, 파생 상태 이펙트를 렌더 계산으로 옮기는 것
- 순수 타입·전송 값 조립 함수·기본 설정의 형제 `.ts` 이동.
  `typescript/functions-extract-helpers-only-when-the-boundary-is-real`가 담당합니다.

**Incorrect (흐름보다 분해 자체가 목적이 됨):**

```tsx
return (
  <PageShell>
    <PageHeaderSection />
    <PageContentSection />
    <PageFooterSection />
  </PageShell>
);
```

**Correct (라우트 진입에서 흐름이 보이고, 실제 경계가 있는 섹션만 분리):**

```tsx
const navigate = useNavigate();
const search = Route.useSearch();

/**
 * entry 목록 조회 API
 */
const responseEntryListSuspense = useEntryListSuspense({
  page: search.page,
});

/**
 * entry 저장 API
 */
const mutationEntrySave = useEntrySave();

/**
 * entry 저장 후 현재 화면 흐름을 유지한 채 route search를 갱신
 */
const handleSubmitButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  await mutationEntrySave.mutateAsync({ data: request });
  void navigate({
    to: "/entries",
    search: { ...search, page: 1 },
  });
};

return (
  <Fragment>
    <EntryFilterSection />
    <EntryListSection onSubmit={handleSubmitButtonClick} />
  </Fragment>
);
```

### 5.5 Place Suspense Boundaries at the Section Owner

**Rule:** `R22` · `screen-place-suspense-boundaries-at-the-section-owner`

**Applies when:** `Suspense` 질의를 쓰는 화면에서 로딩 대체 화면의 위치를 정할 때. `Suspense` 경계를 추가하거나 옮길 때.

**Requires selected:** `screen-avoid-ad-hoc-loading-branches` · 함께 적용

**Review with:** `screen-extract-local-section-components-for-runtime-boundaries`

**Impact: HIGH (막는 로딩을 화면 본문이 아니라 정해진 한 자리에서 처리합니다)**

`Suspense` 질의를 쓰는 컴포넌트마다 그 **바로 위 섹션 소유자**가 경계를 갖습니다.
경계와 대체 화면은 거기 한 곳에만 둡니다.

- 섹션이 따로 없으면 라우트 진입이 경계를 갖습니다.
- 한 화면에 경계를 여러 겹 쌓지 않습니다. 섹션이 독립적으로 채워져야 할 때만 나눕니다.
- 대체 화면은 채워질 내용과 같은 높이를 차지해야 합니다. 그러지 않으면 레이아웃이 튑니다.
- 질의를 부르는 컴포넌트 자신은 경계를 갖지 않습니다. 자기 자신을 감쌀 수 없습니다.

경계가 있으므로 화면 본문에는 로딩 분기가 남지 않습니다.
그 판정은 `screen-avoid-ad-hoc-loading-branches`가 합니다.

**Incorrect (질의를 부르는 컴포넌트 안에서 로딩을 직접 처리):**

```tsx
export const PgEntryTreeSection = () => {
  const responseEntryTreeSuspense = useEntryTreeSuspense();

  return <UiTree nodes={responseEntryTreeSuspense.data.categoryNodes} />;
};
```

```tsx
// 진입 파일: 경계가 없어 화면 전체가 함께 멈춘다
return <PgEntryTreeSection />;
```

**Correct (섹션 소유자가 경계와 대체 화면을 가짐):**

```tsx
return (
  <Suspense fallback={<PgEntryTreeSkeleton />}>
    <PgEntryTreeSection />
  </Suspense>
);
```

### 5.6 Avoid Ad-hoc Loading Branches in Screen Bodies

**Rule:** `R23` · `screen-avoid-ad-hoc-loading-branches`

**Applies when:** Suspense 질의를 쓰는 화면 본문에 초기 로딩 반환을 추가·변경할 때. `isPending`·`isFetching`으로 화면을 가리는 분기를 넣을 때. 제외: 선택 값에 기본값을 채우는 것만 바꾸는 경우.

**Requires selected:** `typescript/absence-expose-optional-values-instead-of-silent-fallbacks` · 함께 적용

**Review with:** `data-preserve-origin-chaining`, `screen-keep-derived-values-close`

**Impact: HIGH (초기 로딩은 Suspense 경계가 맡고 화면 본문에는 데이터가 있는 경로만 남습니다)**

Suspense 질의를 쓰는 화면은 본문에서 초기 로딩을 다시 분기하지 않습니다.
막는 로딩은 Suspense 경계나 상위 레이아웃이 이미 처리합니다.

- `isPending`, `isFetching`은 이미 그려진 화면을 보조할 때만 씁니다.
  버튼 비활성화, 백그라운드 다시 불러오기 표시, 저장 중 배지가 그런 경우입니다.
- 화면 전체를 가리는 지역 로딩 분기가 꼭 필요하면 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 이유를 남깁니다.

값이 없을 수 있다는 사실을 기본값으로 덮는 문제는 이 규칙이 아니라
`typescript/absence-expose-optional-values-instead-of-silent-fallbacks`가 판정합니다.
로딩 분기를 고치면서 `??`나 `||`도 함께 손대면 두 규칙이 같이 걸립니다.

**Incorrect (Suspense 질의 화면에서 초기 로딩을 다시 분기):**

```tsx
if (responseUserGetItemSuspense.isPending) {
  return <Spinner />;
}

return <UserName value={responseUserGetItemSuspense.data.name} />;
```

**Correct (로딩과 갱신 상태는 보조 UI에만 사용):**

```tsx
return (
  <>
    <UserName value={responseUserGetItemSuspense.data.name} />
    <UiButton disabled={mutationUserSave.isPending}>저장</UiButton>
    {responseUserGetItemSuspense.isFetching ? <RefreshIndicator /> : null}
  </>
);
```

**Correct (가리는 분기가 필요하면 이유를 남김):**

```tsx
// 결제 위젯은 금액 확정 전에 그리면 외부 SDK 가 잘못된 금액으로 초기화된다
if (mutationOrderConfirm.isPending) {
  return <OrderConfirmingScreen />;
}
```

## 6. Events and Interaction Flow

**Impact: MEDIUM-HIGH**

이벤트 핸들러는 이름이 예측 가능하고 추가 인자를 커링으로 넘겨야 하며, 사용자 동작은 이펙트가 아니라 핸들러에서 실행해야 합니다. 핸들러 흐름은 재사용 근거가 생길 때까지 그 자리에 둡니다.

### 6.1 Keep Screen-specific Handler Flow Local Until a Real Utility Emerges

**Rule:** `R24` · `events-keep-handler-flow-inline`

**Applies when:** 화면 전용 이름 붙인 핸들러의 분기·변경 요청·화면 이동·후처리를 여러 보조 함수나 훅으로 나눌 때. 쪼개져 있던 핸들러 흐름을 다시 합칠 때.

**Review with:** `typescript/functions-extract-helpers-only-when-the-boundary-is-real`

**Impact: MEDIUM (모든 분기를 잔 함수로 쪼개지 않고도 읽힙니다)**

여기서 `local`은 JSX 인라인 핸들러가 아니라,
이미 이름 붙은 핸들러 본문 안에서 흐름을 계속 읽을 수 있게 유지한다는 뜻입니다.
핸들러가 길어져도 바로 `function` 폴더나 공용 보조 코드로 쪼개지 않습니다.

- 먼저 이른 반환, 단계적 지역 변수, 의미 있는 블록 구분으로 읽기 쉽게 유지합니다.
- `typescript/functions-extract-helpers-only-when-the-boundary-is-real`를 만족할 때만 분리합니다.
- 화면 하나에서만 쓰는 커스텀 훅으로 우회해 흐름을 숨기는 것도 피합니다.
- 인라인 콜백을 같은 컴포넌트 안의 이름 붙인 핸들러로 옮기기만 하는 변경은 대상이 아닙니다.

**Incorrect (재사용 근거 없이 흐름을 지나치게 분해):**

```ts
const validate = () => {/* ... */};
const buildRequest = () => {/* ... */};
const runMutation = async () => {/* ... */};
const postProcess = () => {/* ... */};
```

**Correct (핸들러에서 흐름을 직접 읽을 수 있게 유지):**

```ts
/**
 * 선택된 entry 저장과 화면 이동 처리
 */
const handleSubmitButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  if (!responseEntryListSuspense.data.selectedEntry) {
    return;
  }

  if (mutationEntrySave.isPending) {
    return;
  }

  await mutationEntrySave.mutateAsync({ data: request });
  void navigate({ to: "/entries" });
};
```

### 6.2 Name Handlers Predictably

**Rule:** `R25` · `events-name-and-curry-handlers`

**Applies when:** 이벤트 핸들러를 새로 만들 때. 핸들러 이름이나 대상, 이벤트 표기를 바꿀 때.

**Review with:** `typescript/naming-use-consistent-file-and-symbol-naming`

**Impact: MEDIUM-HIGH (이벤트 흐름을 이름으로 검색할 수 있습니다)**

이벤트 핸들러는 `handle` 접두사와 역할명을 씁니다.

| 상황 | 이름 |
| --- | --- |
| DOM 이벤트 | `handle + Target + Event` |
| 동작 문맥이 분명할 때 | `handle + DomainAction` |

- `on*`은 프롭 이름입니다. 구현에는 쓰지 않습니다.
  `onClick`을 받아 처리하는 함수는 `handleRowClick`입니다.
- 같은 컴포넌트에 같은 이름의 핸들러를 두지 않습니다. 대상이 다르면 대상 이름을 넣습니다.
- 추가 인자를 어떻게 넘길지는 `events-curry-extra-handler-arguments`가 정합니다.

**Incorrect (`on*` 접두사와 제각각인 이름):**

```ts
const onSelect = (id: string, event: MouseEvent<HTMLLIElement>) => {
  console.log(id, event.currentTarget);
};

const clickHandler2 = (event: MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
};
```

**Correct (`handle` 접두사와 대상·이벤트가 드러나는 이름):**

```ts
import type { MouseEventHandler } from "react";

/**
 * 목록 항목 클릭 시 선택 상태 전환
 */
const handleListItemClick: MouseEventHandler<HTMLLIElement> = (_event) => {
  toggleSelection();
};

/**
 * 저장 버튼 클릭 기본 동작 차단
 */
const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
  event.preventDefault();
};
```

### 6.3 Curry Extra Arguments Into DOM Event Handlers

**Rule:** `R26` · `events-curry-extra-handler-arguments`

**Applies when:** DOM 이벤트 프롭에 추가 인자를 넘기는 핸들러를 추가·변경할 때. 인라인 래퍼로 인자를 넘기던 자리를 바꿀 때. 제외: 이벤트 객체를 받지 않는 프롭 콜백인 경우.

**Requires selected:** `typing-function-type-first` · 함께 적용

**Review with:** `composition-named-handlers-over-inline`

**Impact: MEDIUM-HIGH (JSX 에 즉흥적인 래퍼 화살표가 쌓이지 않습니다)**

`onClick`, `onChange`처럼 이벤트 객체를 받는 자리에 추가 인자가 필요하면
팩토리가 인자를 받고 안쪽 함수가 이벤트를 받습니다.

반환값을 JSX에 그대로 전달합니다.
`onClick={() => handleSelectionToggle(id)}`처럼 감싸는 화살표를 만들지 않습니다.

- 팩토리 반환 타입은 `typing-function-type-first`를 따라 리액트 별칭으로 고정합니다.
- 이벤트 객체를 받지 않는 프롭 콜백은 대상이 아닙니다.
  `(id) => void` 계약이면 이름 붙인 핸들러를 그대로 넘깁니다.
- `useEffectEvent`에는 계약에 없는 DOM 이벤트나 커링을 만들지 않습니다.

**Incorrect (인라인 래퍼로 인자를 넘김):**

```tsx
const handleSelectionToggle = (id: string) => {
  toggleSelection(id);
};

<li onClick={() => handleSelectionToggle(entry.id)} />;
```

**Correct (추가 인자는 바깥 함수, 이벤트는 안쪽 함수):**

```tsx
import type { MouseEventHandler } from "react";

/**
 * 목록 항목 클릭 시 선택된 ID 전달
 */
const handleListItemClick =
  (id: string): MouseEventHandler<HTMLLIElement> =>
  (_event) => {
    toggleSelection(id);
  };
```

```tsx
<li onClick={handleListItemClick(entry.id)} />;
```

### 6.4 Run User Actions in Handlers, Not Effects

**Rule:** `R27` · `events-run-user-actions-in-handlers-not-effects`

**Applies when:** 제출·저장·삭제·닫기 같은 한 번뿐인 사용자 액션을 핸들러와 상태+이펙트 사이에서 옮길 때. 한 번뿐인 사용자 액션의 실행 흐름을 바꿀 때.

**Impact: HIGH (한 번뿐인 동작을 상태와 이펙트 재실행으로 흉내 내지 않습니다)**

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

	void createEntryMutation.mutateAsync(formValues);
}, [createEntryMutation, formValues, shouldSubmit]);

const handleSubmit = () => {
	setShouldSubmit(true);
};
```

**Correct (사용자 액션은 핸들러 안에서 바로 수행):**

```tsx
/**
 * 제출 버튼 클릭 시 생성 요청 실행
 */
const handleSubmit = async () => {
	await createEntryMutation.mutateAsync(formValues);
};
```

## 7. Server Data Flow

**Impact: CRITICAL**

질의와 변경 요청은 오리진을 보존해야 하며, 응답 변형은 `query.select`처럼 소스에 가장 가까운 지점에서 끝내야 합니다. 바인딩 이름도 어떤 API에서 왔는지 드러내야 합니다.

### 7.1 Name Query and Mutation Bindings Consistently

**Rule:** `R28` · `data-name-query-and-mutation-bindings-consistently`

**Applies when:** 리액트 Query 질의·변경 요청 훅의 로컬 바인딩을 추가하거나 이름을 바꿀 때. 역할이 드러나지 않는 별칭이 diff에 보일 때.

**Requires selected:** `docs-require-jsdoc-on-key-declarations`, `typescript/naming-use-consistent-file-and-symbol-naming` · 함께 적용

**Review with:** `data-preserve-origin-chaining`

**Impact: HIGH (생성된 API 훅과 지역 바인딩을 훑고 되짚기 쉬워집니다)**

프로젝트가 이미 채택한 질의/변경 요청 훅 이름은 유지하되, 로컬 바인딩 접두사는 `response`와 `mutation`만 사용합니다.
코드 생성기 여부와 무관하게 질의는 `response...`,
변경 요청은 `mutation...`으로 맞춰야 화면 파일에서 역할과 오리진이 한눈에 보입니다.

**Incorrect (질의와 변경 요청 바인딩 이름이 제각각임):**

```ts
const list = useEntryListSuspense();
const removeApi = useEntryRemove();
```

**Correct (로컬 바인딩 접두사를 통일):**

```ts
/**
 * entry 목록 조회 API
 */
const responseEntryListSuspense = useEntryListSuspense();

/**
 * entry 삭제 API
 */
const mutationEntryRemove = useEntryRemove();
```

### 7.2 Preserve Response and Store Origin in Wide Scopes

**Rule:** `R29` · `data-preserve-origin-chaining`

**Applies when:** page·레이아웃·화면 넓은 스코프에서 응답·변경 요청·스토어를 구조분해할 때. 원본을 별칭으로 끊고 값 접근 방식을 바꿀 때.

**Review with:** `screen-keep-derived-values-close`

**Impact: CRITICAL (파일 전체에서 별칭을 따라가지 않고 값의 출처를 바로 압니다)**

페이지, 레이아웃, 화면 스코프에서는 `response...`, `mutation...`, `*Store` 원본을 유지합니다.
넓은 스코프의 구조분해와 별칭 상수는 값의 출처를 흐립니다.

- 실제로 필요하면 핸들러나 이펙트 내부의 좁은 스코프에서만 제한적으로 구조분해합니다.
- `props`를 본문 첫 줄에서 구조분해하는 패턴만 예외입니다.

**Incorrect (넓은 스코프 구조분해로 출처가 흐려짐):**

```ts
const { entries, selectedEntry } = responseEntryListSuspense.data;
```

**Correct (원본 체이닝으로 출처를 유지):**

```tsx
<UiList dataSource={responseEntryListSuspense.data.entries} />
<UiTable dataSource={responseEntryListSuspense.data.selectedEntry.fields} />
```

```ts
/**
 * 검색 응답이 비어 있을 때만 후속 동기화를 건너뜀
 */
useEffect(() => {
  const { data, isFetching } = responseEntrySearchSuspense;

  if (!isFetching && data.entries.length === 0) {
    return;
  }
}, [responseEntrySearchSuspense]);
```

### 7.3 Shape React Query Data in query.select

**Rule:** `R30` · `data-shape-query-data-with-select`

**Applies when:** 서버 응답의 목록·항목·메타 등을 렌더에서 가공하거나 반복 소비할 때. 리액트 Query `select`의 결과 형태를 추가·변경할 때.

**Requires selected:** `docs-require-jsdoc-on-key-declarations` · 함께 적용

**Review with:** `data-name-query-and-mutation-bindings-consistently`, `data-preserve-origin-chaining`

**Impact: CRITICAL (변환이 통신 경계 한 곳에 모여 화면이 응답 원형을 모릅니다)**

서버 응답 가공은 렌더링 본문이 아니라 `query.select`에서 처리합니다.

- `data.list` 같은 원시 응답 구조를 화면 여러 군데에서 직접 해석하지 않습니다.
  도메인 의미가 드러나는 필드 이름으로 한 번 변환합니다.
- 여러 쿼리 데이터를 함께 가공해야 해도 먼저 `select`나 전용 훅 경계에서 풀 수 있는지 봅니다.

`select` 안 변환 함수는 이 규칙이 담당합니다.
별도 함수나 보조 모듈 경계가 없으면 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`은
적용하지 않습니다.

**Incorrect (응답 원형을 화면에서 직접 소비):**

```ts
const items = responseEntryListSuspense.data.list;
```

**Correct (통신 경계에서 화면이 쓸 모양으로 변환):**

```ts
/**
 * entry 목록 조회 API
 */
const responseEntryListSuspense = useEntryListSuspense({
  query: {
    select: (response) => ({
      items: response.data.list,
    }),
  },
});
```

## 8. State Ownership and Updates

**Impact: HIGH**

상태는 값의 수명과 소유자에 맞는 도구로 고르고, 파생값은 저장하지 않고 렌더에서 계산해야 합니다. 여러 화면이 함께 쓰는 판단만 전역 스토어로 올리고, 이전 상태에 기대는 갱신은 함수형으로 씁니다. 이펙트 콜백은 반응성이 필요한 값만 의존성으로 받아야 합니다.

### 8.1 Calculate Derived Values During Rendering

**Rule:** `R31` · `state-calculate-derived-values-during-render`

**Applies when:** 현재 프롭스·상태·검색·응답에서 계산 가능한 값을 별도 상태와 이펙트로 동기화할 때. 그런 동기화를 제거할 때.

**Requires selected:** `screen-keep-derived-values-close` · 함께 적용

**Impact: HIGH (지금 입력으로 구할 수 있는 값을 상태로 두고 이펙트로 맞추지 않습니다)**

현재 프롭스, 상태, 검색, 응답에서 바로 계산할 수 있는 값은
`useEffect`와 `useState`로 다시 동기화하지 않습니다.
렌더 중에 계산하면 추가 렌더와 어긋남이 줄고, 이펙트 의존성도 억지로 늘어나지 않습니다.

파생값은 렌더 중에 만들고 사용 지점 가까이에 둡니다.
배치 기준은 `screen-keep-derived-values-close`가 함께 정합니다.

**Incorrect (파생값을 이펙트로 다시 상태에 동기화):**

```tsx
const [selectedCount, setSelectedCount] = useState(0);

useEffect(() => {
	setSelectedCount(selectedIds.length);
}, [selectedIds]);
```

**Correct (렌더 중에 바로 계산):**

```tsx
return <SelectedCountBadge count={selectedIds.length} />;
```

### 8.2 Choose State Tools by Source of Truth

**Rule:** `R32` · `state-choose-state-tools-by-source-of-truth`

**Applies when:** 로컬 UI·전역 클라이언트·서버 데이터를 새 상태 도구로 옮길 때. 서로 다른 진짜 출처 사이에 값을 복제하거나 동기화할 때.

**Review with:** `state-store-derived-authority`

**Impact: MEDIUM-HIGH (지역 UI 상태, 전역 상태, 서버 상태가 서로 섞이지 않습니다)**

상태 도구는 값의 수명과 소유자를 기준으로 고릅니다.

| 상태의 소유자 | 기본 도구 |
| --- | --- |
| 로컬 UI | `useState` 또는 `useReducer` |
| 전역 클라이언트 | `Zustand` |
| 서버 | `@tanstack/react-query` |

이 기준으로 고르면 화면 파일이 더 읽기 쉬워지고 중복 동기화가 줄어듭니다.

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

### 8.3 Store Shared Derived Decisions Only When They Are Truly Shared

**Rule:** `R33` · `state-store-derived-authority`

**Applies when:** 여러 화면·메뉴·라우트 가드가 쓰는 접근 권한 같은 파생 판단을 스토어에 저장·동기화할 때. 단일 화면에서만 쓰는 값까지 스토어로 올리려 할 때.

**Review with:** `docs-require-jsdoc-on-key-declarations`

**Impact: HIGH (같은 도메인 판별 로직이 여러 화면에 퍼지지 않습니다)**

여러 화면, 메뉴, 라우트 가드에서 반복해서 필요한 파생 판단만 스토어에 승격합니다.
단일 화면에서 한두 번 읽는 질의 필드까지 스토어로 복제하지 않습니다.

스토어에 올리기로 했다면 문자열 비교나 도메인 판별은 초기화나 레이아웃 같은 한 경계에만 모으고,
화면은 `accessStore.canEditRecord` 같은 결과만 참조합니다.
Suspense 질의처럼 `onSuccess`가 없어서 동기화가 필요하다면 소유자가 분명한 경계에서만 `useEffect` 또는
`useLayoutEffect`를 사용하고, 선택자 최적화는 실제로 필요할 때만 쓰고 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 근거를 남깁니다.

**Incorrect (화면마다 판별을 반복하면서 단일 화면용 값을 스토어에도 복제):**

```ts
const accessStore = useAccessStore();
const canEditRecord = responseRecordGetItemSuspense.data.ownerId === currentUserId;

useEffect(() => {
  accessStore.setCanEditRecord(canEditRecord);
}, [accessStore, canEditRecord]);
```

**Correct (공용 파생 판단은 소유자가 분명한 경계에서만 적재하고 화면은 결과만 참조):**

```ts
const accessStore = useAccessStore();

if (accessStore.canEditRecord) {
  // ...
}
```

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

**Rule:** `R34` · `state-use-functional-setstate-updates`

**Applies when:** 다음 상태가 현재 상태에 의존하는 갱신을 추가·변경할 때. 핸들러·비동기 콜백·연속 호출에서 `setState` 방식을 바꿀 때.

**Impact: MEDIUM-HIGH (다음 값이 현재 상태에 달려 있을 때 낡은 값을 붙잡는 버그를 막습니다)**

다음 상태가 현재 상태 값에 의존하면 직접 바깥 변수를 참조하지 말고 함수형 갱신자를 사용합니다.
특히 핸들러, 비동기 콜백, 여러 번 연속 호출될 수 있는 갱신에서는 낡은 값 붙잡기를 막는 데 중요합니다.

**Incorrect (현재 상태를 바깥 클로저에서 직접 읽음):**

```tsx
const handleToggleUser = (userId: string) => {
	if (selectedUserIds.includes(userId)) {
		setSelectedUserIds(selectedUserIds.filter((currentUserId) => currentUserId !== userId));
		return;
	}

	setSelectedUserIds([...selectedUserIds, userId]);
};
```

**Correct (함수형 갱신자로 항상 최신 상태를 기준으로 갱신):**

```tsx
/**
 * 사용자 선택 목록 토글 처리
 */
const handleToggleUser = (userId: string) => {
	setSelectedUserIds((currentUserIds) => {
		if (currentUserIds.includes(userId)) {
			return currentUserIds.filter((currentUserId) => currentUserId !== userId);
		}

		return [...currentUserIds, userId];
	});
};
```

### 8.5 Use useEffectEvent for Non-reactive Effect Callbacks

**Rule:** `R35` · `state-use-effectevent-for-non-reactive-effect-callbacks`

**Applies when:** 구독 이펙트가 최신 프롭·상태 콜백을 읽어야 할 때. ref 동기화 우회, 의존성 재설치, `useEffectEvent`를 추가·변경할 때.

**Requires selected:** `docs-require-jsdoc-on-key-declarations` · 함께 적용

**Review with:** `events-run-user-actions-in-handlers-not-effects`

**Impact: MEDIUM-HIGH (핸들러 로직은 최신으로 읽고 이펙트는 실제 구독에만 반응합니다)**

이펙트 안에서 최신 프롭이나 상태를 읽어야 하지만 그 값 변화가 구독 재설치를
일으키면 안 되는 경우, `ref` 우회 대신 `useEffectEvent`를 씁니다.

이벤트 핸들러를 이펙트로 옮기라는 뜻이 아닙니다.
실제 구독·연결 이펙트 안에서만 쓰고, 클릭·제출 같은 사용자 액션은 이름 붙인 핸들러에 둡니다.

`useEffectEvent`는 리액트 19.2 이상에만 있습니다. 그보다 낮으면 이 규칙을 적용하지 않습니다.

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

## 9. Render Performance

**Impact: MEDIUM-HIGH**

메모이제이션은 확인한 이유가 있을 때만 손댑니다. 실제로 무거운 초기화와 갱신만 게으른 초기화 함수, 전환, 지연 값으로 미룹니다.

### 9.1 Do Not Memoize Without a Confirmed Reason

**Rule:** `R36` · `perf-avoid-defensive-memoization`

**Applies when:** `useMemo`·`useCallback`을 추가하거나 제거할 때. 참조 동일성·실측 병목·무거운 지연 계산을 이유로 수동 메모이제이션을 검토할 때.

**Review with:** `perf-use-usedeferredvalue-for-heavy-derived-renders`

**Impact: MEDIUM-HIGH (효과를 확인하지 않은 방어적 `useMemo`, `useCallback` 을 막습니다)**

`useMemo`와 `useCallback`은 기본적으로 쓰지 않습니다.
쓰는 경우는 다음 넷뿐이며, 어느 경우든 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`를 따라 이유를 남깁니다.

- 외부 라이브러리가 참조 동일성에 민감할 때
- 병목이 실제로 측정됐을 때
- `useDeferredValue` 기준으로 무거운 파생 계산을 늦출 때
- 리액트 컴파일러를 아직 켜지 않아 프로젝트가 수동 메모이제이션을 표준으로 쓸 때

마지막 경우에도 규칙은 같습니다. 감으로 붙이지 않고 무거운 계산인지 먼저 확인합니다.
리액트 컴파일러가 켜져 있으면 처음 셋 말고는 손대지 않습니다.

**Incorrect (단순 가공을 관성적으로 메모이제이션):**

```ts
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);
```

**Correct (외부 패키지 제약을 가리키는 근거를 적고 사용):**

```ts
// ag-grid 는 columnDefs 참조가 바뀌면 컬럼 폭·정렬 상태를 초기화한다. 참조를 고정해야 한다.
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);
```

### 9.2 Use Lazy State Initializers for Expensive Defaults

**Rule:** `R37` · `perf-use-lazy-state-initializers-for-expensive-defaults`

**Applies when:** `useState` 초기값에 localStorage 파싱, 인덱스 생성, 큰 배열 정규화 같은 비용 있는 계산을 넣을 때.

**Impact: MEDIUM (초기 상태 계산이 무거울 때 준비 작업이 렌더마다 되풀이되지 않습니다)**

`useState` 초기값이 `localStorage` 파싱, 인덱스 생성,
큰 배열 정규화처럼 무거운 계산이라면 값을 바로 넣지 말고 초기화 함수로 감쌉니다.
숫자나 문자열 같은 값, 프롭을 그대로 넘기는 경우까지 감쌀 필요는 없습니다.

**Incorrect (비싼 초기화가 렌더마다 다시 평가됨):**

```tsx
const [searchIndex] = useState(buildSearchIndex(entryList));
const [draftFilter] = useState(JSON.parse(localStorage.getItem("entry-filter") ?? "{}"));
```

**Correct (비싼 초기화는 최초 렌더에서만 수행):**

```tsx
const [searchIndex] = useState(() => buildSearchIndex(entryList));
const [draftFilter] = useState(() => {
	const storedValue = localStorage.getItem("entry-filter");
	return storedValue ? JSON.parse(storedValue) : {};
});
```

### 9.3 Use startTransition for Non-urgent Visual Updates

**Rule:** `R38` · `perf-use-starttransition-for-non-urgent-updates`

**Applies when:** 클릭·선택·필터 변경 뒤 큰 목록·표·트리를 다시 그리는 상태 갱신을 다룰 때. 상태 갱신의 우선순위나 전환 처리를 바꿀 때.

**Impact: MEDIUM (상태 변경이 무거운 목록이나 표를 건드릴 때도 반응이 유지됩니다)**

클릭이나 선택 이후 무거운 목록, 표, 트리 렌더가 따라오는 비긴급 시각 업데이트는 `startTransition`으로 감쌉니다.
입력값 자체, 폼 에러, 즉시 비활성화 같은 급한 반응까지 전환에 넣지는 않습니다.

갈림길은 `set` 함수를 내가 갖고 있는지입니다.
내가 부르는 `setState`가 무거운 렌더를 일으키면 이 규칙으로 그 호출을 감쌉니다.
`set` 함수가 내 것이 아니거나 비용이 파생 렌더 쪽에 있으면
`perf-use-usedeferredvalue-for-heavy-derived-renders`를 씁니다.

**Incorrect (급하지 않은 갱신을 급한 갱신으로 처리):**

```tsx
const handleStatusFilterChange = (nextStatus: EntryStatusFilter) => {
	setStatusFilter(nextStatus);
};
```

**Correct (비긴급 시각 업데이트는 전환으로 내림):**

```tsx
/**
 * 상태 필터 변경으로 인한 무거운 목록 갱신을 transition으로 예약
 */
const handleStatusFilterChange = (nextStatus: EntryStatusFilter) => {
	startTransition(() => {
		setStatusFilter(nextStatus);
	});
};
```

### 9.4 Use useDeferredValue for Heavy Derived Renders

**Rule:** `R39` · `perf-use-usedeferredvalue-for-heavy-derived-renders`

**Applies when:** 검색어·필터·정렬 입력마다 큰 목록이나 표를 다시 계산해 입력 반응이 늦어질 때. `useDeferredValue` 기반 계산을 추가·변경할 때.

**Review with:** `perf-avoid-defensive-memoization`, `perf-use-starttransition-for-non-urgent-updates`

**Impact: MEDIUM (무거운 화면이 따라오는 동안에도 입력과 작은 조작이 반응합니다)**

검색어, 필터, 정렬 입력이 무거운 파생 렌더를 유발하면 원본 입력값을 그대로 무거운 화면에 연결하지 않습니다.
`useDeferredValue`로 한 박자 늦춘 값을 만들고, 필요하면 그 값을 기준으로 필터링이나 정렬을 계산합니다.

- 작은 배열이나 단순 문자열 가공까지 습관적으로 지연하지 않습니다.
- 이 경우의 `useMemo`는 `perf-avoid-defensive-memoization`의 예외적 허용 사례입니다.
  지연 값 기준 재계산 비용이 실제로 크고,
  렌더마다 같은 작업을 반복하지 않으려는 목적이 분명할 때만 함께 씁니다.

내가 부르는 `setState`가 원인이면 이 규칙이 아니라
`perf-use-starttransition-for-non-urgent-updates`로 그 호출을 감쌉니다.
입력은 즉시 반응해야 하고 비용이 그 값에서 파생되는 렌더에 있을 때 이 규칙을 씁니다.

**Incorrect (입력과 무거운 파생 렌더를 같은 값에 묶음):**

```tsx
const [keyword, setKeyword] = useState("");
const filteredRows = rows.filter((row) => fuzzyMatchRow(row, keyword));
```

**Correct (입력은 급한 갱신으로, 무거운 파생 렌더는 지연 값과 제한적인 메모이제이션으로 계산):**

```tsx
const [keyword, setKeyword] = useState("");
const deferredKeyword = useDeferredValue(keyword);

// 지연한 검색어에만 다시 계산하도록 묶는다. 행이 수천 개라 매 렌더 필터링은 측정에서 병목이었다.
const filteredRows = useMemo(() => {
	return rows.filter((row) => fuzzyMatchRow(row, deferredKeyword));
}, [deferredKeyword, rows]);
```

## 10. Documentation and Comments

**Impact: MEDIUM**

리액트 경계 선언에는 동반 스킬인 `convention-typescript`의 문서 주석 표준을 적용합니다. 어느 선언에 붙일지와 합성 부품 설명을 어디 두는지를 따로 정합니다.

### 10.1 Require Doc Comments on React Hooks, Handlers, and Key Declarations

**Rule:** `R40` · `docs-require-jsdoc-on-key-declarations`

**Applies when:** 질의·변경 요청이나 비자명한 핸들러/이펙트를 추가·변경할 때. 내보낸 보조 함수·훅·스토어 선언을 추가·변경할 때. 다시 내보내기 포함 공개 타입·인터페이스나 합성 공개 부품을 추가·변경할 때.

**Requires selected:** `typescript/docs-require-header-jsdoc-on-key-declarations` · 함께 적용

**Impact: MEDIUM-HIGH (중요한 API, 핸들러, 이펙트, 타입 선언을 검토하고 다시 쓰기 쉬워집니다)**

문서 주석은 경계를 설명할 때만 붙입니다. 자명한 지역 변수에는 강제하지 않습니다.

`type`과 `interface` 문서화는 `typescript/types-document-custom-types-and-shapes`가 정합니다.
내보냈는지와 무관하게 그 규칙을 따르고, 여기서 다시 판정하지 않습니다.

필수 대상:

- 라우트·화면·레이아웃 소유자의 질의와 변경 요청 바인딩
- 분기, 비동기, 화면 이동, 무효화를 가진 이벤트 핸들러
- 정리 함수가 있거나 의존성이 둘 이상인 `useEffect`
- 내보낸 순수 보조 함수, 커스텀 훅, 스토어 선언
- 합성 컴포넌트의 공개 부품
- 예외적으로 남긴 `useMemo`/`useCallback`

합성 공개 부품의 설명을 어디 두는지는
`docs-document-compound-parts-above-props-interface`가 정합니다.

형식과 태그 기준은 `typescript/docs-require-header-jsdoc-on-key-declarations`가 정합니다.
여러 줄 블록으로 쓰고 역할 태그는 붙이지 않습니다.

**Incorrect (비자명한 경계 선언에 문맥 설명이 없음):**

```ts
const handleRemoveEntryButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	if (!selectedEntry) {
		return;
	}

	await mutationEntryRemove.mutateAsync({ params: { entryId } });
};

useEffect(() => {
	resetForm(userData);
}, [userData, resetForm]);
```

**Correct (비자명한 선언 의도를 바로 위에 여러 줄 블록으로 문서화):**

```ts
/**
 * entry 삭제 API
 */
const mutationEntryRemove = useEntryRemove();

/**
 * 선택된 entry 삭제와 다음 화면 이동 처리
 */
const handleRemoveEntryButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
	if (!selectedEntry) {
		return;
	}

	await mutationEntryRemove.mutateAsync({ params: { entryId } });
};

/**
 * 사용자 데이터 변경 시 폼 상태 동기화
 */
useEffect(() => {
	resetForm(userData);
}, [userData, resetForm]);

/**
 * entry 저장 요청 payload 생성
 */
export const buildEntryPayload = (formValues: EntryFormValues) => {
	return {
		title: formValues.title.trim(),
	};
};
```

**Correct (합성 공개 부품은 프롭스 `interface` 위에 설명을 두고 컴포넌트를 바로 아래에 둠):**

```tsx
/**
 * dialog 제목과 닫기 버튼을 담는 header part
 */
export interface DialogHeaderProps {
	children: ReactNode;
}

const DialogHeader = (props: DialogHeaderProps) => {
	const { children } = props;
	return <header className="wg_dialog__header">{children}</header>;
};
```

### 10.2 Document Compound Parts Above the Props Interface

**Rule:** `R41` · `docs-document-compound-parts-above-props-interface`

**Applies when:** 합성 컴포넌트의 공개 부품이나 그 프롭스 타입을 추가·변경할 때. 부품 설명의 위치를 바꿀 때.

**Review with:** `composition-declare-props-interface-above-the-component`, `docs-require-jsdoc-on-key-declarations`

**Impact: MEDIUM (부품을 열면 계약과 설명이 붙어 있어 한 번에 읽힙니다)**

합성 공개 부품은 설명, 프롭스 `interface`, 컴포넌트 선언을 이 순서로 붙여 둡니다.

1. 부품이 무엇인지 설명하는 문서 주석
2. 프롭스 `interface`
3. 컴포넌트 선언

단순 내부 래퍼에는 부품 문서를 만들지 않습니다.
공개하지 않는 것은 `strategy-expose-only-assembled-compound-parts`가 정합니다.

**Incorrect (설명이 컴포넌트에 붙어 계약과 떨어짐):**

```tsx
export interface UiPanelHeaderProps {
	children: ReactNode;
}

/**
 * 패널 머리말 부품
 */
export const UiPanelHeader = (props: UiPanelHeaderProps) => {
	const { children } = props;
	return <header className="ui_panel__header">{children}</header>;
};
```

**Correct (설명 · 계약 · 선언을 붙여 둠):**

```tsx
/**
 * 패널 머리말 부품
 *
 * 제목과 우측 동작 영역을 소비자가 직접 조립한다.
 */
export interface UiPanelHeaderProps {
	children: ReactNode;
}

export const UiPanelHeader = (props: UiPanelHeaderProps) => {
	const { children } = props;
	return <header className="ui_panel__header">{children}</header>;
};
```

## 참고 자료

- https://react.dev
- https://tanstack.com/query/latest
- https://zustand.docs.pmnd.rs

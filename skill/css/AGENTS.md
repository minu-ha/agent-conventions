# CSS 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.extends`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=css`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 CSS 코딩 컨벤션입니다. 이 가이드는 plain CSS를 기본으로 한 전역 고유 네이밍, 예측 가능한 TSX class 조합, 평평한 selector, wrapper 기준 서드파티 스타일링, 토큰화된 값, 절제된 stylesheet 구성을 강조합니다. `rules/` 아래 rule 파일이 source of truth이며, 최종적으로 에이전트가 읽는 `AGENTS.md`로 compile됩니다.

---

## 목차

1. [Naming and Ownership](#1-naming-and-ownership) — **CRITICAL**
    - 1.1 [Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules](#11-default-to-plain-css-unless-the-project-explicitly-standardizes-on-css-modules)
    - 1.2 [Keep Each scope slug Unique Per Owner](#12-keep-each-scope-slug-unique-per-owner)
    - 1.3 [Name Elements and Modifiers by Role](#13-name-elements-and-modifiers-by-role)
    - 1.4 [Preserve Route Slug Traceability](#14-preserve-route-slug-traceability)
    - 1.5 [Separate Local and Route Style Scopes](#15-separate-local-and-route-style-scopes)
    - 1.6 [Use Scope, Slug, Element, and Modifier Syntax](#16-use-scope-slug-element-and-modifier-syntax)
2. [Class Composition and Wrapper Boundaries](#2-class-composition-and-wrapper-boundaries) — **HIGH**
    - 2.1 [Compose Classes With clsx()](#21-compose-classes-with-clsx)
    - 2.2 [Do Not Use Modifiers for One-off Structural Patches](#22-do-not-use-modifiers-for-one-off-structural-patches)
    - 2.3 [Keep Classes Single-purpose](#23-keep-classes-single-purpose)
    - 2.4 [Prefer Ui* Wrapper Prop Types](#24-prefer-ui-wrapper-prop-types)
    - 2.5 [Prefer Owned Wrappers for Ui* Component Styling](#25-prefer-owned-wrappers-for-ui-component-styling)
3. [Selectors and Nesting Boundaries](#3-selectors-and-nesting-boundaries) — **CRITICAL**
    - 3.1 [Avoid Deep Descendant Selector Dependencies](#31-avoid-deep-descendant-selector-dependencies)
    - 3.2 [Keep Project-owned Selectors Flat](#32-keep-project-owned-selectors-flat)
    - 3.3 [Target Third-party DOM Only From Owned Roots](#33-target-third-party-dom-only-from-owned-roots)
    - 3.4 [Use Pseudo-classes for DOM-owned States](#34-use-pseudo-classes-for-dom-owned-states)
4. [Values, Layout, and Interaction States](#4-values-layout-and-interaction-states) — **HIGH**
    - 4.1 [Keep Layout Intent Explicit](#41-keep-layout-intent-explicit)
    - 4.2 [Provide CSS Variable Fallbacks When Token Presence Is Not Guaranteed](#42-provide-css-variable-fallbacks-when-token-presence-is-not-guaranteed)
    - 4.3 [Separate Domain State Modifiers From DOM Interaction States](#43-separate-domain-state-modifiers-from-dom-interaction-states)
    - 4.4 [Tokenize Repeated Visual Values](#44-tokenize-repeated-visual-values)
5. [File Organization and Guardrails](#5-file-organization-and-guardrails) — **MEDIUM**
    - 5.1 [Keep Style Files Owned by One Component or Route](#51-keep-style-files-owned-by-one-component-or-route)
    - 5.2 [Review Banned CSS Patterns Before Finishing](#52-review-banned-css-patterns-before-finishing)

---

## 1. Naming and Ownership

**Impact: CRITICAL**

클래스 문법, slug 추적성, 네임스페이스 소유권, local-vs-route scope가 명확해야 스타일을 검색하고 안전하게 수정할 수 있습니다.

### 1.1 Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules

**Impact: HIGH (keeps the global `scope_slug` naming system meaningful instead of hiding ownership behind local module indirection)**

이 CSS skill은 기본적으로 plain `*.css`와 전역 고유 클래스명을 전제로 합니다. `rt_*`, `ui_*`, `wg_*`, `loc_*` 네임스페이스는 global class space에서 owner를 추적하려고 존재하므로, 프로젝트에 별도 합의가 없다면 `.module.css`와 `styles.foo`를 기본 선택으로 삼지 않습니다. 프로젝트가 이미 CSS Modules를 공식 표준으로 채택했고 그에 맞는 naming/runtime 규칙이 따로 있다면, 그 프로젝트 로컬 규칙이 이 기본값보다 우선합니다.

**Incorrect (프로젝트 표준이 없는데도 CSS Modules를 기본처럼 사용):**

```tsx
import styles from "./mission-control.module.css";

<div className={styles.rt_star_wars_mission_control__hero}>
	<span className={styles.rt_star_wars_mission_control__eyebrow}>
		GraphQL operations deck
	</span>
</div>
```

```css
.rt_star_wars_mission_control__hero {
	display: grid;
}

.rt_star_wars_mission_control__eyebrow {
	letter-spacing: 0.08em;
}
```

**Correct (기본은 plain CSS와 전역 고유 클래스명을 사용):**

```tsx
import { clsx } from "clsx";
import "./mission-control.css";

<div className={clsx("rt_mc__hero")}>
	<span className={clsx("rt_mc__eyebrow")}>GraphQL operations deck</span>
</div>
```

```css
.rt_mc__hero {
	display: grid;
}

.rt_mc__eyebrow {
	letter-spacing: 0.08em;
}
```

### 1.2 Keep Each scope slug Unique Per Owner

**Impact: CRITICAL (prevents unrelated routes or components from sharing the same namespace and colliding in the global class space)**

클래스명은 프로젝트 전역에서 고유해야 하며, 동일한 `scope_slug` 조합은 단일 소유자만 사용할 수 있습니다. 새 스타일을 추가할 때는 먼저 기존 `scope_slug` 충돌 여부를 확인하고, 의미가 겹치더라도 파일이 다르면 별도 slug를 부여합니다.

**Incorrect (이미 다른 소유자가 쓰는 `scope_slug`를 재사용):**

```txt
// route A
rt_pctbi__header

// route B
rt_pctbi__toolbar
```

**Correct (소유자가 다르면 별도 slug를 부여):**

```txt
// content-type-builder.index
rt_pctbi__header

// members-group-role.index
rt_mgri__header
```

### 1.3 Name Elements and Modifiers by Role

**Impact: HIGH (avoids vague or layout-only names that stop classes from describing what the UI part actually is)**

`element`와 `modifier` 이름은 구조나 치수가 아니라 UI 역할을 표현해야 합니다. `container`, `wrapper`, `box` 같은 포괄 단어 단독 사용이나 `gap12` 같은 숫자 기반 의미는 피하고, 실제 역할과 상태를 드러내는 이름을 씁니다.

**Incorrect (역할 대신 구조나 치수에 기대는 이름):**

```txt
ui_card__wrapper
ui_card__box
ui_card__body--gap12
rt_pcmei__section--compactTop
```

**Correct (역할과 상태를 기준으로 이름을 붙임):**

```txt
ui_card__toolbar
ui_card__body
ui_card__body--active
rt_pcmei__detailSection
```

### 1.4 Preserve Route Slug Traceability

**Impact: HIGH (keeps route-scoped class namespaces readable back to the route hierarchy they belong to)**

라우트 slug는 길이보다 추적 가능성을 우선하고, 상위에서 하위로 이어지는 라우트 트리 순서를 반영해 축약합니다. route 이름을 전부 다 적을 필요는 없고 `mission-control -> mc`, `project.content-type-builder.index -> pctbi`처럼 팀이 owner를 다시 찾을 수 있을 정도로만 줄이면 됩니다. 너무 짧아 의미가 완전히 사라지거나, 계층 순서가 뒤섞이면 클래스명만 봐서는 어느 route 소유인지 추적하기 어려워집니다.

**Incorrect (의미가 약하거나 계층 순서가 흐려진 slug):**

```txt
rt_builder__panel
rt_ctp__panel
rt_ibpct__panel
```

**Correct (도메인 의미와 계층 순서가 보존된 slug):**

```txt
mission-control -> rt_mc
project.content-type-builder -> rt_pctb
project.content-type-builder.index -> rt_pctbi
rt_mc__hero
rt_pctbi__panel
```

### 1.5 Separate Local and Route Style Scopes

**Impact: HIGH (keeps route-shared styles and `-local` component styles from mixing into the same namespace or file)**

`-local` 폴더 컴포넌트의 스타일은 반드시 같은 `-local` 계층의 전용 `*.css` 파일에 작성하고, 클래스는 `loc_` 스코프를 사용합니다. 반대로 route 공용 스타일은 route 소유 CSS 파일에서 `rt_*` 스코프를 사용하며, 두 범위를 한 파일에 섞지 않습니다.

**Incorrect (route 공용 CSS와 local 전용 CSS를 섞음):**

```txt
entries.css
  rt_entries__list
  loc_modalEntryColumnForm__root
```

**Correct (route와 local 스타일의 파일/스코프를 분리):**

```txt
entries.css
  rt_entries__list

-local/modal-entry-column-form.css
  loc_mecf__root
```

### 1.6 Use Scope, Slug, Element, and Modifier Syntax

**Impact: CRITICAL (makes class ownership and UI role traceable from the classname alone)**

클래스명은 `<scope>_<slug>__<element>[--<modifier>]` 문법을 사용합니다. `scope`는 소유 범위, `slug`는 소유자 축약, `element`는 역할, `modifier`는 상태나 변형을 나타내며, 각 구분자는 `_`, `__`, `--`를 일관되게 유지합니다. `scope`와 `slug`는 소문자 축약을 유지하고, `element`와 `modifier`는 `listButton`, `detailExpanded`, `submitButton`, `emptyState`처럼 camelCase로 작성합니다. element/modifier 내부에서 `list-button`, `list_button`처럼 추가 구분자를 다시 도입하지 않습니다.

**Incorrect (구분자 의미가 섞이거나 element/modifier casing이 흔들림):**

```txt
ui_button_container
rt_pctbi_item_active
wgtable-row-selected
rt_pctbi__list-button
rt_pctbi__listButton--detail_expanded
```

**Correct (scope/slug는 소문자 축약, element/modifier는 camelCase로 표기):**

```txt
ui_button__root
rt_pctbi__item--active
wg_table__row--selected
rt_pctbi__listButton
rt_pctbi__listButton--detailExpanded
```

## 2. Class Composition and Wrapper Boundaries

**Impact: HIGH**

TSX class 조합과 wrapper 소유권 규칙은 스타일링 경계를 분명하게 유지하고, UI wrapper가 통제되지 않은 스타일 hook을 노출하는 것을 막습니다.

### 2.1 Compose Classes With clsx()

**Impact: HIGH (keeps TSX class composition readable when base classes and state modifiers need to be combined)**

TSX에서 `className`은 `clsx()` 사용을 기본으로 합니다. 기본 element 클래스 하나만 넣는 경우도 같은 기준을 유지하고, 상태 modifier나 optional class가 붙어도 읽기 쉽게 확장합니다. 문자열 연결이나 중복 ternary로 `className`을 조립하지 않습니다.

**Incorrect (문자열 연결로 클래스 조합을 숨김):**

```tsx
<button className={"rt_pctbi__listButton " + (isActive ? "rt_pctbi__listButton--active" : "")}>
	저장
</button>
```

**Correct (기본 클래스와 modifier를 `clsx()`로 조합):**

```tsx
<button
	className={clsx(
		"rt_pctbi__listButton",
		isActive && "rt_pctbi__listButton--active",
	)}
>
	저장
</button>
```

### 2.2 Do Not Use Modifiers for One-off Structural Patches

**Impact: HIGH (keeps modifiers reserved for state instead of turning them into a second layout naming system)**

modifier는 `active`, `hidden`, `disabled`, `selected`, `error` 같은 상태값에 우선 사용합니다. spacing patch, 방향 보정, 특정 화면에서만 필요한 구조 차이를 덧붙이는 용도로 modifier를 늘리지 않습니다.   
다만 `dense`, `horizontal`, `compact`처럼 컴포넌트 API로 반복해서 쓰이는 명시적 variant라면 modifier를 허용할 수 있습니다. 이런 경우에도 one-off layout fix가 아니라 재사용 가능한 variant라는 근거가 있어야 합니다. guardrail에서 금지하는 대상도 "상태 의미가 아닌 modifier 전체"가 아니라 이런 one-off structural modifier입니다.

**Incorrect (특정 화면용 구조 patch를 modifier로 덧붙임):**

```tsx
<div className={clsx("rt_pcmei__section", "rt_pcmei__section--compactTop")} />
```

**Correct (one-off patch는 별도 element로 풀고, 반복되는 variant만 제한적으로 허용):**

```tsx
<div className={clsx("rt_pcmei__detailSection")} />
```

```tsx
<div className={clsx("ui_table__root", isDense && "ui_table__root--dense")} />
```

### 2.3 Keep Classes Single-purpose

**Impact: HIGH (stops one class from carrying both base styling and multiple state or structural meanings at once)**

하나의 클래스는 하나의 시각적 책임만 가져야 합니다. 상태나 변형이 필요하면 modifier를 별도로 두고, 기본 클래스에 모든 의미를 몰아넣지 않습니다.

**Incorrect (상태 의미를 별도 클래스 역할처럼 합쳐 버림):**

```tsx
<div className={clsx("rt_pctbi__listButtonActive")} />
```

**Correct (기본 클래스와 상태 modifier를 분리):**

```tsx
<div className={clsx("rt_pctbi__listButton", isActive && "rt_pctbi__listButton--active")} />
```

### 2.4 Prefer Ui* Wrapper Prop Types

**Impact: MEDIUM-HIGH (preserves wrapper-level styling and API contracts instead of leaking raw library prop types into usage sites)**

`Ui*` 래퍼 컴포넌트를 사용할 때는 라이브러리 원본 Props 타입이 아니라 래퍼가 노출한 `Ui*Props` 타입을 우선 사용합니다. 그래야 wrapper가 의도적으로 제한하거나 보강한 스타일링 계약과 API 경계를 유지할 수 있습니다.

**Incorrect (라이브러리 원본 Props 타입을 직접 참조):**

```tsx
import UiCollapse, {type AntDesignCollapseProps} from "<project-alias>/components/ui/collapse/ui-collapse.tsx";

const items: NonNullable<AntDesignCollapseProps["items"]> = [];
```

**Correct (wrapper가 노출한 Props 타입을 사용):**

```tsx
import UiCollapse, {type UiCollapseProps} from "<project-alias>/components/ui/collapse/ui-collapse.tsx";

const items: NonNullable<UiCollapseProps["items"]> = [];
```

### 2.5 Prefer Owned Wrappers for Ui* Component Styling

**Impact: HIGH (prevents shared UI wrappers from exposing uncontrolled styling hooks through ad-hoc className injection)**

`Ui*` 컴포넌트(`UiCollapse`, `UiAvatar`, `UiButton` 등)의 내부 DOM을 꾸미기 위한 ad-hoc `className` 주입은 기본적으로 피합니다. 스타일링이 필요하면 화면이나 local 래퍼 클래스를 두고, 그 래퍼 아래에서만 서드파티 라이브러리 내부 DOM을 제한적으로 타겟팅합니다.   
다만 wrapper가 root `className`이나 slot prop을 공식 styling contract로 노출했다면, 레이아웃 참여나 spacing 같은 root-level 스타일에는 그 contract를 그대로 사용할 수 있습니다.

**Incorrect (내부 DOM을 만지기 위해 `Ui*`에 ad-hoc className을 주입):**

```tsx
<UiCollapse className={clsx("rt_srol__collapse")} />
```

**Correct (내부 DOM 스타일링은 소유 래퍼 아래로 제한하고, 공식 root contract는 예외적으로 허용):**

```tsx
<div className={clsx("rt_srol__collapse")}>
	<UiCollapse />
</div>
```

```css
.rt_srol__collapse {
	& .ant-collapse-item {
		border-radius: var(--cms-border-radius, 10px);
	}
}
```

```tsx
// UiButton이 root className contract를 공식적으로 노출하는 경우에만 허용
<UiButton className={clsx("rt_srol__submitButton")} />
```

## 3. Selectors and Nesting Boundaries

**Impact: CRITICAL**

프로젝트 소유 selector를 평평하게 유지하고 서드파티 DOM 타게팅 범위를 좁게 제한해야 cascade surprise를 줄이고 selector 깊이를 예측 가능하게 유지할 수 있습니다.

### 3.1 Avoid Deep Descendant Selector Dependencies

**Impact: HIGH (keeps layout changes from breaking styling through long descendant chains)**

깊은 후손 선택자 체인에 스타일을 걸지 않습니다. 이 규칙은 nested 문법 사용 여부와 무관하게, selector가 DOM 구조에 과도하게 묶이는 것을 금지합니다. project-owned 스타일은 클래스 자체가 계약이 되어야 하며, `.a .b .c .d` 같은 의존성은 DOM 구조가 조금만 바뀌어도 쉽게 깨집니다. owned root 아래의 third-party DOM path는 `selector-target-third-party-dom-from-owned-roots`가 다루는 예외이며, 그 경우에도 shortest viable chain만 허용합니다.

**Incorrect (깊은 후손 선택자 체인에 의존):**

```css
.rt_pctbi__layout .rt_pctbi__panel .rt_pctbi__detail .rt_pctbi__item {
	padding: 8px;
}
```

**Correct (대상 element 클래스나 직접 owner root 계약에 스타일을 둠):**

```css
.rt_pctbi__item {
	padding: 8px;
}

.rt_pctbi__detailHeader {
	gap: var(--cms-spacing-2, 8px);
}
```

### 3.2 Keep Project-owned Selectors Flat

**Impact: CRITICAL (reduces cascade coupling by keeping project-owned selectors independent instead of descendant-driven)**

프로젝트가 직접 소유한 선택자는 플랫 구조를 기본으로 작성합니다. 전처리기 중첩 문법은 project-owned 클래스끼리 부모-자식 관계를 표현하는 데 쓰지 말고, 각 element 클래스가 독립적으로 읽히도록 유지합니다. 이 규칙은 project-owned 클래스 선언 자체의 구조를 다루며, 서드파티 DOM anchor 규칙은 별도로 `selector-target-third-party-dom-from-owned-roots`에서 다룹니다.

**Incorrect (project-owned 클래스 구조를 중첩 selector로 표현):**

```css
.rt_pctbi__layout {
	& .rt_pctbi__panel {
		& .rt_pctbi__item {
			padding: 8px;
		}
	}
}
```

**Correct (플랫한 클래스 단위로 선언):**

```css
.rt_pctbi__layout {
	display: grid;
}

.rt_pctbi__panel {
	border: 1px solid var(--cms-color-border, #d9d9d9);
}

.rt_pctbi__item {
	padding: 8px;
}
```

### 3.3 Target Third-party DOM Only From Owned Roots

**Impact: CRITICAL (limits third-party styling to explicit wrapper ownership instead of leaking across the app)**

서드파티 라이브러리 내부 DOM 클래스(`.ant-*`, `.rc-*`, `.tippy-*`)는 반드시 프로젝트가 소유한 루트 클래스 블록 아래에서만 타겟팅합니다. 핵심은 selector가 항상 owned root block에서 시작되어야 한다는 점입니다.

루트 없는 단독 타겟팅과 project-owned 클래스끼리의 깊은 descendant coupling은 피합니다. third-party DOM을 잡을 때도 `.rt_* .ant-*` 같은 one-line selector로 owned root를 체이닝하지 말고, 항상 owned root block을 연 뒤 그 안에서 `& .ant-*`처럼 nested로 표현합니다. 더 깊은 third-party DOM 경로가 꼭 필요하면 owned root block 아래에서 shortest viable chain만 한 번에 적고, 이 예외는 third-party DOM 경로에만 적용합니다. nested 안에서 다시 nested block을 열어 의미를 흐리는 방식은 여전히 금지합니다.

**Incorrect (루트 없이 타겟팅하거나 nested 안에서 다시 nested를 열어 의미를 흐림):**

```css
.ant-tree-node-content-wrapper {
	border-radius: 4px;
}

.rt_pcmei__treeBox .ant-tree-title {
	color: #999;
}

.rt_pcmei__treeBox {
	& .ant-tree-node-content-wrapper {
		& .ant-tree-iconEle {
			display: inline-flex;
		}
	}
}
```

**Correct (항상 owned root block을 열고, 그 안에서 third-party DOM path를 nested로 적음):**

```css
.rt_pcmei__treeBox {
	& .ant-tree-node-content-wrapper {
		display: inline-flex;
	}
}

.rt_pctb__lnbTop {
	& > .ant-btn-icon {
		color: var(--cms-color-text-tertiary, rgba(0, 0, 0, 0.45));
	}
}

.rt_pcmei__treeBox {
	& .ant-tree-title {
		color: #999;
	}

	& .ant-tree-node-content-wrapper .ant-tree-iconEle .ant-tree-title {
		color: #999;
	}
}
```

### 3.4 Use Pseudo-classes for DOM-owned States

**Impact: HIGH (keeps browser-owned interaction states separate from app-owned state modifiers)**

`:hover`, `:focus`, `:focus-visible`, `:disabled`, `:checked`처럼 브라우저와 DOM이 직접 부여하는 상태는 같은 클래스 블록 내부 nested pseudo-class로 표현합니다. 반대로 `selected`, `active`, `error`처럼 화면이나 도메인이 결정하는 상태는 modifier 클래스로 유지합니다.

**Incorrect (도메인 상태를 pseudo-class처럼 표현):**

```css
.rt_pmli__assetCard {
	&:selected {
		border-color: var(--cms-color-primary, #1677ff);
	}
}
```

**Correct (DOM 상태는 pseudo-class, 화면 상태는 modifier로 분리):**

```css
.rt_pmli__assetCardButton {
	cursor: default;

	&:disabled {
		opacity: 1;
	}

	&:hover:not(:disabled) {
		cursor: pointer;
	}
}

.rt_pmli__assetCard--selected {
	border-color: var(--cms-color-primary, #1677ff);
}
```

## 4. Values, Layout, and Interaction States

**Impact: HIGH**

토큰, 변수 fallback, 명시적인 레이아웃 의도, 앱 상태와 DOM 상태의 분리는 스타일을 더 견고하고 접근 가능하게 유지합니다.

### 4.1 Keep Layout Intent Explicit

**Impact: MEDIUM-HIGH (makes sticky, fixed, and box responsibilities understandable without reverse-engineering the DOM)**

레이아웃 의도는 클래스명과 선언에서 즉시 확인 가능해야 합니다. `position`, `width`, `height` 강제는 최소화하고 부모와 자식의 레이아웃 책임을 분리하며, `sticky`나 `fixed`를 쓸 때는 기준 컨테이너와 `z-index` 의도를 주석으로 남깁니다.

**Incorrect (레이아웃 강제가 많고 기준 설명이 없음):**

```css
.rt_dashboard__toolbar {
	position: sticky;
	top: 0;
	z-index: 9999;
	width: 100%;
	height: 48px;
}
```

**Correct (기준 컨테이너와 의도를 드러냄):**

```css
.rt_dashboard__toolbar {
	/* sticky toolbar pinned inside the scrollable content pane */
	position: sticky;
	top: 0;
	z-index: var(--cms-z-index-toolbar, 10);
}

.rt_dashboard__content {
	display: grid;
	min-height: 0;
}
```

### 4.2 Provide CSS Variable Fallbacks When Token Presence Is Not Guaranteed

**Impact: HIGH (prevents missing tokens from degrading styles unpredictably when variables are absent)**

CSS 변수 `var(--*)`를 사용할 때는 토큰 존재가 보장되지 않는 경계에서 fallback 값을 함께 지정합니다. theme provider, 서드파티 wrapper, 선택적 토큰, 임시 overlay처럼 변수가 빠질 수 있는 surface에서는 안전한 기본값을 둬야 합니다.   
반대로 프로젝트 전역에서 반드시 주입되는 core design token이라면, 누락을 빨리 드러내기 위해 fallback을 생략할 수도 있습니다.

**Incorrect (존재 보장이 없는 토큰을 fallback 없이 사용):**

```css
.rt_pcmei__detailPanel {
	border: 1px solid var(--cms-color-border);
	background: var(--cms-color-bg-base);
}
```

**Correct (불안정한 경계에는 fallback을 두고, 보장된 core token은 의도적으로 fail-loud 할 수 있음):**

```css
.rt_pcmei__detailPanel {
	border: 1px solid var(--cms-color-border, #d9d9d9);
	border-radius: var(--cms-border-radius, 4px);
	background-color: var(--cms-color-bg-base, #fff);
}

.rt_srol__collapse {
	& .ant-collapse-item {
		border-radius: var(--cms-border-radius, 10px);
		background: var(--cms-color-bg-base, #fff);
	}
}

.ui_theme__root {
	color: var(--cms-color-text-primary);
}
```

### 4.3 Separate Domain State Modifiers From DOM Interaction States

**Impact: HIGH (keeps app state, focus visibility, and hover behavior readable and accessible without mixing their responsibilities)**

화면 상태나 도메인 상태는 `--active`, `--selected`, `--error` 같은 modifier로 표현하고, 브라우저 상호작용 상태는 같은 클래스 블록 내부 nested `&:hover`, `&:focus-visible`, `&:disabled` 같은 pseudo-class로 표현합니다. 포커스 링 제거는 금지하며, 대체 포커스 스타일을 반드시 제공합니다.

**Incorrect (포커스 스타일을 제거하거나 상태 경계를 섞음):**

```css
.ui_button__root {
	&:focus {
		outline: none;
	}
}

.ui_button__root--hover {
	background: var(--cms-color-primary, #1677ff);
}
```

**Correct (도메인 상태와 상호작용 상태를 분리하고 포커스를 보존):**

```css
.ui_button__root--active {
	background: var(--cms-color-primary, #1677ff);
}

.ui_button__root {
	&:focus-visible {
		outline: 2px solid var(--cms-color-primary, #1677ff);
		outline-offset: 2px;
	}

	&:hover:not(:disabled) {
		cursor: pointer;
	}
}
```

### 4.4 Tokenize Repeated Visual Values

**Impact: HIGH (keeps repeated colors, spacing, and radius values aligned with shared design tokens instead of drifting into magic numbers)**

색상, 간격, 타이포, 그림자 같은 반복 가능한 시각 값은 CSS 변수와 디자인 토큰을 우선 사용합니다. 같은 값이 2회 이상 반복되면 하드코딩을 늘리기 전에 토큰화 여부를 먼저 검토합니다.

**Incorrect (반복 가능한 값을 그대로 하드코딩):**

```css
.ui_table__toolbar {
	gap: 12px;
}

.ui_table__row {
	background: #f5f5f5;
	border-radius: 4px;
}
```

**Correct (토큰과 변수를 우선 사용):**

```css
.ui_table__toolbar {
	gap: var(--cms-spacing-3, 12px);
}

.ui_table__row--selected {
	background: var(--cms-color-fill-secondary, #f5f5f5);
	border-radius: var(--cms-border-radius, 4px);
}
```

## 5. File Organization and Guardrails

**Impact: MEDIUM**

stylesheet는 하나의 owner에 맞춰 유지하고, 가벼운 구조 주석만 사용하며, 마무리 전에 금지 패턴을 점검해야 합니다.

### 5.1 Keep Style Files Owned by One Component or Route

**Impact: MEDIUM (keeps stylesheets aligned to a single owner so comments, ordering, and scope remain understandable)**

스타일 파일은 하나의 컴포넌트나 route 책임 범위를 기본 단위로 유지합니다. 가장 중요한 기준은 한 파일 안의 클래스들이 하나의 owner를 설명하느냐입니다.   
파일이 길어질 경우 가벼운 섹션 주석이나 선언 순서 규약을 보조적으로 둘 수 있지만, 이 규칙의 핵심은 주석 스타일이 아니라 ownership을 섞지 않는 것입니다.

**Incorrect (여러 소유자의 스타일이 한 파일에 섞이고 구조 주석이 없음):**

```css
/* entries.css */
.rt_entries__list {
	display: grid;
}

.loc_mecf__root {
	display: flex;
}

.ui_button__root {
	inline-size: 100%;
}
```

**Correct (한 파일당 한 소유자 범위를 유지하고 필요시 섹션 주석을 둠):**

```css
/* entries.css */
/* layout */
.rt_entries__layout {
	display: grid;
}

/* visual */
.rt_entries__panel {
	background: var(--cms-color-bg-base, #fff);
}

/* state */
.rt_entries__panel--active {
	border-color: var(--cms-color-primary, #1677ff);
}
```

### 5.2 Review Banned CSS Patterns Before Finishing

**Impact: MEDIUM (catches unsafe selector, modifier, and library-targeting shortcuts before they become part of the shared style system)**

작업을 마치기 전에 금지 패턴을 다시 확인합니다. 요소 선택자 중심 스타일링, 깊은 project-owned 후손 체인, 재사용 근거 없는 구조 modifier, 루트 없는 라이브러리 클래스 타겟팅, `!important` 남용 같은 지름길은 빠르게 작성되더라도 장기적으로 구조를 깨뜨립니다. 반복되는 명시적 variant modifier나 owned root 아래의 최소한의 third-party selector chain은 별도 규칙이 허용하는 범위에서 예외가 될 수 있습니다.

**Incorrect (금지 패턴을 그대로 남김):**

```css
div {
	padding: 8px !important;
}

.scope_slug__section--leftPanel {
	width: 280px;
}

.ant-tree-node-content-wrapper {
	border-radius: 4px;
}
```

**Correct (소유 클래스와 허용된 구조/상태 표현으로 정리):**

```css
.rt_pctbi__item {
	padding: 8px;
}

.rt_pctbi__sidePanel {
	width: 280px;
}

.rt_pctbi__treeBox {
	& .ant-tree-node-content-wrapper {
		border-radius: var(--cms-border-radius, 4px);
	}
}
```

## 참고 자료

- https://developer.mozilla.org/en-US/docs/Web/CSS
- https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
- https://github.com/lukeed/clsx

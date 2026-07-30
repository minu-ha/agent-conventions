# CSS 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.companions`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=css`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 CSS 코딩 컨벤션입니다. plain CSS를 기본으로 한 전역 고유 네이밍, `rt_/wg_/ui_/loc_` owner scope, 예측 가능한 TSX class 조합, 평평한 selector, wrapper 기준 서드파티 스타일링, 토큰화된 값, 절제된 stylesheet 구성을 강조합니다. TSX의 class contract를 함께 바꿀 때는 React와 TypeScript 규칙도 함께 봅니다. `rules/` 아래 rule 파일이 source of truth입니다.

이 문서에는 CSS 컨벤션 규칙만 담겨 있습니다. 아래 규칙도 함께 따릅니다.

---

## 함께 따르는 규칙

- [TypeScript Convention](../typescript/HANDBOOK.md) — 다음 조건에서 함께 적용합니다. TS/TSX class contract, wrapper Props 또는 style import를 함께 변경한다.

---

## 목차

1. [Naming and Ownership](#1-naming-and-ownership) — **CRITICAL**
    - 1.1 [Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules](#11-default-to-plain-css-unless-the-project-explicitly-standardizes-on-css-modules)
    - 1.2 [Keep Each `scope_slug` Unique Per Owner](#12-keep-each-scope-slug-unique-per-owner)
    - 1.3 [Name Elements and Modifiers by Role](#13-name-elements-and-modifiers-by-role)
    - 1.4 [Preserve Route Slug Traceability](#14-preserve-route-slug-traceability)
    - 1.5 [Separate Route, Local, and Shared Style Scopes](#15-separate-route-local-and-shared-style-scopes)
    - 1.6 [Use Scope, Slug, Element, and Modifier Syntax](#16-use-scope-slug-element-and-modifier-syntax)
2. [Class Composition and Wrapper Boundaries](#2-class-composition-and-wrapper-boundaries) — **HIGH**
    - 2.1 [Compose Classes With `clsx()`](#21-compose-classes-with-clsx)
    - 2.2 [Do Not Use Modifiers for One-off Structural Patches](#22-do-not-use-modifiers-for-one-off-structural-patches)
    - 2.3 [Keep Classes Single-purpose](#23-keep-classes-single-purpose)
    - 2.4 [Prefer `Ui*` Wrapper Prop Types](#24-prefer-ui-wrapper-prop-types)
    - 2.5 [Prefer Owned Wrappers for `Ui*` Component Styling](#25-prefer-owned-wrappers-for-ui-component-styling)
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
    - 5.1 [Keep Style Files Owned by One Component or Route Surface](#51-keep-style-files-owned-by-one-component-or-route-surface)
    - 5.2 [Review Banned CSS Patterns Before Finishing](#52-review-banned-css-patterns-before-finishing)

---

## 1. Naming and Ownership

**Impact: CRITICAL**

클래스 문법, `rt_/wg_/ui_/loc_` scope별 slug 규칙, 네임스페이스 소유권, route/local/shared owner 범위가 명확해야 스타일을 검색하고 안전하게 수정할 수 있습니다.

### 1.1 Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules

**Rule:** `C01` · `naming-default-to-plain-css-when-no-module-convention`

**Applies when:** 프로젝트 표준 미확정 상태에서 새 stylesheet 접근 형식\(plain CSS·CSS Modules\)을 선택하거나 `.module.css`·`styles.*`로 전환한다. 기존 plain CSS class rename은 제외한다.

**Impact: HIGH (소유를 local module 간접층에 숨기지 않고 전역 scope_slug 이름 체계가 의미를 유지하게 함)**

이 CSS skill은 기본적으로 plain `*.css`와 전역 고유 클래스명을 전제로 합니다.
`rt_*`, `ui_*`, `wg_*`, `loc_*` 네임스페이스는 global class space에서 owner를 추적하려고 존재하므로,
프로젝트에 별도 합의가 없다면 `.module.css`와 `styles.foo`를 기본 선택으로 삼지 않습니다.
프로젝트가 이미 CSS Modules를 공식 표준으로 채택했고 그에 맞는 naming/runtime 규칙이 따로 있다면,
그 프로젝트 로컬 규칙이 이 기본값보다 우선합니다.

이 규칙은 stylesheet 접근 형식을 새로 결정하거나 전환할 때 선택합니다.
이미 plain CSS를 직접 import하는 owner 안에서 기존 plain CSS class·selector 이름이나 base/modifier 구조만 바꾸는 작업은
접근 형식을 결정하지 않으므로 N/A입니다.

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
import "./_index.css";

<section className={clsx("rt_catalogIndex__hero")}>
	<span className={clsx("rt_catalogIndex__eyebrow")}>Catalog</span>
</section>
```

```css
.rt_catalogIndex__hero {
	display: grid;
}

.rt_catalogIndex__eyebrow {
	letter-spacing: 0.08em;
}
```

### 1.2 Keep Each `scope_slug` Unique Per Owner

**Rule:** `C02` · `naming-keep-scope-slug-unique-per-owner`

**Applies when:** 새 `scope_slug` namespace를 추가·복사·이름 변경하거나 서로 다른 owner의 class가 같은 namespace를 사용할 가능성이 있다.

**Impact: CRITICAL (관련 없는 route나 컴포넌트가 같은 namespace를 공유해 전역 class 공간에서 충돌하는 것을 막음)**

클래스명은 프로젝트 전역에서 고유해야 하며, 동일한 `scope_slug` 조합은 단일 소유자만 사용할 수 있습니다.
새 스타일을 추가할 때는 먼저 기존 `scope_slug` 충돌 여부를 확인하고,
의미가 겹치더라도 파일이 다르면 별도 slug를 부여합니다.

**Incorrect (이미 다른 소유자가 쓰는 `scope_slug`를 재사용):**

```txt
// catalog/index route
rt_catalogIndex__header

// dashboard/index route
rt_catalogIndex__toolbar
```

**Correct (소유자가 다르면 별도 slug를 부여):**

```txt
// catalog/index route
rt_catalogIndex__header

// dashboard/index route
rt_dashboardIndex__header
```

### 1.3 Name Elements and Modifiers by Role

**Rule:** `C03` · `naming-name-elements-and-modifiers-by-role`

**Applies when:** element 또는 modifier class를 새로 짓거나 `container`, `wrapper`, `box`, 치수·간격 중심 이름을 변경한다.

**Impact: HIGH (class가 UI 부위를 설명하지 못하게 만드는 모호하거나 레이아웃 중심인 이름을 피함)**

`element`와 `modifier` 이름은 구조나 치수가 아니라 UI 역할을 표현해야 합니다.
`container`, `wrapper`, `box` 같은 포괄 단어 단독 사용이나 `gap12` 같은 숫자 기반 의미는 피하고,
실제 역할과 상태를 드러내는 이름을 씁니다.

**Incorrect (역할 대신 구조나 치수에 기대는 이름):**

```txt
ui_card__wrapper
ui_card__box
ui_card__body--gap12
rt_catalogDetail__section--compactTop
```

**Correct (역할과 상태를 기준으로 이름을 붙임):**

```txt
ui_card__toolbar
ui_card__body
ui_card__body--active
rt_catalogDetail__detailSection
```

### 1.4 Preserve Route Slug Traceability

**Rule:** `C04` · `naming-preserve-route-slug-traceability`

**Applies when:** route/framework 규칙이 `rt_*` owner를 선택한 화면에서 route class slug를 새로 만들거나 이름을 변경한다.

**Impact: HIGH (route 범위 class namespace를 소속 route 계층으로 거슬러 읽을 수 있게 유지함)**

활성화된 route/framework skill이 `rt_*` owner를 선택했다면,
CSS는 그 owner slug를 route까지 다시 추적할 수 있게 유지합니다.
CSS skill은 어떤 파일이 route-owned인지 결정하지 않고,
이미 선택된 route owner가 클래스명에서 흐려지지 않게 지키는 역할을 합니다.

기본 판단:

- `rt_*` slug는 짧음보다 추적 가능성을 우선합니다.
- 전체 folder path를 모두 쓰지는 않아도, route family와 screen role은 읽혀야 합니다.
- 팀이 공유하는 route map이 없는 opaque acronym은 피합니다.
- `wg_*`, `ui_*`, `loc_*`는 각 owner scope의 naming style을 따릅니다.
- document, local helper, reusable widget의 owner 판단은 companion framework skill의 소유권 규칙을 우선합니다.

**Incorrect (의미가 약하거나 계층 순서가 흐려진 slug):**

```txt
rt_shell__body
rt_pageChrome__main
rt_doc__content
rt_x__root
```

**Correct (도메인 의미와 계층 순서가 보존된 slug):**

```txt
posts index route -> rt_postsIndex
posts detail route -> rt_postsDetail
document shell -> rt_document
rt_postsIndex__root
rt_postsDetail__body
rt_document__body
```

### 1.5 Separate Route, Local, and Shared Style Scopes

**Rule:** `C05` · `naming-separate-local-and-route-style-scopes`

**Applies when:** 스타일 owner를 route screen/support, document, 독립 leaf helper, reusable widget, UI primitive 중에서 결정하거나 서로 다른 owner를 이동·분리한다.

**Review with:** `organization-keep-style-files-owned-by-one-component-or-route`

**Impact: HIGH (route 소유 페이지 스타일·공용 컴포넌트 스타일·순수 local 헬퍼 스타일이 같은 namespace나 파일에 섞이는 것을 막음)**

route/framework skill이 route-owned surface로 판단한 스타일은 `rt_*` scope를 유지합니다.
route screen의 흐름을 구성하거나 지원하는 route support surface는 파일이 `_local/` 같은 helper folder로 내려가도
`rt_*`입니다.
route 맥락을 몰라도 되는 독립 leaf helper만 `loc_*`를 사용합니다.
파일 위치만으로 main screen 또는 route support surface를 `loc_*`로 바꾸지 않습니다.

scope 기준:

- `rt_*`: route-owned screen, route support surface, route/document owner
- `loc_*`: route 맥락과 독립된 leaf helper
- `wg_*`: 여러 route에서 재사용되는 block
- `ui_*`: primitive component

서로 다른 owner 범위는 한 파일에 섞지 않습니다.
어떤 markup이 route-owned인지 판단하는 책임은 활성화된 framework convention이 가집니다.

**Incorrect (route surface, local helper, shared component owner를 한 파일/네임스페이스에 섞음):**

```txt
entries/_index.css
  rt_entriesIndex__root
  loc_filterDialog__root
  rt_document__content
  ui_button__root
```

**Correct (route owner, document owner, local helper owner를 분리):**

```txt
entries/_index.css
  rt_entriesIndex__root
  rt_entriesIndex__list
  rt_entriesIndex__empty

pages/_document.css
  rt_document__body
  rt_document__content

entries/_local/filter-dialog.css
  loc_filterDialog__root
```

### 1.6 Use Scope, Slug, Element, and Modifier Syntax

**Rule:** `C06` · `naming-use-scope-slug-element-modifier-syntax`

**Applies when:** plain CSS의 project-owned class를 새로 만들거나 이름, scope, slug, element, modifier 구분자 또는 casing을 변경한다.

**Impact: CRITICAL (classname만 보고도 class 소유와 UI 역할을 추적할 수 있게 함)**

클래스명은 `<scope>_<slug>__<element>[--<modifier>]` 문법을 사용합니다.
구분자는 `_`, `__`, `--`를 고정하고, 각 부분의 책임을 섞지 않습니다.

구성 요소:

- `scope`: `rt`, `wg`, `ui`, `loc` 같은 lowercase owner namespace
- `slug`: owner 식별자. casing은 해당 scope의 house style을 따름
- `element`: owner 안의 UI 역할. `listButton`, `emptyState`처럼 camelCase
- `modifier`: 상태나 반복 variant. `routeActive`, `selected`처럼 camelCase

중요한 것은 모든 scope에 같은 slug casing을 강제하는 것이 아니라,
같은 owner 안에서 표기가 흔들리지 않게 유지하는 것입니다.

**Incorrect (scope별 slug 규칙을 섞거나 element/modifier casing이 흔들림):**

```txt
ui_tag_list__root
rt_catalog_page__root
rt_catalogDetail__main-content
wg_site_header__brandLink
rt_document__main-content
rt_document__main--route_active
```

**Correct (scope는 lowercase, slug는 scope별 house style, element/modifier는 camelCase):**

```txt
ui_tagList__root
rt_catalogIndex__root
rt_catalogDetail__mainContent
wg_siteHeader__brandLink
rt_document__main
rt_document__main--routeActive
```

## 2. Class Composition and Wrapper Boundaries

**Impact: HIGH**

TSX class 조합과 wrapper 소유권 규칙은 스타일링 경계를 분명하게 유지하고, UI wrapper가 통제되지 않은 스타일 hook을 노출하는 것을 막습니다.

### 2.1 Compose Classes With `clsx()`

**Rule:** `C07` · `composition-compose-classes-with-clsx`

**Applies when:** TSX의 `className`을 추가·수정하거나 base class, modifier, optional class를 조합한다.

**Impact: HIGH (base class와 상태 modifier를 조합할 때 TSX class 조립을 읽을 수 있게 유지함)**

TSX에서 `className`은 `clsx()` 사용을 기본으로 합니다.
기본 element 클래스 하나만 넣는 경우도 같은 기준을 유지하고,
상태 modifier나 optional class가 붙어도 읽기 쉽게 확장합니다.
문자열 연결이나 중복 ternary로 `className`을 조립하지 않습니다.

**Incorrect (문자열 연결로 클래스 조합을 숨김):**

```tsx
<button className={"rt_catalogIndex__listButton " + (isActive ? "rt_catalogIndex__listButton--active" : "")}>
	저장
</button>
```

**Correct (기본 클래스와 modifier를 `clsx()`로 조합):**

```tsx
<button
	className={clsx(
		"rt_catalogIndex__listButton",
		isActive && "rt_catalogIndex__listButton--active",
	)}
>
	저장
</button>
```

### 2.2 Do Not Use Modifiers for One-off Structural Patches

**Rule:** `C08` · `composition-do-not-build-structural-variants-with-modifiers`

**Applies when:** modifier를 추가·변경하거나 반복 가능한 state·API variant와 one-off structural patch 사이를 판정한다. 허용된 state로 결론 나도 변경된 modifier 분류는 Selected다.

**Review with:** `naming-name-elements-and-modifiers-by-role`

**Impact: HIGH (modifier를 두 번째 레이아웃 이름 체계로 만들지 않고 상태 표현에만 남겨둠)**

modifier는 상태나 반복 variant를 표현할 때만 사용합니다.

금지:

- spacing patch
- 방향 보정
- 특정 화면 하나에서만 필요한 구조 차이

허용:

- `active`, `hidden`, `disabled`, `selected`, `error` 같은 상태
- `dense`, `horizontal`, `compact`처럼 component API로 반복 노출되는 variant

금지 대상은 "상태 의미가 아닌 모든 modifier"가 아니라, 재사용 contract 없이 생긴 one-off structural modifier입니다.

이 규칙의 Selected는 modifier가 금지됐다는 뜻이 아니라 변경된 modifier의 계약을 분류했다는 뜻입니다.
`active`·`selected` 같은 허용된 domain state로 결론 나면 `Selected + pass`이며,
위반이 없다는 이유로 N/A로 돌리지 않습니다.

**Incorrect (특정 화면용 구조 patch를 modifier로 덧붙임):**

```tsx
<div className={clsx("rt_catalogDetail__section", "rt_catalogDetail__section--compactTop")} />
```

**Correct (one-off patch는 별도 element로 풀고, 반복되는 variant만 제한적으로 허용):**

```tsx
<div className={clsx("rt_catalogDetail__detailSection")} />
```

```tsx
<div className={clsx("ui_table__root", isDense && "ui_table__root--dense")} />
```

### 2.3 Keep Classes Single-purpose

**Rule:** `C09` · `composition-keep-classes-single-purpose`

**Applies when:** 기존 class가 base와 state·variant 책임을 함께 갖거나 독립 시각 책임을 추가·재사용·분리한다. 기존 결합 책임을 분리하지 않고 처음부터 새 single-purpose pair를 만들거나 책임 보존 rename만 하면 제외한다.

**Impact: HIGH (class 하나가 base 스타일과 여러 상태·구조 의미를 동시에 지는 것을 막음)**

하나의 클래스는 하나의 시각적 책임만 가져야 합니다.
기존 클래스가 base와 state·variant 책임을 함께 가질 때 분리하고,
한 클래스를 독립된 여러 시각 책임에 재사용하지 않습니다.
처음부터 single-purpose base와 modifier를 별도로 만드는 작업은 결합 책임을 해소하는 변경이 없으므로 이 규칙을 선택하지
않습니다.
스타일 책임을 보존한 owner prefix 수정, single-purpose rename,
one-off modifier를 역할명 class로 바꾸기만 하는 경우도 대상이 아닙니다.

**Incorrect (상태 의미를 별도 클래스 역할처럼 합쳐 버림):**

```tsx
<div className={clsx("rt_catalogIndex__listButtonActive")} />
```

**Correct (기본 클래스와 상태 modifier를 분리):**

```tsx
<div className={clsx("rt_catalogIndex__listButton", isActive && "rt_catalogIndex__listButton--active")} />
```

### 2.4 Prefer `Ui*` Wrapper Prop Types

**Rule:** `C10` · `composition-prefer-ui-wrapper-prop-types`

**Applies when:** `Ui*` wrapper 사용처나 wrapper API에서 Props 타입을 선언·추론·재사용하고 라이브러리 원본 Props 참조를 검토한다.

**Requires selected:** `typescript/types-reuse-existing-contracts-before-new-types` · 함께 적용

**Impact: MEDIUM-HIGH (라이브러리 원본 prop 타입이 사용처로 새지 않게 wrapper 수준의 스타일·API 계약을 지킴)**

`Ui*` 래퍼 컴포넌트를 사용할 때는 라이브러리 원본 Props 타입이 아니라 래퍼가 노출한 `Ui*Props` 타입을 우선 사용합니다.
그래야 wrapper가 의도적으로 제한하거나 보강한 스타일링 계약과 API 경계를 유지할 수 있습니다.

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

### 2.5 Prefer Owned Wrappers for `Ui*` Component Styling

**Rule:** `C11` · `composition-style-ui-components-through-owned-wrappers`

**Applies when:** 실제 `Ui*` React wrapper 사용처·API에서 내부 DOM styling 경계를 정하거나 root `className`·slot prop hook을 주입·노출·사용한다. 기존 CSS owner root 아래 third-party selector만 수정하면 제외한다.

**Review with:** `selector-target-third-party-dom-from-owned-roots`

**Impact: HIGH (공용 UI wrapper가 즉석 className 주입으로 통제 안 되는 스타일 훅을 노출하는 것을 막음)**

이 규칙은 실제 `Ui*` React wrapper 컴포넌트/API 경계에만 적용합니다.
`.ui_*` 같은 기존 CSS owner root 아래에서 third-party selector만 스코프하는 CSS-only 변경은
`selector-target-third-party-dom-from-owned-roots`가 담당합니다.

`Ui*` 컴포넌트(`UiCollapse`, `UiAvatar`,
`UiButton` 등)의 내부 DOM을 꾸미기 위한 ad-hoc `className` 주입은 기본적으로 피합니다.
스타일링이 필요하면 화면이나 local 래퍼 클래스를 두고,
그 래퍼 아래에서만 서드파티 라이브러리 내부 DOM을 제한적으로 타겟팅합니다.
다만 wrapper가 root `className`이나 slot prop을 공식 styling contract로 노출했다면,
레이아웃 참여나 spacing 같은 root-level 스타일에는 그 contract를 그대로 사용할 수 있습니다.

**Incorrect (내부 DOM을 만지기 위해 `Ui*`에 ad-hoc className을 주입):**

```tsx
<UiCollapse className={clsx("loc_postFilterDialog__collapse")} />
```

**Correct (내부 DOM 스타일링은 소유 래퍼 아래로 제한하고, 공식 root contract는 예외적으로 허용):**

```tsx
<div className={clsx("loc_postFilterDialog__collapse")}>
	<UiCollapse />
</div>
```

```css
.loc_postFilterDialog__collapse {
	& .ant-collapse-item {
		border-radius: var(--mk-size-radius-card, 10px);
	}
}
```

```tsx
// UiButton이 root className contract를 공식적으로 노출하는 경우에만 허용
<UiButton className={clsx("loc_postFilterDialog__submitButton")} />
```

## 3. Selectors and Nesting Boundaries

**Impact: CRITICAL**

프로젝트 소유 selector를 평평하게 유지하고, DOM pseudo-state는 같은 block 안에 접고, rich text wrapper 예외와 서드파티 DOM 타게팅 범위를 명시해야 cascade surprise를 줄이고 selector 깊이를 예측 가능하게 유지할 수 있습니다.

### 3.1 Avoid Deep Descendant Selector Dependencies

**Rule:** `C12` · `selector-avoid-deep-descendant-dependencies`

**Applies when:** descendant 또는 child selector chain을 추가·수정하거나 DOM 계층에 의존하는 project-owned·third-party selector를 검토한다.

**Impact: HIGH (레이아웃 변경이 긴 descendant 체인을 통해 스타일을 깨뜨리는 것을 막음)**

깊은 후손 선택자 체인에 스타일을 걸지 않습니다.
이 규칙은 nested 문법 사용 여부와 무관하게, selector가 DOM 구조에 과도하게 묶이는 것을 금지합니다.
project-owned 스타일은 클래스 자체가 계약이 되어야 하며,
`.a .b .c .d` 같은 의존성은 DOM 구조가 조금만 바뀌어도 쉽게 깨집니다.
owned root 아래의 third-party DOM path는 `selector-target-third-party-dom-from-owned-roots`가 다루는 예외이며,
그 경우에도 shortest viable chain만 허용합니다.

깊이는 nested source block 수가 아니라 nesting을 펼친 effective selector의 combinator·ancestor chain으로 계산합니다.
`& .ant-tree .ant-tree-node-content-wrapper`는 한 nested block 안에 있어도 owned root 뒤에 third-party ancestor가
2단계이므로 one-level selector가 아닙니다.

**Incorrect (깊은 후손 선택자 체인에 의존):**

```css
.rt_catalogIndex__layout .rt_catalogIndex__panel .rt_catalogIndex__detail .rt_catalogIndex__item {
	padding: 8px;
}
```

**Correct (대상 element 클래스나 직접 owner root 계약에 스타일을 둠):**

```css
.rt_catalogIndex__item {
	padding: 8px;
}

.rt_catalogIndex__detailHeader {
	gap: var(--app-space-2, 8px);
}
```

### 3.2 Keep Project-owned Selectors Flat

**Rule:** `C13` · `selector-keep-project-selectors-flat`

**Applies when:** project-owned class를 중첩·descendant selector로 연결하거나 raw HTML prose·copy·content wrapper 안 element selector를 추가·수정한다.

**Impact: CRITICAL (프로젝트 소유 셀렉터를 descendant 의존 대신 독립적으로 두어 cascade 결합을 줄임)**

프로젝트가 직접 소유한 선택자는 플랫 구조를 기본으로 작성합니다.

판단 기준:

- 기본값: project-owned class는 각각 top-level block으로 선언합니다.
- 금지: project-owned class끼리 부모-자식 관계를 descendant selector로 표현하지 않습니다.
- 예외: `__prose`, `__copy`, `__content`처럼 raw HTML wrapper가 owner boundary라면 같은 block 안에서 `& h2`, `& p`,
  `& > :first-child`를 허용합니다.
- 별도 규칙: third-party DOM anchor는 `selector-target-third-party-dom-from-owned-roots`를 따릅니다.

rich text 예외는 raw element styling에만 적용됩니다.
`.owner__prose .owner__child`처럼 다른 project-owned class를 다시 체이닝하는 근거로 쓰지 않습니다.

**Incorrect (project-owned 클래스 관계를 descendant selector로 쓰고, wrapper styling을 block 밖으로 흩뿌림):**

```css
.rt_catalogIndex__layout {
	& .rt_catalogIndex__panel {
		padding: 8px;
	}
}

.wg_entryDetail__prose h2 {
	margin: 24px 0 12px;
}

.wg_entryDetail__prose > :first-child {
	margin-top: 0;
}
```

**Correct (project-owned 클래스는 플랫하게 두고, rich text wrapper 예외는 같은 block 안에 국한함):**

```css
.rt_catalogIndex__layout {
	display: grid;
}

.rt_catalogIndex__panel {
	padding: 8px;
}

.wg_entryDetail__prose {
	& h2 {
		margin: 24px 0 12px;
	}

	& > :first-child {
		margin-top: 0;
	}
}
```

### 3.3 Target Third-party DOM Only From Owned Roots

**Rule:** `C14` · `selector-target-third-party-dom-from-owned-roots`

**Applies when:** `.ant-*`, `.rc-*`, `.tippy-*` 등 third-party 내부 DOM selector를 추가·수정하거나 owned wrapper 아래로 범위를 제한한다.

**Requires selected:** `selector-avoid-deep-descendant-dependencies` · 함께 적용

**Impact: CRITICAL (third-party 스타일링을 앱 전체로 새게 하지 않고 명시적 wrapper 소유로 제한함)**

서드파티 라이브러리 내부 DOM 클래스(`.ant-*`, `.rc-*`,
`.tippy-*`)는 프로젝트가 소유한 root block 아래에서만 타겟팅합니다.

판단 기준:

- 항상 owned root class block을 먼저 엽니다.
- root 없는 `.ant-*` 단독 selector는 금지합니다.
- `.rt_* .ant-*` 같은 one-line chaining보다 root block 안의 `& .ant-*`를 사용합니다.
- third-party DOM 경로는 shortest viable chain만 허용합니다.
- owned root가 이미 instance scope를 제공하고 target class가 직접 식별 가능하면
  `.ant-tree` 같은 중간 library root를 반복하지 않습니다.
- 추가 third-party ancestor는 target ambiguity나 direct-child contract처럼 실제로 필요한 evidence가 있을 때만 허용하고
  그 근거를 기록합니다.
- nested block 안에서 다시 nested block을 열지 않습니다.

이 예외는 third-party DOM path에만 적용됩니다. project-owned class끼리의 깊은 descendant coupling은 여전히 금지입니다.

**Incorrect (루트 없이 타겟팅하거나 nested 안에서 다시 nested를 열어 의미를 흐림):**

```css
.ant-tree-node-content-wrapper {
	border-radius: 4px;
}

.rt_treePanel__root .ant-tree-title {
	color: #999;
}

.rt_treePanel__root {
	& .ant-tree .ant-tree-node-content-wrapper {
		display: inline-flex;
	}

	& .ant-tree-node-content-wrapper {
		& .ant-tree-iconEle {
			display: inline-flex;
		}
	}
}
```

**Correct (항상 owned root block을 열고, 그 안에서 third-party DOM path를 nested로 적음):**

```css
.rt_treePanel__root {
	& .ant-tree-node-content-wrapper {
		display: inline-flex;
	}

	& .ant-tree-title {
		color: #999;
	}

	& .ant-tree-switcher {
		color: var(--app-color-text-muted, #777);
	}
}

.rt_treePanel__toolbar {
	& > .ant-btn-icon {
		color: var(--app-color-text-muted, rgba(0, 0, 0, 0.45));
	}
}
```

### 3.4 Use Pseudo-classes for DOM-owned States

**Rule:** `C15` · `selector-use-pseudo-classes-for-dom-owned-states`

**Applies when:** `:hover`, `:visited`, `:focus*`, `:disabled`, `:checked`를 추가·수정하거나 parent DOM state가 child styling에 영향을 준다.

**Requires selected:** `values-separate-domain-state-modifiers-from-dom-interaction-states` · 함께 적용

**Impact: HIGH (브라우저가 소유한 상호작용 상태를 앱이 소유한 상태 modifier와 분리함)**

브라우저와 DOM이 직접 부여하는 상태는 같은 클래스 block 안의 nested `&:`로 표현합니다.
화면이나 도메인이 결정하는 상태는 modifier class로 분리합니다.

base/modifier 분리에서는 domain state와 무관한 hover, focus,
disabled interaction을 unconditional base element block에 둡니다.
interaction selector를 modifier 아래로 옮겨 적용 대상을 좁히지 않습니다.
modifier가 켜진 경우에만 interaction이 달라져야 한다는 별도 제품 요구가 있을 때만 그 예외를 명시합니다.

구분 기준:

- DOM-owned: `:hover`, `:visited`, `:focus`, `:focus-visible`, `:disabled`, `:checked`
- App-owned: `selected`, `active`, `error`, `expanded`, `current`
- DOM state가 child element를 바꿔야 하면 parent block에서 CSS 변수를 바꾸고 child block이 그 값을 읽게 합니다.
- `.foo:hover .foo__icon`처럼 project-owned descendant coupling으로 상태를 전달하지 않습니다.

**Incorrect (pseudo-class를 top-level selector로 다시 열거나, parent state를 child selector coupling으로 표현함):**

```css
.wg_siteHeader__brandLink:hover {
	color: var(--mk-color-link-hover);
}

.wg_siteHeader__brandLink:hover .wg_siteHeader__brandMark {
	transform: rotate(-2deg);
}

.rt_pmli__assetCard {
	&:selected {
		border-color: var(--app-color-accent, #1677ff);
	}
}
```

**Correct (DOM 상태는 같은 block 안 nested `&:`로 두고, 화면 상태는 modifier로 분리):**

```css
.wg_siteHeader__brandLink {
	--wg-site-header-brand-mark-transform: translateY(1px);
	color: var(--mk-color-link);

	&:hover {
		--wg-site-header-brand-mark-transform: translateY(1px) rotate(-2deg);
		color: var(--mk-color-link-hover);
	}
}

.wg_siteHeader__brandMark {
	transform: var(--wg-site-header-brand-mark-transform);
}

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
	border-color: var(--app-color-accent, #1677ff);
}
```

## 4. Values, Layout, and Interaction States

**Impact: HIGH**

토큰, 변수 fallback, 명시적인 레이아웃 의도, 앱 상태와 DOM 상태의 분리는 스타일을 더 견고하고 접근 가능하게 유지합니다.

### 4.1 Keep Layout Intent Explicit

**Rule:** `C16` · `values-keep-layout-intent-explicit`

**Applies when:** `sticky`·`fixed`, `z-index`, 강제 width·height 또는 부모·자식 layout 책임을 추가·변경한다. 같은 element의 base/modifier 분리에서 기존 `display`·spacing 선언을 값 그대로 재배치하면 제외한다.

**Impact: MEDIUM-HIGH (DOM을 역추적하지 않고도 sticky·fixed·박스 책임을 이해할 수 있게 함)**

레이아웃 의도는 클래스명과 선언에서 즉시 확인 가능해야 합니다.
`position`, `width`, `height` 강제는 최소화하고 부모와 자식의 레이아웃 책임을 분리하며,
`sticky`나 `fixed`를 쓸 때는 기준 컨테이너와 `z-index` 의도를 주석으로 남깁니다.
같은 DOM element의 base/modifier 책임을 분리하면서 기존 `display`나 spacing property-value를 값 그대로 재배치하는 작업은
class responsibility 규칙이 소유하며 이 규칙은 N/A입니다.
position, z-index, 강제 geometry 또는 부모·자식 layout 책임이 바뀌면 다시 Selected입니다.

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
	z-index: var(--app-z-index-toolbar, 10);
}

.rt_dashboard__content {
	display: grid;
	min-height: 0;
}
```

### 4.2 Provide CSS Variable Fallbacks When Token Presence Is Not Guaranteed

**Rule:** `C17` · `values-always-provide-css-variable-fallbacks`

**Applies when:** 새·변경된 `var(--*)` 사용이나 token 주입 보장 경계를 바꾼다. 같은 stylesheet·주입 경계에서 기존 `var()` 선언을 selector 사이 byte-equivalent 이동만 하면 제외한다.

**Impact: HIGH (변수가 없을 때 토큰 누락이 스타일을 예측 못 하게 망가뜨리는 것을 막음)**

CSS 변수 `var(--*)`를 사용할 때는 토큰 존재가 보장되지 않는 경계에서 fallback 값을 함께 지정합니다.
theme provider, 서드파티 wrapper, 선택적 토큰,
임시 overlay처럼 변수가 빠질 수 있는 surface에서는 안전한 기본값을 둬야 합니다.
요청이나 기존 token contract에 없는 CSS variable을 이 규칙 때문에 새로 발명하지 않으며,
새 stylesheet나 class를 만든다는 사실만으로 이 규칙을 선택하지 않습니다.
다만 실제 diff에 새 CSS variable 사용이 들어오면, 요청 여부와 무관하게 이 규칙을 다시 선택하고
주입 보장·fallback을 검사합니다.
반대로 프로젝트 전역에서 반드시 주입되는 core design token이라면,
누락을 빨리 드러내기 위해 fallback을 생략할 수도 있습니다.

같은 stylesheet와 같은 token 주입 경계 안에서 기존 `var()` 선언을 base와 modifier 또는 rename 전후 selector 사이로
byte-equivalent 이동만 하는 경우는 N/A입니다.
변수 이름·fallback·주입 owner·사용 횟수·의미 중 하나라도 바뀌면 다시 Selected로 판정합니다.

**Incorrect (존재 보장이 없는 토큰을 fallback 없이 사용):**

```css
.loc_postFilterDialog__panel {
	border: 1px solid var(--mk-color-border-default);
	background: var(--mk-color-bg-surface);
}
```

**Correct (불안정한 경계에는 fallback을 두고, 보장된 core token은 의도적으로 fail-loud 할 수 있음):**

```css
.loc_postFilterDialog__panel {
	border: 1px solid var(--mk-color-border-default, #d9d9d9);
	border-radius: var(--mk-size-radius-card, 4px);
	background-color: var(--mk-color-bg-surface, #fff);
}

.loc_postFilterDialog__collapse {
	& .ant-collapse-item {
		border-radius: var(--mk-size-radius-card, 10px);
		background: var(--mk-color-bg-surface, #fff);
	}
}

.ui_theme__root {
	color: var(--mk-color-text-primary);
}
```

### 4.3 Separate Domain State Modifiers From DOM Interaction States

**Rule:** `C18` · `values-separate-domain-state-modifiers-from-dom-interaction-states`

**Applies when:** app/domain state modifier와 hover·focus·disabled 같은 DOM interaction state를 추가·변경하거나 focus ring에 손댄다.

**Review with:** `composition-do-not-build-structural-variants-with-modifiers`

**Impact: HIGH (앱 상태·포커스 가시성·hover 동작의 책임을 섞지 않고 읽기 쉽고 접근성 있게 유지함)**

화면 상태나 도메인 상태는 `--active`, `--selected`, `--error` 같은 modifier로 표현하고,
브라우저 상호작용 상태는 같은 클래스 블록 내부 nested `&:hover`, `&:focus-visible`,
`&:disabled` 같은 pseudo-class로 표현합니다.
새 modifier를 다루면 실제 domain state인지 one-off structural patch인지 확인하기 위해
`composition-do-not-build-structural-variants-with-modifiers`를 다시 판정합니다.
포커스 링 제거는 금지하며, 대체 포커스 스타일을 반드시 제공합니다.

base/modifier 분리에서는 domain state와 무관한 hover, focus,
disabled interaction을 unconditional base element block에 둡니다.
interaction selector를 modifier 아래로 옮겨 적용 대상을 좁히지 않습니다.
modifier block에는 active·selected·error처럼 app state가 소유하는 presentation만 남깁니다.

**Incorrect (포커스 스타일을 제거하거나 상태 경계를 섞음):**

```css
.ui_button__root {
	&:focus {
		outline: none;
	}
}

.ui_button__root--hover {
	background: var(--app-color-accent, #1677ff);
}
```

**Correct (도메인 상태와 상호작용 상태를 분리하고 포커스를 보존):**

```css
.ui_button__root--active {
	background: var(--app-color-accent, #1677ff);
}

.ui_button__root {
	&:focus-visible {
		outline: 2px solid var(--app-color-accent, #1677ff);
		outline-offset: 2px;
	}

	&:hover:not(:disabled) {
		cursor: pointer;
	}
}
```

### 4.4 Tokenize Repeated Visual Values

**Rule:** `C19` · `values-tokenize-repeated-visual-values`

**Applies when:** 색상·간격·radius·타이포·그림자 등 같은 시각 값이 2회 이상 반복되거나 새 shared visual value를 하드코딩한다.

**Review with:** `values-always-provide-css-variable-fallbacks`

**Impact: HIGH (반복되는 색·간격·radius 값이 매직 넘버로 흐르지 않고 공용 디자인 토큰에 맞게 유지함)**

색상, 간격, 타이포, 그림자 같은 반복 가능한 시각 값은 CSS 변수와 디자인 토큰을 우선 사용합니다.
같은 값이 2회 이상 반복되면 하드코딩을 늘리기 전에 토큰화 여부를 먼저 검토합니다.

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
	gap: var(--app-space-3, 12px);
}

.ui_table__row--selected {
	background: var(--app-color-fill-muted, #f5f5f5);
	border-radius: var(--app-radius-control, 4px);
}
```

## 5. File Organization and Guardrails

**Impact: MEDIUM**

stylesheet는 하나의 owner에 맞춰 유지하고, 가벼운 구조 주석만 사용하며, 마무리 전에 금지 패턴을 점검해야 합니다.

### 5.1 Keep Style Files Owned by One Component or Route Surface

**Rule:** `C20` · `organization-keep-style-files-owned-by-one-component-or-route`

**Applies when:** stylesheet를 새로 만들거나 이동·분할·병합하고 한 파일에 component, route, document, local, shared owner가 섞일 가능성이 있다.

**Impact: MEDIUM (주석·순서·범위를 이해할 수 있도록 stylesheet를 소유자 하나에 맞춤)**

스타일 파일은 하나의 컴포넌트, route surface, 또는 pages-local shell 책임 범위를 기본 단위로 유지합니다.
가장 중요한 기준은 한 파일 안의 클래스들이 하나의 owner를 설명하느냐입니다.
파일이 길어질 경우 가벼운 섹션 주석이나 선언 순서 규약을 보조적으로 둘 수 있지만,
이 규칙의 핵심은 주석 스타일이 아니라 ownership을 섞지 않는 것입니다.

**Incorrect (여러 소유자의 스타일이 한 파일에 섞이고 구조 주석이 없음):**

```css
/* posts.css */
.rt_catalogIndex__root {
	display: grid;
}

.rt_document__content {
	display: flex;
}

.ui_button__root {
	inline-size: 100%;
}
```

**Correct (한 파일당 한 소유자 범위를 유지하고 필요시 섹션 주석을 둠):**

```css
/* posts.css */
/* layout */
.rt_catalogIndex__root {
	display: grid;
}

/* visual */
.rt_catalogIndex__panel {
	background: var(--app-color-bg-surface, #fff);
}

/* state */
.rt_catalogIndex__panel--active {
	border-color: var(--app-color-accent, #1677ff);
}
```

### 5.2 Review Banned CSS Patterns Before Finishing

**Rule:** `C21` · `organization-review-banned-css-patterns-before-finishing`

**Applies when:** CSS 또는 TSX class contract 변경이 완료 단계에 들어간다.

**Required on completion:** 마무리 시 항상 적용

**Impact: MEDIUM (위험한 셀렉터·modifier·라이브러리 타겟팅 지름길이 공용 스타일 체계에 들어가기 전에 잡음)**

작업을 마치기 전에 금지 패턴을 다시 확인합니다.

금지:

- 요소 선택자 중심 스타일링
- 깊은 project-owned descendant chain
- 재사용 근거 없는 structural modifier
- root 없는 library class targeting
- top-level pseudo selector 재오픈
- project-owned parent state descendant coupling
- `!important` 남용

허용 가능한 예외:

- 반복되는 명시적 variant modifier
- owner block 안 rich text wrapper의 nested raw element selector
- owned root 아래의 최소 third-party selector chain

예외는 관련 rule에서 허용한 범위 안에서만 사용합니다.

**Incorrect (금지 패턴을 그대로 남김):**

```css
div {
	padding: 8px !important;
}

.wg_siteHeader__brandLink:hover .wg_siteHeader__brandMark {
	transform: rotate(-2deg);
}

.wg_entryDetail__prose h2 {
	margin: 24px 0 12px;
}

.ant-tree-node-content-wrapper {
	border-radius: 4px;
}
```

**Correct (소유 클래스와 허용된 구조/상태 표현으로 정리):**

```css
.wg_siteHeader__brandLink {
	--wg-site-header-brand-mark-transform: none;

	&:hover {
		--wg-site-header-brand-mark-transform: rotate(-2deg);
	}
}

.wg_siteHeader__brandMark {
	transform: var(--wg-site-header-brand-mark-transform);
}

.wg_entryDetail__prose {
	& h2 {
		margin: 24px 0 12px;
	}
}

.rt_treePanel__root {
	& .ant-tree-node-content-wrapper {
		border-radius: var(--app-radius-control, 4px);
	}
}
```

## 참고 자료

- https://developer.mozilla.org/en-US/docs/Web/CSS
- https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
- https://github.com/lukeed/clsx

# CSS 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.companions`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=css`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 CSS 코딩 컨벤션입니다. plain CSS를 기본으로 한 전역 고유 네이밍, `pg_/wg_/ui_` owner scope, 예측 가능한 TSX class 조합, 평평한 selector, wrapper 기준 서드파티 스타일링, 토큰화된 값, 절제된 stylesheet 구성을 강조합니다. TSX의 class contract를 함께 바꿀 때는 React와 TypeScript 규칙도 함께 봅니다. `rules/` 아래 rule 파일이 source of truth입니다.

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
    - 1.5 [Separate Owner Style Scopes](#15-separate-owner-style-scopes)
    - 1.6 [Use Scope, Slug, Element, and Modifier Syntax](#16-use-scope-slug-element-and-modifier-syntax)
2. [Class Composition and Wrapper Boundaries](#2-class-composition-and-wrapper-boundaries) — **HIGH**
    - 2.1 [Compose Classes With `clsx()`](#21-compose-classes-with-clsx)
    - 2.2 [Do Not Use Modifiers for One-off Structural Patches](#22-do-not-use-modifiers-for-one-off-structural-patches)
    - 2.3 [Keep Classes Single-purpose](#23-keep-classes-single-purpose)
    - 2.4 [Prefer `Ui*` Wrapper Prop Types](#24-prefer-ui-wrapper-prop-types)
    - 2.5 [Prefer Owned Wrappers for `Ui*` Component Styling](#25-prefer-owned-wrappers-for-ui-component-styling)
3. [Selectors and Nesting Boundaries](#3-selectors-and-nesting-boundaries) — **CRITICAL**
    - 3.1 [Avoid Deep Descendant Selector Dependencies](#31-avoid-deep-descendant-selector-dependencies)
    - 3.2 [Limit Nesting Block Depth](#32-limit-nesting-block-depth)
    - 3.3 [Target Third-party DOM Only From Owned Roots](#33-target-third-party-dom-only-from-owned-roots)
    - 3.4 [Use Pseudo-classes for DOM-owned States](#34-use-pseudo-classes-for-dom-owned-states)
4. [Values, Layout, and Interaction States](#4-values-layout-and-interaction-states) — **HIGH**
    - 4.1 [Keep Layout Intent Explicit](#41-keep-layout-intent-explicit)
    - 4.2 [Declare Core Tokens Once and Fall Back Everywhere Else](#42-declare-core-tokens-once-and-fall-back-everywhere-else)
    - 4.3 [Separate Domain State Modifiers From DOM Interaction States](#43-separate-domain-state-modifiers-from-dom-interaction-states)
    - 4.4 [Tokenize Repeated Visual Values](#44-tokenize-repeated-visual-values)
5. [File Organization and Guardrails](#5-file-organization-and-guardrails) — **MEDIUM**
    - 5.1 [Keep Style Files Owned by One Component or Route Surface](#51-keep-style-files-owned-by-one-component-or-route-surface)
    - 5.2 [Review Banned CSS Patterns Before Finishing](#52-review-banned-css-patterns-before-finishing)

---

## 1. Naming and Ownership

**Impact: CRITICAL**

클래스 문법, `pg_/wg_/ui_` scope별 slug 규칙, 네임스페이스 소유권, 화면/공용 owner 범위가 명확해야 스타일을 검색하고 안전하게 수정할 수 있습니다.

### 1.1 Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules

**Rule:** `C01` · `naming-default-to-plain-css-when-no-module-convention`

**Applies when:** 프로젝트 표준 미확정 상태에서 새 stylesheet 접근 형식\(plain CSS·CSS Modules\)을 선택하거나 `.module.css`·`styles.*`로 전환할 때. 제외: 기존 plain CSS class rename만 하는 경우.

**Impact: HIGH (소유를 local module 간접층에 숨기지 않고 전역 scope_slug 이름 체계가 의미를 유지하게 합니다)**

이 CSS skill은 기본적으로 plain `*.css`와 전역 고유 클래스명을 전제로 합니다.
`pg_*`, `wg_*`, `ui_*` 네임스페이스는 global class space에서 owner를 추적하려고 존재하므로,
프로젝트에 별도 합의가 없다면 `.module.css`와 `styles.foo`를 기본 선택으로 삼지 않습니다.
프로젝트가 이미 CSS Modules를 공식 표준으로 채택했고 그에 맞는 naming/runtime 규칙이 따로 있다면,
그 프로젝트 로컬 규칙이 이 기본값보다 우선합니다.

**Incorrect (프로젝트 표준이 없는데도 CSS Modules를 기본처럼 사용):**

```tsx
import styles from "./catalog-index.module.css";

<section className={styles.hero}>
	<span className={styles.eyebrow}>Catalog</span>
</section>
```

```css
.hero {
	display: grid;
}

.eyebrow {
	letter-spacing: 0.08em;
}
```

**Correct (기본은 plain CSS와 전역 고유 클래스명을 사용):**

```tsx
import { clsx } from "clsx";
import "./_index.css";

<section className={clsx("pg_catalogIndex__hero")}>
	<span className={clsx("pg_catalogIndex__eyebrow")}>Catalog</span>
</section>
```

```css
.pg_catalogIndex__hero {
	display: grid;
}

.pg_catalogIndex__eyebrow {
	letter-spacing: 0.08em;
}
```

### 1.2 Keep Each `scope_slug` Unique Per Owner

**Rule:** `C02` · `naming-keep-scope-slug-unique-per-owner`

**Applies when:** 새 `scope_slug` namespace를 추가·복사·이름 변경할 때. 서로 다른 owner의 class가 같은 namespace를 사용할 가능성이 있을 때.

**Impact: CRITICAL (관련 없는 route나 컴포넌트가 같은 namespace를 공유해 전역 class 공간에서 충돌하는 것을 막습니다)**

클래스명은 프로젝트 전역에서 고유해야 하며, 동일한 `scope_slug` 조합은 단일 소유자만 사용할 수 있습니다.
새 스타일을 추가할 때는 먼저 기존 `scope_slug` 충돌 여부를 확인하고,
의미가 겹치더라도 파일이 다르면 별도 slug를 부여합니다.

CSS 파일 하나가 slug 하나를 소유합니다.
여러 하위 component가 부모 slug를 나눠 쓰는 것도 같은 위반입니다.
자기 CSS 파일이 있으면 자기 slug를 만들고, 부모 slug를 계속 쓰려면 스타일도 부모 파일에 두어야 합니다.

**Incorrect (이미 다른 소유자가 쓰는 `scope_slug`를 재사용):**

```txt
// catalog/index route
pg_catalogIndex__header

// dashboard/index route
pg_catalogIndex__toolbar
```

**Correct (소유자가 다르면 별도 slug를 부여):**

```txt
// catalog/index route
pg_catalogIndex__header

// dashboard/index route
pg_dashboardIndex__header
```

### 1.3 Name Elements and Modifiers by Role

**Rule:** `C03` · `naming-name-elements-and-modifiers-by-role`

**Applies when:** element 또는 modifier class 이름을 새로 지을 때. `container`, `wrapper`, `box`, 치수·간격 중심 이름을 변경할 때.

**Impact: HIGH (class가 UI 부위를 설명하지 못하게 만드는 모호하거나 레이아웃 중심인 이름을 피합니다)**

`element`와 `modifier` 이름은 구조나 치수가 아니라 UI 역할을 표현해야 합니다.
`container`, `wrapper`, `box` 같은 포괄 단어 단독 사용이나 `gap12` 같은 숫자 기반 의미는 피하고,
실제 역할과 상태를 드러내는 이름을 씁니다.

**Incorrect (역할 대신 구조나 치수에 기대는 이름):**

```txt
ui_card__wrapper
ui_card__box
ui_card__body--gap12
pg_catalogDetail__section--compactTop
```

**Correct (역할과 상태를 기준으로 이름을 붙임):**

```txt
ui_card__toolbar
ui_card__body
ui_card__body--active
pg_catalogDetail__detailSection
```

### 1.4 Preserve Route Slug Traceability

**Rule:** `C04` · `naming-preserve-route-slug-traceability`

**Applies when:** `pg_*` owner의 class slug를 새로 만들거나 이름을 바꿀 때. 같은 이름 component가 여러 화면에 생겨 slug를 구분해야 할 때.

**Impact: HIGH (화면 범위 class namespace를 소속 화면으로 거슬러 읽을 수 있게 유지합니다)**

`pg_*` slug는 소속 화면까지 다시 추적할 수 있어야 합니다.
CSS skill은 어떤 파일이 화면 소유인지 결정하지 않고, 이미 선택된 owner가 클래스명에서 흐려지지 않게 지킵니다.

기본 판단:

- 화면 shell slug는 route 이름을 씁니다. route family와 screen role이 읽혀야 합니다.
- 화면 내부 component slug는 자기 component 이름만 씁니다.
- 팀이 공유하는 route map이 없는 opaque acronym은 피합니다.
- `wg_*`, `ui_*`는 각 owner scope의 naming style을 따릅니다.

부모 이름을 미리 붙이지 않습니다.
충돌이 실제로 생겼을 때만 최소 범위로 덧붙입니다.
미리 붙이면 깊이에 따라 slug가 계속 자라서 충돌을 걱정하기 전에 읽기가 무너집니다.

**Incorrect (의미가 약하거나 계층 순서가 흐려진 slug):**

```txt
pg_shell__body
pg_doc__content
pg_x__root
```

**Incorrect (충돌이 없는데도 부모 이름을 미리 붙임):**

```txt
pg_detailSpikePatternPanelOverviewSection__root
pg_detailSpikePatternPanelSummaryBand__root
```

**Correct (shell은 route 이름, component는 자기 이름):**

```txt
posts index route  -> pg_postsIndex__root
posts detail route -> pg_postsDetail__body
document shell     -> pg_document__body

overview section   -> pg_overviewSection__root
summary band       -> pg_summaryBand__root
```

**Correct (같은 이름이 실제로 두 화면에 생겼을 때만 구분):**

```txt
pg_detailOverviewSection__root
pg_indexOverviewSection__root
```

### 1.5 Separate Owner Style Scopes

**Rule:** `C05` · `naming-separate-owner-style-scopes`

**Applies when:** 스타일 owner를 화면 내부, widget, primitive 중에서 결정할 때. 새 CSS 파일을 만들거나 기존 owner 범위를 옮길 때.

**Review with:** `naming-keep-scope-slug-unique-per-owner`, `organization-keep-style-files-owned-by-one-component-or-route`

**Impact: HIGH (화면 소유 스타일·공용 widget 스타일·primitive 스타일이 같은 namespace나 파일에 섞이는 것을 막습니다)**

scope prefix는 폴더 경로가 아니라 그 CSS 파일 소유자의 재사용 범위를 가리킵니다.

| prefix | owner |
| --- | --- |
| `pg_` | 한 화면 안에서만 쓰이는 shell과 component |
| `wg_` | 여러 화면이 재사용하는 widget과 그 part |
| `ui_` | primitive component와 그 part |

`pg_`는 화면 shell과 그 아래 component를 함께 덮습니다.
shell은 slug가 route 이름과 같아서 따로 표시하지 않아도 구분됩니다.

판정은 CSS 파일 소유로 갈립니다.

- 자기 CSS 파일을 가진 component는 자기 scope slug를 씁니다.
- 부모가 스타일을 소유하면 부모 CSS 파일과 부모 slug에 남깁니다.
- 별도 CSS 파일인데 부모 slug를 쓰고 있으면 ownership이 잘못 나뉜 상태입니다.
- 폴더가 아니라 가장 가까운 공개 패키지 경계로 판정합니다.
  widget 내부 part가 `component` 폴더에 있어도 `wg_`입니다.

서로 다른 owner 범위는 한 파일에 섞지 않습니다.
어떤 파일이 화면 소유인지 판단하는 책임은 활성화된 framework convention이 가집니다.

**Incorrect (화면 소유, widget, primitive owner를 한 파일에 섞음):**

```txt
page/detail/pg-detail.css
  pg_detail__root
  wg_chart__root
  ui_button__root
```

**Incorrect (별도 CSS 파일인데 부모 slug를 계속 사용):**

```txt
page/detail/pg-detail.css
  pg_detail__root

page/detail/component/pg-spike-pattern-panel.css
  pg_detail__panel
  pg_detail__panelHeader
```

**Incorrect (widget 내부 part를 폴더 이름만 보고 화면 scope로 내림):**

```txt
widget/chart/component/wg-chart-header.css
  pg_chartHeader__root
```

**Correct (CSS 파일마다 자기 owner slug를 사용):**

```txt
page/detail/pg-detail.css
  pg_detail__root
  pg_detail__body

page/detail/component/pg-spike-pattern-panel.css
  pg_spikePatternPanel__root
  pg_spikePatternPanel__header

widget/chart/component/wg-chart-header.css
  wg_chartHeader__root

ui/button/ui-button.css
  ui_button__root
```

### 1.6 Use Scope, Slug, Element, and Modifier Syntax

**Rule:** `C06` · `naming-use-scope-slug-element-modifier-syntax`

**Applies when:** plain CSS의 project-owned class를 새로 만들 때. 이름, scope, slug, element, modifier 구분자 또는 casing을 변경할 때.

**Impact: CRITICAL (classname만 보고도 class 소유와 UI 역할을 추적할 수 있게 합니다)**

클래스명은 `<scope>_<slug>__<element>[--<modifier>]` 문법을 사용합니다.
구분자는 `_`, `__`, `--`를 고정하고, 각 부분의 책임을 섞지 않습니다.

구성 요소:

- `scope`: `pg`, `wg`, `ui` 중 하나. lowercase owner namespace
- `slug`: owner 식별자. `camelCase`
- `element`: owner 안의 UI 역할. `listButton`, `emptyState`처럼 camelCase
- `modifier`: 상태나 반복 variant. `routeActive`, `selected`처럼 camelCase

slug에는 prefix가 말하는 부분을 반복하지 않습니다. `UiButton`은 `ui_button`이고 `ui_uiButton`이 아닙니다.

**Incorrect (slug나 element casing이 흔들림):**

```txt
ui_tag_list__root
pg_catalog_page__root
pg_catalogDetail__main-content
wg_site_header__brandLink
pg_document__main-content
pg_document__main--route_active
```

**Correct (scope는 lowercase, slug·element·modifier는 camelCase):**

```txt
ui_tagList__root
pg_catalogIndex__root
pg_catalogDetail__mainContent
wg_siteHeader__brandLink
pg_document__main
pg_document__main--routeActive
```

## 2. Class Composition and Wrapper Boundaries

**Impact: HIGH**

TSX class 조합과 wrapper 소유권 규칙은 스타일링 경계를 분명하게 유지하고, UI wrapper가 통제되지 않은 스타일 hook을 노출하는 것을 막습니다.

### 2.1 Compose Classes With `clsx()`

**Rule:** `C07` · `composition-compose-classes-with-clsx`

**Applies when:** TSX의 `className`을 추가·수정할 때. base class, modifier, optional class를 조합할 때.

**Impact: HIGH (base class와 상태 modifier를 조합할 때 TSX class 조립을 읽을 수 있게 유지합니다)**

TSX에서 `className`은 `clsx()` 사용을 기본으로 합니다.
문자열 연결이나 중복 ternary로 `className`을 조립하지 않습니다.

클래스가 하나일 때도 `clsx()`를 씁니다.
modifier가 붙는 순간 문자열 연결로 되돌아가는 diff를 막으려는 것이고,
`className` 형태가 파일마다 갈리지 않게 해서 grep과 리뷰가 한 패턴만 보게 합니다.

**Incorrect (문자열 연결로 클래스 조합을 숨김):**

```tsx
<button className={"pg_catalogIndex__listButton " + (isActive ? "pg_catalogIndex__listButton--active" : "")}>
	저장
</button>
```

**Correct (기본 클래스와 modifier를 `clsx()`로 조합):**

```tsx
<button
	className={clsx(
		"pg_catalogIndex__listButton",
		isActive && "pg_catalogIndex__listButton--active",
	)}
>
	저장
</button>
```

### 2.2 Do Not Use Modifiers for One-off Structural Patches

**Rule:** `C08` · `composition-do-not-build-structural-variants-with-modifiers`

**Applies when:** modifier를 추가·변경할 때. 반복 가능한 state·API variant와 one-off structural patch 사이를 판정할 때.

**Review with:** `naming-name-elements-and-modifiers-by-role`

**Impact: HIGH (modifier를 두 번째 레이아웃 이름 체계로 만들지 않고 상태 표현에만 남겨둡니다)**

modifier는 상태나 반복 variant를 표현할 때만 사용합니다.

금지:

- spacing patch
- 방향 보정
- 특정 화면 하나에서만 필요한 구조 차이

허용:

- `active`, `hidden`, `disabled`, `selected`, `error` 같은 상태
- `dense`, `horizontal`, `compact`처럼 component API로 반복 노출되는 variant

금지 대상은 "상태 의미가 아닌 모든 modifier"가 아니라, 재사용 contract 없이 생긴 one-off structural modifier입니다.
허용 여부가 갈리는 지점은 그 modifier를 두 번째 화면에서도 같은 이름으로 쓸 수 있느냐입니다.

**Incorrect (특정 화면용 구조 patch를 modifier로 덧붙임):**

```tsx
<div className={clsx("pg_catalogDetail__section", "pg_catalogDetail__section--compactTop")} />
```

**Correct (one-off patch는 별도 element로 풀고, 반복되는 variant만 제한적으로 허용):**

```tsx
<div className={clsx("pg_catalogDetail__detailSection")} />
```

```tsx
<div className={clsx("ui_table__root", isDense && "ui_table__root--dense")} />
```

### 2.3 Keep Classes Single-purpose

**Rule:** `C09` · `composition-keep-classes-single-purpose`

**Applies when:** 기존 class가 base와 state·variant 책임을 함께 갖거나 독립 시각 책임을 추가·재사용·분리할 때. 제외: 기존 결합 책임을 분리하지 않고 처음부터 새 single-purpose pair를 만들거나 책임 보존 rename만 하는 경우.

**Impact: HIGH (class 하나가 base 스타일과 여러 상태·구조 의미를 동시에 지는 것을 막습니다)**

하나의 클래스는 하나의 시각적 책임만 가져야 합니다.
base 스타일과 state를 클래스 이름 하나에 융합하지 않고, 한 클래스를 독립된 여러 시각 책임에 재사용하지 않습니다.

`listButtonActive`처럼 상태를 이름에 녹이면 base만 필요한 곳에서 재사용할 수 없고 상태를 끄는 방법도 없습니다.
base class와 `--modifier`를 따로 두면 둘 다 해결됩니다.

modifier가 상태를 표현할 자격이 있는지는 `composition-do-not-build-structural-variants-with-modifiers`가 판정합니다.

**Incorrect (상태 의미를 별도 클래스 역할처럼 합쳐 버림):**

```tsx
<div className={clsx("pg_catalogIndex__listButtonActive")} />
```

**Correct (기본 클래스와 상태 modifier를 분리):**

```tsx
<div className={clsx("pg_catalogIndex__listButton", isActive && "pg_catalogIndex__listButton--active")} />
```

### 2.4 Prefer `Ui*` Wrapper Prop Types

**Rule:** `C10` · `composition-prefer-ui-wrapper-prop-types`

**Applies when:** `Ui*` wrapper 사용처나 wrapper API에서 Props 타입을 선언·추론·재사용할 때. 라이브러리 원본 Props 참조를 검토할 때.

**Requires selected:** `typescript/types-reuse-existing-contracts-before-new-types` · 함께 적용

**Impact: MEDIUM-HIGH (라이브러리 원본 prop 타입이 사용처로 새지 않게 wrapper 수준의 스타일·API 계약을 지킵니다)**

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

**Applies when:** 실제 `Ui*` React wrapper 사용처·API에서 내부 DOM styling 경계를 정할 때. root `className`·slot prop hook을 주입·노출·사용할 때. 제외: 기존 CSS owner root 아래 third-party selector만 수정하는 경우.

**Review with:** `selector-target-third-party-dom-from-owned-roots`

**Impact: HIGH (공용 UI wrapper가 즉석 className 주입으로 통제되지 않는 스타일 훅을 노출하는 것을 막습니다)**

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
<UiCollapse className={clsx("pg_postFilterDialog__collapse")} />
```

**Correct (내부 DOM 스타일링은 소유 래퍼 아래로 제한하고, 공식 root contract는 예외적으로 허용):**

```tsx
<div className={clsx("pg_postFilterDialog__collapse")}>
	<UiCollapse />
</div>
```

```css
.pg_postFilterDialog__collapse {
	& .ant-collapse-item {
		border-radius: var(--mk-size-radius-card, 10px);
	}
}
```

```tsx
// UiButton이 root className contract를 공식적으로 노출하는 경우에만 허용
<UiButton className={clsx("pg_postFilterDialog__submitButton")} />
```

## 3. Selectors and Nesting Boundaries

**Impact: CRITICAL**

프로젝트 소유 selector를 평평하게 유지하고, DOM pseudo-state는 같은 block 안에 접고, rich text wrapper 예외와 서드파티 DOM 타게팅 범위를 명시해야 cascade surprise를 줄이고 selector 깊이를 예측 가능하게 유지할 수 있습니다.

### 3.1 Avoid Deep Descendant Selector Dependencies

**Rule:** `C12` · `selector-avoid-deep-descendant-dependencies`

**Applies when:** descendant·child·sibling combinator를 추가·수정할 때. DOM 계층에 의존하는 project-owned·third-party selector를 검토할 때.

**Review with:** `selector-limit-nesting-block-depth`

**Impact: HIGH (selector가 훑는 요소 수를 제한해 마크업 변경에 함께 깨지지 않게 합니다)**

중첩을 펼친 effective selector의 combinator 개수를 셉니다.
같은 요소에 붙는 조건인 `.a.b`, `:hover`, `:not()`, `::before`는 DOM 관계가 아니므로 세지 않습니다.

기본값은 combinator 0입니다. 규칙 하나가 요소 하나만 겨냥하고, 상태는 그 요소의 modifier class로 받습니다.

combinator를 쓸 수 있는 경우와 상한은 넷뿐입니다.

| 경우 | 상한 |
| --- | --- |
| 조상의 DOM 상호작용 상태가 자손 모양을 바꿈 | 1 |
| 소유 root 아래 third-party 내부 DOM | 2 |
| raw HTML wrapper 안 element selector | 1 |
| 공유 컴포넌트가 slot class prop을 열지 않은 부분 override | 1 |

첫 항목은 CSS에 부모 선택자가 없어 생기는 정상 소비입니다.
다만 도메인 상태까지 부모 조건으로 얹지 말고 자손 modifier로 옮깁니다.

상한을 넘으면 순서대로 시도합니다.

1. 자손에 modifier를 주고 combinator 0으로 편다
2. 조상 block에서 custom property를 바꾸고 자손이 그 값을 읽는다
3. 위 네 경우 중 무엇인지 주석 한 줄로 남긴다
4. 어디에도 안 걸리면 리팩터 대상이다

중첩을 펼쳐도 effective selector는 같아서 결합도가 줄지 않습니다. 블록 깊이는 별도 규칙이 담당합니다.

**Incorrect (project-owned 클래스를 네 요소까지 체이닝):**

```css
.pg_catalogIndex__layout .pg_catalogIndex__panel .pg_catalogIndex__detail .pg_catalogIndex__item {
	padding: 8px;
}
```

**Incorrect (도메인 상태를 부모 조건으로 얹어 예산을 낭비):**

```css
.pg_spikePanel__spreadButton:not(.pg_spikePanel__spreadButton--checked):hover .pg_spikePanel__spreadBox {
	border-color: #9fadc7;
}
```

**Correct (대상 element 클래스에 직접 스타일을 둠):**

```css
.pg_catalogIndex__item {
	padding: 8px;
}

.pg_catalogIndex__detailHeader {
	gap: var(--app-space-2);
}
```

**Correct (조상 hover는 combinator 1개로 쓰고, 도메인 상태는 자손 modifier가 처리):**

```css
.pg_spikePanel__spreadButton {
	&:hover .pg_spikePanel__spreadBox {
		border-color: var(--app-color-accent);
	}
}

.pg_spikePanel__spreadBox--checked {
	box-shadow: none;
}
```

**Correct (조상 상태를 custom property로 내려 combinator 0으로 유지):**

```css
.pg_spikePanel__spreadButton {
	--pg-spike-box-border: var(--app-color-border);

	&:hover {
		--pg-spike-box-border: var(--app-color-accent);
	}
}

.pg_spikePanel__spreadBox {
	border: 2px solid var(--pg-spike-box-border);
}
```

### 3.2 Limit Nesting Block Depth

**Rule:** `C13` · `selector-limit-nesting-block-depth`

**Applies when:** 중첩 `{}` block을 추가하거나 기존 block을 펼치거나 합칠 때. raw HTML prose·copy·content wrapper 안 element selector를 추가·수정할 때.

**Review with:** `selector-avoid-deep-descendant-dependencies`

**Impact: HIGH (들여쓰기가 깊어져 규칙의 적용 대상을 머릿속에서 조립해야 하는 상태를 막습니다)**

중첩 `{}`는 소스 형식이고 브라우저는 이를 펼쳐서 평가합니다.
그래서 이 규칙은 결합도가 아니라 **가독성**만 담당합니다. 결합도는 `selector-avoid-deep-descendant-dependencies`가 셉니다.

- 중첩 block은 2단까지 씁니다. top-level class block 안에 한 겹만 더 엽니다.
- nested block 안에서 다시 nested block을 열지 않습니다.
- 관련 선언은 owner class block 안에 모아 둡니다.

**중첩을 펼치는 것은 개선이 아닙니다.**
`.a { & .b { } }`를 `.a .b { }`로 바꿔도 effective selector가 같아서 마크업 변경에 똑같이 깨집니다.
오히려 owner 소속이 보이지 않게 되어 파일 아무 곳에나 흩어질 수 있습니다.
깊이를 줄이려면 combinator를 줄여야 하고, 그 방법은 위 규칙이 정합니다.

`__prose`, `__copy`, `__content`처럼 raw HTML wrapper가 owner boundary라면
같은 block 안에서 `& h2`, `& p`, `& > :first-child`를 씁니다.
이 예외는 raw element styling에만 적용하고, 다른 project-owned class를 체이닝하는 근거로 쓰지 않습니다.

**Incorrect (nested block 안에서 다시 nested block을 열어 3단이 됨):**

```css
.pg_spikePanel__spreadButton {
	&.MuiButtonBase-root {
		&:hover {
			.pg_spikePanel__spreadBox {
				border-color: #9fadc7;
			}
		}
	}
}
```

**Incorrect (wrapper styling을 owner block 밖으로 흩뿌림):**

```css
.wg_entryDetail__prose h2 {
	margin: 24px 0 12px;
}

.wg_entryDetail__prose > :first-child {
	margin-top: 0;
}
```

**Correct (2단까지만 열고 owner block 안에 모음):**

```css
.pg_spikePanel__spreadButton {
	&:hover .pg_spikePanel__spreadBox {
		border-color: var(--app-color-accent);
	}
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

**Applies when:** `.ant-*`, `.rc-*`, `.tippy-*` 등 third-party 내부 DOM selector를 추가·수정할 때. owned wrapper 아래로 범위를 제한할 때.

**Requires selected:** `selector-avoid-deep-descendant-dependencies` · 함께 적용

**Impact: CRITICAL (third-party 스타일링을 앱 전체로 새게 하지 않고 명시적 wrapper 소유로 제한합니다)**

서드파티 라이브러리 내부 DOM 클래스(`.ant-*`, `.rc-*`,
`.tippy-*`)는 프로젝트가 소유한 root block 아래에서만 타겟팅합니다.

판단 기준:

- 항상 owned root class block을 먼저 엽니다.
- root 없는 `.ant-*` 단독 selector는 금지합니다.
- `.pg_* .ant-*` 같은 one-line chaining보다 root block 안의 `& .ant-*`를 사용합니다.
- owned root가 이미 instance scope를 제공하고 target class가 직접 식별 가능하면
  `.ant-tree` 같은 중간 library root를 반복하지 않습니다.

combinator 상한은 `selector-avoid-deep-descendant-dependencies`가 정합니다.
third-party DOM은 그 표에서 2까지 허용되고, 2를 넘겨야 하면 라이브러리가 그 구조를 강제한다는 근거를
해당 선언 바로 위 주석 한 줄로 남깁니다.

이 예외는 third-party DOM path에만 적용됩니다. project-owned class끼리의 깊은 descendant coupling은 여전히 금지입니다.

**Incorrect (루트 없이 타겟팅하거나 nested 안에서 다시 nested를 열어 의미를 흐림):**

```css
.ant-tree-node-content-wrapper {
	border-radius: 4px;
}

.pg_treePanel__root .ant-tree-title {
	color: #999;
}

.pg_treePanel__root {
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
.pg_treePanel__root {
	& .ant-tree-node-content-wrapper {
		display: inline-flex;
	}

	& .ant-tree-title {
		color: #999;
	}

	& .ant-tree-switcher {
		color: var(--app-color-text-muted);
	}
}

.pg_treePanel__toolbar {
	& > .ant-btn-icon {
		color: var(--app-color-text-muted));
	}
}
```

### 3.4 Use Pseudo-classes for DOM-owned States

**Rule:** `C15` · `selector-use-pseudo-classes-for-dom-owned-states`

**Applies when:** `:hover`, `:visited`, `:focus*`, `:disabled`, `:checked`를 추가·수정할 때. parent DOM state가 child styling에 영향을 줄 때.

**Requires selected:** `values-separate-domain-state-modifiers-from-dom-interaction-states` · 함께 적용

**Impact: HIGH (브라우저가 소유한 상호작용 상태를 앱이 소유한 상태 modifier와 분리합니다)**

브라우저와 DOM이 직접 부여하는 상태는 같은 클래스 block 안의 nested `&:`로 표현합니다.
화면이나 도메인이 결정하는 상태는 modifier class로 분리합니다.

| 소유 | 상태 | 표현 |
| --- | --- | --- |
| DOM | `:hover`, `:visited`, `:focus-visible`, `:disabled`, `:checked` | 같은 block 안 nested `&:` |
| 앱 | `selected`, `active`, `error`, `expanded`, `current` | `--modifier` class |

- pseudo-class를 top-level selector로 다시 열지 않습니다.
- 도메인 상태를 `:not(.--modifier)`로 뒤집지 않습니다.
  읽는 사람이 부정 조건을 뒤집어야 하고 combinator 예산도 함께 먹습니다. 예외는 자손 modifier로 옮깁니다.
- DOM state가 자손을 바꿔야 하면 조상 block에서 custom property를 바꾸고 자손이 그 값을 읽습니다.
- `.foo:hover .foo__icon`처럼 project-owned descendant coupling으로 상태를 전달하지 않습니다.

base/modifier 배치와 focus 접근성은 `values-separate-domain-state-modifiers-from-dom-interaction-states`가 담당합니다.

**Incorrect (pseudo-class를 top-level selector로 다시 열거나, parent state를 child selector coupling으로 표현함):**

```css
.wg_siteHeader__brandLink:hover {
	color: var(--mk-color-link-hover, #0958d9);
}

.wg_siteHeader__brandLink:hover .wg_siteHeader__brandMark {
	transform: rotate(-2deg);
}

.pg_assetIndex__card {
	&[aria-selected="true"] {
		border-color: var(--app-color-accent);
	}
}

.pg_assetIndex__card:not(.pg_assetIndex__card--checked) .pg_assetIndex__cardBox {
	border-color: var(--app-color-border);
}
```

**Correct (DOM 상태는 같은 block 안 nested `&:`로 두고, 화면 상태는 modifier로 분리):**

```css
.wg_siteHeader__brandLink {
	--wg-site-header-brand-mark-transform: translateY(1px);
	color: var(--mk-color-link, #1677ff);

	&:hover {
		--wg-site-header-brand-mark-transform: translateY(1px) rotate(-2deg);
		color: var(--mk-color-link-hover, #0958d9);
	}
}

.wg_siteHeader__brandMark {
	transform: var(--wg-site-header-brand-mark-transform);
}

.pg_assetIndex__cardButton {
	cursor: default;

	&:disabled {
		opacity: 1;
	}

	&:hover:not(:disabled) {
		cursor: pointer;
	}
}

.pg_assetIndex__card--selected {
	border-color: var(--app-color-accent);
}
```

## 4. Values, Layout, and Interaction States

**Impact: HIGH**

토큰, 변수 fallback, 명시적인 레이아웃 의도, 앱 상태와 DOM 상태의 분리는 스타일을 더 견고하고 접근 가능하게 유지합니다.

### 4.1 Keep Layout Intent Explicit

**Rule:** `C16` · `values-keep-layout-intent-explicit`

**Applies when:** `sticky`·`fixed`, `z-index`, 강제 width·height 또는 부모·자식 layout 책임을 추가·변경할 때. 제외: 같은 element의 base/modifier 분리에서 기존 `display`·spacing 선언을 값 그대로 재배치하는 경우.

**Impact: MEDIUM-HIGH (DOM을 역추적하지 않고도 sticky·fixed·박스 책임을 이해할 수 있게 합니다)**

레이아웃 의도는 클래스명과 선언에서 즉시 확인 가능해야 합니다.
`position`, `width`, `height` 강제는 최소화하고 부모와 자식의 레이아웃 책임을 분리합니다.

- `z-index`에는 숫자를 직접 쓰지 않고 layer 토큰을 씁니다. 토큰 이름이 곧 stacking 순서 문서입니다.
- `sticky`나 `fixed`를 쓸 때는 기준 컨테이너를 주석 한 줄로 남깁니다. 어느 조상이 scroll container인지는 선언에 안 보입니다.

**Incorrect (레이아웃 강제가 많고 기준 설명이 없음):**

```css
.pg_dashboard__toolbar {
	position: sticky;
	top: 0;
	z-index: 9999;
	width: 100%;
	height: 48px;
}
```

**Correct (기준 컨테이너와 의도를 드러냄):**

```css
.pg_dashboard__toolbar {
	/* sticky toolbar pinned inside the scrollable content pane */
	position: sticky;
	top: 0;
	z-index: var(--app-z-index-toolbar);
}

.pg_dashboard__content {
	display: grid;
	min-height: 0;
}
```

### 4.2 Declare Core Tokens Once and Fall Back Everywhere Else

**Rule:** `C17` · `values-always-provide-css-variable-fallbacks`

**Applies when:** `var(--*)` 사용을 추가하거나 변수 이름·fallback을 바꿀 때. core token 목록에 항목을 추가·제거할 때.

**Review with:** `values-tokenize-repeated-visual-values`

**Impact: HIGH (토큰 누락이 스타일을 조용히 망가뜨리는 것을 막고 fallback이 매직 넘버로 번지는 것도 막습니다)**

프로젝트는 전역에서 항상 주입되는 **core token 목록**을 한 곳에 선언합니다.
`:root` 또는 전역 theme stylesheet가 그 목록의 단일 출처입니다.

판정은 목록 대조로 끝냅니다.

| 대상 | fallback |
| --- | --- |
| core token 목록에 있는 변수 | **쓰지 않습니다.** 누락을 fail-loud로 드러냅니다 |
| 그 밖의 모든 `var()` | **씁니다.** 값이 없을 때 안전한 기본값을 둡니다 |

core token에 fallback을 붙이지 않는 이유는 `values-tokenize-repeated-visual-values`와 충돌하기 때문입니다.
`var(--app-space-3, 12px)`가 100곳에 있으면 `12px`을 100곳에 하드코딩한 것과 같아서 토큰화의 목적이 사라집니다.
값을 한 곳에서 바꾸려면 그 한 곳이 유일해야 합니다.

fallback이 필요한 쪽은 주입 주체가 프로젝트가 아닌 경계입니다.
서드파티 wrapper 내부, 선택적 theme, 임시 overlay, 조건부로만 주입되는 변수가 여기 해당합니다.

요청에 없는 CSS variable을 이 규칙 때문에 새로 발명하지 않습니다.

**Incorrect (core token에 fallback을 붙여 값을 두 곳으로 흩음):**

```css
.pg_postFilterDialog__panel {
	gap: var(--app-space-3, 12px);
	color: var(--app-color-text-primary, #212529);
}
```

**Incorrect (서드파티 내부에 주입 보장 없는 변수를 fallback 없이 사용):**

```css
.pg_postFilterDialog__collapse {
	& .ant-collapse-item {
		border-radius: var(--mk-size-radius-card);
	}
}
```

**Correct (core token은 fallback 없이, 그 밖은 fallback과 함께):**

```css
/* core token 목록: app/style/token.css */
:root {
	--app-space-3: 12px;
	--app-color-text-primary: #212529;
}

.pg_postFilterDialog__panel {
	gap: var(--app-space-3);
	color: var(--app-color-text-primary);
}

.pg_postFilterDialog__collapse {
	& .ant-collapse-item {
		border-radius: var(--mk-size-radius-card, 10px);
	}
}
```

### 4.3 Separate Domain State Modifiers From DOM Interaction States

**Rule:** `C18` · `values-separate-domain-state-modifiers-from-dom-interaction-states`

**Applies when:** app/domain state modifier와 hover·focus·disabled 같은 DOM interaction state를 추가·변경할 때. focus ring을 수정할 때.

**Review with:** `composition-do-not-build-structural-variants-with-modifiers`

**Impact: HIGH (앱 상태·포커스 가시성·hover 동작의 책임을 섞지 않고 읽기 쉽고 접근성 있게 유지합니다)**

domain state와 무관한 hover, focus, disabled interaction은 unconditional base element block에 둡니다.
interaction selector를 modifier 아래로 옮겨 적용 대상을 좁히지 않습니다.
modifier block에는 `active`·`selected`·`error`처럼 app state가 소유하는 presentation만 남깁니다.
modifier가 켜진 경우에만 interaction이 달라져야 한다는 제품 요구가 있을 때만 그 예외를 명시합니다.

포커스 링 제거는 금지합니다. `outline: none`을 쓰면 대체 포커스 스타일을 반드시 제공합니다.

무엇을 modifier로 두고 무엇을 pseudo-class로 둘지는 `selector-use-pseudo-classes-for-dom-owned-states`가 정합니다.

**Incorrect (포커스 스타일을 제거하거나 상태 경계를 섞음):**

```css
.ui_button__root {
	&:focus {
		outline: none;
	}
}

.ui_button__root--hover {
	background: var(--app-color-accent);
}
```

**Correct (도메인 상태와 상호작용 상태를 분리하고 포커스를 보존):**

```css
.ui_button__root--active {
	background: var(--app-color-accent);
}

.ui_button__root {
	&:focus-visible {
		outline: 2px solid var(--app-color-accent);
		outline-offset: 2px;
	}

	&:hover:not(:disabled) {
		cursor: pointer;
	}
}
```

### 4.4 Tokenize Repeated Visual Values

**Rule:** `C19` · `values-tokenize-repeated-visual-values`

**Applies when:** 색상·간격·radius·타이포·그림자 등 같은 시각 값이 2회 이상 반복될 때. 새 shared visual value를 하드코딩할 때.

**Review with:** `values-always-provide-css-variable-fallbacks`

**Impact: HIGH (반복되는 색·간격·radius 값이 매직 넘버로 흐르지 않고 공용 디자인 토큰에 맞게 유지합니다)**

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
	gap: var(--app-space-3);
}

.ui_table__row--selected {
	background: var(--app-color-fill-muted);
	border-radius: var(--app-radius-control);
}
```

## 5. File Organization and Guardrails

**Impact: MEDIUM**

stylesheet는 하나의 owner에 맞춰 유지하고, 가벼운 구조 주석만 사용하며, 마무리 전에 금지 패턴을 점검해야 합니다.

### 5.1 Keep Style Files Owned by One Component or Route Surface

**Rule:** `C20` · `organization-keep-style-files-owned-by-one-component-or-route`

**Applies when:** stylesheet를 새로 만들거나 이동·분할·병합해 한 파일에 component, route, document, local, shared owner가 섞일 가능성이 있을 때.

**Impact: MEDIUM (주석·순서·범위를 이해할 수 있도록 stylesheet를 소유자 하나에 맞춥니다)**

스타일 파일은 하나의 컴포넌트, route surface, 또는 pages-local shell 책임 범위를 기본 단위로 유지합니다.
가장 중요한 기준은 한 파일 안의 클래스들이 하나의 owner를 설명하느냐입니다.
파일이 길어질 경우 가벼운 섹션 주석이나 선언 순서 규약을 보조적으로 둘 수 있지만,
이 규칙의 핵심은 주석 스타일이 아니라 ownership을 섞지 않는 것입니다.

**Incorrect (여러 소유자의 스타일이 한 파일에 섞이고 구조 주석이 없음):**

```css
/* posts.css */
.pg_catalogIndex__root {
	display: grid;
}

.pg_document__content {
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
.pg_catalogIndex__root {
	display: grid;
}

/* visual */
.pg_catalogIndex__panel {
	background: var(--app-color-bg-surface);
}

/* state */
.pg_catalogIndex__panel--active {
	border-color: var(--app-color-accent);
}
```

### 5.2 Review Banned CSS Patterns Before Finishing

**Rule:** `C21` · `organization-review-banned-css-patterns-before-finishing`

**Applies when:** CSS 또는 TSX class contract 변경이 완료 단계에 들어갈 때.

**Required on completion:** 마무리 시 항상 적용

**Impact: MEDIUM (위험한 셀렉터·modifier·라이브러리 타겟팅 지름길을 공용 스타일 체계에 들어가기 전에 잡습니다)**

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

.pg_treePanel__root {
	& .ant-tree-node-content-wrapper {
		border-radius: var(--app-radius-control);
	}
}
```

## 참고 자료

- https://developer.mozilla.org/en-US/docs/Web/CSS
- https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
- https://github.com/lukeed/clsx

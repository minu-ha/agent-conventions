# CSS 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.companions`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=css`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 CSS 코딩 컨벤션입니다. plain CSS를 기본으로 한 전역 고유 네이밍, `pg_/wg_/ui_` 소유 범위, 예측 가능한 TSX 클래스 조합, 평평한 선택자, 남의 클래스는 자기 root 아래에서만 겨냥하는 경계, 토큰화된 값, 눈에 보이는 포커스 표시, stylelint 설정을 강조합니다. TSX의 클래스 계약을 함께 바꿀 때는 React와 TypeScript 규칙도 함께 봅니다. `rules/` 아래 rule 파일이 source of truth입니다.

이 문서에는 CSS 컨벤션 규칙만 담겨 있습니다. 아래 규칙도 함께 따릅니다.

---

## 함께 따르는 규칙

- [TypeScript Convention](../typescript/HANDBOOK.md) — 다음 조건에서 함께 적용합니다. TS/TSX 클래스 계약, 래퍼 Props 또는 style import를 함께 변경한다.

---

## 목차

1. [Class Naming and Syntax](#1-class-naming-and-syntax) — **CRITICAL**
    - 1.1 [Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules](#11-default-to-plain-css-unless-the-project-explicitly-standardizes-on-css-modules)
    - 1.2 [Use Scope, Slug, Element, and Modifier Syntax](#12-use-scope-slug-element-and-modifier-syntax)
    - 1.3 [Name Elements and Modifiers by Role](#13-name-elements-and-modifiers-by-role)
    - 1.4 [Keep Page Slugs Traceable to Their Screen](#14-keep-page-slugs-traceable-to-their-screen)
2. [Ownership and Boundaries](#2-ownership-and-boundaries) — **CRITICAL**
    - 2.1 [Give Each CSS File Its Own `scope_slug`](#21-give-each-css-file-its-own-scope-slug)
    - 2.2 [Choose the Scope Prefix by Reuse Range](#22-choose-the-scope-prefix-by-reuse-range)
    - 2.3 [Use Foreign Classes Only Under Your Own Root](#23-use-foreign-classes-only-under-your-own-root)
    - 2.4 [Expose Only a Root Class From Other Owners](#24-expose-only-a-root-class-from-other-owners)
3. [Class Composition in TSX](#3-class-composition-in-tsx) — **HIGH**
    - 3.1 [Compose Classes With `clsx()`](#31-compose-classes-with-clsx)
    - 3.2 [Use Modifiers Only for States and Repeated Variants](#32-use-modifiers-only-for-states-and-repeated-variants)
    - 3.3 [Keep Classes Single-purpose](#33-keep-classes-single-purpose)
    - 3.4 [Inject Classes Only at the Component Entry Point](#34-inject-classes-only-at-the-component-entry-point)
    - 3.5 [Do Not Add Wrapper Elements for Styling](#35-do-not-add-wrapper-elements-for-styling)
4. [Selectors and Declaration Placement](#4-selectors-and-declaration-placement) — **HIGH**
    - 4.1 [Limit Nesting to One Level and Write the Rest Inline](#41-limit-nesting-to-one-level-and-write-the-rest-inline)
    - 4.2 [Use Classes Instead of Element Selectors](#42-use-classes-instead-of-element-selectors)
    - 4.3 [Do Not Group Classes With Commas to Share Declarations](#43-do-not-group-classes-with-commas-to-share-declarations)
    - 4.4 [Declare Each Class in One Block](#44-declare-each-class-in-one-block)
    - 4.5 [Use Pseudo-classes for DOM-owned States](#45-use-pseudo-classes-for-dom-owned-states)
    - 4.6 [Nest DOM State Pseudo-classes in the Owning Block](#46-nest-dom-state-pseudo-classes-in-the-owning-block)
    - 4.7 [Do Not Invert Domain State With `:not()`](#47-do-not-invert-domain-state-with-not)
5. [Values, Layout, and Accessibility](#5-values-layout-and-accessibility) — **HIGH**
    - 5.1 [Keep Layout Intent Explicit](#51-keep-layout-intent-explicit)
    - 5.2 [Declare Core Tokens Once and Fall Back Everywhere Else](#52-declare-core-tokens-once-and-fall-back-everywhere-else)
    - 5.3 [Use Global Tokens and Do Not Create Local Ones](#53-use-global-tokens-and-do-not-create-local-ones)
    - 5.4 [Separate Domain State Modifiers From DOM Interaction States](#54-separate-domain-state-modifiers-from-dom-interaction-states)
    - 5.5 [Always Provide a Visible Focus Indicator](#55-always-provide-a-visible-focus-indicator)
    - 5.6 [Do Not Style Through the `style` Attribute](#56-do-not-style-through-the-style-attribute)
6. [Tooling](#6-tooling) — **MEDIUM**
    - 6.1 [Configure Stylelint to Enforce These Rules](#61-configure-stylelint-to-enforce-these-rules)

---

## 1. Class Naming and Syntax

**Impact: CRITICAL**

클래스 문법이 고정되어 있고 요소·수정자 이름이 역할을 가리켜야 스타일을 이름으로 검색할 수 있고, 이름만 보고 무엇을 담당하는 클래스인지 알 수 있습니다.

### 1.1 Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules

**Rule:** `C01` · `naming-default-to-plain-css-when-no-module-convention`

**Applies when:** 표준이 정해지지 않은 상태에서 스타일시트 방식\(일반 CSS, CSS Modules\)을 고르거나 `.module.css`·`styles.*`로 옮길 때. 제외: 기존 일반 CSS 클래스 이름만 바꾸는 경우.

**Impact: HIGH (클래스명이 전역에서 고유해야 범위_식별자로 소유자를 되짚을 수 있습니다)**

이 CSS 스킬은 일반 `*.css`와 전역에서 고유한 클래스명을 전제로 씁니다.
`pg_*`, `wg_*`, `ui_*` 네임스페이스가 있는 이유는 전역 클래스 공간에서 소유자를 되짚기 위해서입니다.
그래서 프로젝트에 별도 합의가 없으면 `.module.css`나 `styles.foo`로 시작하지 않습니다.
프로젝트가 이미 CSS Modules를 공식 표준으로 정했고 그에 맞는 이름·실행 규칙이 따로 있다면,
그 프로젝트 규칙이 이 기본값보다 앞섭니다.

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

**Correct (기본은 일반 CSS와 전역에서 고유한 클래스 이름을 사용):**

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

### 1.2 Use Scope, Slug, Element, and Modifier Syntax

**Rule:** `C02` · `naming-use-scope-slug-element-modifier-syntax`

**Applies when:** 일반 CSS에서 프로젝트가 소유한 클래스를 새로 만들 때. 이름, 범위, 식별자, 요소, 수정자의 구분자나 대소문자 표기를 바꿀 때.

**Impact: CRITICAL (클래스명만 보고 누가 소유하고 어떤 역할인지 읽힙니다)**

클래스명은 `<scope>_<slug>__<element>[--<modifier>]` 문법을 씁니다.
구분자 `_`, `__`, `--`를 고정하고 각 자리의 책임을 섞지 않습니다.

네 자리를 아래처럼 읽습니다.
앞으로 규칙 본문은 한국어 쪽 이름을 씁니다.

| 자리 | 읽는 이름 | 무엇을 담는가 |
| --- | --- | --- |
| `scope` | 범위 | `pg`, `wg`, `ui` 중 하나. 소문자로 씁니다 |
| `slug` | 식별자 | 그 CSS 파일 소유자의 이름. camelCase |
| `element` | 요소 | 소유자 안의 UI 역할. `listButton`, `emptyState` |
| `modifier` | 수정자 | 상태나 반복되는 모양. `routeActive`, `selected` |

수정자와 변형은 다릅니다.
수정자는 클래스 뒤에 붙는 `--이름`이고, 변형은 컴포넌트가 받는 `variant` 프롭입니다.

식별자에는 접두사가 말하는 부분을 반복하지 않습니다.
`UiButton`은 `ui_button`이고 `ui_uiButton`이 아닙니다.

`selector-class-pattern`에 이 문법을 정규식으로 넣으면 기계가 검사합니다.

**Incorrect (식별자와 요소에 snake_case와 kebab-case가 섞임):**

```txt
ui_tag_list__root
ui_tagList__list-item
wg_site_header__root
wg_siteHeader__brand-link
pg_catalog_detail__root
pg_catalogDetail__main-content
pg_catalogDetail__main--route_active
```

**Correct (범위는 소문자, 식별자·요소·수정자는 camelCase):**

```txt
ui_tagList__root
ui_tagList__listItem
wg_siteHeader__root
wg_siteHeader__brandLink
pg_catalogDetail__root
pg_catalogDetail__mainContent
pg_catalogDetail__main--routeActive
```

### 1.3 Name Elements and Modifiers by Role

**Rule:** `C03` · `naming-name-elements-and-modifiers-by-role`

**Applies when:** 요소나 수정자 클래스 이름을 새로 지을 때. `container`, `wrapper`, `box`, 치수나 간격 중심 이름을 변경할 때.

**Impact: HIGH (이름이 모호하거나 치수를 가리키면 클래스가 어느 부위인지 알 수 없습니다)**

요소와 수정자 이름은 구조나 치수가 아니라 UI 역할을 드러냅니다.
`container`, `wrapper`, `box`처럼 뭉뚱그린 단어를 홀로 쓰거나 `gap12`처럼 숫자로 뜻을 담지 않습니다.
그 자리가 무슨 일을 하는지, 어떤 상태인지가 이름에서 읽히게 씁니다.

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

### 1.4 Keep Page Slugs Traceable to Their Screen

**Rule:** `C04` · `naming-keep-page-slug-traceable`

**Applies when:** `pg_*` 소유자의 클래스 식별자를 새로 만들거나 이름을 바꿀 때. 같은 이름 컴포넌트가 여러 화면에 생겨 식별자를 구분해야 할 때.

**Impact: HIGH (클래스명만 보고 어느 화면 것인지 거슬러 찾습니다)**

`pg_*` 식별자만 보고 어느 화면의 것인지 알 수 있어야 합니다.
어떤 파일이 화면 소유인지는 프레임워크 규약이 정하고, CSS는 그 소유가 식별자에서 흐려지지 않게 지킵니다.

- 화면 뼈대는 화면 이름을 그대로 식별자로 씁니다.
  `pg_postsDetail`처럼 화면 계열과 역할이 읽혀야 합니다.
- 화면 안의 컴포넌트는 자기 이름만 식별자로 씁니다.
- 팀이 함께 쓰는 화면 목록에 없는 줄임말은 쓰지 않습니다.
- `wg_*`, `ui_*`는 각자의 식별자 규칙을 따릅니다.

부모 식별자를 미리 붙이지 않습니다.
충돌이 실제로 생겼을 때만 최소한으로 덧붙입니다.
미리 붙이면 깊이만큼 식별자가 자라서 충돌을 걱정하기 전에 읽기가 무너집니다.

**Incorrect (의미가 약하거나 계층 순서가 흐려진 식별자):**

```txt
pg_shell__body
pg_doc__content
pg_x__root
```

**Incorrect (충돌이 없는데도 부모 식별자를 미리 붙임):**

```txt
pg_detailSalesTrendPanelOverviewSection__root
pg_detailSalesTrendPanelSummaryBand__root
```

**Correct (뼈대는 화면 식별자, 컴포넌트는 자기 식별자):**

```txt
posts index page   -> pg_postsIndex__root
posts detail page  -> pg_postsDetail__body
document shell     -> pg_document__body

overview section   -> pg_overviewSection__root
summary band       -> pg_summaryBand__root
```

**Correct (같은 식별자가 실제로 두 화면에 생겼을 때만 구분):**

```txt
pg_detailOverviewSection__root
pg_indexOverviewSection__root
```

## 2. Ownership and Boundaries

**Impact: CRITICAL**

한 CSS 파일이 어떤 소유자의 클래스만 담는지, 다른 소유자의 표현이 필요할 때 무엇을 하는지, 남의 라이브러리 DOM은 어디까지 겨냥하는지가 정해져야 한 파일을 고쳐서 다른 화면이 깨지는 일이 생기지 않습니다.

### 2.1 Give Each CSS File Its Own `scope_slug`

**Rule:** `C05` · `ownership-give-each-file-one-scope-slug`

**Applies when:** 새 `scope_slug`를 만들거나 기존 식별자를 복사·이름 변경할 때. 서로 다른 컴포넌트가 같은 식별자를 쓸 가능성이 있을 때.

**Impact: CRITICAL (여러 컴포넌트가 같은 네임스페이스를 나눠 쓰면 전역에서 충돌합니다)**

CSS 파일마다 식별자가 하나입니다.
같은 식별자를 쓰는 파일은 프로젝트 전역에서 그 하나뿐입니다.

- 새 스타일을 추가하기 전에 같은 식별자를 쓰는 파일이 이미 있는지 확인합니다.
- 의미가 겹쳐도 파일이 다르면 식별자를 따로 만듭니다.
- 하위 컴포넌트 여럿이 부모 식별자를 나눠 쓰는 것도 같은 위반입니다.
- 자기 CSS 파일이 있으면 자기 식별자를 만듭니다.
  부모 식별자를 계속 쓰려면 스타일도 부모 파일에 둡니다.

**Incorrect (이미 다른 소유자가 쓰는 `scope_slug`를 재사용):**

```txt
// catalog/index route
pg_catalogIndex__header

// dashboard/index route
pg_catalogIndex__toolbar
```

**Correct (소유자가 다르면 별도 식별자를 부여):**

```txt
// catalog/index route
pg_catalogIndex__header

// dashboard/index route
pg_dashboardIndex__header
```

### 2.2 Choose the Scope Prefix by Reuse Range

**Rule:** `C06` · `ownership-choose-scope-prefix-by-reuse-range`

**Applies when:** 새 CSS 파일을 만들며 `pg_`·`wg_`·`ui_` 중 하나를 고를 때. 소유자의 재사용 범위가 바뀌어 접두사를 옮길 때.

**Review with:** `ownership-give-each-file-one-scope-slug`, `ownership-use-foreign-classes-only-under-your-own-root`

**Impact: HIGH (접두사를 재사용 범위로 정하면 이름만 보고 어디서 쓰이는지 압니다)**

범위 접두사는 폴더 경로가 아니라 그 CSS 파일 소유자의 **재사용 범위**를 가리킵니다.

| 접두사 | 재사용 범위 |
| --- | --- |
| `pg_` | 한 화면 안에서만 쓰이는 화면 뼈대와 컴포넌트 |
| `wg_` | 여러 화면이 재사용하는 위젯과 그 부품 |
| `ui_` | 도메인 지식이 없는 원자 컴포넌트와 그 부품 |

`pg_`는 화면 뼈대와 그 아래 컴포넌트를 함께 덮습니다.
뼈대는 식별자가 라우트 이름과 같아서 따로 표시하지 않아도 구분됩니다.

- 폴더가 아니라 가장 가까운 공개 패키지 경계로 판정합니다.
  위젯 내부 부품이 `component` 폴더에 있어도 `wg_`입니다.
- 한 화면만 쓰는데 `wg_`를 붙이지 않습니다.
  재사용을 예상해서 미리 올리지 않습니다.
- 여러 화면이 쓰기 시작하면 그때 `pg_`에서 `wg_`로 옮깁니다.

어떤 파일이 화면 소유인지는 활성화된 프레임워크 규약이 판단합니다.

**Incorrect (`widget` 내부 부품을 폴더 이름만 보고 화면 범위로 내림):**

```txt
widget/chart/component/wg-chart-header.css
  pg_chartHeader__root
```

**Incorrect (한 화면만 쓰는 컴포넌트를 재사용 예상으로 미리 `wg_`로 올림):**

```txt
page/detail/component/pg-sales-trend-panel.css
  wg_salesTrendPanel__root
```

**Correct (재사용 범위대로 접두사를 붙임):**

```txt
page/detail/pg-detail.css
  pg_detail__root

page/detail/component/pg-sales-trend-panel.css
  pg_salesTrendPanel__root

widget/chart/component/wg-chart-header.css
  wg_chartHeader__root

ui/button/ui-button.css
  ui_button__root
```

### 2.3 Use Foreign Classes Only Under Your Own Root

**Rule:** `C07` · `ownership-use-foreign-classes-only-under-your-own-root`

**Applies when:** `.ant-*`·`.rc-*`·`.Mui-*` 같은 외부 라이브러리 클래스를 쓸 때. 다른 `scope_slug`의 클래스를 겨냥할 때.

**Review with:** `ownership-change-other-owners-through-their-api`, `ownership-give-each-file-one-scope-slug`, `selector-limit-nesting-block-depth`

**Impact: CRITICAL (남의 클래스를 홀로 쓰면 그 라이브러리나 위젯을 쓰는 화면이 전부 함께 바뀝니다)**

내 파일이 소유하지 않은 클래스는 **내 최상위 클래스 블록 안에서만** 씁니다.
블록 바깥에 홀로 두지 않습니다.

`scope_slug`가 내 것이면 내 클래스입니다.
그 밖은 전부 남의 것입니다.
외부 라이브러리든 다른 화면의 `pg_`든 위젯의 `wg_`든 똑같이 다룹니다.

| 선택자 | 판정 |
| --- | --- |
| `.ant-tree-title { }` | 안 씁니다. 그 라이브러리를 쓰는 앱 전체에 걸립니다 |
| `.wg_chartCard__caption { }` | 안 씁니다. 그 위젯을 쓰는 화면 전체에 걸립니다 |
| `.pg_x__root { & .ant-tree-title { } }` | 씁니다. 그 인스턴스에만 걸립니다 |
| `.pg_x__root { & .wg_chartCard__caption { } }` | 씁니다 |
| `.pg_x__button:hover .pg_x__box { }` | 내 클래스끼리라 대상이 아닙니다 |

판정은 **선택자가 내 식별자로 시작하는지**입니다.
소유 관계를 따로 조사하지 않습니다.
`.pg_x__root .ant-tree-title`처럼 바깥에서 이어 쓰지도 않습니다.
최상위 블록을 열고 그 안에서 `&`로 씁니다.
한 소유자의 덮어쓰기가 한 블록에 모이면 라이브러리를 올릴 때 볼 곳이 한 군데뿐입니다.

결합자 개수는 제한하지 않습니다.
남의 DOM 깊이는 우리가 정할 수 없습니다.
`.ant-table-thead > tr > th`가 라이브러리의 구조라면 그것이 경로입니다.
경로가 길면 `selector-limit-nesting-block-depth`에 따라 한 줄로 씁니다.

우리 코드는 그 파일에서 고치는 편이 낫습니다.
`ownership-change-other-owners-through-their-api`를 먼저 보고, 거기 안 맞으면 여기로 옵니다.

기계 검증은 디렉터리별 `selector-disallowed-list`입니다.
`page/` 아래는 `/^\.(wg|ui)_/`와 `/^\.(ant|rc|tippy|Mui)-/`를 막습니다.
중첩이 한 겹이라 블록 안 선택자는 `&`로 시작해서 걸리지 않습니다.

**Incorrect (최상위 블록 없이 라이브러리 클래스를 바로 씀):**

```css
.ant-tree-node-content-wrapper {
	border-radius: 4px;
}

.ant-btn-icon {
	color: #8c8c8c;
}
```

**Incorrect (최상위 블록 없이 다른 `scope_slug`의 클래스를 바로 씀):**

```css
/* page/detail/pg-detail.css */
.wg_chartCard__caption {
	color: #8c8c8c;
}

.ui_card__title {
	font-size: 13px;
}
```

**Incorrect (최상위 블록을 열지 않고 바깥에서 이어 씀):**

```css
.pg_treePanel__root .ant-tree-title {
	color: #8c8c8c;
}
```

**Correct (내 최상위 블록 안에서 외부 라이브러리 DOM을 겨냥):**

```css
.pg_treePanel__root {
	& .ant-tree-node-content-wrapper {
		display: inline-flex;
		border-radius: 4px;
	}

	& .ant-tree-title {
		color: #8c8c8c;
	}
}
```

**Correct (겨냥할 노드가 많으면 같은 블록 안에 선택자를 늘림):**

```css
.pg_orderTable__root {
	& .ant-table-thead .ant-table-cell {
		font-weight: 600;
		background: #fafafa;
	}

	& .ant-table-tbody .ant-table-cell {
		padding: 8px 12px;
	}

	& .ant-table-thead > tr > th {
		border-bottom: 2px solid #d9d9d9;
	}
}
```

**Correct (다른 `scope_slug`의 클래스도 내 최상위 블록 안에서 겨냥):**

```css
/* page/detail/pg-detail.css */
.pg_detail__chartSlot {
	min-height: 240px;

	& .wg_chartCard__caption {
		letter-spacing: 0.02em;
	}
}
```

**Correct (중첩된 자손까지 걸리면 안 될 때 직계로 좁힘):**

```css
.pg_treePanel__toolbar {
	& > .ant-btn > .ant-btn-icon {
		color: #8c8c8c;
	}
}
```

### 2.4 Expose Only a Root Class From Other Owners

**Rule:** `C08` · `ownership-change-other-owners-through-their-api`

**Applies when:** 다른 컴포넌트의 배치나 내부 표현을 바꿔야 할 때. 컴포넌트에 클래스 관련 프롭을 추가할 때.

**Review with:** `composition-inject-classes-only-at-the-entry-point`, `ownership-use-foreign-classes-only-under-your-own-root`

**Impact: HIGH (내부 노드로 가는 클래스 프롭을 막고 배치, 변형, 강등 가운데 무엇이 맞는지 먼저 봅니다)**

바꿀 것이 남의 표현이면 세 갈래를 순서대로 봅니다.

| 상황 | 방법 | 비용 |
| --- | --- | --- |
| 최상위 배치만 다름 | 사용처가 `className`을 넘기고 자기 클래스로 스타일 | 사용처 1곳 |
| 여러 화면이 쓰고 하나만 내부가 다름 | 그 소유자가 수정자를 노출 | 소유자 파일 2줄 + 사용처 1줄 |
| 이 화면만 씀 | 화면 폴더 안으로 내림 | 파일 이동과 접두사 이름 변경 |

세 행에 안 맞으면 `ownership-use-foreign-classes-only-under-your-own-root`에 따라
내 최상위 블록 안에서 겨냥합니다.
**막다른 길이 아니라 마지막 선택지입니다.**

셋째 행이 흔히 놓치는 답입니다.
한 화면만 쓰는 컴포넌트는 위젯이 아닙니다.
승격 기준은 맥락 독립성입니다.
내릴 때 프롭을 열지 않습니다.
파일만 옮깁니다.

`className`이 최상위까지만 닿는 것은 제약이 아니라 경계입니다.
컴포넌트가 무엇을 노출하는지는 `composition-inject-classes-only-at-the-entry-point`가 정합니다.

**Incorrect (내부 노드마다 클래스 프롭을 열어 남이 스타일을 넣게 함):**

```tsx
<WgChartCard
	className={styles.card}
	captionClassName={styles.caption}
	titleClassName={styles.title}
/>
```

**Correct (최상위 배치는 사용처가 자기 클래스로 잡음):**

```tsx
<WgChartCard className="pg_detail__chartCard" />
```

```css
/* page/detail/pg-detail.css */
.pg_detail__chartCard {
	grid-area: chart;
	margin-block-end: 16px;
}
```

**Correct (여러 화면이 쓰는 변형은 소유자가 수정자로 노출함):**

```tsx
<WgChartCard tone="muted" />
```

```css
/* widget/chart-card/wg-chart-card.css */
.wg_chartCard__caption--muted {
	color: #8c8c8c;
}
```

**Correct (이 화면만 다르면 화면 안으로 내려 소유자를 하나로 만듦):**

```txt
before
  widget/chart-card/wg-chart-card.tsx      여러 화면이 쓰지 않음
  widget/chart-card/wg-chart-card.css      pg_detail 만 내부를 override 하고 있었음

after
  page/detail/component/pg-chart-card.tsx
  page/detail/component/pg-chart-card.css  pg_chartCard__* 로 owner 하나
```

## 3. Class Composition in TSX

**Impact: HIGH**

TSX 클래스 조합과 래퍼 소유 규칙은 스타일링 경계를 분명하게 유지하고, UI 래퍼가 통제되지 않은 스타일 연결 지점을 노출하는 것을 막습니다.

### 3.1 Compose Classes With `clsx()`

**Rule:** `C09` · `composition-compose-classes-with-clsx`

**Applies when:** TSX의 `className`을 추가·수정할 때. 기본 클래스, 수정자, 선택 클래스를 함께 엮을 때.

**Impact: HIGH (기본 클래스와 상태 수정자를 섞어도 TSX 조립이 한눈에 읽힙니다)**

TSX에서 `className`은 `clsx()`로 조립합니다.
문자열을 이어 붙이거나 삼항 연산자를 겹쳐 쓰지 않습니다.

클래스가 하나일 때도 `clsx()`를 씁니다.
수정자가 붙는 순간 문자열 연결로 되돌아가는 변경을 막습니다.
그리고 `className` 형태가 파일마다 갈리지 않아서 검색과 리뷰가 한 패턴만 봅니다.

**Incorrect (문자열 연결로 클래스 조합을 숨김):**

```tsx
<button className={"pg_catalogIndex__listButton " + (isActive ? "pg_catalogIndex__listButton--active" : "")}>
	저장
</button>
```

**Correct (기본 클래스와 수정자를 `clsx()`로 조합):**

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

### 3.2 Use Modifiers Only for States and Repeated Variants

**Rule:** `C10` · `composition-do-not-build-structural-variants-with-modifiers`

**Applies when:** 수정자를 추가·변경할 때. 여러 곳에서 쓰이는 변형인지 한 곳만의 보정인지 가릴 때.

**Review with:** `naming-name-elements-and-modifiers-by-role`

**Impact: HIGH (수정자가 두 번째 레이아웃 이름 체계로 자라지 않게 막습니다)**

수정자는 두 가지만 표현합니다.

| 쓰는 자리 | 예 |
| --- | --- |
| 켜지고 꺼지는 상태 | `--active`, `--selected`, `--disabled`, `--error`, `--hidden` |
| 여러 곳에서 반복되는 모양 | `--dense`, `--compact`, `--horizontal` |

한 곳에서만 필요한 여백이나 배치 보정에는 쓰지 않습니다.
`--compactTop`, `--marginLeft0`, `--alignRight`처럼 그 화면 하나를 고치려고 붙이는 이름이 여기 해당합니다.
그런 보정은 수정자가 아니라 **역할 이름을 가진 별도 요소 클래스**로 풉니다.

갈리는 기준은 하나입니다.

> 이 수정자를 다른 화면에서도 같은 이름으로 쓸 수 있는가?

쓸 수 있으면 반복되는 모양이라 허용합니다.
그 화면에서만 통하는 이름이면 이미 위치 정보를 담고 있으니 요소로 바꿉니다.

**Incorrect (그 화면 하나를 고치려고 수정자를 붙임):**

```tsx
<div className={clsx("pg_catalogDetail__section", "pg_catalogDetail__section--compactTop")} />
<div className={clsx("pg_catalogDetail__aside", "pg_catalogDetail__aside--marginLeft0")} />
```

**Correct (한 곳만의 보정은 역할 이름을 가진 요소로 분리):**

```tsx
<div className={clsx("pg_catalogDetail__detailSection")} />
<div className={clsx("pg_catalogDetail__flushAside")} />
```

**Correct (상태와 반복되는 모양만 수정자로):**

```tsx
<div className={clsx("ui_table__root", isDense && "ui_table__root--dense")} />
<div className={clsx("pg_catalogIndex__row", isSelected && "pg_catalogIndex__row--selected")} />
```

### 3.3 Keep Classes Single-purpose

**Rule:** `C11` · `composition-keep-classes-single-purpose`

**Applies when:** 기존 클래스가 기본과 상태·변형 책임을 함께 갖거나 독립 시각 책임을 추가·재사용·분리할 때. 제외: 기존 결합 책임을 그대로 두고 처음부터 단일 책임 쌍을 만들거나 책임이 그대로인 이름 변경만 하는 경우.

**Impact: HIGH (클래스 하나가 기본 스타일과 상태 의미를 함께 지면 상태를 끌 방법이 없습니다)**

클래스 하나는 시각 책임 하나만 집니다.
기본 스타일과 상태를 이름 하나에 녹이지 않습니다.
한 클래스를 서로 다른 시각 책임에 돌려 쓰지도 않습니다.

`listButtonActive`처럼 상태를 이름에 녹이면 기본만 필요한 곳에서 재사용할 수 없고 상태를 끄는 방법도 없습니다.
기본 클래스와 `--수정자`를 따로 두면 둘 다 해결됩니다.

수정자가 상태를 표현할 자격이 있는지는 `composition-do-not-build-structural-variants-with-modifiers`가 판정합니다.

**Incorrect (상태 의미를 별도 클래스 역할처럼 합쳐 버림):**

```tsx
<div className={clsx("pg_catalogIndex__listButtonActive")} />
```

**Correct (기본 클래스와 상태 수정자를 분리):**

```tsx
<div className={clsx("pg_catalogIndex__listButton", isActive && "pg_catalogIndex__listButton--active")} />
```

### 3.4 Inject Classes Only at the Component Entry Point

**Rule:** `C12` · `composition-inject-classes-only-at-the-entry-point`

**Applies when:** 우리가 만든 컴포넌트에 `className`이나 클래스 관련 프롭을 추가할 때. 그 컴포넌트 내부 노드의 모양을 화면마다 다르게 해야 할 때. 제외: 기존 CSS 최상위 블록 아래 외부 라이브러리 선택자만 고치는 경우.

**Review with:** `ownership-change-other-owners-through-their-api`, `ownership-use-foreign-classes-only-under-your-own-root`

**Impact: HIGH (내부 노드마다 창구를 열면 사용처가 그 컴포넌트 구조에 묶입니다)**

우리가 만든 컴포넌트가 여는 스타일 창구는 **진입점 하나**입니다.
`ui_`든 `wg_`든 `pg_`든 같습니다.
외부에서 주입하는 클래스는 그 컴포넌트의 최상위까지만 닿습니다.

컴포넌트는 받은 `className`을 자기 최상위 클래스와 `clsx()`로 합칩니다.
사용처는 그 클래스로 배치, 여백, 크기만 줍니다.

`headerClassName`, `itemClassName`처럼 내부 노드로 가는 클래스 프롭을 늘리지 않습니다.
창구가 늘어나면 사용처가 내부 구조를 알게 되고, 내부가 바뀔 때 사용처가 함께 깨집니다.

내부 모양이 화면마다 달라야 하면 컴포넌트가 `variant` 프롭을 받아 처리합니다.
변형은 최상위뿐 아니라 머리말이나 본문처럼 필요한 노드에 각각 수정자로 붙입니다.
최상위에 수정자 하나만 붙이고 내부를 결합자로 잡지 않습니다.

받은 `className`을 내부 노드로 넘기지 않습니다.

사용처 쪽에서 무엇을 고를지는 `ownership-change-other-owners-through-their-api`가 정하고,
`className`을 받지 않는 컴포넌트를 어떻게 다룰지는 `composition-do-not-add-wrapper-elements-for-styling`이 정합니다.

**Incorrect (내부 노드마다 클래스 프롭을 열어 창구를 늘림):**

```tsx
export interface UiCollapseProps {
	className?: string;
	headerClassName?: string;
	titleClassName?: string;
	contentClassName?: string;
}
```

**Incorrect (받은 `className`을 내부 노드로 넘김):**

```tsx
export const UiCollapse = (props: UiCollapseProps) => {
	return (
		<div className={clsx("ui_collapse__root")}>
			<button className={clsx("ui_collapse__header", props.className)} type="button">
				{props.title}
			</button>
			<div className={clsx("ui_collapse__content")}>{props.children}</div>
		</div>
	);
};
```

**Incorrect (변형을 최상위에만 붙이고 내부를 결합자로 잡음):**

```css
.ui_collapse__root--compact .ui_collapse__header {
	padding: 6px 8px;
}

.ui_collapse__root--compact .ui_collapse__title {
	font-size: 13px;
}
```

**Correct (`className`은 최상위 클래스와 합치고, 변형은 필요한 노드마다 수정자로 붙임):**

```tsx
export interface UiCollapseProps {
	className?: string;
	variant?: "default" | "compact";
	title: ReactNode;
	children: ReactNode;
}

export const UiCollapse = (props: UiCollapseProps) => {
	const isCompact = props.variant === "compact";

	return (
		<div className={clsx("ui_collapse__root", isCompact && "ui_collapse__root--compact", props.className)}>
			<button className={clsx("ui_collapse__header", isCompact && "ui_collapse__header--compact")} type="button">
				<span className={clsx("ui_collapse__title", isCompact && "ui_collapse__title--compact")}>{props.title}</span>
			</button>
			<div className={clsx("ui_collapse__content", isCompact && "ui_collapse__content--compact")}>{props.children}</div>
		</div>
	);
};
```

```css
.ui_collapse__header {
	padding: 12px 16px;
}

.ui_collapse__header--compact {
	padding: 6px 8px;
}

.ui_collapse__title--compact {
	font-size: 13px;
}
```

**Correct (사용처는 최상위 스타일만 주고 내부 의도는 프롭으로 넘김):**

```tsx
<UiCollapse className={clsx("pg_postFilterDialog__collapse")} variant="compact" title="필터">
	<PgPostFilterFields />
</UiCollapse>
```

```css
.pg_postFilterDialog__collapse {
	margin-top: 16px;
	width: 100%;
}
```

### 3.5 Do Not Add Wrapper Elements for Styling

**Rule:** `C13` · `composition-do-not-add-wrapper-elements-for-styling`

**Applies when:** 스타일을 주려고 `div`나 `span`을 새로 감쌀 때. `className`을 받지 않는 컴포넌트에 여백이나 크기를 줘야 할 때.

**Review with:** `composition-inject-classes-only-at-the-entry-point`, `naming-name-elements-and-modifiers-by-role`

**Impact: MEDIUM-HIGH (래핑 요소는 부모 레이아웃 계산을 바꾸고 역할 없는 클래스를 늘립니다)**

스타일을 주려고 요소를 새로 감싸지 않습니다.
그 컴포넌트가 `className`을 받도록 먼저 고칩니다.

- 래핑 `div` 하나가 부모의 `flex`나 `grid` 자식 수를 바꿉니다.
  `gap`, `:nth-child()`, `grid-auto-flow`가 함께 흔들립니다.
- 역할 없는 클래스가 하나 늘어납니다.
  `naming-name-elements-and-modifiers-by-role`이 역할 이름을 요구하는데 줄 이름이 없습니다.
- 우리가 만든 컴포넌트면 `className` 계약을 언제든 추가합니다.

래핑이 마지막 수단으로 남는 경우는 하나입니다.

> **외부 라이브러리 컴포넌트가 `className`을 받지 않을 때**

그때는 래퍼에 역할 이름을 붙이고 왜 감쌌는지 주석으로 남깁니다.

**Incorrect (래핑 `div`로 최상위 스타일을 우회):**

```tsx
<div className="pg_postIndex__collapseWrap">
	<UiCollapse items={items} />
</div>
```

```css
.pg_postIndex__collapseWrap {
	margin-block-end: 16px;
}
```

**Incorrect (역할 없는 이름의 래퍼를 늘림):**

```tsx
<div className="pg_postIndex__box">
	<div className="pg_postIndex__inner">
		<UiSearchInput />
	</div>
</div>
```

**Correct (우리 컴포넌트면 `className` 계약을 추가):**

```tsx
export interface UiCollapseProps {
	className?: string;
	items: UiCollapseItem[];
}

export const UiCollapse = (props: UiCollapseProps) => (
	<div className={clsx("ui_collapse__root", props.className)}>{/* … */}</div>
);
```

```tsx
<UiCollapse className="pg_postIndex__collapse" items={items} />
```

```css
.pg_postIndex__collapse {
	margin-block-end: 16px;
}
```

**Correct (외부 라이브러리가 `className`을 받지 않으면 역할 이름을 붙여 감쌈):**

```tsx
{/* LegacyDatePicker 는 className 을 받지 않아 배치용 래퍼가 필요하다 */}
<div className="pg_postIndex__dateField">
	<LegacyDatePicker value={value} onChange={handleChange} />
</div>
```

```css
.pg_postIndex__dateField {
	flex: 1;
	min-width: 0;
}
```

## 4. Selectors and Declaration Placement

**Impact: HIGH**

겨냥 대상이 코드에 그대로 쓰여 있고 한 클래스의 선언이 한 블록에 모여 있어야, 스타일을 고칠 때 읽을 선택자와 볼 블록이 각각 하나로 정해집니다.

### 4.1 Limit Nesting to One Level and Write the Rest Inline

**Rule:** `C14` · `selector-limit-nesting-block-depth`

**Applies when:** 중첩 `{}` 블록을 추가하거나 기존 블록을 펼치거나 합칠 때. `&`로 조건이나 가상 요소를 붙일 때.

**Review with:** `selector-declare-each-class-in-one-block`, `selector-use-classes-instead-of-element-selectors`

**Impact: HIGH (중첩이 늘 한 겹이라 실제 선택자가 코드에 그대로 보입니다)**

**중첩**은 `{}`를 겹치는 것입니다.
규칙은 하나입니다.

> 중첩은 항상 한 겹이고, `&`도 한 선택자에 한 번입니다.

`&`는 **그 블록이 소유한 요소 하나**를 가리킵니다.
그 요소에 조건이나 가상 요소를 붙일 때만 `&`를 씁니다.
다른 요소로 내려가면 `&`를 다시 열지 않고 같은 선택자 줄에 이어 씁니다.

- `.box { &::before { } }` — `.box` 자신의 가상 요소라서 `&`입니다.
- `.button { &:hover .box::before { } }` — 이 `::before`는 `.box`의 것이라 `&`로 쓸 수 없습니다.

그래서 `&`를 어디에 쓸지 고르지 않습니다.
**어느 요소를 가리키느냐가 정합니다.**
"언제는 중첩, 언제는 한 줄"이 아니라 한 겹까지가 중첩이고 그다음은 늘 한 줄입니다.

중첩을 두 겹 이상 열면 실제 선택자가 숨습니다.
`.pg_a { & .pg_b { & .pg_c { } } }`에 쓰인 선택자는 `& .pg_c`뿐이어서
`.pg_a .pg_b .pg_c`로 이어지는 것이 보이지 않습니다.
검사 도구도 각 블록만 봅니다.

기계 검증은 `max-nesting-depth: 1`입니다.
최상위가 0단입니다.

**Incorrect (중첩을 두 겹 이상 열어 실제 선택자를 숨김):**

```css
.pg_salesPanel__spreadButton {
	&.MuiButtonBase-root {
		&:hover {
			.pg_salesPanel__spreadBox {
				border-color: #9fadc7;
			}
		}
	}
}
```

**Incorrect (다른 요소의 pseudo-element를 `&`로 다시 엶):**

```css
.pg_salesPanel__spreadButton {
	&:hover .pg_salesPanel__spreadBox {
		&::before {
			border-color: #9fadc7;
		}
	}
}
```

**Correct (`&`는 한 번, 그다음 경로는 같은 줄에 이어 씀):**

```css
.pg_salesPanel__spreadBox {
	&::before {
		content: '';
		width: 18px;
		height: 18px;
		border: 2px solid #ced4da;
		background: #fff;
	}
}

.pg_salesPanel__spreadButton {
	&.MuiButtonBase-root {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	&:hover .pg_salesPanel__spreadBox::before {
		border-color: #9fadc7;
	}
}
```

**Correct (외부 라이브러리 경로도 깊이와 무관하게 한 줄로 씀):**

```css
.pg_orderTable__root {
	& .ant-table-thead > tr > th {
		border-bottom: 2px solid #d9d9d9;
	}
}
```

### 4.2 Use Classes Instead of Element Selectors

**Rule:** `C15` · `selector-use-classes-instead-of-element-selectors`

**Applies when:** `p`, `h2`, `span`, `button` 같은 요소 선택자를 쓰려 할 때. `dangerouslySetInnerHTML`이나 Markdown 렌더러 출력을 스타일링할 때.

**Review with:** `naming-name-elements-and-modifiers-by-role`

**Impact: MEDIUM (태그만 바꿔도 스타일이 사라지므로 우리가 렌더하는 마크업에는 클래스를 붙입니다)**

우리가 렌더하는 마크업에는 요소 선택자를 쓰지 않습니다.
클래스를 붙입니다.

`div`를 `section`으로, `span`을 `p`로 바꾸는 것만으로 스타일이 사라집니다.
그 변경은 TSX에서 일어나고 CSS 파일에는 흔적이 남지 않습니다.

요소 선택자를 쓸 수 있는 경우는 하나입니다.

> **우리가 그 마크업을 쓰지 않아서 클래스를 붙일 수 없을 때**

`dangerouslySetInnerHTML`, Markdown 렌더러, 리치 텍스트 에디터 출력이 여기 해당합니다.
TSX에서 그 지점이 보이므로 "이게 원본 HTML인가"를 따질 필요가 없습니다.

- 그때도 감싼 클래스 블록 안에서만 씁니다.
  블록 바깥에 `h2 { }`를 두면 그 화면 모든 `h2`에 걸립니다.
- `:first-child` 같은 구조 선택자도 같습니다.
  우리가 렌더하면 클래스를 붙입니다.

`selector-disallowed-list`가 중첩 안 요소 선택자를 막습니다.
그래서 이 예외를 쓸 때는 `stylelint-disable-next-line` 주석이 필요합니다.
드문 경우이므로 그 주석이 곧 "여기는 우리가 쓰지 않는 마크업"이라는 표시가 됩니다.

**Incorrect (우리가 렌더하는 마크업을 요소 선택자로 겨냥함):**

```css
.pg_catalogIndex__toolbar {
	& button {
		height: 32px;
	}

	& > div {
		flex: 1;
	}

	& > :first-child {
		margin-inline-start: 0;
	}
}
```

**Incorrect (요소 선택자를 최상위에 둠):**

```css
.wg_productDetail__prose h2 {
	margin: 24px 0 12px;
}
```

**Correct (우리가 렌더하면 클래스를 붙임):**

```tsx
<div className="pg_catalogIndex__toolbar">
	<div className="pg_catalogIndex__toolbarField">
		<UiSearchInput />
	</div>
	<button type="button" className="pg_catalogIndex__toolbarButton">
		초기화
	</button>
</div>
```

```css
.pg_catalogIndex__toolbarField {
	flex: 1;
}

.pg_catalogIndex__toolbarButton {
	height: 32px;
}
```

**Correct (마크업을 우리가 쓰지 않으면 래퍼 블록 안에서 요소 선택자를 씀):**

```tsx
<div
	className="wg_productDetail__prose"
	dangerouslySetInnerHTML={{__html: product.bodyHtml}}
/>
```

```css
/* stylelint-disable selector-disallowed-list -- dangerouslySetInnerHTML 로 들어온 마크업 */
.wg_productDetail__prose {
	& h2 {
		margin: 24px 0 12px;
		font-size: 18px;
	}

	& p {
		margin: 0 0 12px;
		line-height: 1.7;
	}

	& > :first-child {
		margin-top: 0;
	}
}
/* stylelint-enable selector-disallowed-list */
```

### 4.3 Do Not Group Classes With Commas to Share Declarations

**Rule:** `C16` · `selector-do-not-group-classes-with-commas`

**Applies when:** 여러 클래스가 같은 선언을 반복해 `,`로 묶으려 할 때. 한 대상에 진입 조건이 여럿일 때.

**Review with:** `selector-declare-each-class-in-one-block`, `values-tokenize-repeated-visual-values`

**Impact: MEDIUM-HIGH (공통 선언을 묶지 않고 각 클래스에 두면 한 클래스를 한 곳에서 읽습니다)**

여러 클래스를 `,`로 묶어 공통 선언을 공유하지 않습니다.
반복되는 선언은 각 클래스 블록에 그대로 씁니다.
**중복을 감수합니다.**

- 묶으면 한 클래스를 알기 위해 두 곳을 읽고, 그 클래스가 목록에 있는지도 확인해야 합니다.
- 클래스를 추가·삭제할 때마다 목록도 함께 고쳐야 합니다.
- 값을 지역 변수로 빼서 묶는 것도 같은 문제입니다.
  `values-tokenize-repeated-visual-values`가 막습니다.

한 대상에 진입 조건이 여럿이어도 같습니다.
조건마다 블록을 따로 열고 선언을 그대로 씁니다.
`:is()`로 묶지도 않습니다.
묶는 방법을 둘로 두면 언제 어느 쪽인지 다시 판단해야 합니다.

`@media`나 `@supports` 안에서 같은 클래스를 다시 선언하는 것은 이 규칙의 대상이 아닙니다.

기계 검증은 `no-duplicate-selectors`의 `disallowInList: true`입니다.

**Incorrect (`,`로 공통 선언을 묶고 아래에서 일부만 다시 엶):**

```css
.pg_salesPanel__glyph--line,
.pg_salesPanel__glyph--dashed,
.pg_salesPanel__glyph--pin,
.pg_salesPanel__glyph--band {
	width: 24px;
	height: 24px;
}

.pg_salesPanel__glyph--band {
	background: rgb(140 152 160 / 12%);
}
```

**Incorrect (한 대상의 진입 조건을 `,`로 나열):**

```css
.pg_salesPanel__spreadButton {
	&:hover .pg_salesPanel__spreadBox,
	&.Mui-focusVisible .pg_salesPanel__spreadBox {
		border-color: #9fadc7;
	}
}
```

**Correct (각 클래스가 자기 선언을 전부 가짐):**

```css
.pg_salesPanel__glyph--line {
	width: 24px;
	height: 24px;
}

.pg_salesPanel__glyph--dashed {
	width: 24px;
	height: 24px;
}

.pg_salesPanel__glyph--pin {
	width: 24px;
	height: 24px;
}

.pg_salesPanel__glyph--band {
	width: 24px;
	height: 24px;
	background: rgb(140 152 160 / 12%);
}
```

**Correct (진입 조건마다 블록을 따로 열고 선언을 그대로 씀):**

```css
.pg_salesPanel__spreadButton {
	&:hover .pg_salesPanel__spreadBox {
		border-color: #9fadc7;
	}

	&.Mui-focusVisible .pg_salesPanel__spreadBox {
		border-color: #9fadc7;
	}
}
```

### 4.4 Declare Each Class in One Block

**Rule:** `C17` · `selector-declare-each-class-in-one-block`

**Applies when:** 이미 선언한 클래스에 스타일을 더 추가할 때. 파일 아래쪽에서 위쪽 선언을 덮어쓰려 할 때.

**Review with:** `selector-do-not-group-classes-with-commas`

**Impact: MEDIUM-HIGH (한 클래스의 선언이 한 블록에 모여 고칠 때 볼 곳이 한 군데입니다)**

한 클래스의 선언은 파일 안 한 블록에만 있습니다.
같은 클래스를 여러 곳에서 다시 열어 선언을 나누지 않습니다.

- 고칠 때 볼 블록이 하나로 정해집니다.
  아래에 덮어쓰기가 더 있는지 찾지 않습니다.
- 선언 순서에 의존하는 덮어쓰기가 생기지 않습니다.
  블록을 옮겨도 결과가 같습니다.
- 기본 클래스와 수정자는 서로 다른 클래스이므로 각자 자기 블록을 갖습니다.

`,` 묶음으로 선언을 나누는 형태는 `selector-do-not-group-classes-with-commas`가 막습니다.
이 규칙은 묶음 없이 같은 클래스를 두 번 여는 경우를 막습니다.

`@media`나 `@supports` 안의 재선언은 대상이 아닙니다.
조건이 다른 별개 블록입니다.

기계 검증은 `no-duplicate-selectors`입니다.

**Incorrect (같은 클래스를 파일 두 곳에서 열어 선언 순서에 의존함):**

```css
.pg_catalogIndex__toolbar {
	display: flex;
	gap: 12px;
	padding: 8px;
}

.pg_catalogIndex__row {
	background: #f5f5f5;
}

.pg_catalogIndex__toolbar {
	padding: 12px 16px;
}
```

**Correct (한 블록에 모으고 최종 값만 남김):**

```css
.pg_catalogIndex__toolbar {
	display: flex;
	gap: 12px;
	padding: 12px 16px;
}

.pg_catalogIndex__row {
	background: #f5f5f5;
}
```

**Correct (조건이 다르면 별개 블록으로 둠):**

```css
.pg_catalogIndex__toolbar {
	display: flex;
	gap: 12px;
	padding: 12px 16px;
}

@media (width < 768px) {
	.pg_catalogIndex__toolbar {
		padding: 8px;
	}
}
```

### 4.5 Use Pseudo-classes for DOM-owned States

**Rule:** `C18` · `selector-use-pseudo-classes-for-dom-owned-states`

**Applies when:** `:hover`, `:visited`, `:focus*`, `:disabled`, `:checked`를 추가·수정할 때. 조상의 DOM 상태가 자손 스타일에 영향을 줄 때.

**Requires selected:** `values-separate-domain-state-modifiers-from-dom-interaction-states` · 함께 적용

**Impact: HIGH (브라우저가 주는 상호작용 상태와 앱이 정하는 상태 수정자를 나눕니다)**

브라우저와 DOM이 직접 부여하는 상태는 같은 클래스 블록 안 `&:`로 표현합니다.
화면이나 도메인이 정하는 상태는 수정자 클래스로 떼어 냅니다.

| 소유 | 상태 | 표현 |
| --- | --- | --- |
| DOM | `:hover`, `:visited`, `:focus-visible`, `:disabled`, `:checked` | 같은 블록 안 `&:` |
| 앱 | `selected`, `active`, `error`, `expanded`, `current` | `--수정자` 클래스 |

갈리는 기준은 **누가 그 값을 아는가**입니다.
브라우저가 부여하는 상태는 앱이 알 수 없고, 앱이 아는 상태는 브라우저가 알 수 없습니다.

- 앱이 아는 상태를 `[aria-selected="true"]`처럼 속성으로 겨냥하지 않습니다.
- `aria-*`는 접근성 계약이라 마크업에 그대로 두고, 스타일은 수정자로 겨냥합니다.
- 같은 상태를 두 표기로 쓰지 않습니다.
  어느 쪽이 참인지 가릴 수 없습니다.

가상 클래스를 어디에 쓰는지는 `selector-nest-dom-state-in-the-owning-block`이 정합니다.
`:not(.--수정자)` 반전은 `selector-do-not-invert-domain-state-with-not`이 막습니다.

**Incorrect (앱이 아는 상태를 속성 선택자로 겨냥함):**

```css
.pg_assetIndex__card {
	&[aria-selected="true"] {
		border-color: #1677ff;
	}
}

.pg_assetIndex__row {
	&[data-expanded="true"] {
		background: #f5f5f5;
	}
}
```

**Incorrect (같은 상태를 속성과 수정자 두 표기로 씀):**

```css
.pg_assetIndex__card--selected {
	border-color: #1677ff;
}

.pg_assetIndex__card[aria-selected="true"] {
	box-shadow: 0 0 0 1px #1677ff;
}
```

**Correct (`aria-*`는 마크업에 두고 스타일은 수정자로 겨냥):**

```tsx
<button
	type="button"
	aria-selected={isSelected}
	className={clsx("pg_assetIndex__card", isSelected && "pg_assetIndex__card--selected")}
>
	{asset.name}
</button>
```

```css
.pg_assetIndex__card {
	border: 1px solid #d9d9d9;

	&:disabled {
		opacity: 0.5;
	}
}

.pg_assetIndex__card--selected {
	border-color: #1677ff;
}
```

### 4.6 Nest DOM State Pseudo-classes in the Owning Block

**Rule:** `C19` · `selector-nest-dom-state-in-the-owning-block`

**Applies when:** `:hover`, `:focus-visible`, `:disabled`, `:checked` 스타일을 추가·수정할 때. 조상의 DOM 상태가 자손 스타일을 바꿔야 할 때.

**Review with:** `selector-do-not-group-classes-with-commas`, `selector-limit-nesting-block-depth`, `selector-use-pseudo-classes-for-dom-owned-states`

**Impact: HIGH (한 요소의 기본 모습과 상태 변화를 한 블록에서 나란히 읽습니다)**

DOM 상태 가상 클래스는 그 요소의 클래스 블록 안에서 `&:`로 씁니다.
같은 가상 클래스를 블록 바깥에서 다시 열지 않습니다.

- 기본 모습과 상태 변화가 한 블록에 있어서 무엇이 어떻게 바뀌는지 바로 읽힙니다.
- 파일 어디에 상태 스타일이 더 있는지 찾지 않습니다.
- 여러 상태가 같은 선언을 쓰면 상태마다 블록을 따로 엽니다.
  `,`도 `:is()`도 쓰지 않습니다.

조상의 DOM 상태가 자손을 바꿔야 하면 식별자가 같은 자손을 결합자 하나로 겨냥합니다.
자손의 `:hover`는 포인터가 자손 위에 있을 때만 걸려서 조상 상태를 알 방법이 없고,
CSS에 부모 선택자가 없어서 대체 수단이 없습니다.

자손의 기본 블록은 조상 규칙보다 **앞에** 둡니다.
뒤에 두면 명시도가 낮은 규칙이 높은 규칙 뒤에 오고, `no-descending-specificity`가 이를 잡습니다.

지역 사용자 정의 속성으로 상태를 전달하지 않습니다.
`values-tokenize-repeated-visual-values`가 막습니다.

기계 검증은 `max-nesting-depth: 1`과 `no-descending-specificity`입니다.

**Incorrect (pseudo-class를 최상위 선택자로 다시 엶):**

```css
.wg_siteHeader__brandLink {
	color: #1677ff;
}

.wg_siteHeader__brandLink:hover {
	color: #0958d9;
}

.wg_siteHeader__brandLink:focus-visible {
	outline: 2px solid #1677ff;
}
```

**Incorrect (조상 상태를 지역 변수로 자손에 전달함):**

```css
.wg_siteHeader__brandMark {
	transform: rotate(var(--wg-header-mark-tilt));
}

.wg_siteHeader__brandLink {
	--wg-header-mark-tilt: 0deg;

	&:hover {
		--wg-header-mark-tilt: -2deg;
	}
}
```

**Correct (상태를 같은 블록 안 `&:`로 접고 상태마다 블록을 따로 엶):**

```css
.wg_siteHeader__brandLink {
	color: #1677ff;

	&:hover {
		color: #0958d9;
	}

	&:focus-visible {
		color: #0958d9;
		outline: 2px solid #1677ff;
		outline-offset: 2px;
	}
}
```

**Correct (조상 상태가 자손을 바꾸면 같은 소유자 안에서 결합자 하나):**

```css
.wg_siteHeader__brandMark {
	transform: rotate(0deg);
}

.wg_siteHeader__brandLink {
	color: #1677ff;

	&:hover .wg_siteHeader__brandMark {
		transform: rotate(-2deg);
	}
}
```

### 4.7 Do Not Invert Domain State With `:not()`

**Rule:** `C20` · `selector-do-not-invert-domain-state-with-not`

**Applies when:** `:not(.--modifier)`로 앱 상태를 뒤집으려 할 때. 조상의 수정자가 자손의 모습을 정해야 할 것 같을 때.

**Review with:** `selector-use-pseudo-classes-for-dom-owned-states`

**Impact: HIGH (그 상태가 아닐 때의 모습을 기본 블록에 두면 부정 조건과 조상 의존이 함께 사라집니다)**

도메인 상태를 `:not(.--수정자)`로 뒤집지 않습니다.
그 상태가 아닐 때의 모습은 기본 블록에 두고, 그 상태일 때의 모습만 수정자 블록에 둡니다.

`:not()`이 나오는 원인은 하나입니다.

> 조상의 수정자로 자손의 모습을 정하려 했기 때문입니다.

조상이 자손을 결정하려면 조상이 "그 상태가 아님"을 알아야 합니다.
자손에 자기 수정자를 붙이면 부정 조건이 필요 없어집니다.

- 각 요소의 수정자가 그 요소의 모습을 전부 갖습니다.
- 앱이 아는 상태는 그 요소에 수정자로 씁니다.
  조상에서 다시 읽지 않습니다.
- `:not(:disabled)`처럼 DOM이 소유한 조건은 대상이 아닙니다.
  앱이 그 값을 알 수 없습니다.

무엇이 DOM 상태이고 무엇이 앱 상태인지는 `selector-use-pseudo-classes-for-dom-owned-states`가 정합니다.

**Incorrect (조상 수정자로 자손 모습을 정해 부정 조건과 중첩이 따라옴):**

```css
.pg_salesPanel__spreadButton:not(.pg_salesPanel__spreadButton--checked) {
	&.MuiButtonBase-root {
		&:hover {
			.pg_salesPanel__spreadBox::before {
				border-color: #9fadc7;
				box-shadow: 0 0 0 2px rgb(159 173 199 / 20%);
			}
		}
	}
}
```

**Correct (각 요소의 수정자가 그 요소의 모습을 가짐):**

```css
.pg_salesPanel__spreadBox {
	&::before {
		content: '';
		width: 18px;
		height: 18px;
		border: 2px solid #ced4da;
		border-radius: 4px;
		background: #fff;
	}
}

.pg_salesPanel__spreadBox--checked {
	&::before {
		border-color: #9fadc7;
		background: #9fadc7;
	}
}

.pg_salesPanel__spreadButton {
	&:hover .pg_salesPanel__spreadBox::before {
		border-color: #9fadc7;
		box-shadow: 0 0 0 2px rgb(159 173 199 / 20%);
	}

	&.Mui-focusVisible .pg_salesPanel__spreadBox::before {
		border-color: #9fadc7;
		box-shadow: 0 0 0 2px rgb(159 173 199 / 20%);
	}
}
```

**Correct (DOM이 소유한 조건은 그대로 `:not()`으로 씀):**

```css
.pg_assetIndex__cardButton {
	cursor: default;

	&:hover:not(:disabled) {
		cursor: pointer;
	}
}
```

## 5. Values, Layout, and Accessibility

**Impact: HIGH**

토큰, 변수 대체값, 명시적인 레이아웃 의도, 상태 경계, 눈에 보이는 포커스 표시는 스타일을 더 견고하고 접근 가능하게 유지합니다. 시각 결정은 인라인 `style`이 아니라 스타일시트에 남깁니다.

### 5.1 Keep Layout Intent Explicit

**Rule:** `C21` · `values-keep-layout-intent-explicit`

**Applies when:** `sticky`·`fixed`, `z-index`, 강제 `width`·`height` 또는 부모·자식 레이아웃 책임을 추가·변경할 때. 제외: 같은 요소를 기본과 수정자로 나누면서 기존 `display`·여백 선언을 값 그대로 옮기는 경우.

**Impact: MEDIUM-HIGH (DOM을 거슬러 올라가지 않고 sticky, fixed, 박스 책임을 파악합니다)**

레이아웃 의도는 클래스명과 선언만 보고 바로 읽혀야 합니다.
`position`, `width`, `height`를 억지로 고정하지 않고 부모와 자식의 레이아웃 책임을 나눕니다.

- `z-index`에는 숫자를 직접 쓰지 않고 층 토큰을 씁니다.
  토큰 이름이 곧 쌓임 순서 문서입니다.
- `sticky`나 `fixed`를 쓸 때는 기준 컨테이너를 주석 한 줄로 남깁니다.
  어느 조상이 스크롤 컨테이너인지는 선언에 안 보입니다.

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

### 5.2 Declare Core Tokens Once and Fall Back Everywhere Else

**Rule:** `C22` · `values-always-provide-css-variable-fallbacks`

**Applies when:** `var(--*)`를 새로 쓰거나 변수 이름이나 대체값을 바꿀 때. 공통 토큰 목록에 항목을 넣거나 뺄 때.

**Review with:** `values-tokenize-repeated-visual-values`

**Impact: HIGH (토큰이 빠지면 조용히 깨지지 않고 드러나며, 대체값이 매직 넘버로 번지지도 않습니다)**

프로젝트는 전역에서 항상 주입되는 **공통 토큰 목록**을 한 곳에 선언합니다.
`:root`나 전역 테마 스타일시트가 그 목록의 단일 출처입니다.

판정은 목록 대조로 끝냅니다.

| 대상 | 대체값 |
| --- | --- |
| 공통 토큰 목록에 있는 변수 | **쓰지 않습니다.** 빠진 것을 곧바로 드러냅니다 |
| 그 밖의 모든 `var()` | **씁니다.** 값이 없을 때 안전한 기본값을 둡니다 |

공통 토큰에 대체값을 붙이지 않는 이유는 `values-tokenize-repeated-visual-values`와 충돌하기 때문입니다.
`var(--app-space-3, 12px)`가 100곳에 있으면 `12px`을 100곳에 하드코딩한 것과 같아서 토큰화의 목적이 사라집니다.
값을 한 곳에서 바꾸려면 그 한 곳이 유일해야 합니다.

대체값이 필요한 곳은 프로젝트가 직접 주입하지 않는 경계입니다.
외부 라이브러리 래퍼 내부, 켜고 끄는 테마, 임시 오버레이, 조건부로만 주입되는 변수가 여기 해당합니다.

요청에 없는 CSS 변수를 이 규칙 때문에 새로 만들지 않습니다.

**Incorrect (공통 토큰에 대체값을 붙여 값을 두 곳으로 흩음):**

```css
.pg_postFilterDialog__panel {
	gap: var(--app-space-3, 12px);
	color: var(--app-color-text-primary, #212529);
}
```

**Incorrect (주입이 보장되지 않는 변수를 대체값 없이 씀):**

```css
.pg_postFilterDialog__collapse {
	& .ant-collapse-item {
		border-radius: var(--mk-size-radius-card);
	}
}
```

**Correct (공통 토큰은 대체값 없이, 그 밖은 대체값과 함께):**

```css
/* src/style/token.css — core token 목록의 단일 출처 */
:root {
	--app-space-3: 12px;
	--app-color-text-primary: #212529;
}
```

```css
/* src/page/post-index/component/pg-post-filter-dialog.css */
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

### 5.3 Use Global Tokens and Do Not Create Local Ones

**Rule:** `C23` · `values-tokenize-repeated-visual-values`

**Applies when:** 여러 파일이 같은 색, 간격, radius, 타이포, 그림자 값을 쓸 때. 새 사용자 정의 속성을 선언할 때.

**Review with:** `values-always-provide-css-variable-fallbacks`

**Impact: MEDIUM-HIGH (여러 파일이 쓰는 값은 전역 토큰으로 모으고 나머지는 선언 자리에 그대로 둡니다)**

판정 기준은 **파일 경계**입니다.

| 반복 범위 | 처리 |
| --- | --- |
| 여러 파일 | 전역 공통 토큰을 쓰거나, 없으면 공통 토큰 목록에 넣을지 검토합니다 |
| 한 파일 안 | 값을 그대로 둡니다 |

**지역 사용자 정의 속성은 만들지 않습니다.**
공통 토큰 목록에 없는 변수는 대체값이 필요해서 값이 결국 사용처에 남습니다.
읽는 사람은 선언을 한 번 더 찾아가야 하는데 바꿀 지점은 여전히 여러 곳이라 얻는 것이 없습니다.

조상 상태를 자손에 전달할 때도 변수를 쓰지 않고 결합자 하나로 자손을 겨냥합니다.
결합자를 쓸 범위는 `ownership-use-foreign-classes-only-under-your-own-root`이 정합니다.

선택자 쪽에서 같은 판단을 하는 규칙이 `selector-do-not-group-classes-with-commas`입니다.
여러 클래스를 `,`로 묶어 공통 선언을 빼지 않고 각 클래스에 중복으로 씁니다.

**Incorrect (한 파일 안 반복을 지역 변수로 감쌈):**

```css
.pg_catalogIndex__toolbar {
	--pg-catalog-gap: 12px;
	gap: var(--pg-catalog-gap, 12px);
}

.pg_catalogIndex__footer {
	gap: var(--pg-catalog-gap, 12px);
}
```

**Incorrect (상태 전달을 위해 지역 변수를 만듦):**

```css
.pg_catalogIndex__rowBadge {
	border-color: var(--pg-catalog-row-accent);
}

.pg_catalogIndex__row {
	--pg-catalog-row-accent: transparent;

	&:hover {
		--pg-catalog-row-accent: #1677ff;
	}
}
```

**Incorrect (여러 파일이 쓰는 값을 각 파일에 하드코딩):**

```css
/* pg-catalog-index.css */
.pg_catalogIndex__row {
	background: #f5f5f5;
}
```

```css
/* pg-catalog-detail.css */
.pg_catalogDetail__row {
	background: #f5f5f5;
}
```

**Correct (여러 파일이 쓰는 값은 전역 공통 토큰으로):**

```css
/* src/style/token.css */
:root {
	--app-color-fill-muted: #f5f5f5;
	--app-space-3: 12px;
}
```

```css
.pg_catalogIndex__row {
	background: var(--app-color-fill-muted);
}
```

**Correct (한 파일 안 반복은 값을 그대로 두고, 상태 전달은 결합자 하나로):**

```css
.pg_catalogIndex__rowBadge {
	border: 1px solid transparent;
}

.pg_catalogIndex__toolbar {
	gap: 12px;
}

.pg_catalogIndex__footer {
	gap: 12px;
}

.pg_catalogIndex__row {
	&:hover .pg_catalogIndex__rowBadge {
		border-color: #1677ff;
	}
}
```

### 5.4 Separate Domain State Modifiers From DOM Interaction States

**Rule:** `C24` · `values-separate-domain-state-modifiers-from-dom-interaction-states`

**Applies when:** 앱 상태 수정자와 hover, focus, disabled 같은 DOM 상호작용 상태를 추가·변경할 때. 포커스 링을 수정할 때.

**Review with:** `composition-do-not-build-structural-variants-with-modifiers`

**Impact: HIGH (앱 상태와 hover, 포커스 동작을 섞지 않아 읽기 쉽고 접근성도 지킵니다)**

도메인 상태와 무관한 `:hover`, `:focus`, `:disabled`는 조건 없는 기본 블록에 둡니다.
이 선택자들을 수정자 아래로 옮겨 적용 대상을 좁히지 않습니다.
수정자 블록에는 `active`, `selected`, `error`처럼 앱이 정하는 모습만 남깁니다.
수정자가 켜진 경우에만 상호작용이 달라져야 한다는 제품 요구가 있을 때만 그 예외를 적습니다.

수정자 아래로 옮기면 그 상태가 아닐 때 `:hover`와 `:focus`가 사라집니다.
읽는 사람은 기본 블록만 보고 상호작용이 없다고 판단합니다.

포커스 표시 자체는 `values-always-provide-a-visible-focus-indicator`가 담당합니다.
무엇을 수정자로 두고 무엇을 가상 클래스로 둘지는 `selector-use-pseudo-classes-for-dom-owned-states`가 정합니다.

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

### 5.5 Always Provide a Visible Focus Indicator

**Rule:** `C25` · `values-always-provide-a-visible-focus-indicator`

**Applies when:** `outline`, `:focus`, `:focus-visible` 스타일을 추가·수정할 때. 상호작용 요소의 기본 포커스 링을 덮어쓸 때.

**Review with:** `values-separate-domain-state-modifiers-from-dom-interaction-states`

**Impact: HIGH (포커스 표시를 없애지 않고 형태로 구분해 키보드 사용자가 현재 위치를 봅니다)**

포커스 표시를 없애지 않습니다.
`outline: none`을 쓰면 대체 스타일을 반드시 함께 제공합니다.

- `:focus`보다 `:focus-visible`을 씁니다.
  포인터 클릭에는 링이 안 나오고 키보드 이동에는 나옵니다.
- 색만 바꾸는 것으로 끝내지 않습니다.
  `outline`, `box-shadow` 링, `border` 두께처럼
  형태가 바뀌는 신호를 함께 씁니다.
  색만 쓰면 색각 이상에서 구분되지 않습니다.
- 배경과 링의 대비를 확인합니다.
  링이 배경과 같은 계열이면 없는 것과 같습니다.
- 기본 블록에 둡니다.
  수정자 블록 안에만 두면 그 상태가 아닐 때 표시가 사라집니다.

포커스 표시를 `--focused` 같은 앱 수정자로 대체하지 않습니다.
키보드로 들어왔는지 포인터로 들어왔는지는 브라우저만 알 수 있어서 앱이 재현할 수 없습니다.

**Incorrect (포커스 링을 제거하고 대체를 두지 않음):**

```css
.ui_button__root {
	&:focus {
		outline: none;
	}
}
```

**Incorrect (색만 바꾸고 수정자 안에만 둠):**

```css
.ui_button__root--active {
	&:focus-visible {
		outline: none;
		color: #1677ff;
	}
}
```

**Correct (`:focus-visible`에 형태가 바뀌는 표시를 기본 블록에 둠):**

```css
.ui_button__root {
	border: 1px solid #d9d9d9;

	&:focus-visible {
		outline: 2px solid #1677ff;
		outline-offset: 2px;
	}
}
```

**Correct (`outline`을 덮어쓰면 링으로 대체함):**

```css
.ui_input__field {
	border: 1px solid #d9d9d9;

	&:focus-visible {
		outline: none;
		border-color: #1677ff;
		box-shadow: 0 0 0 3px rgb(22 119 255 / 20%);
	}
}
```

### 5.6 Do Not Style Through the `style` Attribute

**Rule:** `C26` · `values-do-not-style-through-the-style-attribute`

**Applies when:** TSX에 `style={{ … }}`를 추가하거나 그 안의 선언을 바꿀 때. 컴포넌트 프롭으로 `style`을 받아 넘길 때.

**Review with:** `composition-inject-classes-only-at-the-entry-point`, `values-always-provide-css-variable-fallbacks`, `values-tokenize-repeated-visual-values`

**Impact: HIGH (모든 시각 결정이 스타일시트에 남아 검색과 덮어쓰기가 예측대로 동작합니다)**

시각 결정은 스타일시트에 씁니다.
`style={{ … }}`로 쓰지 않습니다.

- 인라인 선언은 클래스보다 우선순위가 높아 스타일시트에서 덮을 수 없습니다.
- CSS 파일을 검색해도 안 나옵니다.
  어디서 온 여백인지 찾을 수 없습니다.
- `:hover`, `@media`, `@container`를 쓸 수 없어 결국 클래스를 다시 만들게 됩니다.

값이 화면마다 달라야 하면 수정자 클래스를 붙입니다.
클래스를 어디서 주입할지는 `composition-inject-classes-only-at-the-entry-point`가 정합니다.

**실행 중에 계산해야만 아는 수치 하나**는 예외입니다.
가상 스크롤 위치, 드래그 좌표, 측정한 높이처럼 스타일시트에 적을 수 없는 값입니다.
이때도 CSS 변수 한 개만 넘기고 실제 선언은 스타일시트에 둡니다.
변수가 없을 때를 대비한 대체값은 `values-always-provide-css-variable-fallbacks`가 정합니다.

래퍼가 `HTMLAttributes`를 `extends` 하면 `style`이 함께 열립니다.
타입에서 막을 방법이 없으므로 이 규칙을 리뷰가 봅니다.

**Incorrect (인라인으로 꾸밈):**

```tsx
<section className={clsx("pg_report__summary")} style={{ marginTop: 16, color: "#c00" }}>
	{summary}
</section>
```

**Correct (스타일시트에 두고 수정자로 가름):**

```tsx
<section className={clsx("pg_report__summary", isCritical && "pg_report__summary--critical")}>
	{summary}
</section>
```

```css
.pg_report__summary {
	margin-block-start: 16px;
}

.pg_report__summary--critical {
	color: var(--color-text-danger);
}
```

**Correct (실행 중에만 아는 수치를 CSS 변수 하나로 넘김):**

```tsx
<div
	className={clsx("pg_report__virtualRow")}
	style={{ "--pg-report-row-offset": `${rowOffset}px` } as CSSProperties}
/>
```

```css
.pg_report__virtualRow {
	position: absolute;
	transform: translateY(var(--pg-report-row-offset, 0));
}
```

## 6. Tooling

**Impact: MEDIUM**

이 컨벤션 중 기계가 잡을 수 있는 항목은 stylelint 설정으로 고정하고, 잡을 수 없는 항목은 리뷰가 담당한다는 것을 명시해야 사람이 검사할 목록이 좁아집니다.

### 6.1 Configure Stylelint to Enforce These Rules

**Rule:** `C27` · `tooling-configure-stylelint-to-enforce-these-rules`

**Applies when:** stylelint 설정을 새로 만들거나 규칙을 추가·수정할 때. 이 컨벤션 중 어디까지 자동으로 잡히는지 확인할 때.

**Review with:** `naming-use-scope-slug-element-modifier-syntax`, `ownership-use-foreign-classes-only-under-your-own-root`, `selector-limit-nesting-block-depth`

**Impact: MEDIUM (기계가 잡는 항목을 설정에 고정하면 리뷰는 판단이 필요한 것만 봅니다)**

`stylelint-config-standard`를 확장하고 그 위에 이 컨벤션용 규칙을 얹습니다.

| stylelint 규칙 | 담당 컨벤션 |
| --- | --- |
| `selector-class-pattern` | `naming-use-scope-slug-element-modifier-syntax` |
| `selector-disallowed-list` | `ownership-use-foreign-classes-only-under-your-own-root` |
| `max-nesting-depth` | `selector-limit-nesting-block-depth` |
| `no-duplicate-selectors` | `selector-do-not-group-classes-with-commas`, `selector-declare-each-class-in-one-block` |
| `property-disallowed-list` | `values-tokenize-repeated-visual-values` |
| `selector-attribute-name-disallowed-list` | `selector-use-pseudo-classes-for-dom-owned-states` |
| `no-descending-specificity` | 자손 기본 블록을 조상 규칙보다 앞에 두게 합니다 |

접두사가 디렉터리마다 달라서 `selector-class-pattern`과 `selector-disallowed-list`는 `overrides`로 나눕니다.
중첩이 한 겹이라 블록 안 선택자는 `&`로 시작하고, 그래서 블록 바깥에 홀로 둔 것만 걸립니다.

`selector-max-combinators`와 `selector-max-type`은 넣지 않습니다.
우리 체이닝과 라이브러리 경로를 개수로 구분할 수 없습니다.

역할 이름, 승격 판단, 변형 노출, 포커스 대비는 리뷰가 담당합니다.

**Incorrect (`stylelint-config-standard`의 기본 클래스 패턴을 그대로 씀):**

```js
export default {
	extends: ["stylelint-config-standard"],
};
```

**Incorrect (결합자 개수로 깊이를 막으려 함):**

```js
export default {
	extends: ["stylelint-config-standard"],
	rules: {
		// 중첩으로 우회되고 .ant-table-thead > tr > th 를 잡아 예외 주석만 늘어난다
		"selector-max-combinators": 1,
	},
};
```

**Correct (공통 규칙 + 디렉터리별 접두사 `overrides`):**

```js
/**
 * 우리 클래스만 문법을 강제한다.
 * 우리 접두사로 시작하지 않는 클래스는 남의 것이라 검사 대상이 아니다.
 */
const ownClassPattern = (scope) =>
	`^(?:(?!${scope}_).*|${scope}_[a-z][a-zA-Z0-9]*__[a-z][a-zA-Z0-9]*(?:--[a-z][a-zA-Z0-9]*)?)$`;

/**
 * 우리가 이름을 정하지 않는 라이브러리 클래스
 */
const libraryPrefixes = [/^\.ant-/, /^\.rc-/, /^\.tippy-/, /^\.Mui-/];

/**
 * 우리가 마크업을 쓰는 자리에서 금지되는 형태
 */
const ownMarkupPatterns = [
	// 상태 pseudo-class 를 top-level 선택자로 다시 여는 것
	/^\.[\w-]+:(hover|focus|focus-visible|focus-within|active|disabled|checked|visited)/,
	// 중첩 안에서 element 선택자로 우리 마크업을 겨냥하는 것.
	// 우리가 쓰지 않는 마크업은 stylelint-disable 주석으로 예외를 표시한다
	/^&\s*[>+~]?\s*[a-z]/,
];

const disallowed = (foreignScopes) => [
	[...foreignScopes, ...libraryPrefixes, ...ownMarkupPatterns],
	{splitList: true},
];

export default {
	extends: ["stylelint-config-standard"],
	rules: {
		"max-nesting-depth": 1,
		"no-duplicate-selectors": [true, {disallowInList: true}],
		// 지역 custom property 선언을 막는다. var() 소비는 걸리지 않는다
		"property-disallowed-list": ["/^--/"],
		// 앱이 아는 상태는 modifier 로 표현한다
		"selector-attribute-name-disallowed-list": [/^aria-/, /^data-/],
		"selector-max-id": 0,
	},
	overrides: [
		{
			files: ["src/page/**/*.css"],
			rules: {
				"selector-class-pattern": ownClassPattern("pg"),
				"selector-disallowed-list": disallowed([/^\.(wg|ui)_/]),
			},
		},
		{
			files: ["src/widget/**/*.css"],
			rules: {
				"selector-class-pattern": ownClassPattern("wg"),
				"selector-disallowed-list": disallowed([/^\.(pg|ui)_/]),
			},
		},
		{
			files: ["src/ui/**/*.css"],
			rules: {
				"selector-class-pattern": ownClassPattern("ui"),
				"selector-disallowed-list": disallowed([/^\.(pg|wg)_/]),
			},
		},
		{
			// 전역 토큰 파일만 custom property 선언을 허용하고 이름을 강제한다
			files: ["src/style/token.css"],
			rules: {
				"selector-class-pattern": null,
				"property-disallowed-list": null,
				// var() 사용까지 검사하므로 외부 변수를 소비하는 파일에는 쓰지 않는다
				"custom-property-pattern": "^app-[a-z0-9-]+$",
			},
		},
	],
};
```

**Correct (기계가 못 잡는 항목은 리뷰 체크리스트로 남김):**

```md
<!-- docs/css-review.md -->
- 요소·수정자 이름이 역할을 가리키는가
- 요소 선택자를 쓴 자리가 정말 우리가 마크업을 쓰지 않는 곳인가
- 이 화면만 쓰는 컴포넌트를 위젯으로 올리지 않았는가
- 내부 모습을 변형으로 노출했는가, 아니면 최상위 블록 아래에서 겨냥했는가
- 포커스 표시가 색만 바뀌지 않고 형태로 구분되는가
```

## 참고 자료

- https://developer.mozilla.org/en-US/docs/Web/CSS
- https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
- https://github.com/lukeed/clsx

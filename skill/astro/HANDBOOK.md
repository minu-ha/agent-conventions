# Astro 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.extends`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=astro`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 Astro 코딩 컨벤션입니다. 이 가이드는 `src/pages`를 Astro의 required route tree이자 route-local owner layer로 보고, `src/pages/_document.astro`/`_head.astro`/`_document.css` 기반 pages-local document helper, routed page entry 중심의 screen implementation, route role에 맞춘 page-adjacent asset naming과 `rt_*` surface ownership, `_local/` route-local UI/runtime boundary, owner-named support file, 의미 있는 dynamic segment와 paginated route family, 공개 URL contract 정리 기준, `ui`/`widget` taxonomy, `.astro` 컴포넌트와 page/island/local support의 명확한 책임 경계, selective extraction 기준, static과 on-demand rendering의 의도적인 선택, build-time/live collections, Actions/endpoints/server islands 같은 Astro 고유 기능의 신중한 사용을 강조합니다. `rules/` 아래 rule 파일이 source of truth이며, Astro local rule은 기본 companion인 `typescript`와 `css` skill과 함께 사용합니다.

이 문서에는 Astro 컨벤션 규칙만 담겨 있습니다. 아래 규칙도 함께 따릅니다.

---

## 함께 따르는 규칙

- [TypeScript Convention](../typescript/HANDBOOK.md) — 공통 규칙
- [CSS Convention](../css/HANDBOOK.md) — 공통 규칙

---

## 목차

1. [Project Structure and File Ownership](#1-project-structure-and-file-ownership) — **CRITICAL**
    - 1.1 [Keep `src/pages` as the Route-local Owner Layer](#11-keep-src-pages-as-the-route-local-owner-layer)
    - 1.2 [Place Pages-local Document Helpers Under `src/pages` with an Underscore Prefix](#12-place-pages-local-document-helpers-under-src-pages-with-an-underscore-prefix)
    - 1.3 [Place Route Implementations Under `src/pages`](#13-place-route-implementations-under-src-pages)
2. [File Naming and Page Assets](#2-file-naming-and-page-assets) — **HIGH**
    - 2.1 [Align Route Page Assets and `rt_*` Surface Classes with Route Role](#21-align-route-page-assets-and-rt-surface-classes-with-route-role)
    - 2.2 [Use Domain-specific Dynamic Segment Names](#22-use-domain-specific-dynamic-segment-names)
    - 2.3 [Use Owner-named Route Support Files Instead of Generic Local Files](#23-use-owner-named-route-support-files-instead-of-generic-local-files)
    - 2.4 [Use Underscore-prefixed Pages-local Helper Names for Document Files](#24-use-underscore-prefixed-pages-local-helper-names-for-document-files)
3. [Astro Components and Layout Composition](#3-astro-components-and-layout-composition) — **HIGH**
    - 3.1 [Compose Page-level Documents Through `_document.astro` and `_head.astro`](#31-compose-page-level-documents-through-document-astro-and-head-astro)
    - 3.2 [Keep Frontmatter Server-only and Template-focused](#32-keep-frontmatter-server-only-and-template-focused)
    - 3.3 [Prefer `.astro` for Static Shells and Layouts](#33-prefer-astro-for-static-shells-and-layouts)
4. [Islands and Framework Boundaries](#4-islands-and-framework-boundaries) — **CRITICAL**
    - 4.1 [Choose `client:*` Directives by Visibility and Urgency](#41-choose-client-directives-by-visibility-and-urgency)
    - 4.2 [Do Not Import `.astro` Components Inside Framework Components](#42-do-not-import-astro-components-inside-framework-components)
    - 4.3 [Hydrate Only Truly Interactive Widgets](#43-hydrate-only-truly-interactive-widgets)
    - 4.4 [Reserve `client:only` for SSR-incompatible Components](#44-reserve-clientonly-for-ssr-incompatible-components)
5. [Routing and Navigation Contracts](#5-routing-and-navigation-contracts) — **HIGH**
    - 5.1 [Keep Dynamic Route Generation at the Page Boundary](#51-keep-dynamic-route-generation-at-the-page-boundary)
    - 5.2 [Prefer Flat Files for Leaf Dynamic Routes](#52-prefer-flat-files-for-leaf-dynamic-routes)
    - 5.3 [Prefer Sibling `index.astro` and `[page].astro` Files for Paginated Route Families](#53-prefer-sibling-index-astro-and-page-astro-files-for-paginated-route-families)
    - 5.4 [Preserve Established Public URL Contracts When Normalizing Route Folders](#54-preserve-established-public-url-contracts-when-normalizing-route-folders)
    - 5.5 [Use HTML Anchors Before Framework Link Abstractions](#55-use-html-anchors-before-framework-link-abstractions)
6. [Rendering Strategy and Delivery Modes](#6-rendering-strategy-and-delivery-modes) — **CRITICAL**
    - 6.1 [Default to Static Until Most Pages Need On-demand Rendering](#61-default-to-static-until-most-pages-need-on-demand-rendering)
    - 6.2 [Reserve `output: "server"` for Mostly Dynamic Apps](#62-reserve-output-server-for-mostly-dynamic-apps)
    - 6.3 [Use `prerender = false` for Request-bound or Personalized Routes](#63-use-prerender-false-for-request-bound-or-personalized-routes)
7. [Content Collections and Data Loading](#7-content-collections-and-data-loading) — **HIGH**
    - 7.1 [Define Build-time Collections in `src/content.config.ts`](#71-define-build-time-collections-in-src-content-config-ts)
    - 7.2 [Distinguish Build-time and Live Collections](#72-distinguish-build-time-and-live-collections)
    - 7.3 [Give Collections Explicit Zod Schemas](#73-give-collections-explicit-zod-schemas)
8. [Server Features and Mutation Boundaries](#8-server-features-and-mutation-boundaries) — **HIGH**
    - 8.1 [Choose Actions vs. Endpoints by Caller and Response Needs](#81-choose-actions-vs-endpoints-by-caller-and-response-needs)
    - 8.2 [Keep Redirects, Rewrites, and Auth Ownership at the Page or Middleware Boundary](#82-keep-redirects-rewrites-and-auth-ownership-at-the-page-or-middleware-boundary)
    - 8.3 [Keep Server Islands Serializable and Slot Fallbacks Ready](#83-keep-server-islands-serializable-and-slot-fallbacks-ready)
9. [Page, Layout, and Island Responsibilities](#9-page-layout-and-island-responsibilities) — **HIGH**
    - 9.1 [Compose Layouts from Widget and UI Only](#91-compose-layouts-from-widget-and-ui-only)
    - 9.2 [Extract Route Support Code Only When the Boundary Is Real](#92-extract-route-support-code-only-when-the-boundary-is-real)
    - 9.3 [Extract Route-local Sections Only for Rendering or Interaction Boundaries](#93-extract-route-local-sections-only-for-rendering-or-interaction-boundaries)
    - 9.4 [Keep Page Files Focused on Route Contract and Data Handoff](#94-keep-page-files-focused-on-route-contract-and-data-handoff)
    - 9.5 [Keep Pages-local Document Helpers Imported Only by Pages](#95-keep-pages-local-document-helpers-imported-only-by-pages)
    - 9.6 [Keep Route Page Files Focused on Screen Flow](#96-keep-route-page-files-focused-on-screen-flow)
    - 9.7 [Limit Layouts to Shell and Composition](#97-limit-layouts-to-shell-and-composition)
    - 9.8 [Place Route Shells Under the Owning Route `_local/` Folder](#98-place-route-shells-under-the-owning-route-local-folder)
    - 9.9 [Place Route-local UI Under `_local/`](#99-place-route-local-ui-under-local)
10. [Documentation and Comments](#10-documentation-and-comments) — **MEDIUM**
    - 10.1 [Limit Inline Comments to Rendering, Ownership, and Integration Caveats](#101-limit-inline-comments-to-rendering-ownership-and-integration-caveats)
    - 10.2 [Require JSDoc on Key Frontmatter, Document Props, and Route Support Declarations](#102-require-jsdoc-on-key-frontmatter-document-props-and-route-support-declarations)
11. [Workflow and Review Checks](#11-workflow-and-review-checks) — **MEDIUM**
    - 11.1 [Add New Pages in Layout-and-rendering-first Order](#111-add-new-pages-in-layout-and-rendering-first-order)
    - 11.2 [Consult Official Docs for Version-sensitive Astro Features](#112-consult-official-docs-for-version-sensitive-astro-features)
    - 11.3 [Review Adapter, Output Mode, and Hydration Before Finishing](#113-review-adapter-output-mode-and-hydration-before-finishing)

---

## 1. Project Structure and File Ownership

**Impact: CRITICAL**

`src/pages`는 Astro의 required route tree이자 route-local owner layer입니다. routed entry는 URL/rendering/server data/document handoff와 화면 흐름을 직접 소유하고, `_document.astro`/`_head.astro`/`_document.css`, `_local/`, owner-named support file처럼 `_` prefix로 제외되는 route-local 파일만 함께 둡니다.

### 1.1 Keep `src/pages` as the Route-local Owner Layer

**Impact: CRITICAL (화면 구현이 공용·generic 헬퍼 계층으로 새지 않게 Astro route 소유를 파일 기반 route 가까이 둠)**

Astro에서 `src/pages`는 required route tree입니다.
Route file은 얇은 import adapter가 아니라 URL contract와 route-local screen flow를 함께 소유합니다.

`src/pages`가 소유하는 것:

- URL contract와 file-based route
- `getStaticPaths()`, `prerender`, request-time data selection
- document helper로 넘기는 page meta handoff
- 현재 route에만 속한 screen implementation

분리가 필요하면 `src/pages/**/_local/`과 owner-named support file로 내립니다.
Shared `ui`/`widget`이나 generic helper layer로 먼저 올리지 않습니다.

**Incorrect (`src/pages`를 얇게 만들기 위해 route-only 구현을 shared layer로 밀어냄):**

```text
src/
  pages/
    admin/
      entries/
        index.astro
  components/
    layout/
      admin-entries-page.astro
    internal/
      entry-editor.tsx
```

이 구조는 실제 route와 구현 owner가 멀어지고, route-only file이 shared component처럼 보이게 만듭니다.

**Correct (route entry와 route-local 구현을 같은 route folder에 둠):**

```text
src/
  pages/
    _document.astro
    _head.astro
    _document.css
    admin/
      _admin.ts
      _admin-api.ts
      _admin-form.ts
      _local/
        admin-shell.astro
        admin-shell.css
        admin-query-provider.tsx
      entries/
        index.astro
        _entry-admin.ts
        _entry-admin.css
        _local/
          entry-admin-runtime.tsx
          entry-admin-table.tsx
          entry-admin-table.css
          entry-editor.tsx
          entry-editor.css
```

이 구조에서는 route contract와 route-only 구현이 함께 움직입니다.
`src/components/ui`와 `src/components/widget`은 여러 route에서 재사용되는 public surface만 받습니다.

### 1.2 Place Pages-local Document Helpers Under `src/pages` with an Underscore Prefix

**Impact: HIGH (route 공용 문서 헬퍼와 route-local support 파일을 route 소유자 가까이 두면서 route 페이지가 되지 않게 함)**

Astro는 `src/pages` 안에서 `_`로 시작하는 파일과 폴더를 router에서 제외합니다.
이 성질을 이용해 pages-local document helper와 route-local support file을 `src/pages/_*` 또는 `src/pages/**/_*`에
둡니다.

기본 배치:

- Top-level document helper: `_document.astro`, `_head.astro`, `_document.css`
- Route support module: `_index.ts`, `_slug.ts`, `_entry-admin.ts`
- Route-local implementation: `_local/entry-editor.tsx`, `_local/entry-editor.css`

`_document.astro`는 `<html>`, `<head>`,
`<body>`와 route-shared body shell을 소유하면서 document shell `Props`를 자기 파일 안에 직접 가집니다.

**Incorrect (document helper와 route-local 구현이 route tree 밖으로 밀려남):**

```text
src/
  components/
    layout/
      _document.astro
      _head.astro
      _document.css
    admin/
      entry-editor.tsx
  pages/
    admin/
      entries/
        index.astro
```

이 구조는 Astro route와 route-only 구현의 ownership을 흐립니다.
`components`는 public shared surface처럼 보이므로 route 전용 파일을 두기에 부적절합니다.

**Correct (pages-local document helper와 route-local 구현을 `_` prefix로 route tree 안에 둠):**

```text
src/
  pages/
    _document.astro
    _head.astro
    _document.css
    index.astro
    404.astro
    posts/
      index.astro
      _index.ts
      _index.css
      [slug].astro
      _slug.ts
    admin/
      _local/
        admin-shell.astro
        admin-shell.css
      entries/
        index.astro
        _entry-admin.ts
        _local/
          entry-editor.tsx
          entry-editor.css
```

이 구조에서는 `_document`, `_head`, `_document.css`가 pages-local document helper라는 점과,
`_local/` 및 owner-named support file이 route-local 구현이라는 점이 파일 위치만으로 드러납니다.

### 1.3 Place Route Implementations Under `src/pages`

**Impact: HIGH (page 구현을 파일 기반 route 가까이 두고 밑줄 접두사로 의도치 않은 route 생성을 피함)**

Astro가 file-based routing을 `src/pages`에서 결정하므로, route 구현도 가능한 한 같은 route subtree에 둡니다.

배치 기준:

- Routed entry: `index.astro`, `[slug].astro`, `new.astro`
- Route support: `_index.ts`, `_slug.ts`, `_entry-admin.ts`
- Route CSS: `_index.css`, `_slug.css`, `_entry-admin.css`
- Route-only runtime/UI: `_local/`
- Shared primitive/block: `src/components/ui` or `src/components/widget`

**Incorrect (route 구현이 `src/features`와 generic helper 이름으로 흩어짐):**

```text
src/
  pages/
    entries/
      index.astro
      [slug].astro
  features/
    entry/
      page.astro
      slug.astro
      index.ts
      index.css
      private/
        editor.tsx
```

**Correct (route entry와 route-local implementation을 같은 page subtree에 배치):**

```text
src/
  pages/
    index.astro
    _index.ts
    _index.css
    entries/
      index.astro
      _index.ts
      _index.css
      [slug].astro
      _slug.ts
      _slug.css
      new.astro
      _new.ts
      _new.css
      _local/
        entry-editor.tsx
        entry-editor.css
    admin/
      entries/
        index.astro
        _entry-admin.ts
        _entry-admin.css
        _local/
          entry-admin-runtime.tsx
          entry-admin-table.tsx
          entry-admin-table.css
```

`src/pages` 안에서 `_`로 시작하는 파일과 폴더는 route가 아니므로 route-local implementation을 안전하게 둘 수 있습니다.
단, `_local/`은 dump folder가 아닙니다.
파일명은 `entry-editor.tsx`, `admin-query-provider.tsx`,
`entry-admin-table.css`처럼 실제 owner와 역할이 드러나야 합니다.

## 2. File Naming and Page Assets

**Impact: HIGH**

`_document`/`_head`/`_document.css` 같은 pages-local helper, route entry와 짝을 이루는 `_index.ts`/`_slug.ts`/`_entry-admin.ts`, `_local/entry-editor.tsx`처럼 owner가 드러나는 route-local asset, `rt_*` route surface owner, 의미 있는 dynamic segment 이름은 file-based routing과 support module 탐색을 함께 쉽게 만듭니다.

### 2.1 Align Route Page Assets and `rt_*` Surface Classes with Route Role

**Impact: HIGH (이름에 폴더 깊이를 중복하지 않고 route 파일·자산·CSS 소유자·URL 의미를 일치시킴)**

Routed entry file names follow Astro routing (`index.astro`, `[slug].astro`,
`new.astro`). Route-local support files and CSS use the route role as owner, not the whole folder path.

Naming 기준:

- Route-owned surface class는 `rt_*__*`를 사용합니다.
- `rt_*` slug는 route family와 screen role이 읽히는 이름을 기본으로 합니다.
- 팀이 공유하는 route map이 없는 짧은 acronym은 정답 예시로 쓰지 않습니다.
- 같은 route family가 충돌하면 더 명시적인 owner name을 선택합니다.
- Document shell은 `rt_document__*`를 유지합니다.

**Incorrect (route depth and generic names leak into file/class names):**

```txt
admin/entries/index.astro -> loc_adminEntriesPage__root
admin/entries/_admin-entries.ts
admin/entries/_local.ts
admin/entries/_local.css
admin/entries/_local/provider.tsx
entries/[slug].astro -> loc_entryDetailPage__body
```

**Correct (route role and asset owner are short, searchable, and aligned):**

```txt
index.astro -> rt_home__root
entries/index.astro -> rt_entriesIndex__root
entries/[slug].astro -> rt_entryDetail__root
admin/entries/index.astro -> rt_adminEntriesIndex__root
admin/entries/_entry-admin.ts
admin/entries/_entry-admin.css
admin/entries/_local/entry-admin-runtime.tsx
admin/entries/_local/entry-editor.tsx
admin/entries/_local/entry-editor.css
_document.astro -> rt_document__body
```

When two route families would collide, choose the smallest owner name that disambiguates the local route.
Do not switch to `loc_*` for the main page surface just because markup moved into `_local/`; the screen owner remains
the route.

### 2.2 Use Domain-specific Dynamic Segment Names

**Impact: MEDIUM-HIGH (파일 트리와 Astro.params 안에서 route 파라미터가 스스로 설명되게 함)**

`[param].astro`와 `[...param].astro`의 이름은 도메인 의미가 드러나는 명사를 사용합니다.
실제 slug를 표현하는 경우가 아니라면 generic `id`, `path`, `value` 이름은 피하고,
파일 경로만 봐도 해당 param이 무엇을 가리키는지 알 수 있게 둡니다.

**Incorrect (generic param 이름으로 의미를 숨김):**

```text
src/pages/posts/[id].astro
src/pages/docs/[...path].astro
src/pages/authors/[value].astro
```

**Correct (param 이름이 파일 레벨에서 바로 의미를 드러냄):**

```text
src/pages/posts/[postId].astro
src/pages/docs/[...docsPath].astro
src/pages/authors/[author].astro
src/pages/blog/[slug].astro
```

### 2.3 Use Owner-named Route Support Files Instead of Generic Local Files

**Impact: MEDIUM-HIGH (route 하나가 헬퍼·런타임 컴포넌트·스타일시트를 여럿 가져도 파일을 찾을 수 있게 함)**

Route-local files should name the owner and responsibility directly.

피할 이름:

- `_local.ts`, `_local.css`
- `_api.ts`, `_form.ts`, `_provider.tsx`
- `index.ts`, `page.css`

권장 이름:

- `_admin.ts`, `_admin-api.ts`, `_admin-form.ts`
- `_entry-admin.ts`, `_entry-admin.css`
- `_local/admin-query-provider.tsx`
- `_local/admin-state-notice.tsx`
- `_local/entry-editor.tsx`, `_local/entry-editor.css`

The routed `index.astro` or `[slug].astro` is the only place where generic route file names are expected,
because Astro owns that naming contract.

**Incorrect (support files hide ownership behind generic names):**

```text
src/
  pages/
    admin/
      entries/
        index.astro
        _local.ts
        _local.css
        _api.ts
        _form.ts
        _local/
          provider.tsx
          editor.tsx
          table.tsx
```

**Correct (support files name the route owner and responsibility):**

```text
src/
  pages/
    admin/
      _admin.ts
      _admin-api.ts
      _admin-form.ts
      _local/
        admin-query-provider.tsx
        admin-state-notice.tsx
      entries/
        index.astro
        _entry-admin.ts
        _entry-admin.css
        _local/
          entry-admin-runtime.tsx
          entry-admin-table.tsx
          entry-admin-table.css
          entry-editor.tsx
          entry-editor.css
```

If a helper is used by exactly one component, place it beside that component with the same owner name,
such as `entry-editor.ts` next to `entry-editor.tsx`. If it is shared across the route family,
use the route support owner,
such as `_entry-admin.ts`. Promote it to `shared` or `components` only after the dependency crosses route ownership.

### 2.4 Use Underscore-prefixed Pages-local Helper Names for Document Files

**Impact: MEDIUM-HIGH (page 옆 비-route 파일을 파일 트리에서 구분하고 generic 셸 이름이 소유를 흐리는 것을 막음)**

`src/pages` 아래의 pages-local document helper와 support file은 `_` prefix와 역할 이름을 함께 사용합니다.

기본 이름:

- `_document.astro`: top-level document entry
- `_document.css`: route-shared body shell style
- `_head.astro`: head/meta concern

피할 이름:

- `_layout.astro`, `_shell.astro`, `_wrapper.astro`, `_base.astro`
- `site-layout.astro`
- 실제 재사용 경계 없는 `_page-chrome.astro`

`_document.astro`와 `_head.astro`의 contract는 각 파일 안의 로컬 `Props`가 직접 소유합니다.

**Incorrect (generic shell 이름이나 feature 이름이 섞여 역할이 흐려짐):**

```text
src/pages/_layout.astro
src/pages/_shell.astro
src/pages/_base.astro
src/pages/site-layout.astro
src/pages/_page-chrome.astro
```

**Correct (underscore prefix와 역할 이름으로 pages-local helper를 드러냄):**

```text
src/pages/_document.astro
src/pages/_document.css
src/pages/_head.astro
```

## 3. Astro Components and Layout Composition

**Impact: HIGH**

`.astro` 컴포넌트는 기본적으로 정적 HTML shell과 server-side 준비 코드를 담당하고, `_document`/`_head`를 통한 pages-local document composition과 template/slot 구조는 framework island 없이도 읽히게 유지해야 합니다.

### 3.1 Compose Page-level Documents Through `_document.astro` and `_head.astro`

**Impact: HIGH (반복되는 document·head·body 셸 조립을 route 파일 밖으로 빼면서 페이지 진입점은 하나로 유지함)**

반복되는 top-level document composition이 필요하면 routed page는 `src/pages/_document.astro` 하나만 import합니다.

소유권:

- Routed page: route data, page meta handoff, body content flow
- `_document.astro`: `<html>`, `<head>` 연결, `<body>`, shared body shell, base CSS import, `<slot />`
- `_head.astro`: SEO/meta/canonical/link/JSON-LD 계산과 head 전용 `Props`
- `_document.css`: document shell style

금지:

- 각 page가 `<html>`, `<head>`, `<body>` 조립을 반복
- `_document.ts` 같은 중간 type-only contract 파일 추가
- `Props extends DocumentMetaProps`처럼 얇은 타입 확장으로 contract 숨기기
- 실제 재사용 경계 없는 `_page-chrome.astro` helper 추가

SEO library는 `_head.astro` 내부 구현 선택지일 뿐 필수 contract가 아닙니다.
중요한 기준은 page, document, head의 책임이 한눈에 보이고, routed page가 body content를 slot으로 전달한다는 점입니다.

**Incorrect (각 page가 문서 조립을 반복함):**

```astro
---
import Head from "./_head.astro";
---

<html lang="ko">
	<Head pageTitle="archive" pageDescription="Archived entries" />
	<body>
		<header>...</header>
		<main>
			<section class="rt_entriesIndex__root">...</section>
		</main>
	</body>
</html>
```

**Correct (page는 document helper에 route body를 slot으로 전달):**

```astro
---
import Document from "@/pages/_document.astro";
import WgEntryFeed from "@/components/widget/entry-feed/wg-entry-feed.astro";

const entries = await listEntries();
---

<Document currentPathname={Astro.url.pathname} pageTitle="entries" pageDescription="Archived entries">
	<section class="rt_entriesIndex__root">
		<WgEntryFeed entries={entries} />
	</section>
</Document>
```

```astro
---
import "./_document.css";
import "@/styles/base.css";
import Head from "./_head.astro";
import WgSiteFooter from "@/components/widget/site-footer/wg-site-footer.astro";
import WgSiteHeader from "@/components/widget/site-header/wg-site-header.astro";

interface Props {
	currentPathname: string;
	pageTitle?: string;
	pageDescription?: string;
}

const {currentPathname, pageTitle, pageDescription} = Astro.props as Props;
---

<!doctype html>
<html lang="ko">
	<Head pageTitle={pageTitle} pageDescription={pageDescription} />
	<body class="rt_document__body">
		<WgSiteHeader currentPathname={currentPathname} />
		<main class="rt_document__main">
			<slot />
		</main>
		<WgSiteFooter />
	</body>
</html>
```

```astro
---
interface Props {
	pageTitle?: string;
	pageDescription?: string;
}

const {pageTitle, pageDescription} = Astro.props as Props;
const title = pageTitle ? `${pageTitle} | Site` : "Site";
const description = pageDescription ?? "Default site description";
---

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>{title}</title>
	<meta name="description" content={description} />
</head>
```

### 3.2 Keep Frontmatter Server-only and Template-focused

**Impact: HIGH (브라우저 동작이 Astro의 서버 측 컴포넌트 준비 단계로 새는 것을 막음)**

Astro frontmatter는 server-only component script입니다.
import, `Astro.props` 해석, fetch, server-side 파생값 계산처럼 HTML을 준비하는 코드에 집중하고,
이 값이 브라우저에서 그대로 살아 있을 것처럼 가정하지 않습니다.
브라우저 이벤트 핸들러나 DOM 접근은 template의 `<script>`나 framework island로 넘기고,
frontmatter 값이 browser script에 필요하면 `data-*` attribute 같은 명시적인 handoff를 사용합니다.

**Incorrect (frontmatter 안에서 browser handler를 정의하고 template에 직접 연결하려 함):**

```astro
---
const handleClick = () => {
	window.alert("Subscribed");
};
---

<button onclick={handleClick}>Subscribe</button>
```

**Correct (server 준비 코드는 frontmatter에 두고 browser 동작은 template script로 명시적으로 handoff):**

```astro
---
const successMessage = "Subscribed";
---

<astro-subscribe data-success-message={successMessage}>
	<button type="button">Subscribe</button>
</astro-subscribe>

<script>
	class AstroSubscribe extends HTMLElement {
		connectedCallback() {
			const button = this.querySelector("button");
			const successMessage = this.dataset.successMessage;

			button?.addEventListener("click", () => {
				window.alert(successMessage ?? "Subscribed");
			});
		}
	}

	customElements.define("astro-subscribe", AstroSubscribe);
</script>
```

### 3.3 Prefer `.astro` for Static Shells and Layouts

**Impact: CRITICAL (불필요한 클라이언트 프레임워크 표면을 줄이고 Astro의 zero-JS 기본값을 지킴)**

state, effect, client runtime가 필요 없는 shell은 기본적으로 `.astro`로 작성합니다.

기준:

- `.astro`: page shell, route shell, wrapper, static content section, document/head helper
- Framework island: browser state, event handler, effect, client-only library가 필요한 leaf
- `src/pages/_document.astro`: top-level document와 shared body shell
- `src/pages/**/_local/*.astro`: 특정 route subtree만 쓰는 route shell

React component를 이미 쓴다는 이유만으로 정적 shell까지 TSX로 밀어 넣지 않습니다.
page content가 주입되는 자리는 `<slot />`로 드러내고,
full document shell이라면 `<html>`이 최상위 parent가 되게 유지합니다.

**Incorrect (정적 shell을 React component로 올려 불필요한 framework surface를 늘림):**

```tsx
export const MarketingLayout = ({title, children}: PropsWithChildren<{title: string}>) => {
	return (
		<html lang="ko">
			<body>
				<header>{title}</header>
				<main>{children}</main>
			</body>
		</html>
	);
};
```

**Correct (정적 shell은 `.astro`가 직접 소유하고 interactive leaf만 필요 시 island로 연결):**

```astro
---
const { title } = Astro.props;
---

<html lang="ko">
	<body>
		<header>{title}</header>
		<main>
			<slot />
		</main>
	</body>
</html>
```

## 4. Islands and Framework Boundaries

**Impact: CRITICAL**

hydration은 진짜 상호작용이 필요한 widget에만 제한하고, framework component와 Astro component 사이의 import/slot 경계도 명확하게 유지해야 합니다.

### 4.1 Choose `client:*` Directives by Visibility and Urgency

**Impact: HIGH (모든 것을 eager 로딩으로 두지 않고 hydration 비용을 의도적으로 정하게 함)**

`client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`는 모두 같은 비용이 아닙니다.
above-the-fold 즉시 상호작용이 필요한 widget만 eager hydration을 쓰고, 그 외에는 visibility/idle 조건에 맞게 낮춥니다.
특히 `client:only`는 server HTML을 생략하므로 일반 hydration 대체재처럼 쓰지 않습니다.

**Incorrect (모든 island를 습관적으로 `client:load`에 올림):**

```astro
<SearchBox client:load />
<ThemePicker client:load />
<FaqAccordion client:load />
```

**Correct (urgency와 visibility에 맞게 hydration 시점을 나눔):**

```astro
<SearchBox client:load />
<ThemePicker client:idle />
<FaqAccordion client:visible />
```

### 4.2 Do Not Import `.astro` Components Inside Framework Components

**Impact: CRITICAL (Astro 컴포넌트 경계를 지키고 지원되지 않는 런타임 간 조립을 피함)**

React 같은 framework component 안에서는 `.astro` component를 직접 import하지 않습니다.
Astro에서 framework island를 감싸고, 필요한 정적 조립은 slot이나 children으로 전달합니다.

**Incorrect (framework component에서 `.astro`를 직접 import해 runtime 경계를 깨뜨림):**

```tsx
import PromoCard from "../PromoCard.astro";

export const Sidebar = () => {
	return <PromoCard />;
};
```

**Correct (Astro parent가 정적 조립을 소유하고 framework component는 island 역할만 담당):**

```astro
---
import Sidebar from "./Sidebar.tsx";
import PromoCard from "./PromoCard.astro";
---

<Sidebar client:idle>
	<PromoCard slot="promo" />
</Sidebar>
```

### 4.3 Hydrate Only Truly Interactive Widgets

**Impact: CRITICAL (Astro 페이지를 대체로 정적으로 유지하고 JavaScript를 진짜 상호작용 경계에만 씀)**

Hydration은 검색 입력, 필터, 플레이어, 차트, 폼 상태처럼 실제 상호작용이 필요한 widget에만 사용합니다.
정적 hero, marketing copy, read-only card, simple CTA wrapper는 `.astro`로 렌더링하고
불필요한 `client:*`를 붙이지 않습니다.

**Incorrect (정적 정보 블록 전체를 습관적으로 hydrate함):**

```astro
---
import FeatureGrid from "../components/FeatureGrid.tsx";
---

<FeatureGrid client:load features={features} />
```

**Correct (정적 grid는 `.astro`로 두고 interactive search만 island로 분리):**

```astro
---
import FeatureGrid from "../components/FeatureGrid.astro";
import FeatureSearch from "../components/FeatureSearch.tsx";
---

<FeatureGrid features={features} />
<FeatureSearch client:visible />
```

### 4.4 Reserve `client:only` for SSR-incompatible Components

**Impact: HIGH (정상적으로 hydrate 가능한 위젯의 서버 렌더 HTML을 지킴)**

`client:only`는 server HTML을 건너뛰고 page load 시점에 바로 client 렌더링합니다.
browser API 전용 라이브러리처럼 SSR이 실제로 불가능한 경우에만 사용하고, 그렇지 않다면 `client:load`, `client:idle`,
`client:visible`로 server HTML을 먼저 남깁니다.
`client:only`를 쓸 때는 framework hint를 명시하고, 로딩 공백이 보이면 fallback도 함께 둡니다.

**Incorrect (SSR 가능한 widget까지 습관적으로 `client:only`에 올림):**

```astro
<ThemeToggle client:only="react" />
<FaqAccordion client:only="react" />
```

**Correct (정상 hydration이 되는 widget은 SSR HTML을 남기고, SSR 불가 컴포넌트만 `client:only` 사용):**

```astro
<ThemeToggle client:idle />
<FaqAccordion client:visible />

<MapWidget client:only="react">
	<div slot="fallback">Loading map...</div>
</MapWidget>
```

## 5. Routing and Navigation Contracts

**Impact: HIGH**

Astro의 file-based routing과 page boundary 책임은 page file에서 직접 드러나야 하며, 하위 route가 없는 dynamic leaf는 flat file로 두고 paginated route family는 얕은 sibling 구조를 우선하되 이미 공개된 URL contract는 함부로 바꾸지 않아야 합니다.

### 5.1 Keep Dynamic Route Generation at the Page Boundary

**Impact: HIGH (URL 계약이 정의된 곳에서 route 파라미터와 빌드 시점 페이지 생성이 보이게 함)**

동적 route의 `getStaticPaths()`와 param-to-page generation 책임은 page file 경계에 둡니다.
shared component나 utility가 URL contract를 대신 소유하게 만들지 말고,
page가 경로와 데이터를 연결한 뒤 렌더링용 component에 props를 전달합니다.

**Incorrect (`getStaticPaths()` 책임을 shared component 쪽으로 밀어 page contract를 숨김):**

```astro
---
import BlogPostPage, { getStaticPaths } from "../../components/blog/BlogPostPage.astro";
export { getStaticPaths };
---

<BlogPostPage />
```

**Correct (page file가 route contract를 소유하고 component는 렌더링만 담당):**

```astro
---
import BlogPostPage from "../../components/blog/BlogPostPage.astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
	const posts = await getCollection("blog");

	return posts.map((post) => ({
		params: { slug: post.id },
		props: { post },
	}));
}

const { post } = Astro.props;
---

<BlogPostPage post={post} />
```

### 5.2 Prefer Flat Files for Leaf Dynamic Routes

**Impact: HIGH (route가 실제로 자식 route를 가질 때까지 동적 route 트리를 얕게 유지함)**

하위 route가 없는 dynamic page는 folder로 감싸지 말고 flat file로 둡니다.
`index.astro` folder는 같은 resource 아래에 child route가 실제로 생겼을 때 사용합니다.

판단 기준:

- Leaf public detail은 `src/pages/posts/[slug].astro`처럼 둡니다.
- Leaf filtered list도 child route가 없으면 `src/pages/tags/[slug].astro`처럼 둡니다.
- 같은 dynamic resource 아래에 `feed.xml`, `[page].astro`,
  settings 같은 child route가 생기면 그때 `src/pages/tags/[slug]/index.astro`로 승격합니다.
- 공개 URL contract가 이미 배포됐다면 파일 구조 선호보다 URL 보존과 redirect 계획을 먼저 봅니다.

**Incorrect (하위 route가 없는데 dynamic route를 folder로 감쌈):**

```text
src/pages/posts/[slug]/index.astro
src/pages/tags/[slug]/index.astro
src/pages/authors/[author]/index.astro
```

이 구조는 route tree depth만 늘리고,
route entry와 page-adjacent `_slug.css`/`_author.css` 같은 support asset의 대응도 흐립니다.

**Correct (leaf route는 flat file, child route가 있을 때만 folder):**

```text
src/pages/posts/[slug].astro
src/pages/posts/_slug.css

src/pages/tags/[slug].astro
src/pages/tags/_slug.css

src/pages/topics/[topic]/index.astro
src/pages/topics/[topic]/[page].astro
src/pages/topics/[topic]/feed.xml.ts
```

`topics/[topic]/index.astro`는 child route를 실제로 가지므로 folder가 route owner입니다.
반대로 `posts/[slug].astro`와 `tags/[slug].astro`는 leaf route라 flat file이 더 읽기 쉽습니다.

### 5.3 Prefer Sibling `index.astro` and `[page].astro` Files for Paginated Route Families

**Impact: HIGH (페이지네이션 route를 얕게 유지하고 목록과 페이지네이션 계약을 한 폴더에서 읽히게 함)**

페이지네이션이 있는 list route family는 가능하면 같은 폴더 안에서 `index.astro`와 `[page].astro`를 sibling으로 둡니다.

배치 기준:

- Home이 별도 landing이면 `src/pages/index.astro`는 그대로 둡니다.
- 하위 route가 없는 dynamic leaf는 `src/pages/articles/[slug].astro`처럼 flat file로 둡니다.
- Paginated archive는 `src/pages/archive/index.astro`와 `src/pages/archive/[page].astro`처럼 전용 family 아래에 둡니다.
- Section list는 `src/pages/articles/index.astro`와 `src/pages/articles/[page].astro`처럼 둡니다.
- Dynamic resource 아래 pagination은 `src/pages/topics/[topic]/index.astro`와
  `src/pages/topics/[topic]/[page].astro`처럼 resource folder 안에 둡니다.

**Incorrect (pagination route를 `page/` 하위 폴더로 한 단계 더 감쌈):**

```text
src/pages/[page].astro
src/pages/articles/page/[page].astro
src/pages/docs/page/[page].astro
src/pages/topics/[topic]/page/[page].astro
```

이 구조는 홈과 archive의 역할을 섞거나,
같은 route family를 불필요한 `page/` 서브폴더로 나눠 tree를 훑을 때 list와 pagination contract를 한눈에 보기 어렵게
만듭니다.

**Correct (list와 pagination을 sibling file로 둠):**

```text
src/pages/index.astro
src/pages/archive/index.astro
src/pages/archive/[page].astro

src/pages/articles/index.astro
src/pages/articles/[page].astro
src/pages/articles/[slug].astro

src/pages/docs/index.astro
src/pages/docs/[page].astro
src/pages/docs/[slug].astro

src/pages/topics/index.astro
src/pages/topics/[topic]/index.astro
src/pages/topics/[topic]/[page].astro
```

이 구조에서는 홈은 별도 route로 남고,
각 paginated route family의 entry page와 pagination page가 같은 폴더에 모여 있어 URL contract를 file tree만 보고도 바로
이해할 수 있습니다.

### 5.4 Preserve Established Public URL Contracts When Normalizing Route Folders

**Impact: HIGH (파일 트리 정리가 이미 쓰이는 공개 URL을 조용히 바꾸는 것을 막음)**

route folder를 더 예쁘게 정리할 수 있더라도, 이미 공개된 URL contract가 있다면 그 계약을 먼저 존중합니다.
현재 사이트가 이미 `/recent/:page?`, `/posts/:page?`, `/posts/:slug`,
`/tags/:slug` 같은 경로를 쓰고 있다면 폴더 대칭성만을 이유로 root pagination, singular folder,
다른 slug family로 URL을 바꾸지 않습니다.
이 skill에서는 "새로 설계할 때의 선호 구조"와 "이미 배포된 공개 URL"을 분리해서 판단합니다.

**Incorrect (폴더 모양을 맞추려는 이유만으로 공개 URL을 바꿈):**

```text
before:
src/pages/index.astro
src/pages/recent/index.astro
src/pages/recent/[page].astro
src/pages/posts/index.astro
src/pages/posts/[page].astro
src/pages/posts/[slug].astro
src/pages/notes/index.astro
src/pages/notes/[page].astro
src/pages/notes/[slug].astro
src/pages/tags/index.astro
src/pages/tags/[slug].astro

after:
src/pages/index.astro
src/pages/[page].astro
src/pages/posts/index.astro
src/pages/posts/[page].astro
src/pages/post/[slug].astro
src/pages/notes/index.astro
src/pages/notes/[page].astro
src/pages/note/[slug].astro
src/pages/tag/[slug].astro
```

이 변경은 file tree는 더 대칭적으로 보일 수 있지만, 이미 배포된 `/recent/*`, `/posts/*`, `/notes/*`,
`/tags/*` 링크와 canonical을 깨뜨리는 공개 URL 변경이므로 별도 migration이나 redirect 계획 없이 수행하면 안 됩니다.

**Correct (현재 공개 URL을 유지하거나, 바꾼다면 명시적 migration으로 다룸):**

```text
current public contract:
src/pages/index.astro
src/pages/recent/index.astro
src/pages/recent/[page].astro
src/pages/posts/index.astro
src/pages/posts/[page].astro
src/pages/posts/[slug].astro
src/pages/notes/index.astro
src/pages/notes/[page].astro
src/pages/notes/[slug].astro
src/pages/tags/index.astro
src/pages/tags/[slug].astro
```

이 경우에는 convention이 현재 공개 URL을 존중하도록 맞추고, 정말 URL을 바꾸고 싶다면 redirect, canonical, internal link,
sitemap까지 포함한 migration 작업으로 분리합니다.

### 5.5 Use HTML Anchors Before Framework Link Abstractions

**Impact: HIGH (내비게이션을 Astro 기본 라우팅 모델에 맞추고 외부 router 습관을 들이지 않음)**

Astro page navigation은 기본적으로 plain `<a>`를 사용합니다.
다른 SPA framework의 `<Link>` 습관을 그대로 들여오지 말고,
client router가 정말 필요한 island 안이 아니라면 HTML anchor를 기본값으로 유지합니다.

**Incorrect (Astro page에서 외부 router abstraction을 습관적으로 사용):**

```astro
---
import { Link } from "react-router-dom";
---

<nav>
	<Link to="/pricing">Pricing</Link>
</nav>
```

**Correct (Astro page contract에 맞는 plain anchor를 기본으로 사용):**

```astro
<nav>
	<a href="/pricing/">Pricing</a>
</nav>
```

## 6. Rendering Strategy and Delivery Modes

**Impact: CRITICAL**

static, on-demand SSR, `output: \"server\"`, client-only islands는 전제가 다르므로 request-time 요구사항과 서버 의존성을 의식적으로 선택해야 합니다.

### 6.1 Default to Static Until Most Pages Need On-demand Rendering

**Impact: CRITICAL (Astro의 빠른 기본값을 지키고 서버 의존을 너무 일찍 들이지 않음)**

Astro 프로젝트는 기본 `static` output을 먼저 유지합니다.
쿠키, 세션, 요청별 개인화가 필요한 경로가 몇 개 있다고 해서 전체 프로젝트를 곧바로 `output: "server"`로 바꾸지 말고,
대부분의 page가 여전히 build-time에 안전하다면 static 기본값을 유지한 채 필요한 route만 on-demand로 opt out 합니다.

**Incorrect (대부분이 정적인 사이트인데 동적 page 몇 개 때문에 전체를 server mode로 바꿈):**

```ts
import { defineConfig } from "astro/config";

export default defineConfig({
	output: "server",
});
```

**Correct (기본값은 static으로 두고 필요한 route만 request-time으로 처리):**

```astro
---export const prerender = false;---
<AccountPage />
```

```ts
import { defineConfig } from "astro/config";

export default defineConfig({
	output: "static",
});
```

### 6.2 Reserve `output: "server"` for Mostly Dynamic Apps

**Impact: HIGH (전체 SSR을 편의 토글이 아니라 앱 수준의 의도적 선택으로 만듦)**

`output: "server"`는 새로운 기능을 추가하는 옵션이 아니라 전체 page의 기본 rendering behavior를 뒤집는 선택입니다.
대시보드, 로그인 후 앱처럼 대부분의 page가 request-time 데이터와 auth에 묶인 경우에만 기본값으로 채택하고,
그 안의 정적 page만 `prerender = true`로 opt in 합니다.

**Incorrect (몇 개의 auth page만 동적인데 전체 project를 server mode로 돌림):**

```text
- marketing, docs, blog가 대부분 정적임
- account, billing 두 page 때문에 `output: "server"`를 전체 기본값으로 선택함
```

**Correct (대부분이 동적인 앱에서만 server mode를 기본값으로 사용하고 정적 page를 개별 opt in):**

```ts
import { defineConfig } from "astro/config";

export default defineConfig({
	output: "server",
});
```

```astro
---export const prerender = true;---
<AboutPage />
```

### 6.3 Use `prerender = false` for Request-bound or Personalized Routes

**Impact: CRITICAL (요청마다 실제로 실행되는 route에만 요청 시점 로직을 둠)**

쿠키, 인증 세션, 요청 헤더,
요청마다 바뀌는 개인화 데이터에 의존하는 page나 endpoint는 static mode에서 `export const prerender = false`로 on-demand
rendering을 명시합니다.
build 시점에 고정된 HTML로 만들 수 없는 동작을 정적 page 안에 억지로 숨기지 않습니다.
`output: "server"`를 이미 쓰는 프로젝트라면 같은 intent를 page-level로 다시 선언할 필요는 없습니다.

**Incorrect (request-time 데이터에 의존하지만 정적 page처럼 둠):**

```astro
---
const session = await getSession(Astro.request.headers);
---

<DashboardPage session={session} />
```

**Correct (request-bound page임을 route boundary에서 드러냄):**

```astro
---
export const prerender = false;

const session = await getSession(Astro.request.headers);
---

<DashboardPage session={session} />
```

## 7. Content Collections and Data Loading

**Impact: HIGH**

structured content는 build-time/live collection 경계를 분명히 하고 config와 schema를 중심으로 관리해야 page 파일 안의 ad-hoc parsing과 freshness 오해를 줄일 수 있습니다.

### 7.1 Define Build-time Collections in `src/content.config.ts`

**Impact: HIGH (콘텐츠 소유를 한곳에 모아 컬렉션 형태가 페이지마다 다시 정의되는 것을 막음)**

build-time content collection 정의는 `src/content.config.ts`에서 한 번에 관리합니다.
page 파일 안에서 glob, frontmatter parsing,
ad-hoc shape normalization을 반복하지 말고 collection loader와 registration을 중앙화합니다.
요청마다 fresh한 데이터를 가져오는 live collection은 이 파일이 아니라 `src/live.config.ts`와 `defineLiveCollection()`
쪽으로 분리합니다.

**Incorrect (page 파일 안에서 raw glob과 frontmatter parsing을 직접 반복):**

```astro
---
const posts = await Astro.glob("../content/blog/*.md");
const sortedPosts = posts
	.map((post) => ({ title: post.frontmatter.title, href: `/blog/${post.file.split("/").at(-1)?.replace(".md", "")}/` }))
	.toSorted((left, right) => right.title.localeCompare(left.title));
---
```

**Correct (collection 정의는 config에 모으고 page는 collection API만 사용):**

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
});

export const collections = { blog };
```

### 7.2 Distinguish Build-time and Live Collections

**Impact: HIGH (정적 콘텐츠와 요청 시점 콘텐츠 사이에서 신선도 가정이 어긋나는 것을 막음)**

build-time content collection과 live collection은 같은 개념으로 취급하지 않습니다.
build-time collection은 `src/content.config.ts`와 `defineCollection()`에 두고 `getCollection()`/`getEntry()`로 읽습니다.
요청마다 fresh한 CMS나 API 데이터를 다뤄야 하면 `src/live.config.ts`와 `defineLiveCollection()`을 사용하고
`getLiveCollection()`/`getLiveEntry()`로 접근합니다.
live collection은 on-demand rendering 전제도 함께 갖습니다.

**Incorrect (request-time freshness가 필요한 데이터를 build-time collection처럼 취급함):**

```text
- 실시간 상품 데이터는 `src/content.config.ts`에 등록한다
- page에서는 `getCollection("products")`로 읽고 재빌드 없이 최신값을 기대한다
```

**Correct (build-time과 live collection의 config와 query를 분리함):**

```ts
import { defineLiveCollection } from "astro:content";
import { productLoader } from "./loaders/product-loader";

const products = defineLiveCollection({
	loader: productLoader({ endpoint: process.env.PRODUCTS_API_URL }),
});

export const collections = { products };
```

### 7.3 Give Collections Explicit Zod Schemas

**Impact: HIGH (구조화 콘텐츠를 타입 안전하게 만들고 frontmatter 변형이 페이지로 새는 것을 막음)**

구조화된 collection은 loader만 두고 끝내지 말고 schema를 명시적으로 둡니다.
collection entry shape를 page마다 추측하거나 optional chaining으로 봉합하지 말고 `astro:zod` 기반 schema에서 타입과
validation을 고정합니다.

**Incorrect (structured content인데 schema 없이 느슨하게 사용):**

```ts
const docs = defineCollection({
	loader: glob({ base: "./src/content/docs", pattern: "**/*.md" }),
});
```

**Correct (collection schema로 필수 필드와 타입을 명시):**

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const docs = defineCollection({
	loader: glob({ base: "./src/content/docs", pattern: "**/*.md" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		order: z.number().int(),
		draft: z.boolean().default(false),
	}),
});
```

## 8. Server Features and Mutation Boundaries

**Impact: HIGH**

Actions, endpoints, server islands는 각각 caller와 response shape, adapter 전제가 다르므로 UI 통신 경로와 deferred rendering 경계를 의도적으로 선택해야 합니다.

### 8.1 Choose Actions vs. Endpoints by Caller and Response Needs

**Impact: HIGH (mutation 경계를 누가 호출하는지와 어떤 응답을 제어해야 하는지에 맞춤)**

브라우저 UI가 직접 호출하는 form submit이나 mutation은 기본적으로 Actions를 먼저 검토합니다.
Actions는 input validation, error shape,
client/server 호출 계약을 한 경계에서 다루기 쉬워 UI와 가까운 write flow에 잘 맞습니다.
반대로 public API, webhook, binary 응답, 세밀한 header/status 제어,
non-UI consumer가 필요한 경우에는 endpoint가 더 자연스럽습니다.
static mode에서 HTML form 기반 action을 쓰면 on-demand rendering 전제도 함께 확인합니다.

**Incorrect (모든 서버 쓰기 흐름을 같은 방식으로 처리함):**

```text
- UI form submit도 무조건 ad-hoc /api fetch로 처리한다
- public webhook도 action처럼 취급한다
- 파일 다운로드 응답도 action 안에서 우겨 넣는다
```

**Correct (caller와 response shape에 맞는 경계를 고른다):**

```text
- page form이나 button mutation: Actions 우선
- 외부 서비스 webhook, public JSON API, 이미지/파일 응답: endpoint 우선
- static mode에서 request-time form 처리: adapter와 prerender 전제를 함께 확인
```

### 8.2 Keep Redirects, Rewrites, and Auth Ownership at the Page or Middleware Boundary

**Impact: HIGH (요청 시점 가드와 내비게이션 부수효과를 시각적으로 남아야 하는 layout 셸 밖에 둠)**

Route-local shell과 pages-local document helper는 shell 조립 역할만 하므로 redirect, rewrite,
auth guard의 owner가 되지 않습니다.

Owner 기준:

- Route-specific request gate: `src/pages/**` page boundary
- Cross-cutting concern: `src/middleware.ts`의 `onRequest()`
- Visual shell: page나 middleware가 결정한 결과를 props 또는 `Astro.locals`로 받아 표현

Route param, query, page-level data selection과 결합된 guard는 page에서 처리합니다.
여러 route에 공통인 auth, locale, tenant, request locals 주입은 middleware에서 처리합니다.
Astro 공식 문서상 `Astro.redirect()`는 page가 `return`해야 하고,
middleware interception은 `src/middleware.ts`에서 수행합니다.

**Incorrect (layout이 request-time guard와 redirect를 직접 소유):**

```astro
---
const session = Astro.locals.session;

if (!session) {
	return Astro.redirect("/login");
}
---

<slot />
```

이 구조는 시각 shell인 layout이 request gate와 navigation side effect까지 떠안아 page/layout 경계를 흐립니다.

**Correct (route-specific guard는 page boundary에서 처리):**

```astro
---
import AccountShell from "./_local/account-shell.astro";

const session = Astro.locals.session;

if (!session) {
	return Astro.redirect("/login");
}
---

<AccountShell title="Account">
	<p>Account page</p>
</AccountShell>
```

**Correct (cross-cutting auth는 middleware에서 처리):**

```ts
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
	if (!context.locals.session && context.url.pathname.startsWith("/account")) {
		return context.redirect("/login", 302);
	}

	return next();
});
```

이 구조에서는 page나 middleware가 request-time guard를 소유하고, layout은 결과가 확정된 뒤 shell만 조립합니다.

### 8.3 Keep Server Islands Serializable and Slot Fallbacks Ready

**Impact: HIGH (지연 렌더링을 이식 가능하게 유지하고 깨진 props나 빈 로딩 화면을 피함)**

`server:defer`를 쓰는 Astro component에는 serializable props만 넘기고,
느린 personalized content에는 fallback slot을 함께 준비합니다.
함수나 거대한 객체를 넘겨 deferred boundary를 깨뜨리거나, placeholder 없이 blank 영역을 남기지 않습니다.

**Incorrect (함수 prop과 fallback 없는 deferred island):**

```astro
---
import Avatar from "../components/Avatar.astro";
---

<Avatar
	server:defer
	user={currentUser}
	onLoaded={() => console.log("loaded")}
/>
```

**Correct (serializable props만 전달하고 fallback을 함께 둠):**

```astro
---
import Avatar from "../components/Avatar.astro";
import GenericAvatar from "../components/GenericAvatar.astro";
---

<Avatar server:defer userId={currentUser.id}>
	<GenericAvatar slot="fallback" />
</Avatar>
```

## 9. Page, Layout, and Island Responsibilities

**Impact: HIGH**

pages-local document helper는 top-level document composition, routed page는 route contract와 `rt_*` screen flow, `_local/`은 route-local UI/runtime boundary, owner-named support module은 진짜 data/rendering boundary를 소유합니다. shared `ui`/`widget`으로 올릴 수 없는 route-only 조각은 같은 route folder 안에 남겨 Astro의 server-first 구조와 ownership이 함께 읽히게 합니다.

### 9.1 Compose Layouts from Widget and UI Only

**Impact: HIGH (layout 파일이 도메인 전용 공용 블록이 되지 않고 route 셸로 남게 함)**

`_document.astro`나 route-local shell이 shell composition을 맡는다면,
그 안에서 조립하는 shared piece는 `src/components/widget/**`와 `src/components/ui/**`로 제한합니다.

구분 기준:

- `ui`: button, input, card, table, box, stack, surface, text 같은 primitive
- `widget`: search-table, site-header, entry-feed, entry-detail처럼 `ui`를 조립한 reusable block
- Document shell: `_document.astro` and `_document.css`
- Route shell: owning route의 `_local/`

Shell 자체를 `ui-*`나 `widget-*`로 이름 붙여 shared component처럼 승격하지 않습니다.
Shell class는 `rt_document__*`처럼 owner가 드러나게 유지합니다.

**Incorrect (layout 역할을 ui/widget로 위장함):**

```text
src/components/ui/page-shell/ui-page-shell.astro
src/components/widget/app-shell/widget-app-shell.astro
```

```astro
---
import UiPageShell from "@/components/ui/page-shell/ui-page-shell.astro";
---

<UiPageShell>
	<slot />
</UiPageShell>
```

`page-shell`은 primitive가 아니고, route shell을 직접 소유하므로 `ui`도 `widget`도 아니라 layout 역할이어야 합니다.

**Correct (document shell은 pages-local에 남기고 shared piece만 ui/widget에서 조립):**

```astro
---
import UiBox from "@/components/ui/box/ui-box.astro";
import UiStack from "@/components/ui/stack/ui-stack.astro";
import UiSurface from "@/components/ui/surface/ui-surface.astro";
import WgSiteHeader from "@/components/widget/site-header/wg-site-header.astro";

const { currentPathname } = Astro.props;
---

<UiSurface class="rt_document__surface">
	<UiStack class="rt_document__stack">
		<UiBox class="rt_document__header">
			<WgSiteHeader currentPathname={currentPathname} />
		</UiBox>
		<main class="rt_document__main">
			<UiBox class="rt_document__content">
				<slot />
			</UiBox>
		</main>
	</UiStack>
</UiSurface>
```

이 예시에서 `_document.astro`는 route-shared body shell을 소유하고,
재사용 가능한 block은 전부 `widget`과 `ui`로 분리되어 있습니다.

### 9.2 Extract Route Support Code Only When the Boundary Is Real

**Impact: HIGH (route 페이지의 일회성 frontmatter 로직이 generic 헬퍼 파일로 흩어지는 것을 막음)**

Route page frontmatter support code should move into owner-named support modules only when the boundary is real.

추출할 수 있는 것:

- clear input/output data boundary
- validation, auth, serialization, model building
- shared route-family data loader

Page file에 남길 것:

- small one-off booleans
- `Astro.props` destructuring
- page-local labels
- `class:list` conditions
- empty-state branch choices

Do not create `_form.ts`, `_api.ts`, `utils.ts`, `helpers.ts`,
or `common.ts` unless the owner name makes the boundary explicit.

**Incorrect (small route-local calculations are scattered into generic helpers):**

```ts
// src/pages/admin/entries/_form.ts
export const getHasActiveFilter = (filter?: string) => Boolean(filter);

export const getEmptyMessage = (filter?: string) => {
	return filter ? "No entries match this filter." : "No entries yet.";
};
```

이 정도 로직은 routed page frontmatter 바로 옆이 더 읽기 쉽고, `_form.ts`라는 이름도 실제 owner를 설명하지 못합니다.

**Correct (owner-named support module에는 실제 route data boundary만 둠):**

```ts
// src/pages/admin/entries/_entry-admin.ts
import type { EntryAdminInitialState } from "./_local/entry-admin-runtime";

/**
 * @summary admin entries 화면의 초기 server state를 만든다.
 */
export const getEntryAdminInitialState = async (): Promise<EntryAdminInitialState> => {
	const entries = await entryAdminApi.listEntries();

	return {
		entries: entries.map(toEntryAdminRow),
	};
};
```

```astro
---
import { getEntryAdminInitialState } from "./_entry-admin";

const initialState = await getEntryAdminInitialState();
const hasEntries = initialState.entries.length > 0;
const emptyMessage = hasEntries ? undefined : "No entries yet.";
---
```

이 구조에서는 API normalization과 initial state 조립만 support module로 내리고,
현재 route의 branch와 문구 선택은 page frontmatter에 남깁니다.

### 9.3 Extract Route-local Sections Only for Rendering or Interaction Boundaries

**Impact: HIGH (조급한 _local/ 섹션 추출 없이 route 페이지를 읽을 수 있게 유지함)**

Move a section into `src/pages/**/_local/` only when it owns a real rendering or interaction boundary.

추출할 수 있는 경계:

- `client:*` or `client:only` hydration
- `server:defer` with fallback
- form/action ownership
- provider setup
- browser-only custom element or script behavior
- third-party widget adapter
- repeated slot contract

Do not extract a component just because a heading/body/footer group looks like a section.
If the subtree still describes the same route surface,
keep the route `rt_*` owner instead of inventing a `loc_*` namespace.

**Incorrect (simple page markup is split into `_local/` wrappers):**

```astro
---
import EntryBodySection from "./_local/entry-body-section.astro";
import EntryHeaderSection from "./_local/entry-header-section.astro";
import EntryMetaSection from "./_local/entry-meta-section.astro";

const { entry } = Astro.props;
---

<article class="rt_entryDetail__root">
	<EntryHeaderSection entry={entry} />
	<EntryMetaSection entry={entry} />
	<EntryBodySection html={entry.html} />
</article>
```

이 세 section이 단순 markup grouping뿐이라면 routed page의 흐름만 숨깁니다.

**Correct (boundary가 있는 subtree만 `_local/`로 분리):**

```astro
---
import RelatedEntriesPanel from "./_local/related-entries-panel.astro";
import EntryReactionIsland from "./_local/entry-reaction-island.tsx";

const { entry, relatedEntries } = Astro.props;
---

<article class="rt_entryDetail__root">
	<header class="rt_entryDetail__header">
		<h1>{entry.title}</h1>
		<p>{entry.description}</p>
	</header>

	<div class="rt_entryDetail__meta">
		<span>{entry.author}</span>
		<span>{entry.publishedAtLabel}</span>
	</div>

	<div class="rt_entryDetail__body" set:html={entry.html} />

	<RelatedEntriesPanel server:defer entries={relatedEntries}>
		<p slot="fallback">Loading related entries...</p>
	</RelatedEntriesPanel>

	<EntryReactionIsland client:visible entryId={entry.id} />
</article>
```

이 예시에서는 deferred panel과 hydrated island처럼 runtime 경계가 있는 부분만 `_local/`로 내리고,
route의 본문 흐름은 routed page에서 읽히게 유지합니다.

### 9.4 Keep Page Files Focused on Route Contract and Data Handoff

**Impact: HIGH (page 파일을 import 전용 어댑터로 만들지 않으면서 src/pages를 route 소유자로 읽히게 함)**

Page file은 route owner 책임을 한눈에 보이게 유지합니다.

Page file이 소유:

- URL contract
- `getStaticPaths()` and `prerender`
- search param 해석
- page-level data selection
- `currentPathname` and document meta handoff
- high-level screen flow

분리 기준:

- Reusable render detail: `ui` or `widget`
- Route-only browser interaction/provider: `_local/`
- Request-time HTML/data selection: page boundary에서 `prerender = false` 여부도 함께 표시
- Client island에 query state만 넘기는 경우: static 기본값 유지 가능

**Incorrect (page 파일이 route contract와 browser runtime detail을 한꺼번에 가짐):**

```astro
---
const tab = Astro.url.searchParams.get("tab") ?? "all";
const posts = await getPosts({ tab });
---

<section>
	{posts.map((post) => (
		<article class="card">
			<h2>{post.title}</h2>
			<PostRemoveModal postId={post.id} />
		</article>
	))}
</section>
```

**Correct (page는 route/data/meta handoff와 screen flow를 소유하고 runtime boundary만 `_local/`로 위임):**

```astro
---
import Document from "@/pages/_document.astro";
import EntryAdminRuntime from "./_local/entry-admin-runtime.tsx";
import { getEntryAdminInitialState, getEntryAdminPreviewSlugs } from "./_entry-admin";
import { util } from "@/shared/util";

export async function getStaticPaths() {
	const slugs = await getEntryAdminPreviewSlugs();

	return slugs.map((slug) => ({
		params: {
			slug: util.entry.toSlug(slug),
		},
	}));
}

const initialState = await getEntryAdminInitialState();
---

<Document currentPathname={Astro.url.pathname} pageTitle="admin entries" pageNoIndex>
	<section class="rt_adminEntriesIndex__root">
		<header class="rt_adminEntriesIndex__header">
			<h1>Entries</h1>
		</header>
		<EntryAdminRuntime client:load initialState={initialState} />
	</section>
</Document>
```

### 9.5 Keep Pages-local Document Helpers Imported Only by Pages

**Impact: HIGH (공용 코드가 라우팅 헬퍼에 의존하지 않도록 route에서 pages-local 문서 헬퍼로 향하는 한 방향 의존을 지킴)**

`src/pages/_document.astro`, `_head.astro`,
`_document.css` 같은 pages-local document helper는 routed page만 import합니다.

의존 방향:

- Page entry imports `_document.astro`
- `_document.astro` imports `_head.astro`, `_document.css`, `widget`, `ui`
- `_document.astro`와 `_head.astro`는 각자 자기 로컬 `Props`를 직접 소유
- `src/components/**`, shared utility, route-local `_local/` leaf는 document helper를 직접 import하지 않음

이 흐름을 지켜야 top-level document composition은 route boundary에 남고 shared component tier가 routing helper에 묶이지
않습니다.

**Incorrect (route-local leaf가 pages-local document helper를 직접 import함):**

```astro
---
import DocumentShell from "@/pages/_document.astro";
---

<DocumentShell currentPathname="/" pageTitle="entries" pageDescription="Archived entries">
	<section>
		<!-- route-local body -->
	</section>
</DocumentShell>
```

이 구조는 leaf component가 pages-local document helper와 메타 계약을 직접 알아야 하므로 route/document/component 경계를
깨뜨립니다.

**Correct (page만 document helper를 알고, `_local/` leaf는 body만 렌더링):**

```astro
---
import Document from "@/pages/_document.astro";
import EntryList from "./_local/entry-list.astro";
import { getEntries, getEntryListPageProps } from "./_index";

const entries = await getEntries();
const pageProps = getEntryListPageProps({
	entries,
	currentPage: 1,
});
---

<Document currentPathname={Astro.url.pathname} pageTitle="entries" pageDescription="Archived entries">
	<EntryList entries={pageProps.entries} />
</Document>
```

```astro
---
import type { EntryListItem } from "../_index";

const { entries } = Astro.props as { entries: EntryListItem[] };
---

<section>
	<!-- route-local body -->
</section>
```

이 구조에서는 page만 top-level shell과 meta props를 조립하고, route-local leaf는 routed body surface에만 집중합니다.

### 9.6 Keep Route Page Files Focused on Screen Flow

**Impact: HIGH (route .astro 파일을 import 전용 어댑터가 아니라 route 조율 계층으로 읽히게 함)**

`src/pages/**/index.astro`, `[slug].astro`, and similar route files own more than the URL.

Page file에서 보여야 하는 것:

- route contract
- data selection
- document props
- empty/error branch
- high-level screen order

Do not reduce every route file to a one-line import of a page component just to keep `src/pages` thin.
Extract only pieces with real rendering, browser runtime, provider, third-party library, or data-shaping boundaries.

**Incorrect (route page hides all screen flow behind route-local components):**

```astro
---
import AdminEntriesRuntime from "./_local/entry-admin-runtime.tsx";
import EntryAdminShell from "./_local/entry-admin-shell.astro";
import Document from "@/pages/_document.astro";
---

<Document currentPathname={Astro.url.pathname} pageTitle="entries">
	<EntryAdminShell>
		<AdminEntriesRuntime client:load />
	</EntryAdminShell>
</Document>
```

이 구조만 보면 route에서 어떤 server data가 준비되는지, 어떤 empty state가 있는지,
어떤 screen surface가 route owner인지 보이지 않습니다.

**Correct (route page가 screen flow와 runtime handoff를 계속 소유):**

```astro
---
import "./_entry-admin.css";
import Document from "@/pages/_document.astro";
import EntryAdminRuntime from "./_local/entry-admin-runtime.tsx";
import { getEntryAdminInitialState } from "./_entry-admin";

const initialState = await getEntryAdminInitialState();
const hasEntries = initialState.entries.length > 0;
---

<Document currentPathname={Astro.url.pathname} pageTitle="admin entries" pageNoIndex>
	<section class="rt_adminEntriesIndex__root">
		<header class="rt_adminEntriesIndex__header">
			<h1>Entries</h1>
		</header>

		{hasEntries ? (
			<EntryAdminRuntime client:load initialState={initialState} />
		) : (
			<p class="rt_adminEntriesIndex__empty">No entries yet.</p>
		)}
	</section>
</Document>
```

이 예시는 React runtime이 필요해도 route entry가 document handoff, server data, high-level branch,
`rt_*` surface owner를 계속 보여 줍니다.

### 9.7 Limit Layouts to Shell and Composition

**Impact: HIGH (공용 layout 파일이 말단 페이지의 데이터·상호작용 로직을 흡수하는 것을 막음)**

route-local shell과 pages-local document helper는 shell composition만 담당합니다.

소유할 수 있는 것:

- common frame
- metadata wrapper
- `<slot />` 기반 composition
- shared chrome 조립
- document/head helper의 local `Props`

소유하지 않는 것:

- 특정 page만 쓰는 fetch/query/mutation
- form state와 submit handler
- detail query, redirect, auth guard
- island 내부 browser state

Data, redirect, auth 판단은 page boundary, middleware, 또는 해당 island에 남깁니다.

**Incorrect (layout이 leaf page 전용 데이터와 form 로직까지 흡수함):**

```astro
---
const invoice = await getInvoice(Astro.params.invoiceId);
const formState = buildInvoiceForm(invoice);
---

<DashboardFrame formState={formState}>
	<slot />
</DashboardFrame>
```

**Correct (document helper는 shell과 slot 조립만 담당):**

```astro
---
import UiSurface from "@/components/ui/surface/ui-surface.astro";
import WgSiteHeader from "@/components/widget/site-header/wg-site-header.astro";

const { currentPathname } = Astro.props;
---

<UiSurface>
	<WgSiteHeader currentPathname={currentPathname} />
	<slot />
</UiSurface>
```

### 9.8 Place Route Shells Under the Owning Route `_local/` Folder

**Impact: HIGH (route 셸 파일이 page와 재사용 블록 사이의 애매한 공용 계층이 되는 것을 막음)**

Route-specific shell files are not shared layouts. Put them under the owning route's `_local/` folder.

기준:

- Route subtree shell: `src/pages/admin/_local/admin-shell.astro`
- Shell style: same owner file, such as `admin-shell.css`
- Shared visual pieces: `ui` and `widget`
- Site-wide document shell: top-level `_document.astro`, `_head.astro`, `_document.css`

Do not create `src/layouts`, `src/components/layouts`, `ui-page-shell`,
or `widget-page-shell` just because several children in one route subtree share a shell.

**Incorrect (route shell floats as a shared component layer):**

```text
src/
  components/
    layouts/
      admin-layout.astro
      admin-layout.css
    ui/
      page-shell/ui-page-shell.astro
  pages/
    admin/
      entries/
        index.astro
```

이 구조는 admin route shell과 site-wide document shell의 자리를 동시에 흐리게 만들고,
shell ownership도 route 밖으로 밀어냅니다.

**Correct (route shell은 owning route `_local/` 아래에 두고 shared 조각만 ui/widget으로 재사용):**

```text
src/
  components/
    ui/
      box/ui-box.astro
      stack/ui-stack.astro
    widget/
      site-header/wg-site-header.astro
  pages/
    _document.astro
    _document.css
    _head.astro
    admin/
      _local/
        admin-shell.astro
        admin-shell.css
      entries/
        index.astro
```

이 구조에서는 `admin-shell.astro`가 admin route family shell을 소유하고,
site-wide document shell은 `src/pages/_*`가 소유하며, shared visual block만 `ui`와 `widget`에서 가져와 조립합니다.

### 9.9 Place Route-local UI Under `_local/`

**Impact: HIGH (route 전용 구현과 공용 공개 표면의 경계를 분명하게 드러냄)**

Shared로 승격되지 않은 route-only UI는 owning route folder의 `_local/` 아래에 둡니다.

`_local/`에 둘 수 있는 것:

- modal, form, table
- provider, runtime component
- 보조 renderer
- component CSS

`_local/`은 현재 route subtree 전용 구현이라는 소유권을 드러내는 이름입니다.
다른 route에서도 쓰이기 시작하면 `ui`, `widget`, 또는 shared domain layer로 승격합니다.
Route page의 screen orchestration까지 `_local/`로 옮기지는 않습니다.

**Incorrect (route-local UI가 shared components나 route root에 섞임):**

```text
src/
  components/
    entry-editor.tsx
  pages/
    admin/
      entries/
        index.astro
        entry-admin-table.tsx
        entry-admin-table.css
```

**Correct (route-local implementation detail은 `_local/` 아래에 둠):**

```text
src/
  components/
    ui/
      button/ui-button.tsx
  pages/
    admin/
      entries/
        index.astro
        _entry-admin.ts
        _entry-admin.css
        _local/
          entry-admin-runtime.tsx
          entry-admin-table.tsx
          entry-admin-table.css
          entry-editor.tsx
          entry-editor.css
```

같은 page surface를 설명하는 `_local/` markup과 CSS는 `loc_*`로 새 namespace를 만들지 말고 `rt_*` owner를 유지합니다.
예외적으로 dialog나 helper wrapper가 route 안에서도 독립 owner contract를 가져야 할 때만 `loc_entryFilterDialog__*` 같은
`loc_*`를 사용합니다.

## 10. Documentation and Comments

**Impact: MEDIUM**

Astro frontmatter, `src/pages/_document.astro`/`_head.astro`, route-local support module의 핵심 선언에는 JSDoc을 남기고, inline comment는 rendering, ownership, integration caveat처럼 없으면 오해될 제약만 설명해야 합니다.

### 10.1 Limit Inline Comments to Rendering, Ownership, and Integration Caveats

**Impact: MEDIUM (Astro 주석을 읽는 사람이 놓치기 쉬운 제약에만 집중시킴)**

Astro의 inline comment는 rendering mode, serialization, route ownership handoff, adapter requirement,
integration caveat처럼 없으면 오해되기 쉬운 제약에만 남깁니다.
frontmatter 안에서는 `//` 주석을 사용하고, template 내부 설명이 필요하면
HTML comment로 남기기보다 frontmatter나 support module로 경계를 옮겨 문서화합니다.
변수명이나 template 구조를 그대로 읽어주는 주석은 남기지 않습니다.

**Incorrect (자명한 동작을 그대로 설명하는 주석):**

```astro
---
const postEntries = await getPostEntries();
// post 목록을 가져온다
const pageProps = getPostListPageProps({ entries: postEntries, currentPage: 1 });
// props를 만든다
---
```

**Correct (rendering/ownership 제약만 짧게 설명):**

```astro
---
// route entry는 collection query와 canonical/meta handoff를 소유한다.
const postEntries = await getPostEntries();

// pagination/basePath 계산은 owner-named support helper에 맡기고 route body 흐름은 page에 남긴다.
const pageProps = getPostListPageProps({ entries: postEntries, currentPage: 1 });
---
```

### 10.2 Require JSDoc on Key Frontmatter, Document Props, and Route Support Declarations

**Impact: MEDIUM-HIGH (구현을 뜯어보기 전에 Astro route 경계와 route-local support 헬퍼를 찾을 수 있게 함)**

Astro frontmatter와 `src/pages/_document.astro`, `src/pages/_head.astro`, `src/pages/**/_entry-admin.ts`,
`src/pages/**/_local/entry-editor.ts` 같은 route-local support module에서 중요한 경계를 선언할 때는 헤더 JSDoc을
작성합니다.

문서화 대상:

- pages-local document/head `Props`
- `getStaticPaths()`
- exported page data loader
- 외부 연동 helper
- rendering mode 판단이 섞인 helper

`@summary`, `@helper`, `@api`, `@field` 같은 태그는 companion skill인 `convention-typescript` 표준에 맞춥니다.
단순 local destructuring이나 자명한 alias까지 전부 문서화할 필요는 없습니다.

**Incorrect (document props/route/support 경계 선언에 문맥 설명이 없음):**

```astro
---
interface Props {
	title: string;
	description: string;
}

export async function getStaticPaths() {
	const posts = await getCollection("blog");
	return posts.map((post) => ({ params: { slug: post.slug } }));
}

const buildHeadModel = (post: Post) => ({
	title: post.title,
	description: post.description,
});
---
```

Route support module에서도 exported contract는 같은 기준을 따릅니다.

```ts
/**
 * @api entry 목록 페이지 데이터 조회
 */
export const listEntryPageItems = async () => {
	return api.entry.list();
};

/**
 * @helper entry 목록 응답을 route view model로 변환
 */
export const toEntryListView = (response: EntryListResponse) => ({
	entries: response.data,
});
```

**Correct (핵심 선언의 역할과 의도를 바로 위에 문서화):**

```astro
---
/**
 * @summary head 전용 SEO/meta contract
 */
interface Props {
	/** @field 브라우저 title에 사용할 현재 페이지 제목 */
	pageTitle?: string;
	/** @field description meta에 사용할 현재 페이지 설명 */
	pageDescription?: string;
}

/**
 * @helper 정적 상세 페이지 slug 목록 생성
 */
export async function getStaticPaths() {
	const posts = await getCollection("blog");
	return posts.map((post) => ({ params: { slug: post.slug } }));
}

/**
 * @helper 포스트 헤드 메타 모델 생성
 */
const buildHeadModel = (post: Post) => ({
	title: post.title,
	description: post.description,
});
---
```

## 11. Workflow and Review Checks

**Impact: MEDIUM**

Astro 기능은 버전과 adapter 조건에 민감하므로 문서 확인과 layout/rendering/hydration review를 마무리 전에 함께 수행해야 합니다.

### 11.1 Add New Pages in Layout-and-rendering-first Order

**Impact: MEDIUM (파일이 번지기 전에 셸·렌더링 모드·아일랜드 경계를 먼저 정해 정리 작업을 줄임)**

새 page를 추가할 때는 화면 마크업부터 급하게 만들지 말고, 먼저 기본 `src/pages/_document.astro` 패턴으로 충분한지,
`_document.astro`와 `_head.astro`의 로컬 `Props`에 어떤 문서 계약이 필요한지, `_document.css`를 건드려야 하는지,
owning route의 `_local/` shell이 필요한지, guard owner, static/on-demand 여부, dynamic route 여부,
island 필요 여부를 정합니다.
이 순서를 따르면 `client:load` 남용이나 route-local ownership 붕괴를 뒤늦게 뜯어내는 일을 줄일 수 있습니다.

**Incorrect (page 파일부터 만들고 나중에 rendering과 shell을 끼워 맞춤):**

```text
1. `src/pages/foo.astro`부터 크게 만든다
2. 브라우저 상호작용이 생기면 일단 `client:load`를 붙인다
3. 쿠키나 auth가 필요해지면 마지막에 SSR 여부를 고민한다
```

**Correct (layout과 rendering 결정을 먼저 고정하고 page를 연다):**

```text
1. 이 page가 기본 `src/pages/_document.astro` shell로 충분한지 먼저 판단한다
2. page가 넘겨야 할 `pageTitle`, `pageDescription`, `currentPathname` 같은 문서 계약을 먼저 정하고 `_document.astro`와 `_head.astro`의 로컬 `Props`에서 끝낼 수 있는지 본다
3. route-shared body shell이 바뀐다면 `_document.css`와 `_document.astro` 안에서 끝낼 수 있는지 먼저 본다
4. 이 page를 소유하는 route folder와 그 route의 `_local/` shell이 필요한지 판단한다
5. auth, redirect, rewrite owner가 page boundary인지 `src/middleware.ts`인지 먼저 정한다
6. static, `prerender = false`, `output: "server"` 중 어떤 rendering 전제가 맞는지 고른다
7. dynamic route면 `getStaticPaths()`가 필요한지 page boundary에서 정한다
8. interactive 부분만 island로 빼고 `client:*` 또는 `client:only` 필요성을 고른다
9. route entry는 body flow를 소유하고, `_local/`에는 runtime/rendering boundary가 있는 조각만 내려갔는지 확인한다
```

### 11.2 Consult Official Docs for Version-sensitive Astro Features

**Impact: MEDIUM (빠르게 바뀌는 Astro 기능과 지시자에 대한 낡은 가정을 줄임)**

`client:*`, `server:defer`, Actions, content collections,
adapters처럼 버전과 host 조건에 민감한 Astro 기능은 공식 문서를 먼저 확인합니다.
`astro-docs` MCP가 연결돼 있다면 그 경로를 우선 사용하고,
없더라도 최소한 공식 문서 기준으로 최신 동작을 확인한 뒤 규칙을 적용합니다.

**Incorrect (다른 framework 기억이나 오래된 Astro 예시를 그대로 적용):**

```text
- "이전 프로젝트에서 봤던 예시니까 확인 없이 그대로 `client:only`를 모든 interactive widget에 붙인다."
- "content collections 예전 API 기억으로 page 파일 안에서 직접 glob 처리한다."
```

**Correct (버전 민감한 기능은 공식 문서를 먼저 대조하고 난 뒤 적용):**

```text
- "이번 변경은 Actions와 server islands를 함께 쓰므로 공식 Astro 문서나 astro-docs MCP에서 현재 API 제약을 먼저 확인한다."
- "확인 후 adapter requirement, serializable props, action 호출 방식에 맞춰 구현한다."
```

### 11.3 Review Adapter, Output Mode, and Hydration Before Finishing

**Impact: MEDIUM (Astro 특유의 배포·렌더링 불일치를 배포 전에 잡음)**

Astro 변경을 마무리할 때는 코드 diff만 보지 말고 adapter, `output`, prerender/on-demand 전제,
build-time/live collection 선택, hydration 경계를 함께 점검합니다.
Actions나 server islands를 추가했는데 adapter가 없거나, 정적 shell이 과하게 hydrate되는 상태로 끝내지 않습니다.

**Incorrect (Astro 전용 전제를 확인하지 않고 기능만 붙이고 마무리):**

```text
- `server:defer`를 추가했지만 adapter 설치 여부를 확인하지 않음
- UI mutation을 Actions로 옮겼지만 static/on-demand 전제는 보지 않음
- dynamic route인데 `getStaticPaths()`와 `prerender` 선택이 현재 mode와 맞는지 확인하지 않음
- 정적 page section까지 `client:load`나 `client:only`가 퍼졌는지 점검하지 않음
```

**Correct (Astro-specific review checklist로 배포 전제를 같이 검토):**

```text
- adapter와 `output` 설정이 Actions/live collections/server islands 요구사항과 맞는지 확인
- prerender 경로와 on-demand 경로가 섞일 때 page boundary 의도가 유지되는지 확인
- dynamic route의 `getStaticPaths()` 유무와 current mode가 서로 모순되지 않는지 확인
- hydrate된 island가 진짜 interactive leaf만 남았는지, `client:only`가 꼭 필요한 곳만 남았는지 마지막으로 점검
```

## 참고 자료

- https://docs.astro.build/en/basics/astro-components/
- https://docs.astro.build/en/basics/project-structure/
- https://docs.astro.build/en/basics/astro-pages/
- https://docs.astro.build/en/guides/framework-components/
- https://docs.astro.build/en/guides/routing/
- https://docs.astro.build/en/guides/on-demand-rendering/
- https://docs.astro.build/en/guides/content-collections/
- https://docs.astro.build/en/guides/actions/
- https://docs.astro.build/en/guides/endpoints/
- https://docs.astro.build/en/guides/server-islands/
- https://docs.astro.build/en/reference/directives-reference/

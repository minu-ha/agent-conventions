# Astro 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.extends`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=astro`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 Astro 코딩 컨벤션입니다. 이 가이드는 `src/pages` 중심의 file-based entry 구조, 의미 있는 dynamic segment naming, `.astro` 컴포넌트와 layout/page/island의 명확한 책임 경계, static과 on-demand rendering의 의도적인 선택, build-time/live collections, Actions/endpoints/server islands 같은 Astro 고유 기능의 신중한 사용을 강조합니다. `rules/` 아래 rule 파일이 source of truth이며, 기본 compiled guide는 local Astro 규칙만 담고 공통 TypeScript 규칙은 `typescript` companion skill과 함께 사용합니다.

이 가이드는 local Astro 컨벤션 규칙만 담고 있습니다. TypeScript 같은 공통 규칙은 companion skill을 함께 로드해 보완합니다.

---

## 함께 로드할 Companion Skill

- `convention-typescript` - TypeScript Convention 공통 규칙 guide: [TypeScript Convention](../typescript/AGENTS.md)

---

## 목차

1. [Project Structure and File Ownership](#1-project-structure-and-file-ownership) — **CRITICAL**
    - 1.1 [Keep Pages, Layouts, Components, and Content in Native Directories](#11-keep-pages-layouts-components-and-content-in-native-directories)
    - 1.2 [Prefer src/pages for Page Entrypoints](#12-prefer-srcpages-for-page-entrypoints)
2. [File Naming and Page Assets](#2-file-naming-and-page-assets) — **HIGH**
    - 2.1 [Grow Complex Pages into a Predictable Asset Set](#21-grow-complex-pages-into-a-predictable-asset-set)
    - 2.2 [Use Domain-specific Dynamic Segment Names](#22-use-domain-specific-dynamic-segment-names)
3. [Astro Components and Layout Composition](#3-astro-components-and-layout-composition) — **HIGH**
    - 3.1 [Keep Frontmatter Server-only and Template-focused](#31-keep-frontmatter-server-only-and-template-focused)
    - 3.2 [Prefer .astro for Static Shells and Layouts](#32-prefer-astro-for-static-shells-and-layouts)
4. [Islands and Framework Boundaries](#4-islands-and-framework-boundaries) — **CRITICAL**
    - 4.1 [Choose client:* Directives by Visibility and Urgency](#41-choose-client-directives-by-visibility-and-urgency)
    - 4.2 [Do Not Import .astro Components Inside Framework Components](#42-do-not-import-astro-components-inside-framework-components)
    - 4.3 [Hydrate Only Truly Interactive Widgets](#43-hydrate-only-truly-interactive-widgets)
    - 4.4 [Reserve client:only for SSR-incompatible Components](#44-reserve-clientonly-for-ssr-incompatible-components)
5. [Routing and Navigation Contracts](#5-routing-and-navigation-contracts) — **HIGH**
    - 5.1 [Keep Dynamic Route Generation at the Page Boundary](#51-keep-dynamic-route-generation-at-the-page-boundary)
    - 5.2 [Use HTML Anchors Before Framework Link Abstractions](#52-use-html-anchors-before-framework-link-abstractions)
6. [Rendering Strategy and Delivery Modes](#6-rendering-strategy-and-delivery-modes) — **CRITICAL**
    - 6.1 [Default to Static Until Most Pages Need On-demand Rendering](#61-default-to-static-until-most-pages-need-on-demand-rendering)
    - 6.2 [Reserve output: "server" for Mostly Dynamic Apps](#62-reserve-output-server-for-mostly-dynamic-apps)
    - 6.3 [Use prerender = false for Request-bound or Personalized Routes](#63-use-prerender-false-for-request-bound-or-personalized-routes)
7. [Content Collections and Data Loading](#7-content-collections-and-data-loading) — **HIGH**
    - 7.1 [Define Build-time Collections in src/content.config.ts](#71-define-build-time-collections-in-srccontentconfigts)
    - 7.2 [Distinguish Build-time and Live Collections](#72-distinguish-build-time-and-live-collections)
    - 7.3 [Give Collections Explicit Zod Schemas](#73-give-collections-explicit-zod-schemas)
8. [Server Features and Mutation Boundaries](#8-server-features-and-mutation-boundaries) — **HIGH**
    - 8.1 [Choose Actions vs. Endpoints by Caller and Response Needs](#81-choose-actions-vs-endpoints-by-caller-and-response-needs)
    - 8.2 [Keep Server Islands Serializable and Slot Fallbacks Ready](#82-keep-server-islands-serializable-and-slot-fallbacks-ready)
9. [Page, Layout, and Island Responsibilities](#9-page-layout-and-island-responsibilities) — **HIGH**
    - 9.1 [Keep Page Files Focused on Route Contract and Data Handoff](#91-keep-page-files-focused-on-route-contract-and-data-handoff)
    - 9.2 [Limit Layouts to Shell and Composition](#92-limit-layouts-to-shell-and-composition)
10. [Workflow and Review Checks](#10-workflow-and-review-checks) — **MEDIUM**
    - 10.1 [Add New Pages in Layout-and-rendering-first Order](#101-add-new-pages-in-layout-and-rendering-first-order)
    - 10.2 [Consult Official Docs for Version-sensitive Astro Features](#102-consult-official-docs-for-version-sensitive-astro-features)
    - 10.3 [Review Adapter, Output Mode, and Hydration Before Finishing](#103-review-adapter-output-mode-and-hydration-before-finishing)

---

## 1. Project Structure and File Ownership

**Impact: CRITICAL**

`src/pages`, `src/layouts`, `src/components`, `src/content`의 역할이 분명해야 Astro 프로젝트의 entry 흐름과 asset ownership을 예측 가능하게 유지할 수 있습니다.

### 1.1 Keep Pages, Layouts, Components, and Content in Native Directories

**Impact: HIGH (keeps Astro-specific responsibilities obvious before reading implementation details)**

`src/pages`, `src/layouts`, `src/components`, `src/content`는 각자 역할이 다릅니다. page와 layout과 reusable component와 content source를 한 디렉터리 트리 안에 섞지 말고, Astro 기본 디렉터리 의미를 그대로 살리는 편이 탐색과 유지보수에 유리합니다.

**Incorrect (페이지, 레이아웃, 콘텐츠 소스를 하나의 feature 트리 안에 섞음):**

```text
src/
  feature/
    blog/
      BlogLayout.astro
      page.astro
      posts/
        hello-world.md
```

**Correct (Astro 고유 디렉터리 의미를 살려 ownership을 분리):**

```text
src/
  pages/
    blog/
      [slug].astro
  layouts/
    BlogLayout.astro
  components/
    blog/
      BlogHeader.astro
  content/
    blog/
      hello-world.md
```

### 1.2 Prefer src/pages for Page Entrypoints

**Impact: CRITICAL (keeps URL-producing entry files searchable and aligned with Astro's file-based routing contract)**

URL을 직접 만드는 page entry는 `src/pages` 아래에서 소유합니다. `components/`, `features/`, `app/` 폴더 안에 page처럼 동작하는 진입 파일을 숨기지 말고, 페이지가 공용 조립을 재사용하더라도 route contract 자체는 `src/pages`에 남겨 둡니다.

**Incorrect (page entry를 feature 폴더 깊숙이 숨겨 file-based routing을 흐림):**

```text
src/
  components/
    marketing/
      pricing-page.astro
  pages/
    pricing.astro   -> imports and re-exports hidden page file
```

**Correct (`src/pages`가 URL entry를 직접 소유하고 조립은 별도 컴포넌트로 위임):**

```text
src/
  pages/
    pricing.astro
  components/
    marketing/
      PricingPage.astro
```

## 2. File Naming and Page Assets

**Impact: HIGH**

의미 있는 dynamic segment 이름과 searchable한 page asset naming은 file-based routing과 support module 탐색을 함께 쉽게 만듭니다.

### 2.1 Grow Complex Pages into a Predictable Asset Set

**Impact: MEDIUM-HIGH (gives larger pages searchable homes for helpers, islands, and render parts before they collapse into a monolith)**

page가 server query 준비, client island, page-only helper를 함께 가지기 시작하면 owner-named asset set으로 키웁니다. URL entry는 `src/pages`에 남기고, render shell과 island, support module은 searchable한 feature 이름으로 분리합니다. 모든 page에 고정된 파일 세트를 강제할 필요는 없지만, 복잡해진 뒤에도 `index.astro`, `utils.ts`, `helper.ts`만 남는 상태는 피합니다.

**Incorrect (page entry 하나에 모든 책임이 뭉치고 support file 이름도 generic함):**

```text
src/
  pages/
    pricing.astro
    utils.ts
    helper.ts
```

**Correct (page가 커지면 owner-named asset set으로 자라나게 유지):**

```text
src/
  pages/
    pricing.astro
  components/
    marketing/
      PricingPage.astro
      PricingCalculator.tsx
  lib/
    marketing/
      pricing-page.ts
```

### 2.2 Use Domain-specific Dynamic Segment Names

**Impact: MEDIUM-HIGH (keeps route params self-explanatory in file trees and inside Astro.params)**

`[param].astro`와 `[...param].astro`의 이름은 도메인 의미가 드러나는 명사를 사용합니다. 실제 slug를 표현하는 경우가 아니라면 generic `id`, `path`, `value` 이름은 피하고, 파일 경로만 봐도 해당 param이 무엇을 가리키는지 알 수 있게 둡니다.

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

## 3. Astro Components and Layout Composition

**Impact: HIGH**

`.astro` 컴포넌트는 기본적으로 정적 HTML shell과 server-side 준비 코드를 담당하고, template와 slot 구조는 framework island 없이도 읽히게 유지해야 합니다.

### 3.1 Keep Frontmatter Server-only and Template-focused

**Impact: HIGH (prevents browser behavior from leaking into Astro's server-side component preparation phase)**

Astro frontmatter는 import, props 해석, fetch, server-side 파생값 계산처럼 HTML을 준비하는 코드에 집중합니다. 브라우저 이벤트 핸들러나 DOM 접근은 template의 `<script>`나 framework island로 넘기고, frontmatter 안에서 client runtime을 흉내 내지 않습니다.

**Incorrect (frontmatter 안에서 browser handler를 정의하고 template에 직접 연결하려 함):**

```astro
---
const handleClick = () => {
	window.alert("Subscribed");
};
---

<button onclick={handleClick}>Subscribe</button>
```

**Correct (server 준비 코드는 frontmatter에 두고 browser 동작은 template script로 분리):**

```astro
---
const buttonId = "newsletter-subscribe";
---

<button id={buttonId}>Subscribe</button>

<script>
	document.getElementById("newsletter-subscribe")?.addEventListener("click", () => {
		window.alert("Subscribed");
	});
</script>
```

### 3.2 Prefer .astro for Static Shells and Layouts

**Impact: CRITICAL (reduces unnecessary client framework surface and keeps Astro's zero-JS default intact)**

state, effect, client runtime가 필요 없는 page shell, layout, wrapper, content section은 기본적으로 `.astro`로 작성합니다. React component를 이미 쓴다는 이유만으로 정적 layout까지 TSX로 밀어 넣지 말고, interactive leaf만 island로 분리합니다.

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

### 4.1 Choose client:* Directives by Visibility and Urgency

**Impact: HIGH (makes hydration cost intentional instead of defaulting everything to eager loading)**

`client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`는 모두 같은 비용이 아닙니다. above-the-fold 즉시 상호작용이 필요한 widget만 eager hydration을 쓰고, 그 외에는 visibility/idle 조건에 맞게 낮춥니다. 특히 `client:only`는 server HTML을 생략하므로 일반 hydration 대체재처럼 쓰지 않습니다.

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

### 4.2 Do Not Import .astro Components Inside Framework Components

**Impact: CRITICAL (preserves Astro's component boundary and avoids unsupported cross-runtime composition)**

React 같은 framework component 안에서는 `.astro` component를 직접 import하지 않습니다. Astro에서 framework island를 감싸고, 필요한 정적 조립은 slot이나 children으로 전달합니다.

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

**Impact: CRITICAL (keeps Astro pages mostly static and reserves JavaScript for real interaction boundaries)**

Hydration은 검색 입력, 필터, 플레이어, 차트, 폼 상태처럼 실제 상호작용이 필요한 widget에만 사용합니다. 정적 hero, marketing copy, read-only card, simple CTA wrapper는 `.astro`로 렌더링하고 불필요한 `client:*`를 붙이지 않습니다.

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

### 4.4 Reserve client:only for SSR-incompatible Components

**Impact: HIGH (preserves server-rendered HTML for interactive widgets that can hydrate normally)**

`client:only`는 server HTML을 건너뛰고 page load 시점에 바로 client 렌더링합니다. browser API 전용 라이브러리처럼 SSR이 실제로 불가능한 경우에만 사용하고, 그렇지 않다면 `client:load`, `client:idle`, `client:visible`로 server HTML을 먼저 남깁니다. `client:only`를 쓸 때는 framework hint를 명시하고, 로딩 공백이 보이면 fallback도 함께 둡니다.

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

Astro의 file-based routing과 page boundary 책임은 page file에서 직접 드러나야 하며 navigation도 plain HTML 기본값을 우선해야 합니다.

### 5.1 Keep Dynamic Route Generation at the Page Boundary

**Impact: HIGH (keeps route params and build-time page generation visible where the URL contract is defined)**

동적 route의 `getStaticPaths()`와 param-to-page generation 책임은 page file 경계에 둡니다. shared component나 utility가 URL contract를 대신 소유하게 만들지 말고, page가 경로와 데이터를 연결한 뒤 렌더링용 component에 props를 전달합니다.

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

### 5.2 Use HTML Anchors Before Framework Link Abstractions

**Impact: HIGH (aligns navigation with Astro's default routing model and avoids importing foreign router habits)**

Astro page navigation은 기본적으로 plain `<a>`를 사용합니다. 다른 SPA framework의 `<Link>` 습관을 그대로 들여오지 말고, client router가 정말 필요한 island 안이 아니라면 HTML anchor를 기본값으로 유지합니다.

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

**Impact: CRITICAL (keeps Astro's fast default intact and avoids adding server dependence too early)**

Astro 프로젝트는 기본 `static` output을 먼저 유지합니다. 쿠키, 세션, 요청별 개인화가 필요한 경로가 몇 개 있다고 해서 전체 프로젝트를 곧바로 `output: "server"`로 바꾸지 말고, 대부분의 page가 여전히 build-time에 안전하다면 static 기본값을 유지한 채 필요한 route만 on-demand로 opt out 합니다.

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

### 6.2 Reserve output: "server" for Mostly Dynamic Apps

**Impact: HIGH (makes full-project SSR a deliberate app-level choice instead of a convenience toggle)**

`output: "server"`는 새로운 기능을 추가하는 옵션이 아니라 전체 page의 기본 rendering behavior를 뒤집는 선택입니다. 대시보드, 로그인 후 앱처럼 대부분의 page가 request-time 데이터와 auth에 묶인 경우에만 기본값으로 채택하고, 그 안의 정적 page만 `prerender = true`로 opt in 합니다.

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

### 6.3 Use prerender = false for Request-bound or Personalized Routes

**Impact: CRITICAL (keeps request-time logic on routes that actually execute per request)**

쿠키, 인증 세션, 요청 헤더, 요청마다 바뀌는 개인화 데이터에 의존하는 page나 endpoint는 static mode에서 `export const prerender = false`로 on-demand rendering을 명시합니다. build 시점에 고정된 HTML로 만들 수 없는 동작을 정적 page 안에 억지로 숨기지 않습니다. `output: "server"`를 이미 쓰는 프로젝트라면 같은 intent를 page-level로 다시 선언할 필요는 없습니다.

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

### 7.1 Define Build-time Collections in src/content.config.ts

**Impact: HIGH (centralizes content ownership and keeps collection shape from being redefined across pages)**

build-time content collection 정의는 `src/content.config.ts`에서 한 번에 관리합니다. page 파일 안에서 glob, frontmatter parsing, ad-hoc shape normalization을 반복하지 말고 collection loader와 registration을 중앙화합니다. 요청마다 fresh한 데이터를 가져오는 live collection은 이 파일이 아니라 `src/live.config.ts`와 `defineLiveCollection()` 쪽으로 분리합니다.

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

**Impact: HIGH (prevents freshness assumptions from drifting between static content and request-time content)**

build-time content collection과 live collection은 같은 개념으로 취급하지 않습니다. build-time collection은 `src/content.config.ts`와 `defineCollection()`에 두고 `getCollection()`/`getEntry()`로 읽습니다. 요청마다 fresh한 CMS나 API 데이터를 다뤄야 하면 `src/live.config.ts`와 `defineLiveCollection()`을 사용하고 `getLiveCollection()`/`getLiveEntry()`로 접근합니다. live collection은 on-demand rendering 전제도 함께 갖습니다.

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

**Impact: HIGH (makes structured content type-safe and prevents frontmatter drift from leaking into pages)**

구조화된 collection은 loader만 두고 끝내지 말고 schema를 명시적으로 둡니다. collection entry shape를 page마다 추측하거나 optional chaining으로 봉합하지 말고 `astro:zod` 기반 schema에서 타입과 validation을 고정합니다.

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

**Impact: HIGH (keeps mutation boundaries aligned with who is calling them and what kind of response they must control)**

브라우저 UI가 직접 호출하는 form submit이나 mutation은 기본적으로 Actions를 먼저 검토합니다. Actions는 input validation, error shape, client/server 호출 계약을 한 경계에서 다루기 쉬워 UI와 가까운 write flow에 잘 맞습니다. 반대로 public API, webhook, binary 응답, 세밀한 header/status 제어, non-UI consumer가 필요한 경우에는 endpoint가 더 자연스럽습니다. static mode에서 HTML form 기반 action을 쓰면 on-demand rendering 전제도 함께 확인합니다.

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

### 8.2 Keep Server Islands Serializable and Slot Fallbacks Ready

**Impact: HIGH (keeps deferred rendering portable and avoids broken props or blank loading states)**

`server:defer`를 쓰는 Astro component에는 serializable props만 넘기고, 느린 personalized content에는 fallback slot을 함께 준비합니다. 함수나 거대한 객체를 넘겨 deferred boundary를 깨뜨리거나, placeholder 없이 blank 영역을 남기지 않습니다.

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

layout은 shell, page는 route contract, island는 interaction을 맡도록 좁게 분리해야 Astro의 server-first 구조가 읽히고 유지보수도 쉬워집니다.

### 9.1 Keep Page Files Focused on Route Contract and Data Handoff

**Impact: HIGH (keeps `src/pages` readable as route boundaries instead of turning them into giant mixed concerns)**

page file은 URL contract, `getStaticPaths()`, `prerender`, page-level data selection, layout 조립과 같은 route boundary 책임을 가집니다. 재사용 가능한 render detail, large markup block, browser interaction은 component나 island로 내려 page가 경계 역할을 유지하게 둡니다.

**Incorrect (page 파일이 route contract와 재사용 렌더링 상세를 한꺼번에 가짐):**

```astro
---
const products = await getProducts();
---

<section>
	{products.map((product) => (
		<article class="card">
			<h2>{product.name}</h2>
			<p>{product.description}</p>
			<button data-id={product.id}>Add to cart</button>
		</article>
	))}
</section>
```

**Correct (page는 route/data handoff를 소유하고 render detail은 component로 넘김):**

```astro
---
import ProductsIndexPage from "../../components/products/ProductsIndexPage.astro";

const products = await getProducts();
---

<ProductsIndexPage products={products} />
```

### 9.2 Limit Layouts to Shell and Composition

**Impact: HIGH (prevents shared layout files from absorbing leaf-page data and interaction logic)**

`src/layouts/*`와 상위 shell component는 공통 frame, metadata wrapper, slot composition, shared chrome까지만 담당합니다. 특정 page만 쓰는 fetch, mutation, form state, detail query를 layout으로 끌어올리지 말고 해당 page나 island에 남겨 둡니다.

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

**Correct (layout은 shell과 slot 조립만 담당):**

```astro
---
const { title } = Astro.props;
---

<DashboardFrame title={title}>
	<slot />
</DashboardFrame>
```

## 10. Workflow and Review Checks

**Impact: MEDIUM**

Astro 기능은 버전과 adapter 조건에 민감하므로 문서 확인과 layout/rendering/hydration review를 마무리 전에 함께 수행해야 합니다.

### 10.1 Add New Pages in Layout-and-rendering-first Order

**Impact: MEDIUM (reduces cleanup work by deciding shell, rendering mode, and island boundaries before files sprawl)**

새 page를 추가할 때는 화면 마크업부터 급하게 만들지 말고, 먼저 layout shell, static/on-demand 여부, dynamic route 여부, island 필요 여부를 정합니다. 이 순서를 따르면 `client:load` 남용이나 `src/pages` monolith를 뒤늦게 뜯어내는 일을 줄일 수 있습니다.

**Incorrect (page 파일부터 만들고 나중에 rendering과 shell을 끼워 맞춤):**

```text
1. `src/pages/foo.astro`부터 크게 만든다
2. 브라우저 상호작용이 생기면 일단 `client:load`를 붙인다
3. 쿠키나 auth가 필요해지면 마지막에 SSR 여부를 고민한다
```

**Correct (layout과 rendering 결정을 먼저 고정하고 page를 연다):**

```text
1. 이 page가 어떤 layout shell 아래에 있어야 하는지 먼저 판단한다
2. static, `prerender = false`, `output: "server"` 중 어떤 rendering 전제가 맞는지 고른다
3. dynamic route면 `getStaticPaths()`가 필요한지 page boundary에서 정한다
4. interactive 부분만 island로 빼고 `client:*` 또는 `client:only` 필요성을 고른다
5. page가 커지면 owner-named asset set으로 support module과 render detail을 분리한다
```

### 10.2 Consult Official Docs for Version-sensitive Astro Features

**Impact: MEDIUM (reduces stale assumptions around fast-moving Astro features and directives)**

`client:*`, `server:defer`, Actions, content collections, adapters처럼 버전과 host 조건에 민감한 Astro 기능은 공식 문서를 먼저 확인합니다. `astro-docs` MCP가 연결돼 있다면 그 경로를 우선 사용하고, 없더라도 최소한 공식 문서 기준으로 최신 동작을 확인한 뒤 규칙을 적용합니다.

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

### 10.3 Review Adapter, Output Mode, and Hydration Before Finishing

**Impact: MEDIUM (catches Astro-specific deployment and rendering mismatches before they ship)**

Astro 변경을 마무리할 때는 코드 diff만 보지 말고 adapter, `output`, prerender/on-demand 전제, build-time/live collection 선택, hydration 경계를 함께 점검합니다. Actions나 server islands를 추가했는데 adapter가 없거나, 정적 shell이 과하게 hydrate되는 상태로 끝내지 않습니다.

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
- https://docs.astro.build/en/guides/framework-components/
- https://docs.astro.build/en/guides/routing/
- https://docs.astro.build/en/guides/on-demand-rendering/
- https://docs.astro.build/en/guides/content-collections/
- https://docs.astro.build/en/guides/actions/
- https://docs.astro.build/en/guides/endpoints/
- https://docs.astro.build/en/guides/server-islands/
- https://docs.astro.build/en/reference/directives-reference/

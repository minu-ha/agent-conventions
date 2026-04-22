# Astro 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.extends`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=astro`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 Astro 코딩 컨벤션입니다. 이 가이드는 thin `src/pages` route adapter와 `src/features/<feature>` 기반 screen implementation, 의미 있는 dynamic segment와 owner-named feature file naming, `.astro` 컴포넌트와 layout/page/island/private의 명확한 책임 경계, feature page orchestration과 selective extraction 기준, static과 on-demand rendering의 의도적인 선택, build-time/live collections, Actions/endpoints/server islands 같은 Astro 고유 기능의 신중한 사용을 강조합니다. `rules/` 아래 rule 파일이 source of truth이며, Astro local rule은 기본 companion인 `typescript`와 `css` skill과 함께 사용합니다.

이 가이드는 local Astro 컨벤션 규칙만 담고 있습니다. 공통 규칙은 companion skill을 함께 로드해 보완합니다.

---

## 함께 로드할 Companion Skill

- `convention-typescript` - TypeScript Convention 공통 규칙 guide: [TypeScript Convention](../typescript/AGENTS.md)
- `convention-css` - CSS Convention 공통 규칙 guide: [CSS Convention](../css/AGENTS.md)

---

## 목차

1. [Project Structure and File Ownership](#1-project-structure-and-file-ownership) — **CRITICAL**
    - 1.1 [Keep src/pages Thin and Use It as the Route Adapter Layer](#11-keep-srcpages-thin-and-use-it-as-the-route-adapter-layer)
    - 1.2 [Place Route Implementations Under src/features/<feature>](#12-place-route-implementations-under-srcfeaturesfeature)
2. [File Naming and Page Assets](#2-file-naming-and-page-assets) — **HIGH**
    - 2.1 [Use Domain-specific Dynamic Segment Names](#21-use-domain-specific-dynamic-segment-names)
    - 2.2 [Use Owner-named Feature Files Instead of Generic page, slug, and index](#22-use-owner-named-feature-files-instead-of-generic-page-slug-and-index)
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
    - 9.1 [Extract Feature Support Code Only When the Astro Boundary Is Real](#91-extract-feature-support-code-only-when-the-astro-boundary-is-real)
    - 9.2 [Extract Feature-private Sections Only for Rendering or Interaction Boundaries](#92-extract-feature-private-sections-only-for-rendering-or-interaction-boundaries)
    - 9.3 [Keep Feature Page Files Focused on Screen Flow](#93-keep-feature-page-files-focused-on-screen-flow)
    - 9.4 [Keep Page Files Focused on Route Contract and Data Handoff](#94-keep-page-files-focused-on-route-contract-and-data-handoff)
    - 9.5 [Limit Layouts to Shell and Composition](#95-limit-layouts-to-shell-and-composition)
    - 9.6 [Place Feature-private UI Under private/](#96-place-feature-private-ui-under-private)
10. [Documentation and Comments](#10-documentation-and-comments) — **MEDIUM**
    - 10.1 [Limit Inline Comments to Rendering, Ownership, and Integration Caveats](#101-limit-inline-comments-to-rendering-ownership-and-integration-caveats)
    - 10.2 [Require JSDoc on Key Frontmatter and Feature Support Declarations](#102-require-jsdoc-on-key-frontmatter-and-feature-support-declarations)
11. [Workflow and Review Checks](#11-workflow-and-review-checks) — **MEDIUM**
    - 11.1 [Add New Pages in Layout-and-rendering-first Order](#111-add-new-pages-in-layout-and-rendering-first-order)
    - 11.2 [Consult Official Docs for Version-sensitive Astro Features](#112-consult-official-docs-for-version-sensitive-astro-features)
    - 11.3 [Review Adapter, Output Mode, and Hydration Before Finishing](#113-review-adapter-output-mode-and-hydration-before-finishing)

---

## 1. Project Structure and File Ownership

**Impact: CRITICAL**

`src/pages`는 Astro의 required route adapter layer로 얇게 유지하고, 실제 route 구현은 `src/features/<feature>`로 분리해야 entry 흐름과 ownership이 예측 가능하게 유지됩니다.

### 1.1 Keep src/pages Thin and Use It as the Route Adapter Layer

**Impact: CRITICAL (keeps Astro's required routing directory from turning into the place where full screens and private UI sprawl)**

Astro에서 `src/pages`는 required reserved directory이므로 route file 자체는 여기에 둡니다. 다만 이 프로젝트에서는 `src/pages`를 framework-required route adapter layer로만 보고 가능한 한 얇게 유지합니다. route file은 file-based route contract, `getStaticPaths()`, search param 해석, page-level data loading, feature entry 선택까지만 담당하고, 실제 화면 조립은 `src/features/<feature>`로 위임합니다. `Astro.url.searchParams`를 읽더라도 prerendered HTML이 그 값에 의존하지 않으면 static 기본값을 유지할 수 있습니다. 반대로 page HTML이나 server-side data loading이 request-time query state에 직접 의존하면 `prerender = false` 같은 rendering 선택도 page boundary에서 같이 드러냅니다.

**Incorrect (`src/pages` 안에서 full screen과 route-private UI까지 함께 키움):**

```astro
---
const search = Astro.url.searchParams.get("search") ?? "";
const posts = await getPosts({ search });
---

<section>
	{posts.map((post) => (
		<article class="post-card">
			<h2>{post.title}</h2>
			<PostRemoveModal postId={post.id} />
		</article>
	))}
</section>
```

**Correct (`src/pages`는 thin adapter로 두고 feature 구현으로 handoff):**

```astro
---
import PostListPage from "../../features/post/post-list-page.astro";
import { getPostListPageData } from "../../features/post/post.ts";

export const prerender = false;

const search = Astro.url.searchParams.get("search") ?? "";
const pageData = await getPostListPageData({ search });
---

<PostListPage {...pageData} />
```

### 1.2 Place Route Implementations Under src/features/<feature>

**Impact: HIGH (keeps Astro's reserved route files small while giving each route family a stable feature-local home)**

Astro가 예약한 디렉터리는 `src/pages`뿐이므로, 실제 route 구현은 `src/features/<feature>` 아래에 두어도 됩니다. 이 프로젝트에서는 list/detail screen, feature-owned support module, feature-owned CSS, feature-private UI를 `src/features/<feature>` 아래에 모으고, `src/pages`는 adapter 역할만 맡깁니다. shared public surface는 `src/components`, structured content는 `src/content`에 남기고, feature-local implementation은 `src/features`에서 소유합니다.

**Incorrect (route implementation이 전부 `src/pages` 안으로 자라남):**

```text
src/
  pages/
    posts/
      index.astro
      post-list-item.astro
      post-meta.astro
      post-remove-modal.astro
      post-remove-modal.css
```

**Correct (route adapter와 feature implementation의 자리를 분리):**

```text
src/
  pages/
    posts/
      index.astro
    post/
      [slug].astro
  features/
    post/
      post-list-page.astro
      post-detail-page.astro
      post.css
      post.ts
      private/
        post-list-item.astro
        post-meta.astro
        post-remove-modal.astro
        post-remove-modal.css
  content/
    blog/
      hello-world.md
```

## 2. File Naming and Page Assets

**Impact: HIGH**

의미 있는 dynamic segment 이름과 owner-named feature file은 file-based routing과 support module 탐색을 함께 쉽게 만듭니다.

### 2.1 Use Domain-specific Dynamic Segment Names

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

### 2.2 Use Owner-named Feature Files Instead of Generic page, slug, and index

**Impact: MEDIUM-HIGH (keeps feature roots searchable even after the number of screens and support files grows)**

`src/features/<feature>` 아래의 파일은 generic name보다 owner-named file을 우선합니다. 즉 `page.astro`, `slug.astro`, `index.css`, `index.ts`처럼 의미가 약한 이름보다 `post-list-page.astro`, `post-detail-page.astro`, `post.css`, `post.ts`처럼 feature 이름과 역할이 함께 드러나는 이름을 사용합니다. 이 규칙은 grep/search 탐색성을 높이고, feature 수가 많아져도 파일명이 서로 구분되게 만듭니다. route adapter 파일인 `src/pages/**/[slug].astro` 같은 이름은 Astro route contract 자체이므로 예외입니다.

**Incorrect (`src/features` 안에서 generic file name을 남발함):**

```text
src/
  features/
    post/
      page.astro
      slug.astro
      index.css
      index.ts
      private/
        modal.astro
        meta.astro
```

**Correct (feature 이름과 역할이 함께 드러나는 owner-named file을 사용):**

```text
src/
  features/
    post/
      post-list-page.astro
      post-detail-page.astro
      post.css
      post.ts
      private/
        post-remove-modal.astro
        post-meta.astro
```

## 3. Astro Components and Layout Composition

**Impact: HIGH**

`.astro` 컴포넌트는 기본적으로 정적 HTML shell과 server-side 준비 코드를 담당하고, template와 slot 구조는 framework island 없이도 읽히게 유지해야 합니다.

### 3.1 Keep Frontmatter Server-only and Template-focused

**Impact: HIGH (prevents browser behavior from leaking into Astro's server-side component preparation phase)**

Astro frontmatter는 server-only component script입니다. import, `Astro.props` 해석, fetch, server-side 파생값 계산처럼 HTML을 준비하는 코드에 집중하고, 이 값이 브라우저에서 그대로 살아 있을 것처럼 가정하지 않습니다. 브라우저 이벤트 핸들러나 DOM 접근은 template의 `<script>`나 framework island로 넘기고, frontmatter 값이 browser script에 필요하면 `data-*` attribute 같은 명시적인 handoff를 사용합니다.

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

### 3.2 Prefer .astro for Static Shells and Layouts

**Impact: CRITICAL (reduces unnecessary client framework surface and keeps Astro's zero-JS default intact)**

state, effect, client runtime가 필요 없는 page shell, layout, wrapper, content section은 기본적으로 `.astro`로 작성합니다. React component를 이미 쓴다는 이유만으로 정적 layout까지 TSX로 밀어 넣지 말고, interactive leaf만 island로 분리합니다. layout이라는 역할은 `src/layouts`에만 둘 필요가 없고, shared owner나 feature owner 아래에 있어도 괜찮습니다. page content가 주입되는 자리는 `<slot />`로 드러내고, full page shell을 만드는 layout이라면 `<html>`이 최상위 parent가 되게 유지합니다.

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

layout은 shell, page는 route adapter contract, feature page는 screen flow owner, `private/`와 support module은 진짜 rendering/interaction/data boundary가 있을 때만 분리해야 Astro의 server-first 구조가 읽히고 유지보수도 쉬워집니다.

### 9.1 Extract Feature Support Code Only When the Astro Boundary Is Real

**Impact: HIGH (prevents feature pages from scattering one-off frontmatter logic into generic helpers)**

feature page frontmatter의 support code는 입력과 출력 계약이 분명하고, 페이지에서 치우면 화면 흐름이 더 잘 읽히며, 다른 entry에서도 같은 owner가 재사용할 가치가 있을 때만 `src/features/<feature>/<feature>.ts` 같은 support module로 옮깁니다. 컬렉션 응답 정규화, page model 조립, metadata helper, shared query argument 생성처럼 server-side data shaping 역할은 옮길 수 있습니다. 반대로 작은 1회성 boolean branch, `Astro.props` destructuring 바로 옆이 가장 읽기 쉬운 계산, 현재 page에만 붙는 `class:list` 조건, 짧은 empty-state label 선택은 feature page frontmatter에 남깁니다. `utils.ts`, `helpers.ts`, `common.ts` 같은 generic 파일명은 만들지 않고 owner-named module을 사용합니다.

**Incorrect (작은 page-local 계산을 generic helper로 흩뿌림):**

```ts
// src/features/post/utils.ts
export const getHasActiveTag = (selectedTag?: string) => {
	return typeof selectedTag === "string" && selectedTag.length > 0;
};

export const getEmptyMessage = (selectedTag?: string) => {
	return selectedTag ? "No posts match this filter." : "No published posts yet.";
};
```

이 정도 로직은 feature page frontmatter 바로 옆이 더 읽기 쉽고, `utils.ts`라는 이름도 ownership을 흐립니다.

**Correct (owner-named support module에는 진짜 data boundary만 둠):**

```ts
// src/features/post/post.ts
/**
 * @helper post collection 응답을 목록 화면 model로 정규화
 */
export const buildPostListPageModel = (posts: PostCollectionEntry[]) => {
	return {
		title: "Posts",
		description: "Latest writing from the team.",
		availableTags: [...new Set(posts.flatMap((post) => post.data.tags))].sort(),
		posts: posts.map((post) => ({
			id: post.id,
			title: post.data.title,
			description: post.data.description,
			tags: post.data.tags,
			href: `/post/${post.slug}/`,
		})),
	};
};
```

```astro
---
import type { PostListPageModel } from "./post";

/**
 * @summary 포스트 목록 feature screen props
 */
interface Props {
	pageModel: PostListPageModel;
	selectedTag?: string;
}

const { pageModel, selectedTag } = Astro.props;
const hasActiveTag = typeof selectedTag === "string" && selectedTag.length > 0;
const emptyMessage = hasActiveTag
	? "No posts match this filter."
	: "No published posts yet.";
---
```

이 구조에서는 collection normalization 같은 실제 data boundary만 `post.ts`에 두고, 현재 feature page 흐름을 읽는 데 필요한 작은 분기와 문구 선택은 frontmatter에 남겨 둡니다.

### 9.2 Extract Feature-private Sections Only for Rendering or Interaction Boundaries

**Impact: HIGH (keeps feature pages readable while avoiding premature `private/` section extraction)**

feature page에서 `private/` component를 추출할지는 "섹션처럼 보이느냐"가 아니라 실제 rendering boundary나 interaction boundary를 소유하느냐로 판단합니다. Astro 기준으로는 `client:*`나 `client:only` hydration, `server:defer`와 fallback slot, form/action ownership, custom element나 inline `<script>`가 붙는 브라우저 동작, props adapter가 복잡한 third-party widget, slot contract를 가진 reusable partial 같은 경우에만 `private/` section으로 분리할 가치가 있습니다. 반대로 단순 layout wrapper, heading/body/footer grouping, 들여쓰기 감소만을 위한 component 추출은 feature page의 흐름만 숨기므로 기본값으로 삼지 않습니다.

**Incorrect (단순한 화면 덩어리를 모두 `private/` section으로 쪼갬):**

```astro
---
import PostBodySection from "./private/post-body-section.astro";
import PostHeaderSection from "./private/post-header-section.astro";
import PostMetaSection from "./private/post-meta-section.astro";

const { pageModel } = Astro.props;
---

<article class="post-detail-page">
	<PostHeaderSection post={pageModel.post} />
	<PostMetaSection post={pageModel.post} />
	<PostBodySection html={pageModel.post.html} />
</article>
```

이 세 section이 하는 일이 단순 markup grouping뿐이라면 분리 이유가 약합니다. 읽는 사람은 실제로 boundary가 있는 부분과 아닌 부분을 구분하기 어려워집니다.

**Correct (boundary가 있는 subtree만 `private/`로 분리):**

```astro
---
import NewsletterSignupIsland from "./private/newsletter-signup-island.tsx";
import RelatedPostsPanel from "./private/related-posts-panel.astro";
import type { PostDetailPageModel } from "./post";

/**
 * @summary 포스트 상세 feature screen props
 */
interface Props {
	pageModel: PostDetailPageModel;
}

const { pageModel } = Astro.props;
---

<article class="post-detail-page">
	<header class="post-detail-page__header">
		<h1>{pageModel.post.title}</h1>
		<p>{pageModel.post.description}</p>
	</header>

	<div class="post-detail-page__meta">
		<span>{pageModel.post.author}</span>
		<span>{pageModel.post.publishedAtLabel}</span>
	</div>

	<div class="post-detail-page__body" set:html={pageModel.post.html} />

	<RelatedPostsPanel server:defer posts={pageModel.relatedPosts}>
		<p slot="fallback">Loading related posts...</p>
	</RelatedPostsPanel>

	<NewsletterSignupIsland client:visible postId={pageModel.post.id} />
</article>
```

이 예시에서는 deferred related posts와 hydrated signup widget처럼 실제 boundary가 있는 부분만 `private/` component로 추출하고, 단순한 header/meta/body markup은 feature page에 남겨 화면 흐름을 보이게 유지합니다.

### 9.3 Keep Feature Page Files Focused on Screen Flow

**Impact: HIGH (keeps `src/features/<feature>/*-page.astro` readable as the main screen orchestration layer after route handoff)**

`src/pages`가 route contract와 data handoff를 끝내고 나면 `src/features/<feature>/*-page.astro`가 화면의 주 orchestration owner가 됩니다. 이 파일에는 section 순서, page-scoped derived value, `Astro.props`에서 받은 data의 화면용 분기, empty state 선택, slot/layout 조립, island prop handoff 같은 화면 흐름이 계속 보여야 합니다. 단순히 마크업 덩어리가 커 보인다는 이유만으로 feature page를 `private/` section wrapper들의 나열로 바꾸지 않습니다. 실제 rendering boundary나 interaction boundary를 가진 subtree만 아래로 내리고, 나머지 화면 흐름은 feature page에서 읽히게 둡니다.

**Incorrect (feature page가 단순 wrapper 나열만 남아 화면 흐름을 숨김):**

```astro
---
import PostHeroSection from "./private/post-hero-section.astro";
import PostFilterSection from "./private/post-filter-section.astro";
import PostListSection from "./private/post-list-section.astro";
import PostPaginationSection from "./private/post-pagination-section.astro";
---

<PostHeroSection />
<PostFilterSection />
<PostListSection />
<PostPaginationSection />
```

이 구조만 보면 어떤 data를 기준으로 분기하는지, 어떤 island가 선택을 바꾸는지, empty state가 어디서 결정되는지 feature page에서 전혀 보이지 않습니다.

**Correct (feature page가 screen flow와 page-level handoff를 계속 소유):**

```astro
---
import PostListItem from "./private/post-list-item.astro";
import PostFiltersIsland from "./private/post-filters-island.tsx";
import type { PostListPageModel } from "./post";

/**
 * @summary 포스트 목록 feature screen props
 */
interface Props {
	pageModel: PostListPageModel;
	selectedTag?: string;
}

const { pageModel, selectedTag } = Astro.props;
const visiblePosts = selectedTag
	? pageModel.posts.filter((post) => post.tags.includes(selectedTag))
	: pageModel.posts;
const hasVisiblePosts = visiblePosts.length > 0;
---

<section class="post-list-page">
	<header class="post-list-page__header">
		<h1>{pageModel.title}</h1>
		<p>{pageModel.description}</p>
	</header>

	<PostFiltersIsland
		client:idle
		availableTags={pageModel.availableTags}
		selectedTag={selectedTag}
	/>

	{hasVisiblePosts ? (
		<ul class="post-list-page__list">
			{visiblePosts.map((post) => (
				<PostListItem post={post} />
			))}
		</ul>
	) : (
		<p class="post-list-page__empty">No posts match this filter.</p>
	)}
</section>
```

이 예시는 filter island와 list item처럼 경계가 있는 subtree만 분리하고, 전체 화면 순서와 empty state 선택은 feature page에서 계속 읽히게 유지합니다.

### 9.4 Keep Page Files Focused on Route Contract and Data Handoff

**Impact: HIGH (keeps `src/pages` readable as route boundaries instead of turning them into giant mixed concerns)**

page file은 URL contract, `getStaticPaths()`, `prerender`, search param 해석, page-level data selection, feature entry 선택과 같은 route boundary 책임을 가집니다. 재사용 가능한 render detail, large markup block, browser interaction은 `src/features/<feature>`나 island로 내려 page가 thin adapter 역할을 유지하게 둡니다. 특히 page HTML이나 server-side data selection이 `Astro.url.searchParams` 같은 request-time state에 직접 의존하는 경우에는 `prerender = false` 여부도 이 경계에서 같이 보이게 유지합니다. 반대로 query state를 client island에 넘기기만 하고 prerendered HTML은 그대로라면 static 기본값을 유지할 수 있습니다.

**Incorrect (page 파일이 route contract와 재사용 렌더링 상세를 한꺼번에 가짐):**

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

**Correct (page는 route/data handoff를 소유하고 feature entry로 위임):**

```astro
---
import PostListPage from "../../features/post/post-list-page.astro";
import { getPostListPageData } from "../../features/post/post.ts";

export const prerender = false;

const tab = Astro.url.searchParams.get("tab") ?? "all";
const pageData = await getPostListPageData({ tab });
---

<PostListPage {...pageData} />
```

### 9.5 Limit Layouts to Shell and Composition

**Impact: HIGH (prevents shared layout files from absorbing leaf-page data and interaction logic)**

layout component는 공통 frame, metadata wrapper, `<slot />` 기반 composition, shared chrome까지만 담당합니다. 이 component가 `src/layouts`, `src/components`, `src/features/<feature>` 중 어디에 있든 역할은 같습니다. Astro 공식 문서 기준으로 `src/layouts`는 관례일 뿐 필수가 아니므로, 이 프로젝트에서는 shared shell이면 shared owner 아래에, feature 전용 shell이면 feature 아래에 둘 수 있습니다. full page shell을 렌더링하는 layout이면 `<html>`이 최상위 parent가 되게 유지하고, 특정 page만 쓰는 fetch, mutation, form state, detail query는 layout으로 끌어올리지 말고 해당 page나 island에 남겨 둡니다.

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

### 9.6 Place Feature-private UI Under private/

**Impact: HIGH (makes the boundary between feature-local implementation and shared public surface obvious)**

shared로 승격되지 않은 route-private UI, modal, form, 보조 renderer, feature 전용 CSS는 `src/features/<feature>/private/` 아래에 둡니다. `private/`는 재사용 가능한 public surface가 아니라 현재 feature 내부 전용 구현이라는 소유권을 드러내는 이름입니다. 다른 feature에서도 쓰이기 시작하면 `private/`에 두지 말고 shared layer로 승격합니다. 다만 feature page의 screen orchestration까지 `private/`로 옮기지는 말고, 실제 leaf UI나 local implementation detail만 내려 ownership을 분명히 합니다.

**Incorrect (feature-local UI가 feature root나 shared components에 섞여 ownership이 흐려짐):**

```text
src/
  components/
    PostMeta.astro
  features/
    post/
      post-list-page.astro
      post-remove-modal.astro
      post-remove-modal.css
```

**Correct (feature-local implementation detail은 `private/` 아래에 둠):**

```text
src/
  components/
    Avatar.astro
  features/
    post/
      post-list-page.astro
      post.ts
      private/
        post-list-item.astro
        post-meta.astro
        post-remove-modal.astro
        post-remove-modal.css
```

## 10. Documentation and Comments

**Impact: MEDIUM**

Astro frontmatter와 feature support module의 핵심 선언에는 JSDoc을 남기고, inline comment는 rendering, ownership, integration caveat처럼 없으면 오해될 제약만 설명해야 합니다.

### 10.1 Limit Inline Comments to Rendering, Ownership, and Integration Caveats

**Impact: MEDIUM (keeps Astro comments focused on the constraints readers are most likely to miss)**

Astro의 inline comment는 rendering mode, serialization, feature ownership handoff, adapter requirement, integration caveat처럼 없으면 오해되기 쉬운 제약에만 남깁니다. frontmatter 안에서는 `//` 주석을 사용하고, template 내부 설명이 필요하면 HTML comment로 남기기보다 frontmatter나 support module로 경계를 옮겨 문서화합니다. 변수명이나 template 구조를 그대로 읽어주는 주석은 남기지 않습니다.

**Incorrect (자명한 동작을 그대로 설명하는 주석):**

```astro
---
const tab = Astro.url.searchParams.get("tab") ?? "all";
// 탭을 가져온다
const pageData = await getPostListPageData({ tab });
// 데이터를 불러온다
---
```

**Correct (rendering/ownership 제약만 짧게 설명):**

```astro
---
export const prerender = false;

// 쿠키 기반 개인화가 있어 build-time prerender로 고정하면 안 됨.
const tab = Astro.url.searchParams.get("tab") ?? "all";

// route adapter는 param 해석까지만 맡고 실제 화면 조립은 feature entry로 넘김.
const pageData = await getPostListPageData({ tab });
---
```

### 10.2 Require JSDoc on Key Frontmatter and Feature Support Declarations

**Impact: MEDIUM-HIGH (makes Astro route boundaries and feature support helpers searchable before readers inspect implementation details)**

Astro frontmatter와 `src/features/<feature>/<feature>.ts` 같은 support module에서 중요한 경계를 선언할 때는 헤더 JSDoc을 작성합니다. `Props` interface, `getStaticPaths()`, exported page data loader, 외부 연동 helper, rendering mode 판단이 섞인 helper는 문맥 설명 없이 지나가기 쉬우므로 `@summary`, `@helper`, `@api`, `@field` 같은 태그를 companion skill인 `convention-typescript` 표준에 맞춰 남깁니다. 단순 local destructuring이나 자명한 alias까지 전부 문서화할 필요는 없습니다.

**Incorrect (route/feature 경계 선언에 문맥 설명이 없음):**

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

**Correct (핵심 선언의 역할과 의도를 바로 위에 문서화):**

```astro
---
/**
 * @summary 포스트 상세 페이지 메타 props
 */
interface Props {
	/** @field 문서 제목 */
	title: string;
	/** @field description 메타 태그 내용 */
	description: string;
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

### 11.2 Consult Official Docs for Version-sensitive Astro Features

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

### 11.3 Review Adapter, Output Mode, and Hydration Before Finishing

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

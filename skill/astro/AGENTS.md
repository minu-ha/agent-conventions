# Astro 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.extends`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=astro`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 Astro 코딩 컨벤션입니다. 이 가이드는 `src/pages` 중심의 file-based entry 구조, `.astro` 컴포넌트와 layout의 명확한 경계, 과한 hydration을 피하는 island 설계, content collections와 Actions/server islands 같은 Astro 고유 기능의 의도적인 사용을 강조합니다. `rules/` 아래 rule 파일이 source of truth이며, 기본 compiled guide는 local Astro 규칙만 담고 공통 TypeScript 규칙은 `typescript` companion skill과 함께 사용합니다.

이 가이드는 local Astro 컨벤션 규칙만 담고 있습니다. TypeScript 같은 공통 규칙은 companion skill을 함께 로드해 보완합니다.

---

## 함께 로드할 Companion Skill

- `convention-typescript` - TypeScript Convention 공통 규칙 guide: [TypeScript Convention](../typescript/AGENTS.md)

---

## 목차

1. [Project Structure and File Ownership](#1-project-structure-and-file-ownership) — **CRITICAL**
    - 1.1 [Keep Pages, Layouts, Components, and Content in Native Directories](#11-keep-pages-layouts-components-and-content-in-native-directories)
    - 1.2 [Prefer src/pages for Page Entrypoints](#12-prefer-srcpages-for-page-entrypoints)
2. [Astro Components and Layout Composition](#2-astro-components-and-layout-composition) — **HIGH**
    - 2.1 [Keep Frontmatter Server-only and Template-focused](#21-keep-frontmatter-server-only-and-template-focused)
    - 2.2 [Prefer .astro for Static Shells and Layouts](#22-prefer-astro-for-static-shells-and-layouts)
3. [Islands and Framework Boundaries](#3-islands-and-framework-boundaries) — **CRITICAL**
    - 3.1 [Choose client:* Directives by Visibility and Urgency](#31-choose-client-directives-by-visibility-and-urgency)
    - 3.2 [Do Not Import .astro Components Inside Framework Components](#32-do-not-import-astro-components-inside-framework-components)
    - 3.3 [Hydrate Only Truly Interactive Widgets](#33-hydrate-only-truly-interactive-widgets)
4. [Routing and Navigation Contracts](#4-routing-and-navigation-contracts) — **HIGH**
    - 4.1 [Keep Dynamic Route Generation at the Page Boundary](#41-keep-dynamic-route-generation-at-the-page-boundary)
    - 4.2 [Use HTML Anchors Before Framework Link Abstractions](#42-use-html-anchors-before-framework-link-abstractions)
5. [Content Collections and Data Loading](#5-content-collections-and-data-loading) — **HIGH**
    - 5.1 [Define Collections in src/content.config.ts](#51-define-collections-in-srccontentconfigts)
    - 5.2 [Give Collections Explicit Zod Schemas](#52-give-collections-explicit-zod-schemas)
6. [Server Features and Rendering Boundaries](#6-server-features-and-rendering-boundaries) — **HIGH**
    - 6.1 [Keep Server Islands Serializable and Slot Fallbacks Ready](#61-keep-server-islands-serializable-and-slot-fallbacks-ready)
    - 6.2 [Prefer Actions Over UI-facing API Endpoints](#62-prefer-actions-over-ui-facing-api-endpoints)
7. [Workflow and Review Checks](#7-workflow-and-review-checks) — **MEDIUM**
    - 7.1 [Consult Official Docs for Version-sensitive Astro Features](#71-consult-official-docs-for-version-sensitive-astro-features)
    - 7.2 [Review Adapter, Output Mode, and Hydration Before Finishing](#72-review-adapter-output-mode-and-hydration-before-finishing)

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

## 2. Astro Components and Layout Composition

**Impact: HIGH**

`.astro` 컴포넌트는 기본적으로 정적 HTML shell과 server-side 준비 코드를 담당하고, template와 slot 구조는 framework island 없이도 읽히게 유지해야 합니다.

### 2.1 Keep Frontmatter Server-only and Template-focused

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

### 2.2 Prefer .astro for Static Shells and Layouts

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

## 3. Islands and Framework Boundaries

**Impact: CRITICAL**

hydration은 진짜 상호작용이 필요한 widget에만 제한하고, framework component와 Astro component 사이의 import/slot 경계도 명확하게 유지해야 합니다.

### 3.1 Choose client:* Directives by Visibility and Urgency

**Impact: HIGH (makes hydration cost intentional instead of defaulting everything to eager loading)**

`client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`는 모두 같은 비용이 아닙니다. above-the-fold 즉시 상호작용이 필요한 widget만 eager hydration을 쓰고, 그 외에는 visibility/idle 조건에 맞게 낮춥니다.

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

### 3.2 Do Not Import .astro Components Inside Framework Components

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

### 3.3 Hydrate Only Truly Interactive Widgets

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

## 4. Routing and Navigation Contracts

**Impact: HIGH**

Astro의 file-based routing과 page boundary 책임은 page file에서 직접 드러나야 하며 navigation도 plain HTML 기본값을 우선해야 합니다.

### 4.1 Keep Dynamic Route Generation at the Page Boundary

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

### 4.2 Use HTML Anchors Before Framework Link Abstractions

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

## 5. Content Collections and Data Loading

**Impact: HIGH**

structured content는 collection config와 schema를 중심으로 관리해야 page 파일 안의 ad-hoc parsing과 shape drift를 줄일 수 있습니다.

### 5.1 Define Collections in src/content.config.ts

**Impact: HIGH (centralizes content ownership and keeps collection shape from being redefined across pages)**

build-time content collection 정의는 `src/content.config.ts`에서 한 번에 관리합니다. page 파일 안에서 glob, frontmatter parsing, ad-hoc shape normalization을 반복하지 말고 collection loader와 registration을 중앙화합니다.

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

### 5.2 Give Collections Explicit Zod Schemas

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

## 6. Server Features and Rendering Boundaries

**Impact: HIGH**

Actions, endpoints, server islands는 각각 전제가 다르므로 UI 통신 경로와 deferred rendering 경계를 의도적으로 선택해야 합니다.

### 6.1 Keep Server Islands Serializable and Slot Fallbacks Ready

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

### 6.2 Prefer Actions Over UI-facing API Endpoints

**Impact: HIGH (keeps browser-to-server form and mutation flows type-safe with less boilerplate)**

브라우저 UI가 직접 호출하는 form submit이나 mutation은 가능하면 API endpoint보다 Actions를 우선합니다. Actions는 input validation, error shape, client/server 호출 계약을 한 경계에서 다루기 쉬우므로 UI와 가까운 write flow에 더 잘 맞습니다.

**Incorrect (UI mutation마다 ad-hoc API endpoint와 수동 `fetch()`를 만듦):**

```astro
<script>
	document.querySelector("form")?.addEventListener("submit", async (event) => {
		event.preventDefault();
		await fetch("/api/newsletter", {
			method: "POST",
			body: new FormData(event.currentTarget),
		});
	});
</script>
```

**Correct (UI-facing mutation은 Action 경계로 올리고 type-safe하게 호출):**

```ts
import { defineAction } from "astro:actions";
import { z } from "astro/zod";

export const server = {
	subscribeNewsletter: defineAction({
		input: z.object({ email: z.string().email() }),
		handler: async ({ email }) => {
			await subscribe(email);
			return { ok: true };
		},
	}),
};
```

## 7. Workflow and Review Checks

**Impact: MEDIUM**

Astro 기능은 버전과 adapter 조건에 민감하므로 문서 확인과 adapter/output/hydration review를 마무리 전에 함께 수행해야 합니다.

### 7.1 Consult Official Docs for Version-sensitive Astro Features

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

### 7.2 Review Adapter, Output Mode, and Hydration Before Finishing

**Impact: MEDIUM (catches Astro-specific deployment and rendering mismatches before they ship)**

Astro 변경을 마무리할 때는 코드 diff만 보지 말고 adapter, `output`, prerender/on-demand 전제, hydration 경계를 함께 점검합니다. Actions나 server islands를 추가했는데 adapter가 없거나, 정적 shell이 과하게 hydrate되는 상태로 끝내지 않습니다.

**Incorrect (Astro 전용 전제를 확인하지 않고 기능만 붙이고 마무리):**

```text
- `server:defer`를 추가했지만 adapter 설치 여부를 확인하지 않음
- UI mutation을 Actions로 옮겼지만 output mode와 host 제약은 보지 않음
- 정적 page section까지 `client:load`가 퍼졌는지 점검하지 않음
```

**Correct (Astro-specific review checklist로 배포 전제를 같이 검토):**

```text
- adapter와 `output` 설정이 Actions/server islands 요구사항과 맞는지 확인
- prerender 경로와 on-demand 경로가 섞일 때 page boundary 의도가 유지되는지 확인
- hydrate된 island가 진짜 interactive leaf만 남았는지 마지막으로 점검
```

## 참고 자료

- https://docs.astro.build/en/basics/astro-components/
- https://docs.astro.build/en/guides/framework-components/
- https://docs.astro.build/en/guides/routing/
- https://docs.astro.build/en/guides/content-collections/
- https://docs.astro.build/en/guides/actions/
- https://docs.astro.build/en/guides/server-islands/

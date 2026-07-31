# TanStack Route 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.extends`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=tanstack-route`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 TanStack Router 컨벤션입니다. 이 가이드는 layout-shell-first route grouping, 검색 가능한 파일명, 명시적인 router boundary 선언, route-local 소유권, generated artifact 보호를 강조합니다. `rules/` 아래 rule 파일이 source of truth이며, 기본 compiled guide는 local router 규칙만 담고 route support module과 search schema에는 `typescript` companion skill을 함께 사용합니다.

이 문서에는 TanStack Route 컨벤션 규칙만 담겨 있습니다. 아래 규칙도 함께 따릅니다.

---

## 함께 따르는 규칙

- [TypeScript Convention](../typescript/HANDBOOK.md) — 공통 규칙

---

## 목차

1. [Route Structure and Grouping](#1-route-structure-and-grouping) — **CRITICAL**
    - 1.1 [Avoid Folder-only and Flat-only Route Trees](#11-avoid-folder-only-and-flat-only-route-trees)
    - 1.2 [Keep Root Responsibilities in `__root.tsx`](#12-keep-root-responsibilities-in-root-tsx)
    - 1.3 [Keep Shared-layout Screens Under One Parent Layout](#13-keep-shared-layout-screens-under-one-parent-layout)
    - 1.4 [Split Top-level Route Groups by Layout Shell](#14-split-top-level-route-groups-by-layout-shell)
    - 1.5 [Use Parentheses Folders for Pathless Route Groups](#15-use-parentheses-folders-for-pathless-route-groups)
2. [File Naming and Route Assets](#2-file-naming-and-route-assets) — **HIGH**
    - 2.1 [Name Top-level Groups by Shell Meaning](#21-name-top-level-groups-by-shell-meaning)
    - 2.2 [Prepare the Basic Route File Set](#22-prepare-the-basic-route-file-set)
    - 2.3 [Start Child Route Sets With Parentheses Folders](#23-start-child-route-sets-with-parentheses-folders)
    - 2.4 [Use Domain-specific Dynamic Segment Names](#24-use-domain-specific-dynamic-segment-names)
    - 2.5 [Use Owner-named Route Support Modules Instead of Generic Helper Files](#25-use-owner-named-route-support-modules-instead-of-generic-helper-files)
    - 2.6 [Use Searchable Feature Route File Names](#26-use-searchable-feature-route-file-names)
3. [Route Definition and Navigation Boundaries](#3-route-definition-and-navigation-boundaries) — **CRITICAL**
    - 3.1 [Export `Route` at the Top of the File](#31-export-route-at-the-top-of-the-file)
    - 3.2 [Match Route Paths to File Structure](#32-match-route-paths-to-file-structure)
    - 3.3 [Read Params and Search From the Local `Route`](#33-read-params-and-search-from-the-local-route)
    - 3.4 [Redirect Empty Entry Routes in `beforeLoad`](#34-redirect-empty-entry-routes-in-beforeload)
    - 3.5 [Run Auth and Permission Guards in `beforeLoad`](#35-run-auth-and-permission-guards-in-beforeload)
    - 3.6 [Validate Search Before Using Route Search](#36-validate-search-before-using-route-search)
4. [Route-local Ownership and Responsibilities](#4-route-local-ownership-and-responsibilities) — **HIGH**
    - 4.1 [Keep `*.index.tsx` Files Focused on Screen Flow](#41-keep-index-tsx-files-focused-on-screen-flow)
    - 4.2 [Limit `*.layout.tsx` Files to Shell Concerns](#42-limit-layout-tsx-files-to-shell-concerns)
    - 4.3 [Place Route-only Modules in `-local/`](#43-place-route-only-modules-in--local)
5. [Styles and Generated Artifacts](#5-styles-and-generated-artifacts) — **MEDIUM-HIGH**
    - 5.1 [Keep Route CSS at Route Scope](#51-keep-route-css-at-route-scope)
    - 5.2 [Never Edit Generated Route Tree Files](#52-never-edit-generated-route-tree-files)
6. [Workflow and Verification](#6-workflow-and-verification) — **MEDIUM**
    - 6.1 [Add New Routes in Layout-first Order](#61-add-new-routes-in-layout-first-order)
    - 6.2 [Review Route Structure Before Finishing](#62-review-route-structure-before-finishing)

---

## 1. Route Structure and Grouping

**Impact: CRITICAL**

layout shell 결정, root 경계, pathless grouping 규칙은 기능이 늘어나도 route tree를 예측 가능하게 유지합니다.

### 1.1 Avoid Folder-only and Flat-only Route Trees

**Impact: HIGH (깊은 중첩이나 지나치게 긴 파일명을 강요하지 않고 route 트리를 읽을 수 있게 유지합니다)**

폴더만으로 라우트를 표현하면 중첩이 깊어지고 `index.tsx` 반복이 심해집니다.
반대로 플랫 파일명만으로 구조를 표현하면 파일명이 지나치게 길어지고 rename 비용이 커집니다.
일반 폴더, `()` 그룹 폴더, feature 이름이 드러나는 엔트리 파일명을 함께 섞어 씁니다.

**Incorrect (폴더 전용 구조와 플랫 전용 구조로 한쪽에 치우침):**

```txt
Bad: 폴더만으로 표현
<route-root>/app/settings/permissions/members/index.tsx

Bad: 플랫 파일명만으로 표현
<route-root>/app.settings.permissions.members.index.tsx
```

**Correct (일반 폴더와 그룹 폴더, feature 엔트리를 혼합):**

```txt
<route-root>/app/
  app.layout.tsx
  app.index.tsx
  (settings)/
    settings.layout.tsx
    settings.index.tsx
    (permissions)/
      permissions.layout.tsx
      permissions.index.tsx
      (members)/
        members.index.tsx
```

### 1.2 Keep Root Responsibilities in `__root.tsx`

**Impact: HIGH (앱 전역 route 관심사가 기능별 셸과 섞이는 것을 막습니다)**

전역 라우트 컨텍스트와 앱 전체 공통 책임은 `<route-root>/__root.tsx`에서만 관리합니다.
루트는 `head`, 전역 `Outlet`, 전역 로딩/모달 정리처럼 모든 화면이 공유하는 책임만 가져야 하고,
특정 feature 전용 셸이나 화면 로직을 끌어오지 않습니다.

**Incorrect (루트 파일에 feature 전용 셸 책임을 섞음):**

```tsx
// <route-root>/__root.tsx
export const Route = createRootRoute({
	component: Root,
});

function Root() {
	return (
		<AuthSidebarLayout>
			<ProjectDashboardHeader />
			<Outlet />
		</AuthSidebarLayout>
	);
}
```

**Correct (루트는 전역 책임만 유지):**

```tsx
// <route-root>/__root.tsx
export const Route = createRootRoute({
	head: () => ({
		meta: [{title: "App"}],
	}),
	component: Root,
});

function Root() {
	return (
		<>
			<GlobalModalHost />
			<Outlet />
		</>
	);
}
```

### 1.3 Keep Shared-layout Screens Under One Parent Layout

**Impact: HIGH (같은 레이아웃을 쓰는 화면들이 최상위 route 셸을 중복하지 않게 합니다)**

여러 화면이 같은 레이아웃 셸을 쓰면 같은 부모 `layout` 아래에 두고 하위 그룹만 늘립니다.
기능이 다르다는 이유만으로 최상위 레이아웃을 새로 만들지 말고, 동일 셸이라면 기존 부모 아래에서 확장합니다.
각 feature가 자기 `feature.layout.tsx` tunnel route를 따로 가질 수는 있지만,
공통 shell을 대신하는 상위 layout을 feature별로 중복해서 만들지는 않습니다.

**Incorrect (같은 셸인데 기능별로 상위 layout을 새로 만듦):**

```txt
<route-root>/(orders)/orders.layout.tsx
<route-root>/(orders)/orders.index.tsx
<route-root>/(members)/members.layout.tsx
<route-root>/(members)/members.index.tsx
```

**Correct (같은 셸이면 하나의 부모 layout 아래에 유지):**

```txt
<route-root>/app.layout.tsx
<route-root>/app.index.tsx
<route-root>/app/(orders)/orders.layout.tsx
<route-root>/app/(orders)/orders.index.tsx
<route-root>/app/(members)/members.layout.tsx
<route-root>/app/(members)/members.index.tsx
<route-root>/app/(settings)/settings.layout.tsx
<route-root>/app/(settings)/settings.index.tsx
```

### 1.4 Split Top-level Route Groups by Layout Shell

**Impact: CRITICAL (최상위 route 경계를 기능 이름이 아니라 실제 셸 차이에 맞춥니다)**

최상위 라우트 그룹은 기능명 기준이 아니라 레이아웃 셸 기준으로 나눕니다.
헤더, 사이드바, 접근 가드, 브레드크럼, 전역 래퍼가 다르면 별도 최상위 그룹으로 분리하고, 모든 화면이 같은 셸을 공유하면
기능별 최상위 그룹으로 쪼개지 않습니다.

**Incorrect (같은 레이아웃인데 기능명으로 최상위 그룹을 분리):**

```txt
<route-root>/(orders)/orders.index.tsx
<route-root>/(members)/members.index.tsx
<route-root>/(settings)/settings.index.tsx
```

**Correct (셸 차이가 있을 때만 최상위 그룹을 분리):**

```txt
<route-root>/(public)/home.index.tsx
<route-root>/(workspace)/workspace.layout.tsx
<route-root>/(workspace)/workspace.index.tsx
<route-root>/(workspace)/workspace/(settings)/settings.index.tsx
```

### 1.5 Use Parentheses Folders for Pathless Route Groups

**Impact: HIGH (URL 계층과 그룹 계층을 분리해 경로를 바꾸지 않고도 중첩 route를 정돈합니다)**

일반 폴더는 실제 URL 세그먼트를 반영하는 상위 계층이고,
괄호 폴더 `()`는 하위 라우트를 그룹화하기 위한 pathless 계층입니다.
URL에 보여야 하는 상위 계층만 일반 폴더로 두고, 하위 라우트 묶음은 괄호 폴더로 분리합니다.

**Incorrect (URL 계층과 그룹 계층을 같은 폴더 규칙으로 섞음):**

```txt
<route-root>/app/settings.profile.index.tsx
<route-root>/app/settings.security.index.tsx
```

**Correct (URL 폴더와 pathless 그룹 폴더를 구분):**

```txt
<route-root>/app/
  app.layout.tsx
  app.index.tsx
  (settings)/
    settings.index.tsx
    (security)/
      security.index.tsx
```

## 2. File Naming and Route Assets

**Impact: HIGH**

검색 가능한 entry 파일명, 의미 있는 segment 이름, 예측 가능한 route asset 세트는 route를 더 쉽게 찾고 유지보수하게 만듭니다.

### 2.1 Name Top-level Groups by Shell Meaning

**Impact: HIGH (최상위 route 그룹이 우연히 담고 있는 기능이 아니라 소속 셸을 말하게 합니다)**

최상위 그룹 이름은 기능명이 아니라 레이아웃 셸 의미가 드러나야 합니다.
`public/app`, `auth/workspace`, `marketing/admin`처럼 셸 단위를 표현하고, 같은 셸이면 새 그룹 이름을 만들지 않습니다.

**Incorrect (기능명으로 최상위 그룹 의미를 대신함):**

```txt
<route-root>/(orders)/orders.index.tsx
<route-root>/(members)/members.index.tsx
<route-root>/(reports)/reports.index.tsx
```

**Correct (셸 의미가 드러나는 이름을 사용):**

```txt
<route-root>/(public)/home.index.tsx
<route-root>/(workspace)/workspace.index.tsx
<route-root>/(workspace)/workspace/(reports)/reports.index.tsx
```

### 2.2 Prepare the Basic Route File Set

**Impact: MEDIUM-HIGH (중첩 route가 처음부터 스타일·셸 코드·순수 헬퍼를 둘 예측 가능한 자리를 갖게 합니다)**

이 프로젝트의 route file set은 `feature.css`, `feature.ts`, `feature.layout.tsx`,
`feature.index.tsx` 4개를 기본 세트로 봅니다.
`*.layout.tsx`는 눈에 띄는 shell UI가 아직 없더라도 route tunnel과 향후 layout 책임을 받을 경계로 미리 두고,
`*.ts`는 route support code가 자라날 기본 자리로 둡니다.
이렇게 해야 라우트가 커져도 스타일, 셸, 화면, 순수 로직의 자리가 예측 가능하게 유지됩니다.

**Incorrect (4-file set 없이 화면 파일만 먼저 만들어 책임 경계가 사라짐):**

```txt
(settings)/
  settings.index.tsx
```

**Correct (기본 4-file route 세트를 먼저 마련):**

```txt
(settings)/
  settings.css
  settings.ts
  settings.layout.tsx
  settings.index.tsx
```

### 2.3 Start Child Route Sets With Parentheses Folders

**Impact: HIGH (파일명이 길어지거나 형제 route가 훑기 어려워지기 전에 자식 route 그룹을 드러냅니다)**

하위 라우트가 생기면 기본적으로 먼저 `(<feature>)` 그룹 폴더를 만들고, 그 안에 해당 feature의 4-file set(`feature.css`,
`feature.ts`, `feature.layout.tsx`, `feature.index.tsx`)과 `-local/`을 정리합니다.
이 규칙의 목적은 URL semantics를 바꾸는 것이 아니라 route asset 묶음을 한 feature 단위로 보이게 유지하는 것입니다.
이렇게 하면 sibling route가 늘어나도 같은 계층의 route asset이 서로 섞이지 않고, 파일명이 불필요하게 길어지지 않습니다.

**Incorrect (하위 라우트를 플랫 파일명으로 계속 누적):**

```txt
<route-root>/app/settings.index.tsx
<route-root>/app/settings.profile.index.tsx
<route-root>/app/settings.security.index.tsx
```

**Correct (하위 라우트 묶음을 그룹 폴더로 먼저 감쌈):**

```txt
<route-root>/app/(settings)/settings.css
<route-root>/app/(settings)/settings.ts
<route-root>/app/(settings)/settings.layout.tsx
<route-root>/app/(settings)/settings.index.tsx
<route-root>/app/(settings)/(profile)/profile.index.tsx
<route-root>/app/(settings)/(security)/security.index.tsx
```

### 2.4 Use Domain-specific Dynamic Segment Names

**Impact: MEDIUM-HIGH (파일 수준과 router API 안에서 route 파라미터가 스스로 설명되게 합니다)**

필수 path param은 `{$param}`, 선택 path param은 `{-$param}` 문법을 사용하고,
param 이름은 도메인 의미가 드러나는 명사를 씁니다.
generic `id`, `x` 같은 이름은 파일 구조만 봐서는 의미를 알 수 없으므로 피합니다.

**Incorrect (generic param 이름을 사용):**

```txt
users.{$id}.index.tsx
posts.{-$x}.tsx
```

**Correct (도메인 의미가 드러나는 이름을 사용):**

```txt
users.{$userId}.index.tsx
posts.{$postId}.edit.index.tsx
filters.{-$tab}.tsx
```

### 2.5 Use Owner-named Route Support Modules Instead of Generic Helper Files

**Impact: MEDIUM-HIGH (경계가 흐려지기 전에 route 파일에 정규화·매핑 로직이 쌓이는 것을 막습니다)**

라우트 전용 순수 support code가 entry file을 흐리기 시작하면 첫 추출 대상은 같은 계층 owner-named module입니다.
예를 들어 `settings.index.tsx`라면 `settings.ts`로 옮기고 named export를 직접 import합니다.

exported support helper는 `convention-typescript` 규칙에 맞춰 헤더 doc 주석을 붙이고,
silent fallback으로 결측을 숨기지 않습니다.
`helper.ts`, `helpers.ts`, `utils.ts`, `common.ts` 같은 generic 파일명은 만들지 않고,
화면 하나에서만 쓰는 custom hook으로 우회해 숨기지도 않습니다.

**Incorrect (generic helper 파일명으로 support code를 분산):**

```txt
(settings)/
  helpers.ts
  settings.index.tsx
```

```ts
// helpers.ts
export const normalizeSettingsSearch = (value: string | undefined) => {
	return value?.trim().toLowerCase() ?? "";
};
```

**Correct (owner-named sibling module에 named export로 유지):**

```ts
// settings.ts
/**
 * settings 검색어 trim/lower 정규화
 */
export const normalizeSettingsSearch = (value: string | undefined) => {
	const normalizedValue = value?.trim().toLowerCase();

	if (!normalizedValue) {
		return undefined;
	}

	return normalizedValue;
};

/**
 * settings 기본 redirect destination 조립
 */
export const buildSettingsRedirect = (tab: string) => {
	return {to: "/app/settings/general", search: {tab}};
};
```

### 2.6 Use Searchable Feature Route File Names

**Impact: HIGH (그룹 폴더가 이미 있어도 파일 검색으로 route 진입점을 찾기 쉽게 유지합니다)**

이 프로젝트는 mixed route tree와 `routeToken: "layout"` 전제를 사용하므로,
그룹 폴더를 쓰더라도 엔트리 파일명은 `feature.index.tsx`, `feature.layout.tsx`처럼 feature 이름을 유지합니다.
그룹 폴더 아래 파일명을 모두 `index.tsx`, `layout.tsx`로 두면 검색성과 탐색성이 크게 떨어집니다.

**Incorrect (그룹 폴더 안에서 익명 파일명을 사용):**

```txt
(settings)/
  index.tsx
  layout.tsx
```

**Correct (feature 이름이 드러나는 엔트리 파일명을 사용):**

```txt
(settings)/
  settings.index.tsx
  settings.layout.tsx
```

## 3. Route Definition and Navigation Boundaries

**Impact: CRITICAL**

route 선언, redirect, guard, search 검증은 화면 안으로 새지 않고 router boundary에 명시적으로 유지되어야 합니다.

### 3.1 Export `Route` at the Top of the File

**Impact: HIGH (화면 구현 세부가 시작되기 전에 router 계약이 먼저 드러나게 합니다)**

각 라우트 파일은 `export const Route = createFileRoute("...")({...})` 형태를 기본으로 하고,
export 이름은 항상 `Route`로 고정합니다.
route definition은 파일 상단에 두고, 화면 컴포넌트나 owner-named support module import는 그 아래에 배치합니다.

**Incorrect (컴포넌트와 보조 코드 뒤에 route definition을 숨김):**

```tsx
function UsersIndex() {
	return <UsersScreen />;
}

const usersRoutePath = "/app/(users)/users/";

export const UsersRoute = createFileRoute(usersRoutePath)({
	component: UsersIndex,
});
```

**Correct (파일 상단에서 `Route` 계약을 먼저 선언):**

```tsx
export const Route = createFileRoute("/app/(users)/users/")({
	component: UsersIndex,
});

function UsersIndex() {
	return <UsersScreen />;
}
```

### 3.2 Match Route Paths to File Structure

**Impact: HIGH (route 문자열이 해당 route를 소유한 파일 트리에서 벗어나는 것을 막습니다)**

`createFileRoute()` 문자열은 실제 파일 구조와 대응되게 작성합니다.
일반 폴더, pathless group, 동적 세그먼트,
trailing slash 규칙을 문자열에 그대로 반영해야 route tree와 파일 위치를 함께 추적할 수 있습니다.

**Incorrect (경로 문자열이 파일 구조와 어긋남):**

```tsx
// file: <route-root>/app/(settings)/settings.index.tsx
export const Route = createFileRoute("/settings")({
	component: SettingsIndex,
});
```

**Correct (경로 문자열이 실제 파일 구조를 반영):**

```tsx
createFileRoute("/app")({...});
createFileRoute("/app/")({...});
createFileRoute("/app/(settings)/settings/")({...});
```

### 3.3 Read Params and Search From the Local `Route`

**Impact: MEDIUM-HIGH (param·search 접근을 계약을 소유한 route 파일에 맞춥니다)**

param과 search 접근은 해당 파일의 `Route`에서 꺼내 쓰는 것을 기본으로 합니다.
훅 사용 패턴을 route definition 근처에서 일관되게 유지하면,
이 파일이 어떤 params/search 계약을 갖는지 한 곳에서 읽을 수 있습니다.

**Incorrect (전역 hook 호출로 계약 출처를 흐림):**

```tsx
const params = useParams({from: "/app/(users)/users/{$userId}/"});
const search = useSearch({from: "/app/(users)/users/"});
```

**Correct (해당 파일의 `Route`에서 직접 읽음):**

```tsx
const {useParams, useSearch} = Route;

const params = useParams();
const search = useSearch();
```

### 3.4 Redirect Empty Entry Routes in `beforeLoad`

**Impact: HIGH (화면이 마운트되고 부수효과가 시작되기 전에 진입 리다이렉트를 router 경계로 옮깁니다)**

실화면이 없는 중간 route의 기본 진입은 `index` route의 `beforeLoad`에서 redirect로 처리합니다.
path param이나 search를 유지해야 하면 `beforeLoad`에서 명시적으로 다시 넘겨 화면 마운트 이후 강제 이동을 피합니다.

**Incorrect (컴포넌트 렌더링 후 `useEffect`로 강제 이동):**

```tsx
function SettingsIndex() {
	const navigate = useNavigate();

	useEffect(() => {
		void navigate({to: "/app/settings/general"});
	}, [navigate]);

	return null;
}
```

**Correct (route 진입 단계에서 redirect 처리):**

```tsx
export const Route = createFileRoute("/app/(settings)/settings/")({
	beforeLoad: ({search}) => {
		throw redirect({to: "/app/settings/general", search, replace: true});
	},
});
```

### 3.5 Run Auth and Permission Guards in `beforeLoad`

**Impact: CRITICAL (화면에서 뒤늦게 이동시키지 않고 접근 제어를 router 경계에 둡니다)**

인증과 권한 보장은 라우트 컴포넌트 본문이 아니라 `beforeLoad`에서 처리합니다.
공통 가드 로직은 route 전용 support module이나 안정된 shared module로 분리해 재사용하고,
화면 컴포넌트가 렌더링된 뒤 조건부 네비게이션을 하는 패턴은 피합니다.

**Incorrect (컴포넌트 렌더링 이후 조건부 네비게이션):**

```tsx
function ProtectedPage() {
	const token = useTokenStore();
	const navigate = useNavigate();

	if (!token) {
		void navigate({to: "/login"});
	}

	return <Outlet />;
}
```

**Correct (진입 전 가드로 접근을 차단):**

```tsx
export const Route = createFileRoute("/app")({
	beforeLoad: async ({context}) => {
		await ensureAuthenticated(context);
	},
	component: AppLayout,
});
```

### 3.6 Validate Search Before Using Route Search

**Impact: CRITICAL (화면 곳곳에서 다시 파싱하지 않고 query string을 route 경계에서 한 번 정규화합니다)**

쿼리스트링을 읽는 화면은 `Route.useSearch()` 사용 전에 `validateSearch`를 선언합니다.
search schema는 `z.object(...)`로 작성하고, 숫자형 페이지네이션이나 선택값은 `z.coerce.number()`로 보정하며,
초기값이나 방어값이 필요하면 `.default()`와 `.catch()`를 함께 사용합니다.

**Incorrect (사용처마다 문자열 파싱을 반복):**

```tsx
const search = useSearch({from: "/app/users"});
const page = Number(search.page ?? 1);
const size = Number(search.size ?? 20);
```

**Correct (route에서 먼저 search를 정규화):**

```tsx
export const Route = createFileRoute("/app/(users)/users/")({
	validateSearch: z.object({
		page: z.coerce.number().int().min(1).default(1).catch(1),
		size: z.coerce.number().int().min(1).max(100).default(20).catch(20),
	}),
	component: UsersIndex,
});
```

## 4. Route-local Ownership and Responsibilities

**Impact: HIGH**

`layout`, `index`, `-local` 파일은 각각 좁은 책임만 가져야 route flow가 보이고 책임이 흐려지지 않습니다.

### 4.1 Keep `*.index.tsx` Files Focused on Screen Flow

**Impact: HIGH (화면 조립·hook·handler가 보이는 읽기 쉬운 route 진입점을 지킵니다)**

`*.index.tsx`는 실제 화면 렌더링, API hook, 이벤트 핸들러, search 기반 상태 동기화, 화면 조립을 담당합니다.
entry file이 순수 helper, 대형 상수, route 외부 재사용 로직까지 떠안기 시작하면
화면 흐름이 흐려지므로 route-local support module과 `-local/`로 책임을 분리합니다.
작은 1회성 guard나 사용 지점 바로 옆이 더 읽기 쉬운 계산은 entry file에 남길 수 있습니다.

**Incorrect (entry file에 화면 흐름과 무관한 support code를 누적):**

```tsx
const DEFAULT_COLUMNS = ["name", "role", "status"] as const;

const normalizeMembersSearch = (value: string | undefined) => {
	return value?.trim().toLowerCase() ?? "";
};

export const Route = createFileRoute("/app/(members)/members/")({
	component: MembersIndex,
});
```

**Correct (entry file은 화면 흐름을 보여주고 support code는 owner-named module로 분리):**

```tsx
import {normalizeMembersSearch} from "./members";
import {MembersToolbar} from "./-local/members-toolbar";

export const Route = createFileRoute("/app/(members)/members/")({
	component: MembersIndex,
});

function MembersIndex() {
	const search = Route.useSearch();
	const normalizedKeyword = normalizeMembersSearch(search.keyword);

	return <MembersToolbar keyword={normalizedKeyword} />;
}
```

### 4.2 Limit `*.layout.tsx` Files to Shell Concerns

**Impact: HIGH (부모 route 셸이 말단 화면의 데이터·폼 로직을 흡수하는 것을 막습니다)**

`*.layout.tsx`는 부모 경로 등록, 접근 제어, 공통 래퍼, 메뉴 상태 동기화, `<Outlet />`까지만 담당합니다.
이 프로젝트에서는 `*.layout.tsx`를 4-file set의 기본 tunnel route로 항상 두지만,
파일이 있다는 이유로 leaf 화면 전용 API 호출이나 상세 폼 로직을 흡수시키지는 않습니다.
하위 leaf 화면만 쓰는 로직은 layout에 넣지 않고 해당 `index`나 `-local`로 내립니다.

**Incorrect (layout 파일이 leaf 화면 전용 로직까지 가짐):**

```tsx
function SettingsLayout() {
	const query = useSettingsDetailQuery();
	const form = useSettingsForm(query.data);

	return (
		<SettingsShell form={form}>
			<Outlet />
		</SettingsShell>
	);
}
```

**Correct (layout route는 최소 tunnel이어도 `Route` export와 outlet 책임만 유지):**

```tsx
export const Route = createFileRoute("/app/(settings)/settings")({
	component: SettingsLayout,
});

function SettingsLayout() {
	return <Outlet />;
}
```

### 4.3 Place Route-only Modules in `-local/`

**Impact: HIGH (계약이 안정되기 전까지 route 범위 UI와 비공개 모듈을 route 가까이 둡니다)**

해당 라우트에서만 쓰는 모달, 폼, 보조 컴포넌트, route-private module은 라우트 하위 `-local/`에 둡니다.
다른 라우트와 계약이 아직 안정되지 않았다면 shared UI나 공용 helper로 올리지 말고, 먼저 route-local 소유를 유지합니다.
다만 route entry가 직접 가져오는 순수 support function은 먼저 같은 계층 owner-named module(`settings.ts`,
`members.ts`)에 두고, `-local/`은 route-private UI와 module 묶음이 실제로 생길 때 사용합니다.

**Incorrect (route 전용 모듈을 성급하게 공용 레이어로 올림):**

```txt
<component-root>/ui/modal/ui-setting-form-modal.tsx
<component-root>/ui/modal/ui-setting-form-modal.css
```

**Correct (해당 route 아래 `-local/`에 둠):**

```txt
(settings)/
  settings.index.tsx
  -local/
    modal-setting-form.tsx
    modal-setting-form.css
```

## 5. Styles and Generated Artifacts

**Impact: MEDIUM-HIGH**

route 스타일은 해당 route와 함께 있어야 하고, generated router output은 derived artifact로만 유지되어야 합니다.

### 5.1 Keep Route CSS at Route Scope

**Impact: MEDIUM-HIGH (route 수준 스타일과 지역 컴포넌트 스타일이 거대한 stylesheet 하나로 뭉치는 것을 막습니다)**

route 공용 스타일은 해당 route 폴더의 `*.css`에 두고, `-local` 컴포넌트 스타일은 `-local/*.css`에 둡니다.
같은 route의 `layout`과 `index`가 같은 시각 컨텍스트를 공유하더라도,
route 공용 CSS와 local 전용 CSS를 한 파일로 합치지 않습니다.

**Incorrect (route 공용 스타일과 local 전용 스타일을 한 파일에 누적):**

```txt
(settings)/
  settings.index.tsx
  -local/
    modal-setting-form.tsx

settings.css에 modal 전용 스타일까지 모두 선언
```

**Correct (route 범위와 local 범위 스타일을 분리):**

```txt
(settings)/
  settings.css
  settings.index.tsx
  -local/
    modal-setting-form.tsx
    modal-setting-form.css
```

### 5.2 Never Edit Generated Route Tree Files

**Impact: MEDIUM-HIGH (생성된 router 출력을 route 소스에서 파생된 빌드 산출물로 유지합니다)**

라우트 추가나 변경 결과로 생성되는 `<generated-route-tree-path>`는 수동 수정하지 않습니다.
라우트 소스만 수정하고, 생성 파일은 결과물로만 다루어야 source of truth가 명확하게 유지됩니다.

**Incorrect (생성 파일을 직접 수정해 동작을 맞춤):**

```txt
// Bad
<generated-route-tree-path>에 수동으로 route node를 추가
<generated-route-tree-path>에서 import 경로를 직접 수정
```

**Correct (라우트 소스를 고치고 생성물은 다시 생성):**

```txt
// Good
route source file을 수정한다
router generator를 다시 실행한다
<generated-route-tree-path>는 결과물로만 확인한다
```

## 6. Workflow and Verification

**Impact: MEDIUM**

새 route 작업은 반복 가능한 setup과 review 순서를 따라야 구조, guard, router 계약을 마무리 전에 점검할 수 있습니다.

### 6.1 Add New Routes in Layout-first Order

**Impact: MEDIUM (route 파일이 번지기 전에 셸·그룹·search 경계를 먼저 정해 정리 작업을 줄입니다)**

신규 라우트를 추가할 때는 화면 파일부터 급하게 만들지 말고, 레이아웃 셸과 그룹 구조를 먼저 고정하는 순서를 따릅니다.
이 프로젝트에서는 `feature.css`, `feature.ts`, `feature.layout.tsx`,
`feature.index.tsx` 4-file set을 route 기본 단위로 보고, layout file은 최소 tunnel이어도 먼저 자리를 확보합니다.
이렇게 해야 route tree, support code 위치, search 검증 경계가 뒤늦게 흔들리지 않습니다.

**Incorrect (leaf 화면부터 만들고 나중에 구조를 끼워 맞춤):**

```txt
1. 바로 feature.index.tsx부터 만든다
2. 화면이 커진 뒤에 layout, support code, -local 위치를 고민한다
3. search parsing과 redirect를 화면 본문에서 임시로 처리한다
```

**Correct (layout-first 순서로 route를 추가):**

```txt
1. 모든 화면이 같은 레이아웃 셸인지 먼저 판단한다
2. 셸이 다르면 최상위 그룹을 분리하고, 같으면 기존 부모 layout 아래에 둔다
3. URL에 반영되는 상위 계층은 일반 폴더로 만든다
4. 하위 라우트가 생기면 (<feature>) 그룹 폴더를 만든다
5. 기본적으로 feature.css, feature.ts, feature.layout.tsx, feature.index.tsx 4-file set을 준비한다
6. feature.layout.tsx는 shell UI가 아직 없더라도 route tunnel 경계로 두고, support code는 feature.ts에 named export로 모은다
7. 동적 세그먼트가 필요하면 {$param}, {-$param} 규칙을 사용한다
8. search를 읽는 화면이면 validateSearch를 먼저 선언한다
9. route 전용 보조 모듈이 있으면 같은 계층 -local/에 둔다
10. 생성된 <generated-route-tree-path>는 수동 수정하지 않는다
```

### 6.2 Review Route Structure Before Finishing

**Impact: MEDIUM (route 변경을 완료로 선언하기 전에 그룹·가드·소유 어긋남을 잡습니다)**

라우트 작업을 끝냈다고 보기 전에 구조 체크리스트를 다시 확인합니다.
화면이 보인다는 이유만으로 마무리하지 말고, 그룹 구조, support code 배치, guard 위치,
generated artifact 처리까지 함께 점검해야 합니다.

**Incorrect (렌더링만 확인하고 구조 검토를 생략):**

```txt
- 페이지가 뜨는지만 확인한다
- redirect와 guard 위치는 나중에 정리한다
- support code가 route 파일 안에 과하게 남아 있어도 그대로 둔다
- generated route tree를 직접 고쳐서 통과시킨다
```

**Correct (마무리 전에 route 체크리스트를 순회):**

```txt
- 최상위 라우트 분리가 기능명이 아니라 레이아웃 셸 기준인가
- 폴더 전용 구조와 플랫 전용 구조 중 하나로 치우치지 않았는가
- URL에 반영되는 상위는 일반 폴더로 두었는가
- 하위 route 묶음은 () 그룹 폴더로 분리했는가
- 하위 route라면 feature.css, feature.ts, feature.layout.tsx, feature.index.tsx 4-file set을 갖췄는가
- 그룹 폴더 안의 엔트리 파일명이 feature.index.tsx처럼 검색 가능한가
- 화면 전용 순수 support code가 route 파일 안에 누적되지 않았고, 추출했다면 generic helper 파일 대신 owner-named sibling `*.ts`에 named export로 두었는가
- 인증/권한 가드를 컴포넌트 본문이 아니라 beforeLoad에 두었는가
- 쿼리스트링을 읽는 화면에 validateSearch가 선언되어 있는가
- route 전용 보조 모듈이 -local/에 정리되어 있는가
- <generated-route-tree-path>를 수동 수정하지 않았는가
```

## 참고 자료

- https://tanstack.com/router/latest
- https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing
- https://zod.dev

# React 컨벤션

- 버전: 1.0.0
- 조직: Agent Conventions
- 날짜: 2026년 4월

> **생성된 문서입니다. 직접 수정하지 마세요.**
>
> 현재 skill의 `rules/*.md`, `metadata.json`, `metadata.json.extends`를 수정한 뒤 `npm --prefix ../../package run build -- --skill=react`로 다시 생성하세요.

---

## 개요

에이전트 협업 팀을 위한 React 코딩 컨벤션입니다. 이 가이드는 shared 코드와 route-local 코드 사이의 명확한 소유 경계, single component·compound component·explicit variant를 구분하는 composition 전략, React 계약에 맞는 handler/prop 시그니처, 예측 가능한 화면 흐름, 오리진을 보존하는 state 접근, React 19 컴포넌트 구조와 effect/transition 패턴, React 고유 문서화 규칙을 강조합니다. compound component는 state 없는 조립 구조로 시작해 필요할 때 같은 public 이름을 유지한 채 stateful 구조로 자연스럽게 확장될 수 있어야 하고, route-local section component는 async/state/interaction 같은 runtime boundary를 실제로 소유할 때만 추출합니다. TanStack Query, Zustand, React 19 ref prop/Activity/useEffectEvent를 쓰는 React codebase를 기본 전제로 하며, `rules/` 아래 rule 파일이 source of truth입니다. 기본 compiled guide는 local React 규칙만 담고 `typescript` companion skill과 함께 사용합니다.

이 가이드는 local React 컨벤션 규칙만 담고 있습니다. 공통 규칙은 companion skill을 함께 로드해 보완합니다.

---

## 함께 로드할 Companion Skill

- `convention-typescript` - TypeScript Convention 공통 규칙 guide: [TypeScript Convention](../typescript/AGENTS.md)

---

## 목차

1. [Ownership and Boundaries](#1-ownership-and-boundaries) — **CRITICAL**
    - 1.1 [Avoid Barrel Exports and React Namespace Types](#11-avoid-barrel-exports-and-react-namespace-types)
    - 1.2 [Do Not Create Screen-local Custom Hooks for Pure Logic](#12-do-not-create-screen-local-custom-hooks-for-pure-logic)
    - 1.3 [Keep UI, Widget, and -local Ownership Separate](#13-keep-ui-widget-and--local-ownership-separate)
    - 1.4 [Place Route-local Files by Visual Scope](#14-place-route-local-files-by-visual-scope)
    - 1.5 [Route Shared Constants Through `shared/config.ts`](#15-route-shared-constants-through-shared-config-ts)
    - 1.6 [Use Consistent File and Symbol Naming](#16-use-consistent-file-and-symbol-naming)
2. [Typing and Contracts](#2-typing-and-contracts) — **HIGH**
    - 2.1 [Prefer React Handler Type Aliases Over Inline Event Parameter Annotations](#21-prefer-react-handler-type-aliases-over-inline-event-parameter-annotations)
    - 2.2 [Reuse Prop and API Contracts Before Creating New Types](#22-reuse-prop-and-api-contracts-before-creating-new-types)
3. [Composition Strategy](#3-composition-strategy) — **HIGH**
    - 3.1 [Avoid Boolean Prop Proliferation in Shared Components](#31-avoid-boolean-prop-proliferation-in-shared-components)
    - 3.2 [Choose Single Components, Compound Components, and Variants Deliberately](#32-choose-single-components-compound-components-and-variants-deliberately)
    - 3.3 [Prefer Children Over Render Props for Static Composition](#33-prefer-children-over-render-props-for-static-composition)
4. [Component Structure and JSX](#4-component-structure-and-jsx) — **HIGH**
    - 4.1 [Accept props as a Whole and Destructure Inside the Component](#41-accept-props-as-a-whole-and-destructure-inside-the-component)
    - 4.2 [Do Not Define Components Inside Components](#42-do-not-define-components-inside-components)
    - 4.3 [Prefer Arrow Functions and Object Parameters for Complex Signatures](#43-prefer-arrow-functions-and-object-parameters-for-complex-signatures)
    - 4.4 [Use Named Handlers Instead of Hiding Logic in JSX](#44-use-named-handlers-instead-of-hiding-logic-in-jsx)
    - 4.5 [Use ref Props Instead of New forwardRef Wrappers in React 19](#45-use-ref-props-instead-of-new-forwardref-wrappers-in-react-19)
    - 4.6 [Use Visibility Primitives Deliberately for Show and Hide Branches](#46-use-visibility-primitives-deliberately-for-show-and-hide-branches)
5. [Screen File Discipline](#5-screen-file-discipline) — **HIGH**
    - 5.1 [Avoid Premature Abstraction in Screen Code](#51-avoid-premature-abstraction-in-screen-code)
    - 5.2 [Extract Route-local Section Components Only for Runtime Boundaries](#52-extract-route-local-section-components-only-for-runtime-boundaries)
    - 5.3 [Extract Screen Support Code Only When the Boundary Is Real](#53-extract-screen-support-code-only-when-the-boundary-is-real)
    - 5.4 [Keep Derived Values Close to Where They Are Used](#54-keep-derived-values-close-to-where-they-are-used)
    - 5.5 [Keep Route Entry Files Focused on Screen Flow](#55-keep-route-entry-files-focused-on-screen-flow)
    - 5.6 [Move Screen-owned Pure Support Code Into `page.ts` Before Splitting Further](#56-move-screen-owned-pure-support-code-into-page-ts-before-splitting-further)
6. [Events and Interaction Flow](#6-events-and-interaction-flow) — **MEDIUM-HIGH**
    - 6.1 [Keep Screen-specific Handler Flow Local Until a Real Utility Emerges](#61-keep-screen-specific-handler-flow-local-until-a-real-utility-emerges)
    - 6.2 [Name Handlers Predictably and Curry Extra Arguments](#62-name-handlers-predictably-and-curry-extra-arguments)
    - 6.3 [Run User Actions in Handlers, Not Effects](#63-run-user-actions-in-handlers-not-effects)
7. [State and Data Flow](#7-state-and-data-flow) — **CRITICAL**
    - 7.1 [Avoid Silent Fallback Defaults and Ad-hoc Loading Branches](#71-avoid-silent-fallback-defaults-and-ad-hoc-loading-branches)
    - 7.2 [Calculate Derived Values During Rendering](#72-calculate-derived-values-during-rendering)
    - 7.3 [Choose State Tools by Source of Truth](#73-choose-state-tools-by-source-of-truth)
    - 7.4 [Name Query and Mutation Bindings Consistently](#74-name-query-and-mutation-bindings-consistently)
    - 7.5 [Prefer React Compiler Defaults Over Manual Memoization](#75-prefer-react-compiler-defaults-over-manual-memoization)
    - 7.6 [Preserve Response and Store Origin in Wide Scopes](#76-preserve-response-and-store-origin-in-wide-scopes)
    - 7.7 [Shape React Query Data in query.select](#77-shape-react-query-data-in-query-select)
    - 7.8 [Store Shared Role and Authority Decisions Only When They Are Truly Shared](#78-store-shared-role-and-authority-decisions-only-when-they-are-truly-shared)
    - 7.9 [Use Functional setState Updates When Based on Previous State](#79-use-functional-setstate-updates-when-based-on-previous-state)
    - 7.10 [Use Lazy State Initializers for Expensive Defaults](#710-use-lazy-state-initializers-for-expensive-defaults)
    - 7.11 [Use startTransition for Non-urgent Visual Updates](#711-use-starttransition-for-non-urgent-visual-updates)
    - 7.12 [Use useDeferredValue for Heavy Derived Renders](#712-use-usedeferredvalue-for-heavy-derived-renders)
    - 7.13 [Use useEffectEvent for Non-reactive Effect Callbacks](#713-use-useeffectevent-for-non-reactive-effect-callbacks)
8. [Documentation and Comments](#8-documentation-and-comments) — **MEDIUM**
    - 8.1 [Document Compound Parts with @part and @description](#81-document-compound-parts-with-part-and-description)
    - 8.2 [Limit Inline Comments to Non-obvious Logic](#82-limit-inline-comments-to-non-obvious-logic)
    - 8.3 [Require JSDoc on React Hooks, Handlers, and Key Declarations](#83-require-jsdoc-on-react-hooks-handlers-and-key-declarations)

---

## 1. Ownership and Boundaries

**Impact: CRITICAL**

Shared UI, widget, route-local 코드는 소유 경계가 분명해야 에이전트가 코드를 예측 가능하게 배치할 수 있습니다.

### 1.1 Avoid Barrel Exports and React Namespace Types

**Impact: HIGH (import 경로를 명시적으로 유지하고 타입 import 스타일 혼용을 막음)**

`index.ts` 기반 barrel export를 만들지 않고, React 타입은 `React.MouseEvent` 같은 전역 네임스페이스 대신 `import type`으로 직접 가져옵니다. 이렇게 해야 import 경로와 타입 출처가 더 명시적으로 유지됩니다.

**Incorrect (barrel export와 namespace 타입 혼용):**

```ts
// index.ts
export * from "./user-card";

const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
};
```

**Correct (직접 import와 import type 사용):**

```ts
import type { MouseEventHandler } from "react";

/**
 * @event 버튼 클릭 기본 동작 차단
 */
const handleClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
  // ...
};
```

### 1.2 Do Not Create Screen-local Custom Hooks for Pure Logic

**Impact: HIGH (React 전용 추상화를 실제 lifecycle/context 결합이 있는 경우에만 사용하게 함)**

화면 하나에 종속된 계산, 정규화, payload 조립은 custom hook으로 포장하지 말고 먼저 일반 `.ts` support module에 둡니다.   
route entry 화면이라면 기본 추출 위치는 같은 계층의 `page.ts`이고, screen-owned pure function은 named export를 직접 import해 사용합니다.   
screen-local custom hook은 lifecycle, context, 다른 hook 호출 순서 같은 React orchestration을 실제로 캡슐화할 때만 허용합니다.   
단순 계산을 hook처럼 보이게 만드는 추상화는 피합니다.

**Incorrect (로컬 계산을 습관적으로 hook으로 포장):**

```ts
export const useMediaUploadPayload = (files: UploadFile[]) => {
  return files.map((file) => ({ uid: file.uid }));
};
```

**Incorrect (로컬 support module도 불필요한 `page.*` namespace로 감쌈):**

```ts
export const page = {
	buildMediaUploadPayload(files: UploadFile[]) {
		return files.map((file) => ({ uid: file.uid }));
	},
};
```

**Correct (순수 계산은 sibling `page.ts`의 named export로 유지):**

```ts
/**
 * @helper 업로드 파일 목록을 저장 payload로 정규화
 */
export const buildMediaUploadPayload = (files: UploadFile[]) => {
  return files.map((file) => ({ uid: file.uid }));
};
```

**Correct (sibling `page.ts`도 named export를 직접 가져옴):**

```tsx
import { buildMediaUploadPayload } from "./page";

const request = buildMediaUploadPayload(files);
```

### 1.3 Keep UI, Widget, and -local Ownership Separate

**Impact: CRITICAL (공용 책임과 route-local 책임이 같은 레이어로 섞이는 것을 막음)**

`ui`는 순수 view, `widget`은 여러 화면에서 재사용되는 공용 조합, `-local`은 특정 route 맥락을 아는 화면 전용 코드로 유지합니다. `widget` 레이어 폴더명은 유지하되, widget-owned 파일과 심볼은 `wg-*`, `Wg*` 규칙으로 소유자를 바로 드러내야 합니다. `ui`는 계속 `ui-*`, `Ui*` 규칙을 사용합니다.

**Incorrect (view 레이어와 화면 전용 로직이 섞임):**

```tsx
// <component-root>/ui/button/ui-delete-entry-button.tsx
const UiDeleteEntryButton = () => {
  const navigate = useNavigate();

  return <button onClick={() => void navigate({ to: "/entries" })}>삭제</button>;
};
```

**Correct (레이어별 책임과 이름이 분리됨):**

```tsx
// <component-root>/ui/button/ui-button.tsx
export interface UiButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export const UiButton = (props: UiButtonProps) => {
  const { onClick } = props;
  return <button onClick={onClick} />;
};
```

```tsx
// <component-root>/widget/entry-toolbar/wg-entry-toolbar.tsx
export interface WgEntryToolbarProps {
  onClose: () => void;
}

export const WgEntryToolbar = (props: WgEntryToolbarProps) => {
  const { onClose } = props;
  return <UiButton onClick={onClose} />;
};
```

```tsx
// <route-root>/entries/-local/delete-entry-button.tsx
const DeleteEntryButton = () => {
  const navigate = useNavigate();
  return <UiButton onClick={() => void navigate({ to: "/entries" })} />;
};
```

### 1.4 Place Route-local Files by Visual Scope

**Impact: HIGH (route 전용 component, style, logic를 예측 가능한 위치에 유지함)**

화면 전용 컴포넌트와 스타일은 `-local/`에 두고, 비컴포넌트 로직은 라우트와 같은 계층의 `.ts` 파일에 둡니다. 같은 계층 `.ts` 파일에는 JSX를 직접 넣지 않고, 필요하면 렌더링 콜백을 주입합니다.

**Incorrect (화면 전용 컴포넌트와 순수 로직 위치가 뒤섞임):**

```tsx
// folders.ts
export const renderFolderTitle = () => <span>Folder</span>;
```

**Correct (시각 코드와 비시각 로직의 위치를 분리):**

```ts
// folders.ts
/**
 * @helper folder node를 UiTree data로 변환
 */
export const mapFolderNodeToTreeData = (node: FolderNode, renderers: FolderTreeRenderers) => {
  return {
    key: String(node.id),
    title: renderers.renderTitle(node),
  };
};
```

```tsx
// -local/folder-tree.tsx
<UiTree treeData={nodes.map((node) => mapFolderNodeToTreeData(node, { renderTitle }))} />
```

### 1.5 Route Shared Constants Through `shared/config.ts`

**Impact: HIGH (공용 상수가 route와 local component 곳곳에 흩어지는 것을 막음)**

여러 화면에서 쓰는 상수와 설정은 라우트 파일이나 `-local` 컴포넌트에 흩뿌리지 말고 기본적으로 `shared/config.ts` 한 파일에서 가져옵니다.   
수가 많지 않을 때는 폴더로 쪼개기보다 `export const config = {}` 한 namespace를 유지하고, 사용처는 `config.*` 체이닝으로 접근해 출처를 보존합니다.   
공용 순수 함수는 `config`에 섞지 말고 `shared/util.ts`의 `util.*` 아래로 분리합니다. route나 feature 전용 support code는 `shared/util.ts`로 올리지 말고 sibling `page.ts`나 owner-named module에 둡니다.

**Incorrect (공용 상수를 화면 파일에 직접 선언):**

```ts
export const project_menu_key = {
  dashboard: "dashboard",
  settings: "settings",
} as const;
```

**Correct (공용 설정은 `shared/config.ts`의 namespace에서 사용):**

```ts
import { config } from "@/shared/config";

config.navigation.project_menu_key.dashboard;
```

### 1.6 Use Consistent File and Symbol Naming

**Impact: HIGH (에이전트가 파일을 만들거나 옮길 때 소유 경계와 의도를 분명하게 유지함)**

파일명은 `kebab-case`, 일반 변수와 함수는 `camelCase`, 타입과 컴포넌트는 `PascalCase`를 사용합니다.   
`const`인지 여부로 별도 casing을 두지 않고, 화면과 모듈 안의 로컬 값은 모두 `camelCase`로 맞춥니다.   
여러 화면이 함께 쓰는 설정과 enum-like 상수는 `shared/config.ts`의 `config.*` 아래에 두고, 그 객체 이름과 키는 `snake_case`를 사용합니다. 파일명과 심볼명이 소유자와 역할을 바로 드러내야 route-local 이동과 공용화 판단이 쉬워집니다.

**Incorrect (파일명과 심볼 규칙이 제각각이고 공용 상수를 화면 파일에 직접 둠):**

```tsx
// UserCard.tsx
const active_tab = "overview";

export const projectMenuKey = {
	dashboard: "dashboard",
	settings: "settings",
} as const;

export const user_card = () => {
	return <section data-tab={active_tab} />;
};
```

**Correct (로컬 값은 `camelCase`, 공용 설정은 `config.*` 체이닝으로 읽음):**

```tsx
// user-card.tsx
import { config } from "@/shared/config";

const activeTab = config.navigation.project_menu_key.dashboard;

export const UserCard = () => {
	return <section data-tab={activeTab} />;
};
```

## 2. Typing and Contracts

**Impact: HIGH**

React가 제공하는 handler와 prop 계약은 선언 위치에서 바로 드러나야 하며, props와 callback 시그니처 재사용도 React 문맥에 맞게 유지해야 합니다.

### 2.1 Prefer React Handler Type Aliases Over Inline Event Parameter Annotations

**Impact: HIGH (React handler 시그니처와 callback 의도를 선언 위치에서 바로 보이게 함)**

React가 제공하는 이벤트 핸들러 타입이나 prop callback 계약이 이미 있다면, 매개변수 타입보다 함수 변수 타입 선언을 우선합니다. 일반 TypeScript 함수 타입 규칙은 companion skill인 `convention-typescript`에서 다루고, 여기서는 React handler alias를 바로 쓰는 경우를 강조합니다.

**Incorrect (핸들러 타입이 있는데 매개변수만 타입 지정):**

```ts
const handleAddButtonClick = (event: MouseEvent<HTMLButtonElement>): void => {
  event.preventDefault();
};
```

**Correct (함수 변수 타입으로 시그니처를 고정):**

```ts
import type { MouseEventHandler } from "react";

/**
 * @event 추가 버튼 클릭 기본 동작 차단
 */
const handleAddButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
  // ...
};
```

### 2.2 Reuse Prop and API Contracts Before Creating New Types

**Impact: HIGH (중복 타입 구조가 시간이 지나며 어긋나는 것을 막음)**

Props 콜백 구현 시에는 Props 시그니처를 재사용하고, API 응답 타입이 이미 있으면 새 인터페이스를 만들지 않습니다. 필요하면 `Pick`, `Omit`, indexed access 같은 파생 타입으로 좁힙니다.

**Incorrect (같은 계약을 새 타입으로 다시 정의):**

```ts
interface EntrySummaryValues {
  id: number;
  title: string;
  status: string;
}
```

**Correct (기존 계약을 직접 재사용):**

```ts
type EntrySummary = Pick<EntrySummaryResponse, "id" | "title">;

/**
 * @event 링크 클릭 기본 이동 차단
 */
const handleLinkClick: LinkProps["onLinkClick"] = (event) => {
  event.preventDefault();
};
```

## 3. Composition Strategy

**Impact: HIGH**

Shared component는 single component, compound component, explicit variant 중 어떤 구조를 쓸지 먼저 결정해야 하며, compound component는 state 없는 조립 구조에서 시작해 필요할 때 같은 public 이름을 유지한 채 stateful 구조로 확장될 수 있어야 합니다.

### 3.1 Avoid Boolean Prop Proliferation in Shared Components

**Impact: HIGH (exported shared components stay explicit instead of accumulating hidden variant combinations)**

여러 파일과 레이어에서 재사용되는 shared component에 `isCompact`, `isEditing`, `showSearch` 같은 boolean prop을 계속 추가하지 않습니다.  
boolean이 늘어날수록 가능한 조합이 급증하고, JSX 분기와 스타일 조건도 함께 불어나기 때문입니다.  
이 규칙은 exported shared component에 적용합니다.  
route entry 안의 일회성 분기는 로컬에서 유지할 수 있지만, shared `ui`나 `widget`는 explicit variant component나 compound component로 드러냅니다. `.Root` 같은 namespaced part 문법은 권장 예시일 뿐이고, 이 규칙의 본질은 boolean을 없애고 구조를 명시적으로 드러내는 데 있습니다.

**Incorrect (boolean prop 조합으로 shared component가 비대해짐):**

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

**Correct (variant를 explicit component와 stateless compound component로 분리):**

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

핵심은 `WgEntryToolbar` 하나에 boolean 모드를 계속 추가하지 않는 것입니다.  
explicit variant는 standalone component여도 되고, 이렇게 compound component 위에서 조립해도 됩니다.

### 3.2 Choose Single Components, Compound Components, and Variants Deliberately

**Impact: HIGH (helps shared components choose the simplest structure that still exposes the right extension points)**

shared component는 props보다 구조를 먼저 고릅니다.
고정 UI, public part 조립, shared state/action/context, 반복 preset 중 무엇이 필요한지 순서대로 봅니다.

**빠른 선택표**

| 상황 | 선택 |
| --- | --- |
| 고정 UI | `single component` 또는 route-local JSX |
| part 조립만 필요함 | `stateless compound component` |
| 여러 part가 같은 state/action/context를 읽음 | `stateful compound component` |
| 같은 compound 조합이 반복됨 | `explicit variant component` |
| parent가 runtime 데이터를 child 콜백에 밀어줘야 함 | `render prop` |

public part는 소비자가 이름으로 조립해야 하거나 shared context/action을 직접 쓰는 영역만 공개합니다.
단순 class wrapper, spacing 보정 DOM, 내부 layout helper는 숨깁니다. stateless compound에 state가 필요해지면 public 이름은 유지하고 context만 추가합니다.

**Incorrect (single component, compound component, explicit variant의 경계를 구분하지 않고 하나의 component에 몰아넣음):**

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

boolean branch, optional slot, render prop, fixed variant를 한 component에 몰아두면 소비자가 실제 구조를 예측하기 어렵습니다.

**Correct (고정 구조면 single component로 유지):**

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

**Correct (구조를 열어야 하면 stateless compound component로 시작):**

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

이런 구조는 지금은 `stateless compound component`지만, 나중에 state가 필요해지면 같은 이름을 유지한 채 `stateful compound component`로 확장할 수 있습니다.

**Correct (여러 part가 state를 공유하면 stateful compound component로 확장):**

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

`Tabs.Trigger`와 `Tabs.Panel`처럼 여러 part가 같은 state를 읽고 행동을 공유하면, 그 시점부터는 `stateful compound component`입니다.

**Correct (같은 family 조합이 반복되면 explicit variant로 감쌈):**

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

이 규칙은 `strategy-avoid-boolean-prop-proliferation`, `strategy-prefer-children-over-render-props`, `screen-avoid-premature-abstraction`과 함께 봅니다.

### 3.3 Prefer Children Over Render Props for Static Composition

**Impact: MEDIUM (keeps shared component composition readable when the parent does not need to push runtime data through callbacks)**

shared component가 `stateless compound component`로 충분할 때는 `renderHeader`, `renderFooter` 같은 render prop보다 `children`과 namespaced slot part를 우선합니다.  
render prop은 parent가 child에 item, index, state 같은 runtime 데이터를 전달해야 할 때만 사용합니다.

**Incorrect (정적인 구조를 render prop으로 조립):**

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

**Correct (children과 namespaced slot part로 구조를 드러냄):**

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

같은 shell을 재사용하지만 내부 구조는 화면마다 달라질 수 있다면 `stateless compound component`가 더 읽기 쉽습니다.  
이 경우에는 `showFooter`, `showSearch`, `isCreateMode` 같은 boolean prop도 필요 없고, parent가 runtime 데이터를 child 함수에 밀어줄 이유도 없으므로 render prop보다 단순한 구조 조립이 맞습니다. `Panel.Root/Header/Footer`처럼 dot notation으로 묶고, 나중에 state가 필요해지면 같은 이름을 유지한 채 context를 추가합니다.

## 4. Component Structure and JSX

**Impact: HIGH**

컴포넌트는 계약과 variant가 분명하게 드러나야 하며, JSX 안에 동작을 숨기지 않고 React 19 기준의 컴포넌트 구조를 읽기 쉽게 유지해야 합니다.

### 4.1 Accept props as a Whole and Destructure Inside the Component

**Impact: MEDIUM (컴포넌트 계약을 시그니처에 남기고 실제 사용을 본문 가까이에 유지함)**

컴포넌트 시그니처는 `props` 전체를 받고, 함수 본문 첫 줄에서 구조분해합니다. 이렇게 하면 시그니처에서 계약을 한눈에 읽고, 본문에서 실제 사용하는 값을 좁은 스코프에 둘 수 있습니다.

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

**Impact: HIGH (prevents remount bugs and hidden state resets caused by recreating component types every render)**

컴포넌트 본문 안에서 다른 컴포넌트를 새로 정의하지 않습니다. parent가 다시 렌더될 때마다 child component type도 새로 만들어져 remount, focus reset, animation restart, effect 재실행이 생길 수 있습니다.   
로컬에서 JSX 조각을 재사용하고 싶다면 그냥 helper 함수 호출로 남기거나, 독립 component로 빼고 props를 전달합니다.

**Incorrect (렌더마다 새 component type을 생성):**

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

**Correct (component를 바깥으로 분리하고 props로 전달):**

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

### 4.3 Prefer Arrow Functions and Object Parameters for Complex Signatures

**Impact: MEDIUM-HIGH (함수 선언과 다중 인자 계약을 더 쉽게 확장하고 수정할 수 있게 함)**

함수는 기본적으로 화살표 함수로 선언하고, 매개변수가 3개 이상이거나 같은 계열 값이 함께 이동하면 단일 객체 매개변수로 묶습니다. 객체 매개변수 타입은 파일 상단에 선언해 계약을 먼저 드러냅니다.

**Incorrect (길고 취약한 positional parameter 나열):**

```ts
export function updateEntryMediaUploadFileByUid(
  uploadFileListByColumn: Record<string, UploadFile[]>,
  columnName: string,
  fileUid: string,
  updater: (uploadFile: UploadFile) => UploadFile,
) {
  // ...
}
```

**Correct (화살표 함수와 객체 매개변수 사용):**

```ts
export interface UpdateEntryMediaUploadFileByUidParams {
  uploadFileListByColumn: Record<string, UploadFile[]>;
  columnName: string;
  fileUid: string;
  updater: (uploadFile: UploadFile) => UploadFile;
}

/**
 * @helper column별 업로드 파일 목록에서 특정 uid 항목 갱신
 */
export const updateEntryMediaUploadFileByUid = (params: UpdateEntryMediaUploadFileByUidParams) => {
  const { uploadFileListByColumn, columnName, fileUid, updater } = params;
  // ...
};
```

### 4.4 Use Named Handlers Instead of Hiding Logic in JSX

**Impact: HIGH (부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽을 수 있게 함)**

JSX에서는 명명된 핸들러 참조를 기본으로 하고, 아주 짧은 단순 위임만 인라인 함수로 허용합니다. 분기, 비동기 호출, 여러 부수효과가 들어가면 반드시 핸들러로 분리합니다.

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
 * @event 선택된 entry 삭제와 다음 화면 이동 처리
 */
const handleRemoveEntryButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  // ...
};

<UiButton onClick={handleRemoveEntryButtonClick} />;
```

### 4.5 Use ref Props Instead of New forwardRef Wrappers in React 19

**Impact: MEDIUM-HIGH (keeps component definitions simpler in React 19 codebases and avoids adding legacy wrappers by default)**

React 19 codebase에서는 `ref`를 "외부에서 실제로 제어해야 하는 public imperative contract"로 다룹니다.   
따라서 focus, scroll, measure 같은 contract가 있을 때만 `ref` prop을 열고, 그 경우에도 새로운 `forwardRef` wrapper보다 `ref`를 일반 prop처럼 직접 받는 방식을 기본값으로 삼습니다.   
반대로 외부 제어가 필요 없는 단순 view component에는 `ref` prop 자체를 추가하지 않습니다.   
기존 `forwardRef`를 모두 지우라는 뜻은 아니며, third-party 타입 제약이나 점진적 마이그레이션 때문에 유지해야 하는 경우는 예외로 둘 수 있습니다.

**Incorrect (React 19에서도 새 `forwardRef`를 추가):**

```tsx
import { forwardRef } from "react";

export const UiSearchInput = forwardRef<HTMLInputElement, UiSearchInputProps>((props, ref) => {
	return <input ref={ref} {...props} />;
});
```

**Incorrect (`ref` contract가 필요 없는 단순 view component에도 습관적으로 `ref`를 노출):**

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

**Correct (`ref`가 실제로 필요한 public API일 때만 React 19 방식으로 직접 받음):**

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

**Correct (`ref`가 실제 contract가 아닐 때는 일반 prop만 유지):**

```tsx
export interface UiStatusBadgeProps {
	label: string;
}

export const UiStatusBadge = (props: UiStatusBadgeProps) => {
	const { label } = props;
	return <span>{label}</span>;
};
```

### 4.6 Use Visibility Primitives Deliberately for Show and Hide Branches

**Impact: MEDIUM (표시 여부 결정을 route 화면 전반에서 명시적이고 일관되게 유지함)**

React 19의 `<Activity />` 또는 프로젝트가 이미 채택한 동등한 visibility primitive가 있다면, 이미 마운트된 subtree를 보여주거나 숨기는 의도일 때만 사용합니다.   
삼항 렌더링과 visibility primitive는 같은 의미가 아닙니다. 전자는 branch를 아예 unmount할 수 있지만, 후자는 숨겨진 subtree의 state와 effect를 유지할 수 있습니다. mount/unmount 의미가 중요하면 기존 조건부 렌더링을 유지하고, 코드베이스에 `Activity`가 아직 없다면 이 규칙 때문에 새 추상화를 도입하지 말고 기존 패턴을 따릅니다.

**Incorrect (lifecycle 의미가 다른 분기를 무비판적으로 visibility primitive로 치환):**

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

**Correct (show/hide가 목적일 때만 visibility primitive를 사용하고, mount 의미가 중요하면 조건부 렌더링을 유지):**

```tsx
return <Activity mode={isSidebarOpen ? "visible" : "hidden"}><EntrySidebar /></Activity>;
```

```tsx
return hasItems ? <ItemList /> : <EmptyState />;
```

## 5. Screen File Discipline

**Impact: HIGH**

Route entry 파일은 화면 흐름을 분명하게 보여줘야 하며, helper 추출도 경계가 정당할 때만 해야 합니다. layout-only 분리는 지양하지만 async, state, interaction 같은 runtime boundary를 소유한 route-local section은 추출할 수 있습니다.

### 5.1 Avoid Premature Abstraction in Screen Code

**Impact: HIGH (추측성 추출 대신 실제 재사용 경계에 맞춰 route 코드를 유지함)**

반복이 보인다는 이유만으로 공용 hook, component, helper를 만들지 않습니다.

먼저 시도할 것:

- 한 함수 안에서 단계 변수, section comment, 내부 블록으로 정리
- route-local JSX에 남기고 흐름을 보이게 유지
- 작은 mapper, href 조립, fallback 처리는 호출 위치에 유지

추출할 수 있는 때:

- 여러 화면/모듈이 같은 이름의 계약으로 직접 호출함
- state/effect/context/form/store orchestration을 한 custom hook이 실제로 소유함
- route-local component가 async/state/provider/interaction 같은 runtime boundary를 소유함

금지:

- 한 component, 한 handler, 한 query `select`만 쓰는 helper를 support module에 쌓기
- export helper가 다른 export helper 하나만 위해 존재하는 구조
- 이름이 그럴듯하다는 이유로 흐름을 파일 왕복으로 숨기기

**Incorrect (반복만 보고 성급하게 추상화):**

```ts
const usePermissionA = () => {
  // 유사 로직
};

const usePermissionB = () => {
  // 유사 로직
};
```

**Incorrect (component 하나만 쓰는 단계 helper를 support module에 남김):**

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

이 helper들이 다른 화면의 계약으로 쓰이지 않는다면 component를 읽는 사람이 helper 정의로 이동해야 하는 비용만 생깁니다.

**Correct (계약이 생긴 뒤에 공용화):**

```ts
/**
 * @summary form state, 저장 mutation, 오류 노출을 함께 오케스트레이션하는 editor contract
 */
export const useEntryEditor = () => {
  const form = useForm<EntryEditorFormValues>();

  /**
   * @api entry 저장 API
   */
  const mutationEntrySave = useEntrySave();
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  return { form, mutationEntrySave, setSubmitErrorMessage, submitErrorMessage };
};
```

**Correct (같은 화면 안 반복은 먼저 한 함수 안에서 local 정리로 해결):**

```ts
/**
 * @helper entry form values를 API payload로 조립
 */
export const buildEntryPayload = (formValues: EntryFormValues) => {
	// 1. 공통 문자열 값 정규화
	// 2. API payload 형태로 조립
	// 3. 결과 반환
};
```

**Correct (작은 query shaping과 href 조립은 사용 지점에 둠):**

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

**Impact: HIGH (route entry의 orchestration은 보이게 유지하면서도 async, state, interaction처럼 실제 경계가 있는 subtree는 안전하게 분리할 수 있게 함)**

route entry의 local component는 `runtime boundary`가 있을 때만 추출합니다.
단순 layout wrapper, className grouping, 들여쓰기 감소만으로는 추출하지 않습니다.

추출 가능한 boundary:

- async: `Suspense`, skeleton, loading, error, empty state
- state/provider: local state, effect sync, form provider, context, scoped store
- interaction: popover, modal, selection, inline edit, drag, expandable tree
- library/performance: dense widget adapter, virtualization, transition, deferred value

search param, navigation, page-level query/mutation, cross-section effect, invalidate, redirect, 여러 section에 걸친 파생값은 route entry에 둡니다.

**Incorrect (layout wrapper만 분리해 route flow를 숨김):**

```tsx
const EntrySidebarPanel = () => {
	return (
		<section className="entry-layout__sidebar">
			<SidebarStats />
			<SearchField />
			<EntryTree />
		</section>
	);
};

const EntryDetailPanel = () => {
	return (
		<section className="entry-layout__detail">
			<DetailHeader />
			<EntryTable />
		</section>
	);
};

export const RouteComponent = () => {
	const responseEntryTreeSuspense = useEntryTreeSuspense();
	const responseEntryListSuspense = useEntryListSuspense();

	return (
		<div className="entry-layout">
			<EntrySidebarPanel />
			<EntryDetailPanel />
		</div>
	);
};
```

이 구조는 route entry가 어떤 data와 interaction을 오케스트레이션하는지 숨기고, local component도 runtime boundary 없이 layout wrapper 역할만 합니다.

**Correct (runtime boundary를 소유하는 section만 route-local component로 추출):**

```tsx
interface EntryTreeSectionProps {
	categoryNodes: EntryCategoryNode[];
	selectedCategoryId?: string;
	onCategorySelect: (categoryId: string) => void;
}

const EntryTreeSection = (props: EntryTreeSectionProps) => {
	const { categoryNodes, selectedCategoryId, onCategorySelect } = props;
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
	const [treeSearchKeyword, setTreeSearchKeyword] = useState("");

	const filteredCategoryNodes = getFilteredCategoryNodes(
		categoryNodes,
		treeSearchKeyword,
	);

	/**
	 * @event tree에서 선택한 category key를 route search용 categoryId로 변환
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

이 `EntryTreeSection`은 tree search state, expand interaction, empty state, `UiTree` adapter라는 runtime boundary를 실제로 소유하므로 local component로 승격할 가치가 있습니다.

**Correct (route entry는 orchestration을 계속 소유):**

```tsx
export const RouteComponent = () => {
	const navigate = useNavigate();
	const search = Route.useSearch();

	/**
	 * @api tree sidebar 조회 API
	 */
	const responseEntryTreeSuspense = useEntryTreeSuspense<EntryTreeSelectData>();

	/**
	 * @api entry 목록 조회 API
	 */
	const responseEntryListSuspense = useEntryListSuspense<EntryListSelectData>();

	/**
	 * @event tree에서 선택한 category로 route search를 갱신
	 */
	const handleCategorySelect: EntryTreeSectionProps["onCategorySelect"] = (categoryId) => {
		void navigate({
			to: "/entries",
			search: { page: search.page, size: search.size, categoryId },
		});
	};

	return (
		<div className="entry-layout">
			<EntryTreeSection
				categoryNodes={responseEntryTreeSuspense.data.categoryNodes}
				selectedCategoryId={search.categoryId}
				onCategorySelect={handleCategorySelect}
			/>
			<EntryTableSection
				entries={responseEntryListSuspense.data?.entries}
			/>
		</div>
	);
};
```

요약하면 route-local section component는 "화면의 한 덩어리처럼 보이기 때문"이 아니라, async, state, provider, interaction, library, performance 중 하나의 runtime boundary를 실제로 소유할 때만 추출합니다.

### 5.3 Extract Screen Support Code Only When the Boundary Is Real

**Impact: HIGH (route 파일이 자기 계약이 없는 helper 조각으로 분해되는 것을 막음)**

화면 support code는 "이름 붙일 수 있다"가 아니라 "경계가 있다"일 때만 추출합니다.

추출 후보:

- React state/hook과 직접 결합되지 않은 pure function
- 입력/출력 계약이 명확한 화면 전용 변환, preset, option, column meta
- 밖으로 빼면 route entry의 response, state, handler, render flow가 더 잘 보이는 코드
- 여러 exported 함수에서 같은 단계가 반복되는 이름 있는 도메인 규칙

남길 것:

- 작은 1회성 guard, URL 조립, `trim() || undefined` 같은 호출 지점 계산
- handler/effect 안에 있어야 문맥이 보이는 query invalidation, navigation, fallback 처리
- 한 component나 한 query `select`만 쓰는 작은 mapper

배치:

- route sibling `page.ts`에 named export로 둡니다.
- `helper.ts`, `helpers.ts`, `utils.ts`, `common.ts` 같은 generic 파일명은 만들지 않습니다.
- support module 안에서도 작은 private helper를 쌓지 말고, 기본은 한 exported 함수 안에서 단계별로 정리합니다.

**Incorrect (작은 화면 전용 계산을 generic util 파일로 뺌):**

```ts
// utils.ts
export const util = {
  getNextPage(page: number) {
    return page + 1;
  },
};
```

**Incorrect (`page.ts`를 export helper 창고처럼 사용):**

```ts
export const normalizeEntryValues = (formValues: EntryFormValues) => {
	// ...
};

export const buildEntryUploadRequests = (files: UploadFile[]) => {
	// ...
};

export const mergeEntryPayload = (
	values: EntryFormValues,
	uploadRequests: SaveUploadRequest[],
) => {
	// ...
};

export const buildEntryPayload = (formValues: EntryFormValues, files: UploadFile[]) => {
	return mergeEntryPayload(
		normalizeEntryValues(formValues),
		buildEntryUploadRequests(files),
	);
};
```

**Incorrect (`_local` component 하나만 쓰는 private helper를 누적):**

```tsx
const readOptionalFilter = (value: string) => value.trim() || undefined;

const buildEditHref = ({ editHrefBase, row }: { editHrefBase: string; row: EntryRow }) =>
	`${editHrefBase}${row.id}/`;

export const EntryTable = (props: EntryTableProps) => {
	const responseEntriesQuery = useListEntries({
		q: readOptionalFilter(filters.q),
	});

	return <a href={buildEditHref({editHrefBase: props.editHrefBase, row})}>{row.title}</a>;
};
```

이 정도는 helper 이름을 따라가는 것보다 component 안에서 직접 읽는 편이 빠릅니다.

**Correct (screen-owned support code는 먼저 `page.ts`의 named export로 모으고, 흐름에 묶인 로직은 handler에 남김):**

```ts
// page.ts
/**
 * @helper tree 응답을 화면용 node shape로 정규화
 */
export const normalizeTreeNodes = (nodes: TreeNodeResponse[]) => {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
  }));
};
```

```ts
// page.tsx
/**
 * @event 저장 요청 후 목록 query를 무효화
 */
const handleSave = async () => {
  await mutationEntrySave.mutateAsync({ data: request });
  await queryClient.invalidateQueries({ queryKey: ["entry-list"] });
};
```

**Correct (`page.ts` 안의 작은 단계는 한 exported 함수 안에서 정리):**

```ts
/**
 * @helper entry form values와 파일 목록을 저장 payload로 조립
 */
export const buildEntryPayload = (
	formValues: EntryFormValues,
	files: UploadFile[],
) => {
	// 1. formValues 정규화
	// 2. upload request 조립
	// 3. payload 병합
	return {
		// ...
	};
};
```

**Correct (component 전용 작은 단계는 호출 위치에 유지):**

```tsx
export const EntryTable = (props: EntryTableProps) => {
	const { editHrefBase, filters } = props;
	const responseEntriesQuery = useListEntriesSuspense({
		q: filters.q.trim() || undefined,
	});

	return responseEntriesQuery.data.map((row) => (
		<a href={`${editHrefBase}${row.id}/`} key={row.id}>
			{row.title}
		</a>
	));
};
```

**Correct (여러 owner가 실제로 공유할 때만 `shared/util.ts`로 승격):**

```ts
// shared/util.ts
export const util = {
	date: {
		/**
		 * @helper date 입력값을 ISO 문자열로 정규화
		 */
		normalize(value: Date | string) {
			return new Date(value).toISOString();
		},
	},
};
```

### 5.4 Keep Derived Values Close to Where They Are Used

**Impact: HIGH (오리진을 보존하고 route 파일이 alias와 명령형 setup 코드로 채워지는 것을 막음)**

화면 상단에서 오리진을 잃는 별칭 상수, `let` 재할당, 배열 `push` 기반 명령형 조립을 금지합니다. Hook 파라미터, JSX 표시값, effect 내부 계산은 실제 사용하는 좁은 스코프에서 직접 계산합니다. JSX에서만 쓰는 표시값은 특히 화면 상단 `const`로 빼지 말고 원본 체이닝으로 직접 참조합니다.

**Incorrect (화면 상단에서 파생값과 별칭을 누적):**

```ts
const entrySchemaData = responseEntrySchema.data;
const hasSelectedRows = selectedRows.length > 0;
const selectedCategoryIdForQuery = selectedCategoryState.selectedCategoryNode?.id;
```

**Correct (사용 지점 가까이에서 계산):**

```ts
/**
 * @api entry 목록 조회 API
 */
const responseEntryListSuspense = useEntryListSuspense({
  categoryId: selectedCategoryState.selectedCategoryNode?.id,
});
```

```tsx
<Activity mode={selectedRows.length > 0 ? "visible" : "hidden"} />
```

```tsx
return <UiInput value={selectedNodeContext?.node?.name} />;
```

### 5.5 Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (route 파일을 화면의 주 orchestration 지점으로 읽기 쉽게 만듦)**

라우트 엔트리 파일은 화면 흐름이 드러나게 유지합니다. state, API response/mutation, event handler, `useEffect`, 렌더링 조립이 보이도록 두고, 단순 레이아웃 분리만을 위한 조기 컴포넌트화는 기본값으로 삼지 않습니다. runtime boundary를 소유하는 route-local section component는 추출할 수 있지만, route entry는 여전히 search param, navigate, page-level query/mutation, cross-section effect 같은 orchestration을 보여줘야 합니다.

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

**Correct (화면 엔트리에서 흐름과 orchestration이 보이고, 필요한 section만 runtime boundary 기준으로 분리):**

```tsx
const navigate = useNavigate();
const search = Route.useSearch();

/**
 * @api entry 목록 조회 API
 */
const responseEntryListSuspense = useEntryListSuspense({
  page: search.page,
});

/**
 * @api entry 저장 API
 */
const mutationEntrySave = useEntrySave();

/**
 * @event entry 저장 후 현재 화면 흐름을 유지한 채 route search를 갱신
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

### 5.6 Move Screen-owned Pure Support Code Into `page.ts` Before Splitting Further

**Impact: HIGH (route entry 파일이 preset과 순수 helper를 쌓기보다 orchestration에 집중하게 함)**

이 규칙은 추출하기로 결정한 화면 전용 pure support code의 목적지를 정합니다.

`page.ts`로 옮길 것:

- 화면 전용 불변 설정, 옵션 목록, preset, column meta
- React hook 없이 동작하는 pure support function
- 화면 전용 type/interface
- 여러 줄로 커진 request/response shaping

`page.tsx`에 남길 것:

- response/mutation, state, handler, effect, render flow
- 작은 1회성 guard와 사용 지점 옆이 더 빠른 계산
- query invalidation, navigation처럼 hook context가 필요한 흐름

`page.ts`는 helper 창고가 아니라 화면 전용 support module입니다. 처음부터 `*-request.ts`, `*-columns.ts`로 쪼개지 말고, `page.ts`가 여러 독립 관심사로 커졌을 때만 추가 분리를 검토합니다.

**Incorrect (route entry 상단에 순수 지원 코드가 누적됨):**

```ts
const getMediaColumnRules = () => {
  // ...
};

const buildFileRequests = () => {
  // ...
};
```

**Incorrect (`page.ts` 안에서도 작은 단계마다 export helper를 늘림):**

```ts
export const getUploadFileExtension = (fileName: string) => {
	// ...
};

export const formatUploadFileSizeMb = (bytes: number) => {
	// ...
};

export const validateUploadFile = (file: UploadFileCandidate) => {
	// ...
};
```

**Correct (route entry 흐름은 `page.tsx`에 두고, screen-owned pure support code는 `page.ts`의 named export로 모음):**

```tsx
import { buildFileRequests } from "./page";

const [uploadFilesByField, setUploadFilesByField] = useState({});

/**
 * @api entry form schema 조회 API
 */
const responseEntryFormSchema = useEntryFormSchema();

/**
 * @event 업로드 파일 목록으로 요청 payload 조립
 */
const handleFormFinish = () => {
  const request = buildFileRequests(uploadFilesByField);
  // ...
};
```

```ts
/**
 * @helper upload field별 검증 규칙 생성
 */
export const getUploadFieldRules = () => {
  // ...
};

/**
 * @helper 업로드 파일 목록을 저장 request 배열로 변환
 */
export const buildFileRequests = (uploadFilesByField: Record<string, unknown>) => {
  // ...
  return [];
};
```

**Correct (`page.ts` 내부 단계는 한 exported 함수 안에서 정리):**

```ts
/**
 * @helper 업로드 파일 유효성 검사를 단계별로 수행
 */
export const validateUploadFile = (file: UploadFileCandidate) => {
	// 1. 파일 크기 확인
	// 2. 확장자 확인
	// 3. 확장자별 제한 확인
	// 4. 메시지 조립 후 결과 반환
};
```

**Correct (작은 1회성 계산은 render flow 옆에 그대로 둠):**

```tsx
const isSubmitDisabled =
	mutationEntrySave.isPending || uploadFileList.length === 0;

return <UiButton disabled={isSubmitDisabled}>저장</UiButton>;
```

## 6. Events and Interaction Flow

**Impact: MEDIUM-HIGH**

Event handler는 이름이 예측 가능하고 effect 재실행을 유발하지 않는 직접적인 사용자 액션 흐름으로 유지해야 합니다.

### 6.1 Keep Screen-specific Handler Flow Local Until a Real Utility Emerges

**Impact: MEDIUM (모든 분기를 작은 helper로 쪼개지 않고도 가독성을 유지함)**

여기서 `local`은 JSX 인라인 핸들러를 뜻하지 않고, 이미 이름 붙은 handler 본문 안에서 흐름을 계속 읽을 수 있게 유지한다는 뜻입니다.   
핸들러가 길어져도 바로 `page.ts`나 shared support code로 쪼개지 않습니다. 먼저 early return, 단계적 지역 변수, 의미 있는 블록 구분으로 읽기 쉽게 유지하고, `screen-extract-utilities-selectively` 규칙을 만족할 때만 분리합니다. 화면 하나에서만 쓰는 custom hook으로 우회해 흐름을 숨기는 것도 기본적으로 피합니다.

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
 * @event 선택된 entry 저장과 화면 이동 처리
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

### 6.2 Name Handlers Predictably and Curry Extra Arguments

**Impact: MEDIUM-HIGH (이벤트 흐름을 검색 가능하게 유지하고 즉흥적인 handler 시그니처를 피함)**

이벤트 핸들러는 `handle` 접두사로 시작하고 역할이 바로 드러나게 이름 짓습니다.
DOM 이벤트처럼 target과 event가 중요하면 `handle + Target + Event` 패턴을 우선하고, submit/save/message처럼 문맥상 target이 이미 분명한 action callback은 `handle + DomainAction`처럼 더 짧게 둘 수 있습니다.
추가 인자가 필요하면 handler factory 형태의 고차 함수로 감싸고, 최종 반환값은 React handler 타입으로 고정합니다.

**Incorrect (이름과 시그니처가 제각각임):**

```ts
const onSelect = (id: string, event: MouseEvent<HTMLLIElement>) => {
  console.log(id, event.currentTarget);
};
```

**Correct (추가 인자는 바깥 함수, 이벤트는 안쪽 handler):**

```ts
import type { MouseEventHandler } from "react";

/**
 * @event 목록 항목 클릭 시 선택된 ID 전달
 */
const handleListItemClick =
  (id: string): MouseEventHandler<HTMLLIElement> =>
  (_event) => {
    console.log(id);
  };
```

### 6.3 Run User Actions in Handlers, Not Effects

**Impact: HIGH (avoids modeling one-shot user actions as state plus effect replays)**

제출, 저장, 삭제, 닫기 같은 사용자 액션은 해당 handler 안에서 바로 실행합니다.   
액션 자체를 state로 올린 뒤 `useEffect`가 나중에 실행하게 만들면 unrelated dependency 변화에도 재실행되기 쉽고, 흐름도 읽기 어려워집니다.

**Incorrect (사용자 액션을 state + effect로 모델링):**

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

**Correct (사용자 액션은 handler 안에서 바로 수행):**

```tsx
/**
 * @event 제출 버튼 클릭 시 생성 요청 실행
 */
const handleSubmit = async () => {
	await createEntryMutation.mutateAsync(formValues);
};
```

## 7. State and Data Flow

**Impact: CRITICAL**

Server state, store 접근, 파생값, effect callback, transition은 오리진을 보존해야 하며 데이터 변형도 가능한 한 소스 가까이에 있어야 합니다.

### 7.1 Avoid Silent Fallback Defaults and Ad-hoc Loading Branches

**Impact: HIGH (결측 데이터를 숨기지 않고 로딩 UX를 Suspense 또는 명시적 예외 처리 쪽으로 유도함)**

옵셔널 값에 `??`, `||`로 습관적인 기본값을 넣지 않고, Suspense query의 초기 blocking 로딩을 화면 본문에서 즉석 분기하지 않습니다. 결측값은 드러내고, 초기 로딩은 기본적으로 Suspense 경계나 상위 레이아웃에서 처리합니다.   
대신 `isPending`, `isFetching` 같은 상태는 버튼 비활성화, background refetch indicator, 저장 중 배지처럼 기존 UI를 보조하는 좁은 용도로만 사용합니다. 화면 전체를 가리는 로컬 loading 분기가 꼭 필요하면 가까운 한글 주석으로 이유를 남깁니다.

**Incorrect (결측과 로딩을 즉석에서 숨김):**

```tsx
const name = responseUserGetItemSuspense.data?.name ?? "";

if (responseUserGetItemSuspense.isPending) {
  return <Spinner />;
}
```

**Correct (결측은 명시적으로 드러내고, pending/fetching은 보조 UI에만 사용):**

```tsx
if (!responseUserGetItemSuspense.data?.name) {
  return (
    <>
      <UserNameEmptyState />
      <UiButton disabled={mutationUserSave.isPending}>저장</UiButton>
      {responseUserGetItemSuspense.isFetching ? <RefreshIndicator /> : null}
    </>
  );
}

return (
  <>
    <UserName value={responseUserGetItemSuspense.data.name} />
    <UiButton disabled={mutationUserSave.isPending}>저장</UiButton>
    {responseUserGetItemSuspense.isFetching ? <RefreshIndicator /> : null}
  </>
);
```

### 7.2 Calculate Derived Values During Rendering

**Impact: HIGH (avoids redundant state sync and effect-driven drift when values can be computed from current inputs)**

현재 props, state, search, response에서 바로 계산할 수 있는 값은 `useEffect`와 `useState`로 다시 동기화하지 않습니다.   
render 중에 계산하면 추가 렌더와 drift를 줄일 수 있고, effect dependency도 억지로 늘어나지 않습니다.   
이 규칙은 `screen-keep-derived-values-close`와 함께 사용합니다. 파생값은 render 중에 만들고, 사용 지점 가까이에 둡니다.

**Incorrect (파생값을 effect로 다시 state에 동기화):**

```tsx
const [selectedCount, setSelectedCount] = useState(0);

useEffect(() => {
	setSelectedCount(selectedIds.length);
}, [selectedIds]);
```

**Correct (render 중에 바로 계산):**

```tsx
return <SelectedCountBadge count={selectedIds.length} />;
```

### 7.3 Choose State Tools by Source of Truth

**Impact: MEDIUM-HIGH (로컬 UI state, 전역 client state, server state가 서로 흐려지는 것을 막음)**

이 convention 세트는 로컬 UI 상태에 `useState` 또는 `useReducer`, 전역 클라이언트 상태에 `Zustand`, 서버 상태에 `@tanstack/react-query`를 기본 전제로 둡니다.   
상태 도구를 수명과 소유자 기준으로 고르면 화면 파일이 더 읽기 쉬워지고 중복 동기화가 줄어듭니다.   
프로젝트가 이미 다른 전역 store나 server-state 도구를 표준으로 채택했다면, 이 규칙을 문자 그대로 적용해 `Zustand`나 `react-query`를 새로 들여오지 말고 같은 source-of-truth 원칙만 유지합니다.

**Incorrect (서버 상태를 로컬 상태로 복제):**

```ts
const responseUserGetItemSuspense = useUserGetItemSuspense();
const [userName, setUserName] = useState(responseUserGetItemSuspense.data.name);
```

**Correct (도구를 source of truth에 맞춤):**

```ts
const [isOpen, setIsOpen] = useState(false);
const themeStore = useThemeStore();

/**
 * @api 사용자 상세 조회 API
 */
const responseUserGetItemSuspense = useUserGetItemSuspense();
```

### 7.4 Name Query and Mutation Bindings Consistently

**Impact: HIGH (생성된 API hook과 로컬 바인딩을 쉽게 훑고 추적할 수 있게 함)**

프로젝트가 이미 채택한 query/mutation hook 이름은 유지하되, 로컬 바인딩 접두사는 `response`와 `mutation`만 사용합니다. codegen 여부와 무관하게 query는 `response...`, mutation은 `mutation...`으로 맞춰야 화면 파일에서 역할과 오리진이 한눈에 보입니다.

**Incorrect (query와 mutation 바인딩 이름이 제각각임):**

```ts
const list = useEntryListSuspense();
const removeApi = useEntryRemove();
```

**Correct (로컬 바인딩 접두사를 통일):**

```ts
/**
 * @api entry 목록 조회 API
 */
const responseEntryListSuspense = useEntryListSuspense();

/**
 * @api entry 삭제 API
 */
const mutationEntryRemove = useEntryRemove();
```

### 7.5 Prefer React Compiler Defaults Over Manual Memoization

**Impact: MEDIUM-HIGH (검증되지 않은 값어치 없이 노이즈만 늘리는 방어적 useMemo/useCallback을 피함)**

React 19 컴파일러가 처리하는 범위에서는 `useMemo`, `useCallback`을 기본적으로 사용하지 않습니다.   
외부 라이브러리가 참조 동일성에 민감하거나, 병목이 실제로 확인된 경우에만 허용하고 바로 위에 한글 주석으로 이유를 남깁니다.  
`useDeferredValue`를 기준으로 무거운 파생 계산을 늦추는 경우처럼 render 비용 절감 목적이 분명한 예외는 허용할 수 있지만, 그때도 "정말 무거운 계산인지"가 먼저 확인되어야 합니다.

**Incorrect (단순 가공을 관성적으로 memoization):**

```ts
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);
```

**Correct (필요할 때만 이유를 적고 사용):**

```ts
// list library가 columns 참조 동일성을 요구하여 리렌더 폭증을 방지한다.
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);
```

### 7.6 Preserve Response and Store Origin in Wide Scopes

**Impact: CRITICAL (파일 전체에서 alias를 따라가지 않아도 값의 출처를 바로 알 수 있게 함)**

페이지, 레이아웃, 화면 스코프에서는 `response...`, `mutation...`, `*Store` 원본을 유지합니다. 넓은 스코프 구조분해와 별칭 상수는 피하고, 정말 필요할 때만 handler나 effect 내부의 좁은 스코프에서 제한적으로 구조분해합니다. `props`를 본문 첫 줄에서 구조분해하는 패턴만 예외로 봅니다.

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
 * @watch 검색 응답이 비어 있을 때만 후속 동기화를 건너뜀
 */
useEffect(() => {
  const { data, isFetching } = responseEntrySearchSuspense;

  if (!isFetching && data.entries.length === 0) {
    return;
  }
}, [responseEntrySearchSuspense]);
```

### 7.7 Shape React Query Data in query.select

**Impact: CRITICAL (응답 변환을 fetch 경계 가까이에 두고 렌더 타임의 반복 매핑을 피함)**

서버 응답 가공은 렌더링 본문이 아니라 `query.select`에서 처리합니다.   
`data.list` 같은 원시 응답 구조를 화면 여러 군데에서 직접 해석하지 말고, 도메인 의미가 드러나는 필드 이름으로 한 번 변환합니다.   
여러 쿼리 데이터를 함께 가공해야 해도 먼저 `select`나 전용 hook 경계에서 풀 수 있는지 검토합니다.

**Incorrect (응답 원형을 화면에서 직접 소비):**

```ts
const endpoints = responsePermissionGroupGetApiEndpointListSuspense.data.list;
```

**Correct (패칭 시점에 필요한 모양으로 변환):**

```ts
/**
 * @api permission group endpoint 목록 조회 API
 */
const responsePermissionGroupGetApiEndpointListSuspense = usePermissionGroupGetApiEndpointListSuspense({
  query: {
    select: (response) => ({
      endpoints: response.data.list,
    }),
  },
});
```

### 7.8 Store Shared Role and Authority Decisions Only When They Are Truly Shared

**Impact: HIGH (중복된 권한 판별 휴리스틱이 여러 화면에 퍼지는 것을 막음)**

역할, 권한, 공용 판별 결과가 여러 화면, 메뉴, route guard에서 반복해서 필요할 때만 스토어에 승격합니다. 단일 화면에서 한두 번 읽는 query 필드까지 store로 복제하지 않습니다.   
store에 올리기로 했다면 문자열 비교나 도메인 판별은 bootstrap/layout 같은 한 경계에만 모으고, 화면은 `roleStore.isSuperAdmin` 같은 결과만 참조합니다. Suspense query처럼 `onSuccess`가 없어서 동기화가 필요하다면 owner가 분명한 경계에서만 `useEffect` 또는 `useLayoutEffect`를 사용하고, selector 최적화는 정말 필요한 경우에만 근거 주석과 함께 예외적으로 사용합니다.

**Incorrect (화면마다 판별을 반복하면서 단일 화면용 값을 store에도 복제):**

```ts
const roleStore = useRoleStore();
const isSuperAdmin = isSuperAdminRoleName(responseRoleGetItemSuspense.data.role);

useEffect(() => {
  roleStore.setRole(responseRoleGetItemSuspense.data.role);
}, [responseRoleGetItemSuspense.data.role, roleStore]);
```

**Correct (공용 권한은 owner가 분명한 경계에서만 적재하고 화면은 결과만 참조):**

```ts
const authStore = useAuthStore();

if (authStore.canManageUsers) {
  // ...
}
```

```ts
/**
 * @watch bootstrap authority 응답을 auth store에 동기화
 */
useEffect(() => {
  if (!responseAuthBootstrapSuspense.data) {
    return;
  }

  authStore.setAuthority(responseAuthBootstrapSuspense.data.authority);
}, [authStore, responseAuthBootstrapSuspense.data]);
```

### 7.9 Use Functional setState Updates When Based on Previous State

**Impact: MEDIUM-HIGH (prevents stale closure bugs when the next value depends on the current state)**

다음 state가 현재 state 값에 의존하면 직접 바깥 변수를 참조하지 말고 functional updater를 사용합니다.   
특히 handler, async callback, 여러 번 연속 호출될 수 있는 갱신에서는 stale closure를 막는 데 중요합니다.

**Incorrect (현재 state를 바깥 closure에서 직접 읽음):**

```tsx
const handleToggleUser = (userId: string) => {
	if (selectedUserIds.includes(userId)) {
		setSelectedUserIds(selectedUserIds.filter((currentUserId) => currentUserId !== userId));
		return;
	}

	setSelectedUserIds([...selectedUserIds, userId]);
};
```

**Correct (functional updater로 항상 최신 state를 기준으로 갱신):**

```tsx
/**
 * @event 사용자 선택 목록 토글 처리
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

### 7.10 Use Lazy State Initializers for Expensive Defaults

**Impact: MEDIUM (prevents repeated setup work when the initial state is expensive to compute)**

`useState` 초기값이 localStorage 파싱, 인덱스 생성, 큰 배열 정규화처럼 무거운 계산이라면 값을 바로 넣지 말고 initializer 함수로 감쌉니다. 싼 literal이나 단순 prop passthrough까지 전부 함수형으로 감쌀 필요는 없습니다.

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

### 7.11 Use startTransition for Non-urgent Visual Updates

**Impact: MEDIUM (keeps interactions responsive when a state change triggers a heavy list, table, or tree update)**

클릭이나 선택 이후 무거운 list, table, tree 렌더가 따라오는 비긴급 시각 업데이트는 `startTransition`으로 감쌉니다.   
입력값 자체, 폼 에러, 즉시 비활성화 같은 urgent feedback까지 transition에 넣지는 않습니다.

**Incorrect (무거운 비긴급 업데이트를 urgent state로 처리):**

```tsx
const handleStatusFilterChange = (nextStatus: EntryStatusFilter) => {
	setStatusFilter(nextStatus);
};
```

**Correct (비긴급 시각 업데이트는 transition으로 내림):**

```tsx
/**
 * @event 상태 필터 변경으로 인한 무거운 목록 갱신을 transition으로 예약
 */
const handleStatusFilterChange = (nextStatus: EntryStatusFilter) => {
	startTransition(() => {
		setStatusFilter(nextStatus);
	});
};
```

### 7.12 Use useDeferredValue for Heavy Derived Renders

**Impact: MEDIUM (keeps typing and small interactions responsive while expensive derived views catch up)**

검색어, 필터, 정렬 입력이 무거운 파생 렌더를 유발하면 원본 입력값을 그대로 expensive view에 연결하지 않습니다.  
`useDeferredValue`로 한 박자 늦춘 값을 만들고, 필요한 경우 그 값을 기준으로 필터링이나 정렬을 계산합니다.   
이 규칙은 실제로 렌더 지연이 느껴질 때 적용합니다. 작은 배열이나 단순 문자열 가공까지 습관적으로 defer하지는 않습니다.  
또한 이 경우의 `useMemo`는 `state-compiler-first-memoization` 규칙의 예외적인 허용 사례입니다.   
deferred value를 기준으로 expensive 계산을 다시 돌리는 비용이 실제로 크고, render마다 같은 작업을 반복하지 않으려는 목적이 분명할 때만 함께 사용합니다.

**Incorrect (입력과 무거운 파생 렌더를 같은 값에 묶음):**

```tsx
const [keyword, setKeyword] = useState("");
const filteredRows = rows.filter((row) => fuzzyMatchRow(row, keyword));
```

**Correct (입력은 urgent, 무거운 파생 렌더는 deferred 값과 제한적인 memoization으로 계산):**

```tsx
const [keyword, setKeyword] = useState("");
const deferredKeyword = useDeferredValue(keyword);

const filteredRows = useMemo(() => {
	return rows.filter((row) => fuzzyMatchRow(row, deferredKeyword));
}, [deferredKeyword, rows]);
```

### 7.13 Use useEffectEvent for Non-reactive Effect Callbacks

**Impact: MEDIUM-HIGH (keeps effects reactive only to true subscriptions while still reading the latest handler logic)**

effect 안에서 최신 prop이나 state를 읽어야 하지만, 그 값 변화 자체가 subscription 재설치를 일으키면 안 되는 경우에는 ref hack 대신 `useEffectEvent`를 우선합니다.   
이 규칙은 event handler를 effect로 옮기라는 뜻이 아닙니다. 진짜 구독/연결 effect 안에서만 쓰고, 클릭/제출 같은 사용자 액션은 여전히 named handler에 둡니다.

**Incorrect (최신 callback을 위해 ref를 수동 동기화):**

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

**Correct (non-reactive callback은 `useEffectEvent`로 분리):**

```tsx
/**
 * @event socket message 수신 시 최신 onMessage 로직 실행
 */
const handleMessage = useEffectEvent((message: SocketMessage) => {
	onMessage(message);
});

/**
 * @watch socket subscription lifecycle 유지
 */
useEffect(() => {
	const unsubscribe = socket.subscribe((message) => {
		handleMessage(message);
	});

	return unsubscribe;
}, [socket]);
```

## 8. Documentation and Comments

**Impact: MEDIUM**

React 경계 선언에는 companion skill인 `convention-typescript`의 annotation 표준을 적용하고, compound component의 public part는 `@part`와 `@description`으로 읽히게 문서화하며, inline comment는 JSX나 handler 흐름에서 비자명한 제약만 설명해야 합니다.

### 8.1 Document Compound Parts with @part and @description

**Impact: MEDIUM (keeps compound public parts scannable as one named boundary instead of disconnected props and component declarations)**

compound component가 public part를 노출하면 part 단위로 문서화합니다.

작성 방식:

- props `interface` 바로 위에 `@part`와 `@description`을 둡니다.
- component 선언은 그 `interface` 바로 아래에 둡니다.
- part field는 `@field`, part 내부 handler는 `@event`로 설명합니다.
- 단순 내부 wrapper에는 public part 문서를 만들지 않습니다.

**Incorrect (props와 component 설명이 분리되어 part 경계가 흐려짐):**

```tsx
/**
 * @summary dialog header props
 */
interface DialogHeaderProps {
	/**
	 * @field header 영역 안에 렌더할 자식 요소
	 */
	children: ReactNode;
}

/**
 * @summary dialog 헤더 슬롯
 */
const DialogHeader = (props: DialogHeaderProps) => {
	const { children } = props;

	return <header className="dialog-header">{children}</header>;
};

export const Dialog = {
	Header: DialogHeader,
} as const;
```

이 방식은 props shape와 component 역할을 따로 읽어야 해서 `Dialog.Header`라는 part 경계가 한눈에 들어오지 않습니다.

**Correct (part 단위로 JSDoc을 묶어 읽히게 유지):**

```tsx
/**
 * @part dialog header
 * @description dialog panel 상단의 제목과 설명 영역을 감싸는 헤더 컴포넌트
 */
interface DialogHeaderProps {
	/**
	 * @field header 영역 안에 렌더할 자식 요소
	 */
	children: ReactNode;
}
const DialogHeader = (props: DialogHeaderProps) => {
	const { children } = props;

	return <header className="dialog-header">{children}</header>;
};
```

**Correct (stateful part 내부의 handler도 역할에 맞게 문서화):**

```tsx
/**
 * @part dialog close
 * @description dialog root context를 사용해 닫기 액션을 실행하는 공용 버튼 컴포넌트
 */
interface DialogCloseProps {
	/**
	 * @field 닫기 버튼 안에 표시할 자식 요소
	 */
	children: ReactNode;
}
const DialogClose = (props: DialogCloseProps) => {
	const { children } = props;
	const dialog = useDialogContext();

	/**
	 * @event dialog 닫기 버튼 클릭 처리
	 */
	const handleCloseButtonClick = () => {
		dialog.closeDialog();
	};

	return (
		<button onClick={handleCloseButtonClick} type="button">
			{children}
		</button>
	);
};
```

요약하면 compound part는 props type만의 문서도, component만의 문서도 아닙니다.  
하나의 public part boundary로 읽히게 `@part`와 `@description`을 props `interface` 위에 두고, component를 바로 아래에 붙입니다.

### 8.2 Limit Inline Comments to Non-obvious Logic

**Impact: MEDIUM (코드를 해설하기보다 주석을 caveat, 제약, 부수효과 설명에 집중시킴)**

함수 본문 안에서는 `//` 라인 주석을 사용하고, 도메인 규칙, 예외 방어, 라이브러리 제약, 부수효과 순서처럼 코드만 읽어서는 놓치기 쉬운 경우에만 남깁니다. 변수명 반복이나 단순 매핑 설명은 주석으로 적지 않습니다. 헤더 JSDoc과 annotation 태그 선택은 `docs-require-jsdoc-on-key-declarations`와 companion skill인 `convention-typescript`의 표준을 따릅니다.

**Incorrect (코드 그대로를 반복하는 주석):**

```ts
// selectedKey를 selectedKeys 첫 번째 값으로 할당
const selectedKey = selectedKeys[0];
```

**Correct (도메인 제약이나 caveat를 설명):**

```ts
// TABLE 단건 ON 시 해당 TABLE의 상위 FOLDER만 ON으로 복구하고 형제 TABLE 상태는 유지
const updatedNodes = updateNodeDisplayed(nodes, targetId, true);
```

```ts
// 업로드 직후에는 서버 정렬 기준이 확정되지 않아 optimistic reorder를 막는다.
if (mutationFileUpload.isPending) {
  return;
}
```

### 8.3 Require JSDoc on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM-HIGH (중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 함)**

JSDoc은 경계를 설명할 때만 붙입니다. 자명한 local 변수에는 강제하지 않습니다.

필수 대상:

- route/screen/layout owner의 named query/mutation binding
- 분기, async, navigation, invalidation을 가진 event handler
- 동기화 의도가 중요한 `useEffect`
- exported pure support function, custom hook, store 선언
- public `type`/`interface`, compound component public part
- 예외적으로 남긴 `useMemo`/`useCallback`

태그는 `convention-typescript`의 `@api`, `@event`, `@watch`, `@helper`, `@summary`, `@part`, `@description`, `@field`를 사용합니다.

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

**Correct (비자명한 선언 의도와 역할을 바로 위에 문서화):**

```ts
/**
 * @api entry 삭제 API
 */
const mutationEntryRemove = useEntryRemove();

/**
 * @event 선택된 entry 삭제와 다음 화면 이동 처리
 */
const handleRemoveEntryButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  if (!selectedEntry) {
    return;
  }

  await mutationEntryRemove.mutateAsync({ params: { entryId } });
};

/**
 * @watch 사용자 데이터 변경 시 폼 상태 동기화
 */
useEffect(() => {
  resetForm(userData);
}, [userData, resetForm]);

/**
 * @helper entry 저장 요청 payload 생성
 */
export const buildEntryPayload = (formValues: EntryFormValues) => {
  return {
    title: formValues.title.trim(),
  };
};
```

## 참고 자료

- https://react.dev
- https://tanstack.com/query/latest
- https://zustand.docs.pmnd.rs

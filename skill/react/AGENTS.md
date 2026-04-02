# React Conventions

**Version 1.0.0**  
Agent Conventions  
April 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases in this convention set.  
> The source of truth lives in `rules/*.md`; this file is a compiled guide.

---

## Abstract

React coding conventions for agent-assisted teams. The guide emphasizes clear ownership boundaries between shared and route-local code, explicit typing, predictable handler flow, origin-preserving state access, and concise Korean documentation. Rule files in rules/ are the source of truth and compile into AGENTS.md for agent consumption.

---

## Table of Contents

1. [Ownership and Boundaries](#1-ownership-and-boundaries) — **CRITICAL**
   - 1.1 [Avoid Barrel Exports and React Namespace Types](#11-avoid-barrel-exports-and-react-namespace-types)
   - 1.2 [Keep UI, Widget, and -local Ownership Separate](#12-keep-ui-widget-and--local-ownership-separate)
   - 1.3 [Place Route-local Files by Visual Scope](#13-place-route-local-files-by-visual-scope)
   - 1.4 [Prefer Plain .ts Helpers Over Local Custom Hooks](#14-prefer-plain-ts-helpers-over-local-custom-hooks)
   - 1.5 [Route Shared Constants Through a Config Entry Point](#15-route-shared-constants-through-a-config-entry-point)
   - 1.6 [Use Consistent File and Symbol Naming](#16-use-consistent-file-and-symbol-naming)
2. [Typing and Contracts](#2-typing-and-contracts) — **HIGH**
   - 2.1 [Document Custom Types at the Top of the File](#21-document-custom-types-at-the-top-of-the-file)
   - 2.2 [Mark Unused Parameters with an Underscore Prefix](#22-mark-unused-parameters-with-an-underscore-prefix)
   - 2.3 [Prefer Function Variable Types Over Parameter Annotations](#23-prefer-function-variable-types-over-parameter-annotations)
   - 2.4 [Reuse Prop and API Contracts Before Creating New Types](#24-reuse-prop-and-api-contracts-before-creating-new-types)
3. [Component Structure and JSX](#3-component-structure-and-jsx) — **HIGH**
   - 3.1 [Accept props as a Whole and Destructure Inside the Component](#31-accept-props-as-a-whole-and-destructure-inside-the-component)
   - 3.2 [Prefer Arrow Functions and Object Parameters for Complex Signatures](#32-prefer-arrow-functions-and-object-parameters-for-complex-signatures)
   - 3.3 [Prefer Object Literals with as const Over enum](#33-prefer-object-literals-with-as-const-over-enum)
   - 3.4 [Use Activity for JSX Render Branches](#34-use-activity-for-jsx-render-branches)
   - 3.5 [Use Named Handlers Instead of Hiding Logic in JSX](#35-use-named-handlers-instead-of-hiding-logic-in-jsx)
4. [Screen File Discipline](#4-screen-file-discipline) — **HIGH**
   - 4.1 [Avoid Premature Abstraction in Screen Code](#41-avoid-premature-abstraction-in-screen-code)
   - 4.2 [Extract Utilities Only When the Boundary Is Real](#42-extract-utilities-only-when-the-boundary-is-real)
   - 4.3 [Keep Derived Values Close to Where They Are Used](#43-keep-derived-values-close-to-where-they-are-used)
   - 4.4 [Keep Route Entry Files Focused on Screen Flow](#44-keep-route-entry-files-focused-on-screen-flow)
   - 4.5 [Move Pure Support Code Out of Route Entry Files](#45-move-pure-support-code-out-of-route-entry-files)
5. [Events and Interaction Flow](#5-events-and-interaction-flow) — **MEDIUM-HIGH**
   - 5.1 [Keep Screen-specific Handler Flow Inline Until a Real Utility Emerges](#51-keep-screen-specific-handler-flow-inline-until-a-real-utility-emerges)
   - 5.2 [Name Handlers Predictably and Curry Extra Arguments](#52-name-handlers-predictably-and-curry-extra-arguments)
6. [State and Data Flow](#6-state-and-data-flow) — **CRITICAL**
   - 6.1 [Avoid Silent Fallback Defaults and Ad-hoc Loading Branches](#61-avoid-silent-fallback-defaults-and-ad-hoc-loading-branches)
   - 6.2 [Choose State Tools by Source of Truth](#62-choose-state-tools-by-source-of-truth)
   - 6.3 [Name Query and Mutation Bindings Consistently](#63-name-query-and-mutation-bindings-consistently)
   - 6.4 [Prefer React Compiler Defaults Over Manual Memoization](#64-prefer-react-compiler-defaults-over-manual-memoization)
   - 6.5 [Preserve Response and Store Origin in Wide Scopes](#65-preserve-response-and-store-origin-in-wide-scopes)
   - 6.6 [Shape React Query Data in query.select](#66-shape-react-query-data-in-queryselect)
   - 6.7 [Store Shared Role and Authority Decisions Once](#67-store-shared-role-and-authority-decisions-once)
7. [Documentation and Comments](#7-documentation-and-comments) — **MEDIUM**
   - 7.1 [Limit Inline Comments to Non-obvious Logic](#71-limit-inline-comments-to-non-obvious-logic)
   - 7.2 [Require JSDoc on Key Declarations](#72-require-jsdoc-on-key-declarations)
   - 7.3 [Use @description for API Calls and @summary for Everything Else](#73-use-description-for-api-calls-and-summary-for-everything-else)
   - 7.4 [Write Concise Korean Comments About Purpose and Constraints](#74-write-concise-korean-comments-about-purpose-and-constraints)

---

## 1. Ownership and Boundaries

**Impact: CRITICAL**

Shared UI, widgets, and route-local code must have clear ownership so agents can place code predictably.

### 1.1 Avoid Barrel Exports and React Namespace Types

**Impact: HIGH (preserves explicit import paths and prevents mixed type import styles)**

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

const handleClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
  // ...
};
```

### 1.2 Keep UI, Widget, and -local Ownership Separate

**Impact: CRITICAL (prevents shared and route-local responsibilities from collapsing into the same layer)**

`ui`는 순수 view, `widget`은 여러 화면에서 재사용되는 공용 조합, `-local`은 특정 route 맥락을 아는 화면 전용 코드로 유지합니다. 파일명도 `ui-*`, `widget-*` 접두사로 소유자를 바로 드러내야 합니다.

**Incorrect (view 레이어와 화면 전용 로직이 섞임):**

```tsx
// <component-root>/ui/button/ui-delete-table-button.tsx
const UiDeleteTableButton = () => {
  const navigate = useNavigate();

  return <button onClick={() => void navigate({ to: "/tables" })}>삭제</button>;
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
// <route-root>/tables/-local/delete-table-button.tsx
const DeleteTableButton = () => {
  const navigate = useNavigate();
  return <UiButton onClick={() => void navigate({ to: "/tables" })} />;
};
```

### 1.3 Place Route-local Files by Visual Scope

**Impact: HIGH (keeps route-only components, styles, and logic in predictable locations)**

화면 전용 컴포넌트와 스타일은 `-local/`에 두고, 비컴포넌트 로직은 라우트와 같은 계층의 `.ts` 파일에 둡니다. 같은 계층 `.ts` 파일에는 JSX를 직접 넣지 않고, 필요하면 렌더링 콜백을 주입합니다.

**Incorrect (화면 전용 컴포넌트와 순수 로직 위치가 뒤섞임):**

```tsx
// folders.ts
export const renderFolderTitle = () => <span>Folder</span>;
```

**Correct (시각 코드와 비시각 로직의 위치를 분리):**

```ts
// folders.ts
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

### 1.4 Prefer Plain .ts Helpers Over Local Custom Hooks

**Impact: HIGH (keeps React-only abstractions reserved for real lifecycle or context coupling)**

컴포넌트 하나를 위한 계산, 정규화, payload 조립은 기본적으로 일반 `.ts` helper로 둡니다. React 생명주기, state, context, effect에 실제로 묶일 때만 custom hook으로 승격합니다.

**Incorrect (로컬 계산을 습관적으로 hook으로 포장):**

```ts
export const useMediaUploadPayload = (files: UploadFile[]) => {
  return files.map((file) => ({ uid: file.uid }));
};
```

**Correct (순수 계산은 일반 helper로 유지):**

```ts
export const buildMediaUploadPayload = (files: UploadFile[]) => {
  return files.map((file) => ({ uid: file.uid }));
};
```

### 1.5 Route Shared Constants Through a Config Entry Point

**Impact: HIGH (stops shared constants from scattering across routes and local components)**

여러 화면에서 쓰는 상수와 설정은 라우트 파일이나 `-local` 컴포넌트에 흩뿌리지 말고 공개 진입점에서 가져옵니다. 사용처는 `config.*` 체이닝으로 접근해 출처를 유지합니다.

**Incorrect (공용 상수를 화면 파일에 직접 선언):**

```ts
export const DASHBOARD_MENU_KEY = {
  DASHBOARD: "dashboard",
  SETTINGS: "settings",
} as const;
```

**Correct (공용 진입점에서 상수를 사용):**

```ts
import { config } from "<config-entry-import-path>";

config.navigation.projectMenuKey.dashboard;
```

### 1.6 Use Consistent File and Symbol Naming

**Impact: HIGH (keeps ownership and intent obvious when agents create or move files)**

파일명은 `kebab-case`, 변수와 함수는 `camelCase`, 타입과 컴포넌트는 `PascalCase`, 상수는 `SCREAMING_SNAKE_CASE`를 사용합니다. 파일명과 심볼명이 소유자나 역할을 바로 드러내야 route-local 이동과 공용화 판단이 쉬워집니다.

**Incorrect (파일명과 심볼 규칙이 제각각임):**

```tsx
// UserCard.tsx
export const user_card = () => {
  return null;
};
```

**Correct (파일명과 심볼 규칙이 일관됨):**

```tsx
// user-card.tsx
export const UserCard = () => {
  return null;
};
```

## 2. Typing and Contracts

**Impact: HIGH**

Explicit function, prop, and API contracts reduce ambiguity and keep React code traceable.

### 2.1 Document Custom Types at the Top of the File

**Impact: MEDIUM-HIGH (keeps domain-specific types searchable and understandable without reading implementations)**

API 생성 타입이 아닌 커스텀 `type`, `interface` 선언은 파일 상단에 모으고 JSDoc으로 의미를 설명합니다. 객체형 `type`, `interface`는 헤더에 `@summary`를 작성하고, 각 필드 바로 위 `@field` 블록 주석으로 필드 의미를 모두 명시합니다. 헤더에 여러 `@field` 또는 `@property`를 나열하는 예전 방식은 사용하지 않으며, 구현 중간에 타입 선언을 흩뿌리지 않습니다.

**Incorrect (구현 중간 선언 + 헤더에 필드 설명 나열):**

```ts
/**
 * @summary 엔트리 트리 사이드바 노드
 * @property id 노드 식별자
 * @property name 사이드바 표시 이름
 */
interface EntrySidebarNode {
  id: number;
  name: string;
}

const normalize = () => {
  interface LocalEntryNode {
    id: number;
    name: string;
  }
};
```

**Correct (파일 상단 배치 + 헤더 `@summary` + 필드별 `@field`):**

```ts
/**
 * @summary 엔트리 트리 사이드바 노드
 */
export interface EntrySidebarNode {
  /**
   * @field 노드 식별자
   */
  id: number;
  /**
   * @field 사이드바 표시 이름
   */
  name: string;
}
```

### 2.2 Mark Unused Parameters with an Underscore Prefix

**Impact: MEDIUM (keeps ignored event or callback parameters explicit without pretending they do not exist)**

미사용 매개변수는 생략하지 말고 `_` 접두사를 붙여 명시합니다. 특히 React handler에서 이벤트 객체를 받지만 사용하지 않는 경우, 시그니처는 유지하고 의도만 명확히 숨깁니다.

**Incorrect (매개변수를 감추거나 이름만 남김):**

```ts
const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
  // no-op
};
```

**Correct (미사용 매개변수를 명시적으로 표시):**

```ts
const handleChange: ChangeEventHandler<HTMLInputElement> = (_event) => {
  // no-op
};
```

### 2.3 Prefer Function Variable Types Over Parameter Annotations

**Impact: HIGH (keeps handler signatures and callback intent visible at the declaration site)**

이벤트 핸들러나 이미 알려진 함수 타입이 있다면, 매개변수 타입보다 함수 변수 타입 선언을 우선합니다. 표준 함수 타입이 없을 때만 매개변수에 직접 타입을 적습니다.

**Incorrect (핸들러 타입이 있는데 매개변수만 타입 지정):**

```ts
const handleAddButtonClick = (event: MouseEvent<HTMLButtonElement>): void => {
  event.preventDefault();
};
```

**Correct (함수 변수 타입으로 시그니처를 고정):**

```ts
import type { MouseEventHandler } from "react";

const handleAddButtonClick: MouseEventHandler<HTMLButtonElement> = (_event) => {
  // ...
};
```

### 2.4 Reuse Prop and API Contracts Before Creating New Types

**Impact: HIGH (prevents duplicate type shapes from drifting apart over time)**

Props 콜백 구현 시에는 Props 시그니처를 재사용하고, API 응답 타입이 이미 있으면 새 인터페이스를 만들지 않습니다. 필요하면 `Pick`, `Omit`, indexed access 같은 파생 타입으로 좁힙니다.

**Incorrect (같은 계약을 새 타입으로 다시 정의):**

```ts
interface PermissionMemberEditValues {
  id: number;
  name: string;
  role: string;
}
```

**Correct (기존 계약을 직접 재사용):**

```ts
type PermissionGroupAdminSummary = Pick<PermissionGroupAdminResponse, "id" | "name">;

const handleLinkClick: LinkProps["onLinkClick"] = (event) => {
  event.preventDefault();
};
```

## 3. Component Structure and JSX

**Impact: HIGH**

Components should keep contracts obvious and rendering logic readable without hiding behavior in JSX.

### 3.1 Accept props as a Whole and Destructure Inside the Component

**Impact: MEDIUM (keeps the component contract visible at the signature and local usage close to the body)**

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

### 3.2 Prefer Arrow Functions and Object Parameters for Complex Signatures

**Impact: MEDIUM-HIGH (keeps function declarations and multi-argument contracts easier to evolve)**

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

export const updateEntryMediaUploadFileByUid = (params: UpdateEntryMediaUploadFileByUidParams) => {
  const { uploadFileListByColumn, columnName, fileUid, updater } = params;
  // ...
};
```

### 3.3 Prefer Object Literals with as const Over enum

**Impact: MEDIUM (keeps runtime output simple and type derivation explicit)**

`enum` 대신 객체 리터럴과 `as const`를 사용합니다. 이렇게 하면 런타임 형태가 단순하고, 값 유니온 타입을 직접 파생하기 쉬워집니다.

**Incorrect (enum 사용):**

```ts
enum Status {
  Pending = "pending",
  Success = "success",
}
```

**Correct (object literal + as const 사용):**

```ts
const STATUS = {
  Pending: "pending",
  Success: "success",
} as const;

type Status = (typeof STATUS)[keyof typeof STATUS];
```

### 3.4 Use Activity for JSX Render Branches

**Impact: MEDIUM (keeps visibility decisions explicit and consistent across route screens)**

JSX에서 렌더링 노드를 바꾸는 조건부 분기에는 삼항 렌더링 대신 `<Activity />`를 사용합니다. 속성값 계산은 삼항을 허용하지만, 노드 자체의 표시/숨김은 `Activity`로 통일합니다.

**Incorrect (렌더링 노드 선택을 삼항으로 처리):**

```tsx
return hasItems ? <ItemList /> : <EmptyState />;
```

**Correct (표시/숨김을 Activity로 드러냄):**

```tsx
return (
  <>
    <Activity mode={hasItems ? "visible" : "hidden"}>
      <ItemList />
    </Activity>
    <Activity mode={hasItems ? "hidden" : "visible"}>
      <EmptyState />
    </Activity>
  </>
);
```

### 3.5 Use Named Handlers Instead of Hiding Logic in JSX

**Impact: HIGH (keeps side effects, branching, and async work visible in normal code flow)**

JSX에서는 명명된 핸들러 참조를 기본으로 하고, 아주 짧은 단순 위임만 인라인 함수로 허용합니다. 분기, 비동기 호출, 여러 부수효과가 들어가면 반드시 핸들러로 분리합니다.

**Incorrect (분기와 비동기를 JSX 안에 숨김):**

```tsx
<UiButton
  onClick={async () => {
    if (!selectedTable) {
      return;
    }

    await mutationContentTypeRemove.mutateAsync({ params: { projectId } });
    void navigate({ to: "/next" });
  }}
/>
```

**Correct (로직을 명명된 핸들러로 노출):**

```tsx
const handleRemoveTableButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  // ...
};

<UiButton onClick={handleRemoveTableButtonClick} />;
```

## 4. Screen File Discipline

**Impact: HIGH**

Route entry files should show screen flow clearly and only extract helpers when the boundary is justified.

### 4.1 Avoid Premature Abstraction in Screen Code

**Impact: HIGH (keeps route code grounded in real reuse boundaries instead of speculative extraction)**

반복이 보인다는 이유만으로 즉시 공용 hook, 공용 컴포넌트, 공용 helper로 올리지 않습니다. 실제 재사용 범위가 둘 이상에서 검증되고 계약이 안정되었을 때만 공용화를 허용합니다.

**Incorrect (반복만 보고 성급하게 추상화):**

```ts
const usePermissionA = () => {
  // 유사 로직
};

const usePermissionB = () => {
  // 유사 로직
};
```

**Correct (계약이 생긴 뒤에 공용화):**

```ts
/**
 * @summary 입력 검증, 저장, 오류 표시 계약
 */
export const useContentEditor = () => {
  // ...
};
```

### 4.2 Extract Utilities Only When the Boundary Is Real

**Impact: HIGH (prevents route files from being fragmented into helpers that do not carry their own contract)**

유틸 분리는 React state와 직접 결합되지 않고, 입력/출력 계약이 명확하며, 함수명이 도메인 의도를 설명할 때만 검토합니다. 반복, 복잡한 분기, 정규화, 테스트 가치가 실제로 있을 때만 같은 계층 `.ts` 파일로 뺍니다. `queryClient.invalidateQueries`처럼 해당 hook 컨텍스트에 붙어 있을 때 더 읽기 쉬운 동기화 로직은 별도 유틸로 모으지 않습니다.

**Incorrect (한 줄 계산까지 helper로 쪼갬):**

```ts
const getNextPage = (page: number) => page + 1;
const handleMoveNextPage = () => {
  setPage(getNextPage(page));
};
```

**Correct (정규화나 순회처럼 경계가 선명한 로직만 분리):**

```ts
export const normalizeFolderTreeNodes = (nodes: ContentFolderNodeResponse[]) => {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
  }));
};
```

```ts
const handleSave = async () => {
  await mutationContentTypeUpsert.mutateAsync({ data: request });
  await queryClient.invalidateQueries({ queryKey: ["content-type-list"] });
};
```

필요하다면 함수 시그니처 가독성을 위해 JSDoc 헤더에 `biome-ignore format:`를 제한적으로 둘 수 있지만, helper 추출의 근거로 사용하면 안 됩니다.

### 4.3 Keep Derived Values Close to Where They Are Used

**Impact: HIGH (preserves origin and stops route files from filling with aliases and imperative setup code)**

화면 상단에서 오리진을 잃는 별칭 상수, `let` 재할당, 배열 `push` 기반 명령형 조립을 금지합니다. Hook 파라미터, JSX 표시값, effect 내부 계산은 실제 사용하는 좁은 스코프에서 직접 계산합니다. JSX에서만 쓰는 표시값은 특히 화면 상단 `const`로 빼지 말고 원본 체이닝으로 직접 참조합니다.

**Incorrect (화면 상단에서 파생값과 별칭을 누적):**

```ts
const tableInfoData = responseContentManagerGetTableInfo.data;
const hasSelectedRows = selectedRows.length > 0;
const selectedTableNameForQuery = selectedEntryTableState.selectedTableNode?.tableName;
```

**Correct (사용 지점 가까이에서 계산):**

```ts
const responseContentManagerSearchContents = useContentManagerSearchContentsSuspense({
  tableName: selectedEntryTableState.selectedTableNode?.tableName,
});
```

```tsx
<Activity mode={selectedRows.length > 0 ? "visible" : "hidden"} />
```

```tsx
return <UiInput value={selectedNodeContext?.node?.name} />;
```

### 4.4 Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (makes route files readable as the main orchestration point for the screen)**

라우트 엔트리 파일은 화면 흐름이 드러나게 유지합니다. state, API response/mutation, event handler, `useEffect`, 렌더링 조립이 보이도록 두고, 단순 레이아웃 분리만을 위한 조기 컴포넌트화는 기본값으로 삼지 않습니다.

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

**Correct (화면 엔트리에서 흐름과 orchestration이 보임):**

```tsx
const responseContentTypeGetListSuspense = useContentTypeGetListSuspense({ projectId });
const handleSubmitButtonClick = async () => {
  // ...
};

return <ContentTypeBuilderScreen onSubmit={handleSubmitButtonClick} />;
```

### 4.5 Move Pure Support Code Out of Route Entry Files

**Impact: HIGH (keeps route entry files focused on orchestration instead of accumulating presets and pure helpers)**

화면 전용 불변 설정, 옵션 목록, preset, 컬럼 메타, 순수 helper, 타입 선언은 route entry 상단에 쌓아두지 말고 같은 계층 `.ts` 파일로 이동합니다. route entry에는 React state, API response/mutation, handler, `useEffect`, 렌더링 흐름만 남기는 것을 기본값으로 삼습니다.

**Incorrect (route entry 상단에 순수 지원 코드가 누적됨):**

```ts
const getMediaColumnRules = () => {
  // ...
};

const buildFileRequests = () => {
  // ...
};
```

**Correct (route entry에는 흐름만 남김):**

```tsx
const [mediaUploadFileListByColumn, setMediaUploadFileListByColumn] = useState({});
const responseContentManagerGetTableInfo = useContentManagerGetTableInfo();

const handleFormFinish = () => {
  // ...
};
```

## 5. Events and Interaction Flow

**Impact: MEDIUM-HIGH**

Event handlers should remain easy to scan, with predictable naming and minimal indirection.

### 5.1 Keep Screen-specific Handler Flow Inline Until a Real Utility Emerges

**Impact: MEDIUM (preserves readability without forcing every branch into tiny helper functions)**

핸들러가 길어져도 바로 helper로 쪼개지 않습니다. 먼저 early return, 단계적 지역 변수, 의미 있는 블록 구분으로 읽기 쉽게 유지하고, `screen-extract-utilities-selectively` 규칙을 만족할 때만 분리합니다.

**Incorrect (재사용 근거 없이 흐름을 지나치게 분해):**

```ts
const validate = () => {/* ... */};
const buildRequest = () => {/* ... */};
const runMutation = async () => {/* ... */};
const postProcess = () => {/* ... */};
```

**Correct (핸들러에서 흐름을 직접 읽을 수 있게 유지):**

```ts
const handleSubmitButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  if (!responseContentTypeGetListSuspense.data.selectedTable) {
    return;
  }

  if (mutationContentTypeUpsert.isPending) {
    return;
  }

  await mutationContentTypeUpsert.mutateAsync({ data: request });
  void navigate({ to: "/content-type-builder" });
};
```

### 5.2 Name Handlers Predictably and Curry Extra Arguments

**Impact: MEDIUM-HIGH (keeps event flow searchable and avoids ad hoc handler signatures)**

이벤트 핸들러는 `handle + Target + Event` 패턴으로 이름 짓습니다. 추가 인자가 필요하면 handler factory 형태의 고차 함수로 감싸고, 최종 반환값은 React handler 타입으로 고정합니다.

**Incorrect (이름과 시그니처가 제각각임):**

```ts
const onSelect = (id: string, event: MouseEvent<HTMLLIElement>) => {
  console.log(id, event.currentTarget);
};
```

**Correct (추가 인자는 바깥 함수, 이벤트는 안쪽 handler):**

```ts
import type { MouseEventHandler } from "react";

const handleListItemClick =
  (id: string): MouseEventHandler<HTMLLIElement> =>
  (_event) => {
    console.log(id);
  };
```

## 6. State and Data Flow

**Impact: CRITICAL**

Server state, store access, and derived values must preserve origin and keep data shaping near the source.

### 6.1 Avoid Silent Fallback Defaults and Ad-hoc Loading Branches

**Impact: HIGH (keeps missing data visible and pushes loading UX toward Suspense or explicit exception handling)**

옵셔널 값에 `??`, `||`로 습관적인 기본값을 넣지 않고, `isPending`, `isFetching` 같은 상태를 즉시 렌더링하지 않습니다. 결측값은 드러내고, 로딩은 기본적으로 Suspense 경계나 상위 레이아웃에서 처리합니다. 예외가 필요하면 가까운 한글 주석으로 이유를 남깁니다.

**Incorrect (결측과 로딩을 즉석에서 숨김):**

```tsx
const name = responseUserGetItemSuspense.data?.name ?? "";

if (responseUserGetItemSuspense.isPending) {
  return <Spinner />;
}
```

**Correct (결측을 드러내고 의도 있는 분기만 허용):**

```tsx
const name = responseUserGetItemSuspense.data?.name;

return (
  <Activity mode={name ? "visible" : "hidden"}>
    <UserName value={name} />
  </Activity>
);
```

### 6.2 Choose State Tools by Source of Truth

**Impact: MEDIUM-HIGH (prevents local UI state, global client state, and server state from blurring together)**

로컬 UI 상태는 `useState` 또는 `useReducer`, 전역 클라이언트 상태는 `Zustand`, 서버 상태는 `@tanstack/react-query`를 사용합니다. 상태 도구를 수명과 소유자 기준으로 고르면 화면 파일이 더 읽기 쉬워지고 중복 동기화가 줄어듭니다.

**Incorrect (서버 상태를 로컬 상태로 복제):**

```ts
const responseUserGetItemSuspense = useUserGetItemSuspense();
const [userName, setUserName] = useState(responseUserGetItemSuspense.data.name);
```

**Correct (도구를 source of truth에 맞춤):**

```ts
const [isOpen, setIsOpen] = useState(false);
const themeStore = useThemeStore();
const responseUserGetItemSuspense = useUserGetItemSuspense();
```

### 6.3 Name Query and Mutation Bindings Consistently

**Impact: HIGH (makes generated API hooks and their local bindings easy to scan and trace)**

Swagger 기반 hook 이름은 유지하되, 로컬 바인딩 접두사는 `response`와 `mutation`만 사용합니다. query는 `response...`, mutation은 `mutation...`으로 맞춰야 화면 파일에서 역할과 오리진이 한눈에 보입니다.

**Incorrect (query와 mutation 바인딩 이름이 제각각임):**

```ts
const tableList = useContentTypeGetListSuspense();
const deleteTableApi = useContentTypeRemove();
```

**Correct (로컬 바인딩 접두사를 통일):**

```ts
const responseContentTypeGetListSuspense = useContentTypeGetListSuspense();
const mutationContentTypeRemove = useContentTypeRemove();
```

### 6.4 Prefer React Compiler Defaults Over Manual Memoization

**Impact: MEDIUM-HIGH (avoids defensive useMemo and useCallback that add noise without proven value)**

React 19 컴파일러가 처리하는 범위에서는 `useMemo`, `useCallback`을 기본적으로 사용하지 않습니다. 외부 라이브러리가 참조 동일성에 민감하거나, 병목이 실제로 확인된 경우에만 허용하고 바로 위에 한글 주석으로 이유를 남깁니다.

**Incorrect (단순 가공을 관성적으로 memoization):**

```ts
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);
```

**Correct (필요할 때만 이유를 적고 사용):**

```ts
// 테이블 라이브러리가 columns 참조 동일성을 요구하여 리렌더 폭증을 방지한다.
const columns = useMemo(() => buildColumns(response.data.columns), [response.data.columns]);
```

### 6.5 Preserve Response and Store Origin in Wide Scopes

**Impact: CRITICAL (makes it obvious where values came from without chasing aliases across the file)**

페이지, 레이아웃, 화면 스코프에서는 `response...`, `mutation...`, `*Store` 원본을 유지합니다. 넓은 스코프 구조분해와 별칭 상수는 피하고, 정말 필요할 때만 handler나 effect 내부의 좁은 스코프에서 제한적으로 구조분해합니다. `props`를 본문 첫 줄에서 구조분해하는 패턴만 예외로 봅니다.

**Incorrect (넓은 스코프 구조분해로 출처가 흐려짐):**

```ts
const { tables, selectedTable } = responseContentTypeGetListSuspense.data;
```

**Correct (원본 체이닝으로 출처를 유지):**

```tsx
<UiList dataSource={responseContentTypeGetListSuspense.data.tables} />
<UiTable dataSource={responseContentTypeGetListSuspense.data.selectedTable.columns} />
```

```ts
useEffect(() => {
  const { data, isFetching } = responseContentManagerSearchContentsSuspense;

  if (!isFetching && data.contents.length === 0) {
    return;
  }
}, [responseContentManagerSearchContentsSuspense]);
```

### 6.6 Shape React Query Data in query.select

**Impact: CRITICAL (keeps response transformation close to the fetch boundary and avoids repeated render-time mapping)**

서버 응답 가공은 렌더링 본문이 아니라 `query.select`에서 처리합니다. `data.list` 같은 원시 응답 구조를 화면 여러 군데에서 직접 해석하지 말고, 도메인 의미가 드러나는 필드 이름으로 한 번 변환합니다. 여러 쿼리 데이터를 함께 가공해야 해도 먼저 `select`나 전용 hook 경계에서 풀 수 있는지 검토합니다.

**Incorrect (응답 원형을 화면에서 직접 소비):**

```ts
const endpoints = responsePermissionGroupGetApiEndpointListSuspense.data.list;
```

**Correct (패칭 시점에 필요한 모양으로 변환):**

```ts
const responsePermissionGroupGetApiEndpointListSuspense = usePermissionGroupGetApiEndpointListSuspense({
  query: {
    select: ({ data }) => ({
      endpoints: data.list,
    }),
  },
});
```

### 6.7 Store Shared Role and Authority Decisions Once

**Impact: HIGH (prevents duplicated authorization heuristics from spreading across screens)**

역할, 권한, 공용 판별 결과는 스토어에 한 번 적재하고 화면에서는 그 결과만 참조합니다. 화면마다 문자열 비교나 유틸 호출로 다시 계산하지 않고, 스토어 접근도 구조분해보다 원본 객체 체이닝을 우선합니다. Suspense query처럼 `onSuccess`가 없으면 `useEffect` 또는 `useLayoutEffect`에서 동기화하고, selector 최적화는 정말 필요한 경우에만 근거 주석과 함께 예외적으로 사용합니다.

**Incorrect (화면마다 판별을 반복하고 구조분해로 오리진을 잃음):**

```ts
const isSuperAdmin = isSuperAdminRoleName(roleName);
const { isEditor } = useRoleStore();
```

**Correct (공용 판별 결과를 스토어에서 한 번 참조):**

```ts
const roleStore = useRoleStore();

if (roleStore.isSuperAdmin) {
  // ...
}
```

```ts
useEffect(() => {
  if (!responseRoleGetItemSuspense.data) {
    return;
  }

  roleStore.setRole(responseRoleGetItemSuspense.data.role);
}, [responseRoleGetItemSuspense.data, roleStore]);
```

## 7. Documentation and Comments

**Impact: MEDIUM**

Comments should explain intent, constraints, and side effects in concise Korean instead of repeating code.

### 7.1 Limit Inline Comments to Non-obvious Logic

**Impact: MEDIUM (keeps comments focused on caveats, constraints, and side effects instead of narrating the code)**

함수 본문 안에서는 JSDoc 대신 `//` 라인 주석을 사용하고, 도메인 규칙, 예외 방어, 라이브러리 제약, 부수효과 순서처럼 코드만 읽어서는 놓치기 쉬운 경우에만 남깁니다. 변수명 반복이나 단순 매핑 설명은 주석으로 적지 않습니다. 함수 시그니처를 한 줄로 유지해야 가독성이 더 좋은 경우에만 헤더 JSDoc 안에서 `biome-ignore format:`를 제한적으로 사용합니다.

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
/**
 * @summary 트리 노드 UiTree 데이터 변환
 * biome-ignore format: 매개변수 가독성 목적 시그니처 한 줄 유지
 */
export const mapFolderNodeToTreeData = (node: ContentFolderTreeNode, renderers: FolderTreeRenderers) => {
  return {
    title: renderers.renderTitle(node),
    icon: renderers.renderIcon(node),
  };
};
```

### 7.2 Require JSDoc on Key Declarations

**Impact: MEDIUM-HIGH (makes important API, handler, effect, and type declarations easier to review and reuse)**

API 호출 훅과 mutation 선언, 이벤트 핸들러, `useEffect`, 주요 유틸 함수, 커스텀 `type`과 `interface`, 그리고 예외적으로 사용하는 `useMemo`/`useCallback`에는 JSDoc을 작성합니다. 상태 변수나 단순 파생값처럼 문맥상 자명한 선언에는 강제하지 않습니다.

**Incorrect (중요한 선언에 문맥 설명이 없음):**

```ts
const mutationContentTypeRemove = useContentTypeRemove();

useEffect(() => {
  resetForm(userData);
}, [userData, resetForm]);
```

**Correct (선언 의도와 역할을 바로 위에 문서화):**

```ts
/**
 * @description 테이블 삭제 API
 */
const mutationContentTypeRemove = useContentTypeRemove();

/**
 * @summary 사용자 데이터 변경 시 폼 상태 동기화
 */
useEffect(() => {
  resetForm(userData);
}, [userData, resetForm]);
```

### 7.3 Use @description for API Calls and @summary for Everything Else

**Impact: MEDIUM (standardizes JSDoc intent so generated and handwritten declarations read consistently)**

API 관련 변수 선언은 `@description`, 그 외 handler, `useEffect`, 일반 함수, 타입 선언은 `@summary`를 사용합니다. 문장은 명사형 종결과 개조식 표현을 기본으로 하고, 하나의 선언에 두 태그를 섞지 않습니다.

**Incorrect (API 주석에 태그를 혼용):**

```ts
/**
 * @description 테이블 목록 조회 API
 * @summary v1 테이블 목록 조회
 */
const responseContentTypeGetListSuspense = useContentTypeGetListSuspense();
```

**Correct (선언 종류에 맞는 태그 하나만 사용):**

```ts
/**
 * @description 테이블 목록 조회 API
 */
const responseContentTypeGetListSuspense = useContentTypeGetListSuspense();

/**
 * @summary 테이블 선택 쿼리스트링 갱신
 */
const handleSelectTable: MouseEventHandler<HTMLButtonElement> = (_event) => {
  // ...
};
```

### 7.4 Write Concise Korean Comments About Purpose and Constraints

**Impact: MEDIUM (makes intent and caveats discoverable without narrating obvious mechanics)**

주석은 한글로 작성하고, 코드가 왜 존재하는지, 어떤 제약을 다루는지, 어떤 부수효과 순서가 중요한지를 설명합니다. 변수명을 반복하는 설명이나 코드 그대로 읽히는 How 설명은 피합니다.

**Incorrect (코드를 다시 읽어주는 주석):**

```ts
// selectedKey를 selectedKeys 첫 번째 값으로 할당
const selectedKey = selectedKeys[0];
```

**Correct (도메인 규칙이나 제약을 설명):**

```ts
// TABLE 단건 ON 시 해당 TABLE의 상위 FOLDER만 ON으로 복구하고 형제 TABLE 상태는 유지
const updatedNodes = updateNodeDisplayed(nodes, targetId, true);
```

## References

- https://react.dev
- https://tanstack.com/query/latest
- https://zustand.docs.pmnd.rs

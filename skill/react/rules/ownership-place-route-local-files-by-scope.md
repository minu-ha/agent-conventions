---
title: Place Route-local Files by Visual Scope
impact: HIGH
impactDescription: route 전용 component, style, logic를 예측 가능한 위치에 유지함
tags: ownership, local, routes, files
---

## Place Route-local Files by Visual Scope

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

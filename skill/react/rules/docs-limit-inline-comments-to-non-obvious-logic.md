---
title: Limit Inline Comments to Non-obvious Logic
impact: MEDIUM
impactDescription: 코드를 해설하기보다 주석을 caveat, 제약, 부수효과 설명에 집중시킴
tags: docs, comments, inline
---

## Limit Inline Comments to Non-obvious Logic

**Impact: MEDIUM (코드를 해설하기보다 주석을 caveat, 제약, 부수효과 설명에 집중시킴)**

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

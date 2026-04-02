---
title: Extract Utilities Only When the Boundary Is Real
impact: HIGH
impactDescription: route 파일이 자기 계약이 없는 helper 조각으로 분해되는 것을 막음
tags: screen, utils, extraction
---

## Extract Utilities Only When the Boundary Is Real

**Impact: HIGH (route 파일이 자기 계약이 없는 helper 조각으로 분해되는 것을 막음)**

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

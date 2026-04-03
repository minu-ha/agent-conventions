---
title: Extract Screen Support Code Only When the Boundary Is Real
impact: HIGH
impactDescription: route 파일이 자기 계약이 없는 helper 조각으로 분해되는 것을 막음
tags: screen, utils, extraction
---

## Extract Screen Support Code Only When the Boundary Is Real

**Impact: HIGH (route 파일이 자기 계약이 없는 helper 조각으로 분해되는 것을 막음)**

화면 support code는 React state와 직접 결합되지 않고, 입력/출력 계약이 분명하며, 밖으로 빼면 entry flow가 더 읽기 쉬워질 때만 추출합니다.   
기본 추출 대상은 sibling `page.ts`이고, `page.ts`도 named export/direct import를 우선합니다.   
`helper.ts`, `helpers.ts`, `utils.ts`, `common.ts` 같은 generic 파일명은 feature 안에서 만들지 않습니다.   
`queryClient.invalidateQueries`처럼 hook 컨텍스트에 붙어 있어야 더 읽기 쉬운 동기화 로직은 handler/effect에 남기고, 여러 owner가 실제로 공유하는 범용 순수 함수만 `shared/util.ts`의 `util.*`로 승격합니다.

**Incorrect (작은 화면 전용 계산을 generic util 파일로 뺌):**

```ts
// utils.ts
export const util = {
  getNextPage(page: number) {
    return page + 1;
  },
};
```

**Correct (screen-owned support code는 먼저 `page.ts`의 named export로 모으고, 흐름에 묶인 로직은 handler에 남김):**

```ts
// page.ts
export const normalizeFolderTreeNodes = (nodes: ContentFolderNodeResponse[]) => {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
  }));
};
```

```ts
// page.tsx
const handleSave = async () => {
  await mutationContentTypeUpsert.mutateAsync({ data: request });
  await queryClient.invalidateQueries({ queryKey: ["content-type-list"] });
};
```

**Correct (여러 owner가 실제로 공유할 때만 `shared/util.ts`로 승격):**

```ts
// shared/util.ts
export const util = {
	date: {
		normalize(value: Date | string) {
			return new Date(value).toISOString();
		},
	},
};
```

---
title: Extract Screen Support Code Only When the Boundary Is Real
impact: HIGH
impactDescription: route 파일이 자기 계약이 없는 helper 조각으로 분해되는 것을 막음
tags: screen, utils, extraction
---

## Extract Screen Support Code Only When the Boundary Is Real

**Impact: HIGH (route 파일이 자기 계약이 없는 helper 조각으로 분해되는 것을 막음)**

화면 support code는 React state와 직접 결합되지 않고, 입력/출력 계약이 분명하며, 밖으로 빼면 entry flow가 더 읽기 쉬워질 때만 추출합니다.
옮기기로 결정한 경우 기본 목적지는 sibling `page.ts`이고, `page.ts`도 named export/direct import를 우선합니다.
반대로 작은 1회성 guard, 사용 지점 바로 옆이 더 읽기 쉬운 계산, hook context에 붙어 있어야 의미가 분명한 동기화 로직은 `page.tsx`에 남깁니다.
이 규칙은 `page.ts` 안에서 export 경계를 어디까지 둘지에 대한 규칙입니다. 같은 support module 안의 반복은 기본적으로 한 exported 함수 안에 유지하고, 같은 단계가 여러 exported 함수에서 그대로 반복되거나 이름 붙은 도메인 규칙으로 읽힐 때만 private helper를 검토합니다. export helper가 또 다른 export helper만 위해 존재하는 구조는 피합니다.
`page.ts`나 `_local/*.ts`에 한 component만 쓰는 private helper를 쌓는 것도 피합니다. URL 문자열 조립, query filter trim, 단순 API response mapper, mutation error fallback처럼 호출 위치에서 한두 단계로 읽히는 코드는 component나 handler 본문에 둡니다.
`helper.ts`, `helpers.ts`, `utils.ts`, `common.ts` 같은 generic 파일명은 feature 안에서 만들지 않습니다.
`queryClient.invalidateQueries`처럼 hook 컨텍스트에 붙어 있어야 더 읽기 쉬운 동기화 로직은 handler/effect에 남기고, support module 바깥 여러 모듈이 같은 함수를 직접 import해야 할 때만 `shared/util.ts`의 `util.*`나 별도 owner module 승격을 검토합니다.

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

export const buildEntryMediaRequests = (files: WgMediaUploaderFile[]) => {
	// ...
};

export const mergeEntryPayload = (
	values: EntryFormValues,
	mediaRequests: UpsertMediaFileRequest[],
) => {
	// ...
};

export const buildEntryPayload = (formValues: EntryFormValues, files: WgMediaUploaderFile[]) => {
	return mergeEntryPayload(
		normalizeEntryValues(formValues),
		buildEntryMediaRequests(files),
	);
};
```

**Incorrect (`_local` component 하나만 쓰는 private helper를 누적):**

```tsx
const readOptionalFilter = (value: string) => value.trim() || undefined;

const buildEditHref = ({editHrefBase, row}: {editHrefBase: string; row: EntryRow}) => `${editHrefBase}${row.id}/`;

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
 * @helper folder tree 응답을 화면용 node shape로 정규화
 */
export const normalizeFolderTreeNodes = (nodes: ContentFolderNodeResponse[]) => {
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
  await mutationContentTypeUpsert.mutateAsync({ data: request });
  await queryClient.invalidateQueries({ queryKey: ["content-type-list"] });
};
```

**Correct (`page.ts` 안의 작은 단계는 한 exported 함수 안에서 정리):**

```ts
/**
 * @helper entry form values와 파일 목록을 저장 payload로 조립
 */
export const buildEntryPayload = (
	formValues: EntryFormValues,
	files: WgMediaUploaderFile[],
) => {
	// 1. formValues 정규화
	// 2. media request 조립
	// 3. payload 병합
	return {
		// ...
	};
};
```

**Correct (component 전용 작은 단계는 호출 위치에 유지):**

```tsx
export const EntryTable = (props: EntryTableProps) => {
	const responseEntriesQuery = useListEntries({
		q: filters.q.trim() || undefined,
	});

	return <a href={`${props.editHrefBase}${row.id}/`}>{row.title}</a>;
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

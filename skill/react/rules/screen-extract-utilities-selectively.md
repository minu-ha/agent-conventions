---
title: Extract Screen Support Code Only When the Boundary Is Real
impact: HIGH
impactDescription: route 파일이 자기 계약이 없는 helper 조각으로 분해되는 것을 막음
appliesWhen: 화면 계산·변환·preset·option·column meta를 별도 함수/support module로 추출·이동하거나 support 경계를 바꾼다. query `select` 내부 shaping만이면 제외한다.
reviewWith: screen-move-pure-support-code-out-of-entry-files, typescript/functions-extract-helpers-only-when-the-boundary-is-real
tags: screen, utils, extraction
---

## Extract Screen Support Code Only When the Boundary Is Real

**Impact: HIGH (route 파일이 자기 계약이 없는 helper 조각으로 분해되는 것을 막음)**

화면 support code는 "이름 붙일 수 있다"가 아니라 "경계가 있다"일 때만 추출합니다.

추출 후보:

- React state/hook과 직접 결합되지 않은 pure function
- 입력/출력 계약이 명확한 화면 전용 변환, preset, option, column meta
- 밖으로 빼면 route entry의 response, state, handler, render flow가 더 잘 보이는 코드
- 여러 exported 함수에서 같은 단계가 반복되는 이름 있는 도메인 규칙

남길 것:

- 작은 1회성 guard, URL 조립, 빈 검색어 생략 같은 호출 지점 계산
- handler/effect 안에 있어야 문맥이 보이는 query invalidation, navigation, fallback 처리
- query `select` 내부 mapper. `state-shape-query-data-with-select` 가 담당하므로
  별도 함수나 support module 경계가 없으면 이 규칙은 적용하지 않는다

배치:

- route sibling `page.ts`에 named export로 둡니다.
- `helper.ts`, `helpers.ts`, `utils.ts`, `common.ts` 같은 generic 파일명은 만들지 않습니다.
- support module 안에서도 작은 private helper를 쌓지 말고, 기본은 한 exported 함수 안에서 단계별로 정리합니다.

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
	const trimmedQuery = filters.q.trim();
	const responseEntriesQuery = useListEntriesSuspense({
		q: trimmedQuery ? trimmedQuery : undefined,
	});

	return responseEntriesQuery.data.map((row) => (
		<a href={`${editHrefBase}${row.id}/`} key={row.id}>
			{row.title}
		</a>
	));
};
```

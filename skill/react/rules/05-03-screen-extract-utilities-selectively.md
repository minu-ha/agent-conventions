---
title: Extract Screen Support Code Only When the Boundary Is Real
titleKo: 화면 보조 코드는 가려서 뺍니다
impact: HIGH
impactDescription: 화면 진입 파일이 자기 계약도 없는 조각들로 흩어지지 않습니다
appliesWhen:
  - 화면 계산·변환·기본 설정·option·column meta를 별도 함수나 보조 모듈으로 옮길 때
  - 화면 보조 경계를 바꿀 때
  - 제외: 질의 `select` 내부 shaping만 바꾸는 경우
reviewWith: >-
  ownership-place-owner-files-in-role-folders, typescript/functions-extract-helpers-only-when-the-boundary-is-real
tags: screen, utils, extraction
---

## Extract Screen Support Code Only When the Boundary Is Real

**Impact: HIGH (화면 진입 파일이 자기 계약도 없는 조각들로 흩어지지 않습니다)**

화면 보조 code는 이름을 붙일 수 있다는 이유가 아니라 경계가 실재할 때만 추출합니다.

추출 후보:

- React 상태/훅과 직접 결합되지 않은 pure function
- 입력/출력 계약이 명확한 화면 전용 변환, 기본 설정, option, column meta
- 밖으로 빼면 라우트 진입의 response, 상태, 핸들러, 렌더 flow가 더 잘 보이는 코드
- 여러 내보낸 함수에서 같은 단계가 반복되는 이름 있는 도메인 규칙

호출 지점에 남길 대상:

- 작은 1회성 guard, URL 조립, 빈 검색어 생략 같은 호출 지점 계산
- 핸들러/이펙트 안에 있어야 문맥이 보이는 질의 invalidation, navigation, fallback 처리
- 질의 `select` 내부 mapper.
  `data-shape-query-data-with-select`가 담당하므로 별도 함수나 보조 모듈 경계가 없으면 이 규칙은 적용하지 않습니다.

배치 기준:

- 소유자 아래 `function` 폴더에 대표 내보낸 함수 하나당 파일 하나로 둡니다.
- `helper.ts`, `helpers.ts`, `utils.ts`, `common.ts` 같은 generic 파일명은 만들지 않습니다.
- 한 파일 안에서 작은 private 보조 함수를 쌓지 말고, 기본은 한 내보낸 함수 안에서 단계별로 정리합니다.

**Incorrect (한 파일에 export 보조 함수를 단계별로 쌓아 서로 호출하게 만듦):**

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

**Correct (화면 전용 보조 code는 소유자의 `function` 폴더에 두고, 흐름에 묶인 로직은 핸들러에 남김):**

```ts
// page/entries/function/normalize-tree-nodes.ts
/**
 * tree 응답을 화면용 node shape로 정규화
 */
export const normalizeTreeNodes = (nodes: TreeNodeResponse[]) => {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
  }));
};
```

```ts
// page/entries/pg-entries.tsx
/**
 * 저장 요청 후 목록 query를 무효화
 */
const handleSave = async () => {
  await mutationEntrySave.mutateAsync({ data: request });
  await queryClient.invalidateQueries({ queryKey: ["entry-list"] });
};
```

**Correct (파일 안의 작은 단계는 한 내보낸 함수 안에서 정리):**

```ts
/**
 * entry form values와 파일 목록을 저장 payload로 조립
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

**Correct (컴포넌트 전용 작은 단계는 호출 위치에 유지):**

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

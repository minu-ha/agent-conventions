---
title: Avoid Premature Abstraction in Screen Code
titleKo: 화면 코드의 조급한 추상화 피하기
impact: HIGH
impactDescription: 추측성 추출 대신 실제 재사용 경계에 맞춰 route 코드를 유지함
impactDescriptionKo: 추측성 추출 대신 실제 재사용 경계에 맞춰 route 코드를 유지함
appliesWhen: screen 코드를 helper·hook·component·module로 추출하거나 한 곳에서만 쓰는 기존 추상화를 접어 넣는다.
reviewWith: >-
  screen-extract-local-section-components-for-runtime-boundaries, screen-extract-utilities-selectively,
  typescript/functions-extract-helpers-only-when-the-boundary-is-real
tags: screen, abstraction, reuse
---

## Avoid Premature Abstraction in Screen Code

**Impact: HIGH (추측성 추출 대신 실제 재사용 경계에 맞춰 route 코드를 유지함)**

반복이 보인다는 이유만으로 공용 hook, component, helper를 만들지 않습니다.

먼저 시도할 것:

- 한 함수 안에서 단계 변수, section comment, 내부 블록으로 정리
- route-local JSX에 남기고 흐름을 보이게 유지
- 작은 mapper, href 조립, fallback 처리는 호출 위치에 유지

추출할 수 있는 때:

- 여러 화면/모듈이 같은 이름의 계약으로 직접 호출함
- state·effect·context·form·store 연결을 한 custom hook이 실제로 소유함
- route-local component가 async/state/provider/interaction 같은 runtime boundary를 소유함

금지:

- 한 component, 한 handler, 한 query `select`만 쓰는 helper를 support module에 쌓기
- export helper가 다른 export helper 하나만 위해 존재하는 구조
- 이름이 그럴듯하다는 이유로 흐름을 파일 왕복으로 숨기기

**Incorrect (반복만 보고 성급하게 추상화):**

```ts
const useEntryAccessA = () => {
  // 유사 로직
};

const useEntryAccessB = () => {
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

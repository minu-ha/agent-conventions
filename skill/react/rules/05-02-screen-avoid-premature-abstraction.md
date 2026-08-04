---
title: Avoid Premature Abstraction in Screen Code
titleKo: 화면 코드를 미리 추상화하지 않습니다
impact: HIGH
impactDescription: 짐작으로 빼내지 않고 실제 재사용 경계에 맞춰 화면 코드를 둡니다
appliesWhen:
  - 화면 코드를 보조 함수·훅·컴포넌트·모듈으로 추출할 때
  - 한 곳에서만 쓰는 기존 추상화를 다시 접어 넣을 때
reviewWith: >-
  screen-extract-local-section-components-for-runtime-boundaries, typescript/functions-extract-helpers-only-when-the-boundary-is-real
tags: screen
---

## Avoid Premature Abstraction in Screen Code

**Impact: HIGH (짐작으로 빼내지 않고 실제 재사용 경계에 맞춰 화면 코드를 둡니다)**

반복이 보인다는 이유만으로 공용 훅, 컴포넌트, 보조 함수를 만들지 않습니다.

추출 전에 먼저 시도할 방법:

- 한 함수 안에서 단계 변수, 섹션 주석, 내부 블록으로 정리
- 화면 지역 JSX에 남기고 흐름을 보이게 유지
- 작은 변환 함수, `href` 조립, 기본값 처리는 호출 위치에 유지

추출해도 되는 경계는 이 규칙이 정하지 않습니다.
컴포넌트는 `screen-extract-local-section-components-for-runtime-boundaries`가,
함수는 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`가 판정합니다.

먼저 시도한 뒤에도 남는 금지 구조:

- 한 컴포넌트, 한 핸들러, 한 질의 `select`만 쓰는 보조 함수를 보조 모듈에 쌓는 구조
- 내보내기 보조 함수가 다른 내보내기 보조 함수 하나만 위해 존재하는 구조
- 이름이 그럴듯하다는 이유로 흐름을 파일 왕복 뒤에 숨기는 구조

**Incorrect (반복만 보고 성급하게 추상화):**

```ts
const useEntryAccessA = () => {
  // 유사 로직
};

const useEntryAccessB = () => {
  // 유사 로직
};
```

**Incorrect (컴포넌트 하나만 쓰는 단계 보조 함수를 보조 모듈에 남김):**

```tsx
const buildEditHref = ({ editHrefBase, row }: { editHrefBase: string; row: EntryRow }) =>
	`${editHrefBase}${row.id}/`;

const mapResponseToRows = (response: EntryListResponse) =>
	response.data.map((entry) => ({ id: entry.id, title: entry.title }));

export const PgEntryTable = (props: PgEntryTableProps) => {
	const { editHrefBase } = props;
	const responseEntriesQuery = useListEntriesSuspense({}, {
		query: { select: mapResponseToRows },
	});

	return responseEntriesQuery.data.map((row) => (
		<a href={buildEditHref({ editHrefBase, row })} key={row.id}>
			{row.title}
		</a>
	));
};
```

**Correct (계약이 생긴 뒤에 공용화):**

```ts
/**
 * form state, 저장 mutation, 오류 노출을 함께 오케스트레이션하는 editor contract
 */
export const useEntryEditor = () => {
  const form = useForm<EntryEditorFormValues>();

  /**
   * entry 저장 API
   */
  const mutationEntrySave = useEntrySave();
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  return { form, mutationEntrySave, setSubmitErrorMessage, submitErrorMessage };
};
```

**Correct (여러 보조 함수 대신 한 함수 안에서 단계별로 정리):**

```ts
/**
 * entry form values를 API payload로 조립
 */
export const buildEntryPayload = (formValues: EntryFormValues) => {
	// 1. 공통 문자열 값 정규화
	// 2. API payload 형태로 조립
	// 3. 결과 반환
};
```

**Correct (작은 질의 가공과 `href` 조립은 사용 지점에 둠):**

```tsx
export const PgEntryTable = (props: PgEntryTableProps) => {
	const { editHrefBase } = props;
	const responseEntriesQuery = useListEntriesSuspense(
		{},
		{
			query: {
				select: (response) =>
					response.data.map((entry) => ({ id: entry.id, title: entry.title })),
			},
		},
	);

	return responseEntriesQuery.data.map((row) => (
		<a href={`${editHrefBase}${row.id}/`} key={row.id}>
			{row.title}
		</a>
	));
};
```

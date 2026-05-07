---
title: Avoid Premature Abstraction in Screen Code
impact: HIGH
impactDescription: 추측성 추출 대신 실제 재사용 경계에 맞춰 route 코드를 유지함
tags: screen, abstraction, reuse
---

## Avoid Premature Abstraction in Screen Code

**Impact: HIGH (추측성 추출 대신 실제 재사용 경계에 맞춰 route 코드를 유지함)**

반복이 보인다는 이유만으로 즉시 공용 hook, 공용 컴포넌트, 공용 helper로 올리지 않습니다. 같은 화면, 같은 support module, 같은 exported 함수 안에서 비슷한 단계가 반복되더라도 기본은 한 함수 안에 유지합니다.
같은 이름의 계약으로 여러 화면이나 모듈이 직접 호출해야 하는 경계가 분명해질 때만 공용화를 검토합니다. 그 전에는 section comment, 단계 구분 변수, 내부 블록으로 먼저 정리합니다. route-local component 추출도 예외가 아니며, 단순 layout wrapper가 아니라 실제 runtime boundary를 소유할 때만 검토합니다.
custom hook도 예외가 아닙니다. hook 이름을 붙일 수 있다는 이유만으로 추출하지 말고, state/effect/context/form/store처럼 실제 React orchestration을 묶을 때만 hook 경계를 만듭니다.
screen support module이나 React-adjacent `.ts` 파일에서도 같은 기준을 적용합니다. `readMutationFieldErrors`, `buildEditHref`, `mapResponseToRows`처럼 한 component, 한 handler, 한 query `select`만 위해 존재하는 작은 함수는 호출 위치에 둡니다. 함수 이름이 설명처럼 보이더라도 사용자가 실제 흐름을 따라가려고 파일 안을 왕복해야 한다면 추상화 비용이 더 큽니다.

**Incorrect (반복만 보고 성급하게 추상화):**

```ts
const usePermissionA = () => {
  // 유사 로직
};

const usePermissionB = () => {
  // 유사 로직
};
```

**Incorrect (component 하나만 쓰는 단계 helper를 support module에 남김):**

```ts
const buildEditHref = ({editHrefBase, row}: {editHrefBase: string; row: EntryRow}) => `${editHrefBase}${row.id}/`;

const mapResponseToRows = (response: EntryListResponse) =>
	response.data.map((entry) => ({id: entry.id, title: entry.title}));

export const EntryTable = (props: EntryTableProps) => {
	const responseEntriesQuery = useListEntries<EntryRow[]>({}, {query: {select: mapResponseToRows}});

	return responseEntriesQuery.data.map((row) => <a href={buildEditHref({editHrefBase: props.editHrefBase, row})}>{row.title}</a>);
};
```

이 helper들이 다른 화면의 계약으로 쓰이지 않는다면 component를 읽는 사람이 helper 정의로 이동해야 하는 비용만 생깁니다.

**Correct (계약이 생긴 뒤에 공용화):**

```ts
/**
 * @summary form state, 저장 mutation, 오류 노출을 함께 오케스트레이션하는 editor contract
 */
export const useContentEditor = () => {
  const form = useForm<ContentEditorFormValues>();

  /**
   * @api content 저장 API
   */
  const mutationContentSave = useContentSave();
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  return { form, mutationContentSave, setSubmitErrorMessage, submitErrorMessage };
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

```ts
export const EntryTable = (props: EntryTableProps) => {
	const responseEntriesQuery = useListEntries<EntryRow[]>(
		{},
		{query: {select: (response) => response.data.map((entry) => ({id: entry.id, title: entry.title}))}},
	);

	return responseEntriesQuery.data.map((row) => <a href={`${props.editHrefBase}${row.id}/`}>{row.title}</a>);
};
```

---
title: Name a Value Only to Prevent Recompute or Explain a Judgment
titleKo: 변수는 재계산을 막거나 복잡한 판정에 이름을 붙일 때만 만듭니다
impact: HIGH
impactDescription: 사용 횟수보다 계산 비용과 판정의 복잡성을 기준으로 변수 선언 여부를 판단합니다
appliesWhen:
  - 순수 계산의 결과를 지역 변수(`const`)로 받는 줄을 추가 · 삭제할 때
  - 표현식을 쓰는 자리에 그대로 적을지 변수로 뺄지 정할 때
reviewWith: functions-avoid-imperative-assembly-in-wide-scopes, values-read-objects-through-chains
tags: functions, origin
---

## Name a Value Only to Prevent Recompute or Explain a Judgment

**Impact: HIGH (사용 횟수보다 계산 비용과 판정의 복잡성을 기준으로 변수 선언 여부를 판단합니다)**

지역 변수는 재계산을 막거나 여러 항을 합친 판정에 이름을 붙일 때만 만듭니다.
사용처 수만으로는 만들지 않으며, 아래 사유가 없으면 표현식을 쓰는 자리에 둡니다.

| 변수로 받을 사유 | 확인할 것 |
| --- | --- |
| 콜백 · 반복문으로 옮기면 비용이 반복됨 | 코드에 한 번 적혀도 원소마다 실행됩니다. 반복 조회용 `Set`도 콜백 밖에 둡니다 |
| 시각 · 난수처럼 호출마다 값이 달라짐 | 여러 사용처가 같은 값을 보아야 합니다 |
| `await`, `yield`, 외부 호출 | 순서나 호출 시점을 바꾸지 않습니다. `localStorage.getItem()`도 해당합니다 |
| 훅 호출 · `useState` 반환 | 정해진 호출 위치와 횟수를 유지합니다 |
| 여러 항을 합친 판정 | `isEditable`처럼 이름이 판정의 결론을 설명해야 합니다 |
| 부정이 겹친 판정 | `!row.deletedAt && !row.archivedAt`은 `isVisible`처럼 뜻을 드러냅니다 |

단일 비교인 `row.dueDate < today`는 반복해서 써도 그대로 둡니다.
사용처가 하나 늘었다고 변수 필요성까지 달라지지 않도록 표현식의 성격으로 판단합니다.

| 이 규칙과 구분할 대상 | 적용 규칙 |
| --- | --- |
| 함수 값 | 계산 결과가 아닌 계약입니다. `functions-declare-functions-as-arrow-consts`를 따릅니다 |
| 객체 필드의 별칭 | `values-read-objects-through-chains` |
| `let` 재할당 · `push` 누적 | `functions-avoid-imperative-assembly-in-wide-scopes` |
| 표현식 안의 리터럴 | 지역 변수로 옮기지 않고 `types-replace-enum-with-as-const-objects`와 `naming-place-project-constants-in-the-root-constant-folder`로 선언합니다 |

반복 조회 구조의 사용 기준은 `values-use-set-and-map-for-repeated-lookups`를 따릅니다.

**Incorrect (두 번 쓴다는 이유만으로 변수로 뺍니다):**

```ts
const toRowClassNames = (row: Row): string[] => {
	const isOverdue = row.dueDate < today;

	return [
		isOverdue ? "ui_row__root--overdue" : "ui_row__root",
		isOverdue ? "ui_row__badge--overdue" : "ui_row__badge",
	];
};
```

**Correct (항이 하나라 두 번 적어도 그 자리에 그대로 씁니다):**

```ts
const toRowClassNames = (row: Row): string[] => {
	return [
		row.dueDate < today ? "ui_row__root--overdue" : "ui_row__root",
		row.dueDate < today ? "ui_row__badge--overdue" : "ui_row__badge",
	];
};
```

**Incorrect (돌려주기만 할 값을 변수로 뺍니다):**

```ts
const toNextPage = (page: number): number => {
	const nextPage = page + 1;

	return nextPage;
};

const toRowLabel = (row: Row): string => {
	const rowLabel = `${row.title} (${row.id})`;

	return rowLabel;
};
```

**Correct (이름을 붙이지 않고 그대로 돌려줍니다):**

```ts
const toNextPage = (page: number): number => {
	return page + 1;
};

const toRowLabel = (row: Row): string => {
	return `${row.title} (${row.id})`;
};
```

**Incorrect (세 항을 엮은 판정을 쓰는 자리에 그대로 늘어놓습니다):**

```ts
const toRowAction = (row: Row): RowAction => {
	return row.status === product_status.draft && !row.lockedAt && row.ownerId === session.userId
		? row_action.edit
		: row_action.view;
};
```

**Correct (한 번만 써도 합성 판정이라 변수로 뺍니다):**

```ts
const toRowAction = (row: Row): RowAction => {
	const isEditable = row.status === product_status.draft && !row.lockedAt && row.ownerId === session.userId;

	return isEditable ? row_action.edit : row_action.view;
};
```

**Incorrect (콜백 안에 두어 행마다 다시 계산합니다):**

```ts
const toVisibleRows = (rows: Row[], keyword: string): Row[] => {
	return rows.filter((row) => row.title.toLowerCase().includes(keyword.trim().toLowerCase()));
};
```

**Correct (콜백 밖으로 빼 행마다 다시 계산하지 않습니다):**

```ts
const toVisibleRows = (rows: Row[], keyword: string): Row[] => {
	// 콜백 안으로 옮기면 행마다 다시 계산한다
	const lowerKeyword = keyword.trim().toLowerCase();

	return rows.filter((row) => row.title.toLowerCase().includes(lowerKeyword));
};
```

**Incorrect (변수를 없애느라 저장과 캐시 비우기 순서가 뒤집힙니다):**

```ts
/**
 * 초안을 저장한 뒤 목록 캐시를 비운다
 */
const submitDraft = async (draft: Draft) => {
	await queryClient.invalidateQueries({queryKey: ["records"]});

	return await saveRecord(draft);
};
```

**Correct (외부 호출의 실행 순서를 유지하려고 변수로 뺍니다):**

```ts
/**
 * 초안을 저장한 뒤 목록 캐시를 비운다
 */
const submitDraft = async (draft: Draft) => {
	const savedRecord = await saveRecord(draft);

	await queryClient.invalidateQueries({queryKey: ["records"]});

	return savedRecord;
};
```

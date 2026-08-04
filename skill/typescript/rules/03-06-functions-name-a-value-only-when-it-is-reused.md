---
title: Name a Value Only When It Is Reused
titleKo: 값에 이름은 두 번 이상 쓸 때만 붙입니다
impact: HIGH
impactDescription: 한 번 쓸 값에 이름을 붙이지 않아 식의 출처가 쓰는 자리에 그대로 남습니다
appliesWhen:
  - 순수 계산의 결과를 지역 `const`로 받는 줄을 추가·삭제할 때
  - 식을 그 자리에 적을지 이름을 붙일지 정할 때
reviewWith: functions-avoid-imperative-assembly-in-wide-scopes
tags: functions, origin
---

## Name a Value Only When It Is Reused

**Impact: HIGH (한 번 쓸 값에 이름을 붙이지 않아 식의 출처가 쓰는 자리에 그대로 남습니다)**

부수효과 없는 순수 식의 결과를 **한 번만 쓰면 이름을 붙이지 않고 그 자리에 적습니다.**
두 번 이상 쓰면 그 자리들을 모두 감싸는 가장 좁은 스코프에 `const`로 둡니다.

이름을 붙이는 순간 읽는 사람은 그 값이 어디서 왔는지 확인하러 위로 올라가야 합니다.
한 번 쓸 값이면 올라갈 이유가 없게 그 자리에 적는 편이 낫습니다.

대상은 순수 식의 결과뿐입니다.
아래는 이름을 붙이는 것이 문법이거나 순서가 뜻을 갖는 자리라 해당하지 않습니다.

| 대상이 아닌 것 | 이유 |
| --- | --- |
| **콜백이나 반복문 안으로 들어가는 값** | 글로 한 번이어도 실행은 원소마다 한 번씩입니다 |
| 훅 호출과 `useState` 반환 | 부르는 자리와 횟수가 정해져 있습니다 |
| `await`나 `yield`가 붙은 값 | 실행 순서가 뜻을 갖습니다 |
| 바깥과 주고받는 호출 (`init()`, `localStorage.getItem()`) | 옮기면 부르는 시점이 달라집니다 |
| 함수 값에 붙인 이름 | 이름이 곧 계약입니다 |

**글에서 한 번인 것과 실행에서 한 번인 것은 다릅니다.**
`.map()`이나 `.filter()` 콜백 안, 반복문 안으로 옮기면 원소 수만큼 다시 계산합니다.
그런 값은 콜백 밖에 이름을 붙여 둡니다.
`functions-use-set-and-map-for-repeated-lookups`가 만드는 `Set`도 같은 이유로 밖에 둡니다.

`let` 재할당과 배열 `push` 누적은 `functions-avoid-imperative-assembly-in-wide-scopes`가 봅니다.

**Incorrect (한 번 쓸 값에 이름을 붙임):**

```ts
const toNextIteration = (iteration: number): number => {
	const nextIteration = iteration + 1;

	return nextIteration;
};

const toRowLabel = (row: Row): string => {
	const rowLabel = `${row.title} (${row.id})`;

	return rowLabel;
};
```

**Correct (그 자리에 적음):**

```ts
const toNextIteration = (iteration: number): number => {
	return iteration + 1;
};

const toRowLabel = (row: Row): string => {
	return `${row.title} (${row.id})`;
};
```

**Correct (두 번 이상 쓰므로 이름을 붙임):**

```ts
const toRowClassNames = (row: Row): string[] => {
	const isOverdue = row.dueDate < today;

	return [
		isOverdue ? "ui_row__root--overdue" : "ui_row__root",
		isOverdue ? "ui_row__badge--overdue" : "ui_row__badge",
	];
};
```

**Correct (콜백 밖이라 이름을 붙여 둠):**

```ts
const filterVisibleRows = (rows: Row[], keyword: string): Row[] => {
	// 콜백 안으로 옮기면 행마다 다시 계산한다
	const normalizedKeyword = keyword.trim().toLowerCase();

	return rows.filter((row) => row.title.toLowerCase().includes(normalizedKeyword));
};
```

**Correct (바깥과 주고받는 호출이라 대상이 아님):**

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

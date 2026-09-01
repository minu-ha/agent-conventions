---
title: Name a Value Only to Prevent Recompute or Explain a Judgment
titleKo: 변수는 재계산을 막거나 복잡한 판정에 이름을 붙일 때만 만듭니다
impact: MEDIUM
impactDescription: 변수로 뺄지가 그 표현식 안에서 정해져 쓰는 자리가 하나 늘었다고 판정이 뒤집히지 않습니다
appliesWhen:
  - 순수 계산의 결과를 지역 변수(`const`)로 받는 줄을 추가·삭제할 때
  - 표현식을 쓰는 자리에 그대로 적을지 변수로 뺄지 정할 때
reviewWith: functions-avoid-imperative-assembly-in-wide-scopes, values-read-objects-through-chains
tags: functions, origin
---

## Name a Value Only to Prevent Recompute or Explain a Judgment

**Impact: MEDIUM (변수로 뺄지가 그 표현식 안에서 정해져 쓰는 자리가 하나 늘었다고 판정이 뒤집히지 않습니다)**

변수를 만드는 이유는 둘입니다.
둘 다 아니면 표현식을 쓰는 자리에 그대로 적습니다.
같은 표현식을 몇 번 적든 마찬가지입니다.

**1. 다시 계산하면 값이 달라지거나 비용이 듭니다.**

| 자리 | 이유 |
| --- | --- |
| 콜백이나 반복문 안으로 들어가는 값 | 코드에 한 번 적혀 있어도 실행은 원소마다 한 번씩입니다 |
| 시각·난수처럼 부를 때마다 달라지는 값 | 두 자리가 서로 다른 값을 봅니다 |
| `await`나 `yield`가 붙은 값 | 실행 순서가 뜻을 갖습니다 |
| 바깥과 주고받는 호출 (`init()`, `localStorage.getItem()`) | 옮기면 부르는 시점이 달라집니다 |
| 훅 호출과 `useState` 반환 | 부르는 자리와 횟수가 정해져 있습니다 |

함수 값은 계산 결과가 아니라 계약이라 이 규칙 대상이 아닙니다.
선언 형태는 `functions-declare-functions-as-arrow-consts`가 정합니다.

**코드에 한 번 적힌 것과 실행에서 한 번인 것은 다릅니다.**
`.map()`이나 `.filter()` 콜백 안, 반복문 안으로 옮기면 원소 수만큼 다시 계산합니다.
`values-use-set-and-map-for-repeated-lookups`가 만드는 `Set`도 같은 이유로 콜백 밖에 둡니다.

**2. 여러 항을 엮은 판정이라 이름이 결론을 대신 말해 줍니다.**

`row.status === product_status.draft && !row.lockedAt && row.ownerId === session.userId`는
읽을 때마다 세 항을 머릿속에서 합쳐야 합니다.
`isEditable`은 그 합성을 한 번만 하게 합니다.

- 항이 하나면 이름이 더해 줄 것이 없습니다.
  `row.dueDate < today`는 쓰는 자리에 그대로 적습니다.
- 부정이 겹치면 이름으로 뒤집습니다.
  `!row.deletedAt && !row.archivedAt`보다 `isVisible`이 한 번에 읽힙니다.
- 표현식에 리터럴이 보이면 변수로 뺄 자리가 아니라 그 리터럴을 선언할 자리입니다.
  `types-replace-enum-with-as-const-objects`와
  `naming-place-project-constants-in-the-root-constant-folder` 규칙이 그 자리를 정합니다.

**횟수는 기준이 아닙니다.**
몇 번 쓰이는지는 파일 전체를 봐야 알고, 쓰는 자리를 하나 더하면 어제 맞던 판정이 오늘 뒤집힙니다.
같은 코드에 다른 답이 나오는 기준은 지킬 수 없습니다.
위 둘은 그 표현식 안에서 판정됩니다.

변수로 빼면 읽는 사람은 그 값이 어디서 왔는지 확인하러 위로 올라갑니다.
그 비용을 치를 이유가 위 둘입니다.

`let` 재할당과 배열 `push` 누적은 `functions-avoid-imperative-assembly-in-wide-scopes`가 봅니다.
객체 필드를 그대로 읽는 것은 계산이 아니라 `values-read-objects-through-chains`가 봅니다.

**Incorrect (돌려주기만 할 값을 변수로 뺍니다):**

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

**Correct (한 번만 써도 합성 판정이라 변수로 뺍니다):**

```ts
const toRowAction = (row: Row): RowAction => {
	const isEditable = row.status === product_status.draft && !row.lockedAt && row.ownerId === session.userId;

	return isEditable ? rowAction.edit : rowAction.view;
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

**Correct (바깥과 주고받는 호출이라 변수로 뺍니다):**

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

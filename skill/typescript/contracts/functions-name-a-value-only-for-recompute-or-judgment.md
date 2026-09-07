# Name a Value Only to Prevent Recompute or Explain a Judgment

**Impact: MEDIUM (사용 횟수보다 계산 비용과 판정의 복잡성을 기준으로 변수 선언 여부를 판단합니다)**

지역 변수는 재계산을 막거나 여러 항을 합친 판정에 이름을 붙일 때만 만듭니다.
사용처 수만으로는 만들지 않으며, 아래 사유가 없으면 표현식을 쓰는 자리에 둡니다.

| 변수로 받을 사유 | 확인할 것 |
| --- | --- |
| 콜백·반복문으로 옮기면 비용이 반복됨 | 코드에 한 번 적혀도 원소마다 실행됩니다. 반복 조회용 `Set`도 콜백 밖에 둡니다 |
| 시각·난수처럼 호출마다 값이 달라짐 | 여러 사용처가 같은 값을 보아야 합니다 |
| `await`, `yield`, 외부 호출 | 순서나 호출 시점을 바꾸지 않습니다. `localStorage.getItem()`도 해당합니다 |
| 훅 호출·`useState` 반환 | 정해진 호출 위치와 횟수를 유지합니다 |
| 여러 항을 합친 판정 | `isEditable`처럼 이름이 판정의 결론을 설명해야 합니다 |
| 부정이 겹친 판정 | `!row.deletedAt && !row.archivedAt`은 `isVisible`처럼 뜻을 드러냅니다 |

단일 비교인 `row.dueDate < today`는 반복해서 써도 그대로 둡니다.
사용처가 하나 늘었다고 변수 필요성까지 달라지지 않도록 표현식의 성격으로 판단합니다.

| 이 규칙과 구분할 대상 | 적용 규칙 |
| --- | --- |
| 함수 값 | 계산 결과가 아닌 계약입니다. `functions-declare-functions-as-arrow-consts`를 따릅니다 |
| 객체 필드의 별칭 | `values-read-objects-through-chains` |
| `let` 재할당·`push` 누적 | `functions-avoid-imperative-assembly-in-wide-scopes` |
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

> 나머지 예시·예외는 [full rule](../rules/03-08-functions-name-a-value-only-for-recompute-or-judgment.md)에 있습니다.

---
title: Name a Value Only to Prevent Recompute or Explain a Judgment
titleKo: 변수는 재계산을 막거나 복잡한 판정에 이름을 붙일 때만 만듭니다
impact: HIGH
impactDescription: 사용 횟수보다 계산 비용과 판정의 복잡성을 기준으로 변수 선언 여부를 판단합니다
appliesWhen:
  - 순수 계산의 결과를 지역 변수(`const`)로 받는 줄을 추가, 삭제할 때
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
| 콜백, 반복문으로 옮기면 비용이 반복됨 | 코드에 한 번 적혀도 원소마다 실행됩니다. 반복 조회용 `Set`도 콜백 밖에 둡니다 |
| 시각, 난수처럼 호출마다 값이 달라짐 | 여러 사용처가 같은 값을 보아야 합니다 |
| `await`, `yield`, 외부 호출 | 순서나 호출 시점을 바꾸지 않습니다. `localStorage.getItem()`도 해당합니다 |
| 훅 호출, `useState` 반환 | 정해진 호출 위치와 횟수를 유지합니다 |
| 여러 항을 합친 판정 | `isEditable`처럼 이름이 판정의 결론을 설명해야 합니다 |
| 부정이 겹친 판정 | `!row.deletedAt && !row.archivedAt`은 `isVisible`처럼 뜻을 드러내는 이름으로 받습니다 |

단일 비교인 `row.dueDate < today`는 반복해서 써도 그대로 둡니다.
객체 필드의 별칭은 `values-read-objects-through-chains`,
`let` 재할당과 `push`는 `functions-avoid-imperative-assembly-in-wide-scopes`가 정합니다.

**Incorrect 1 (두 번 쓴다는 이유만으로 변수로 뺍니다):**

<<< ../examples/functions-name-a-value-only-for-recompute-or-judgment/01-incorrect.ts

**Correct 1 (항이 하나라 두 번 적어도 그 자리에 그대로 씁니다):**

<<< ../examples/functions-name-a-value-only-for-recompute-or-judgment/02-correct.ts

**Incorrect 2 (돌려주기만 할 값을 변수로 뺍니다):**

<<< ../examples/functions-name-a-value-only-for-recompute-or-judgment/03-incorrect.ts

**Correct 2 (이름을 붙이지 않고 그대로 돌려줍니다):**

<<< ../examples/functions-name-a-value-only-for-recompute-or-judgment/04-correct.ts

**Incorrect 3 (세 항을 엮은 판정을 쓰는 자리에 그대로 늘어놓습니다):**

<<< ../examples/functions-name-a-value-only-for-recompute-or-judgment/05-incorrect.ts

**Correct 3 (한 번만 써도 합성 판정이라 변수로 뺍니다):**

<<< ../examples/functions-name-a-value-only-for-recompute-or-judgment/06-correct.ts

**Incorrect 4 (콜백 안에 두어 행마다 다시 계산합니다):**

<<< ../examples/functions-name-a-value-only-for-recompute-or-judgment/07-incorrect.ts

**Correct 4 (콜백 밖으로 빼 행마다 다시 계산하지 않습니다):**

<<< ../examples/functions-name-a-value-only-for-recompute-or-judgment/08-correct.ts

**Incorrect 5 (변수를 없애느라 저장과 캐시 비우기 순서가 뒤집힙니다):**

<<< ../examples/functions-name-a-value-only-for-recompute-or-judgment/09-incorrect.ts

**Correct 5 (외부 호출의 실행 순서를 유지하려고 변수로 뺍니다):**

<<< ../examples/functions-name-a-value-only-for-recompute-or-judgment/10-correct.ts

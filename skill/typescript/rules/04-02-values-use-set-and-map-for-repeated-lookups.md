---
title: Use Set and Map for Repeated Lookups
titleKo: 같은 조회를 반복하면 `Set`이나 `Map`으로 정리합니다
impact: MEDIUM
impactDescription: 반복 조회 구조를 한 번 만들어 목록 전체를 되풀이해 비교하는 비용을 줄입니다
appliesWhen:
  - 같은 목록의 `includes`나 `find`를 루프 · 배열 콜백 안에서 호출하도록 추가 · 변경할 때
  - 같은 목록의 키 조회를 서로 다른 세 지점 이상에서 하도록 추가 · 변경할 때
  - 제외: 조회하는 목록이 짧고 길이가 정해져 있는 경우
tags: functions
---

## Use Set and Map for Repeated Lookups

**Impact: MEDIUM (반복 조회 구조를 한 번 만들어 목록 전체를 되풀이해 비교하는 비용을 줄입니다)**

같은 목록을 반복 조회하면 루프 밖에서 `Set`이나 `Map`을 한 번 만들고, 원본 목록이 바뀔 때 갱신합니다.
중첩된 `includes` · `find`는 최악의 경우 두 목록 길이의 곱만큼 비교합니다.

| 상황 | 처리 |
| --- | --- |
| 같은 목록을 루프나 `map`, `filter`, `some` 콜백 안에서 조회 | 포함 여부는 `Set.has`, 항목 조회는 `Map.get`으로 바꿉니다 |
| 같은 목록을 서로 다른 세 지점 이상에서 조회 | 한 번 만든 `Set`, `Map`을 공유합니다 |
| 위 조건에 해당하지 않거나 길이가 정해진 짧은 목록 | 기존 조회를 유지합니다 |
| 중복 제거 · 차집합처럼 결과 목록을 만듦 | `uniq`, `difference`, `without`을 씁니다. 만든 뒤 `has`를 반복 호출할 때만 `Set`을 남깁니다 |

`Set` · `Map`도 생성 비용이 있으며 조회가 항상 상수 시간인 것은 아닙니다.
명세는 평균 조회 시간이 원소 수에 비례하는 시간보다 짧을 것만 요구합니다.
서버 응답이나 사용자 선택처럼 목록 길이를 통제하지 못할 때 반복 조회 비용이 커집니다.

| `Map`으로 바꾸기 전 확인 | 이유와 처리 |
| --- | --- |
| `keyBy`의 객체를 조회용으로 쓰는지 | 프로토타입의 `constructor`, `toString` 키에 걸릴 수 있어 `Map`을 씁니다 |
| 없는 키를 타입이 드러내는지 | `noUncheckedIndexedAccess`가 꺼진 `Record<string, T>`와 달리 `Map.get()`은 항상 `T \| undefined`입니다 |
| 키가 중복되는지 | `find`는 첫 항목, `new Map(entries)`는 마지막 항목을 남깁니다. 첫 항목을 유지하려면 `uniqBy`를 먼저 적용합니다 |

`groupBy` · `keyBy`는 목록을 재구성할 때 씁니다.
목록 연산의 선택은 `values-use-es-toolkit-for-value-helpers`가 정합니다.

**Incorrect 1 (같은 배열을 반복 순회하며 포함 여부를 확인합니다):**

```ts
const visibleProducts = products.filter((product) => allowedProductIds.includes(product.id));
const disabledProducts = archivedProducts.filter((product) => allowedProductIds.includes(product.id));
```

**Correct 1 (반복 조회는 `Set`으로 처리합니다):**

```ts
const allowedProductIdSet = new Set(allowedProductIds);

const visibleProducts = products.filter((product) => allowedProductIdSet.has(product.id));
const disabledProducts = archivedProducts.filter((product) => allowedProductIdSet.has(product.id));
```

**Correct (반복 키 조회는 `Map`으로 처리합니다):**

```ts
// users는 서버 계약상 id가 고유하다
const userById = new Map(users.map((user) => [user.id, user]));

const owner = userById.get(ownerId);
const reviewer = userById.get(reviewerId);
const approver = userById.get(approverId);
```

**Correct (길이가 정해진 짧은 목록은 `includes`를 그대로 씁니다):**

```ts
const isEditableStatus = editable_order_statuses.includes(order.status);
```

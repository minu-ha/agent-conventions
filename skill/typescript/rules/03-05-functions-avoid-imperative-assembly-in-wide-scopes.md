---
title: Avoid Imperative Assembly in Wide Scopes
titleKo: 넓은 스코프에서 `let` 재할당과 `push`로 값을 쌓지 않습니다
impact: MEDIUM
impactDescription: 분기로 공유 지역 변수를 바꾸지 않아 넓은 스코프의 값 조립이 선언형으로 남습니다
appliesWhen:
  - 모듈 최상위나 함수 본문 전체를 덮는 스코프에서 `let` 재할당, 배열 `push`, 조건부 누적으로 값을 만들 때
reviewWith: functions-extract-helpers-only-when-the-boundary-is-real
tags: functions
---

## Avoid Imperative Assembly in Wide Scopes

**Impact: MEDIUM (분기로 공유 지역 변수를 바꾸지 않아 넓은 스코프의 값 조립이 선언형으로 남습니다)**

모듈 최상위나 함수 본문 전체를 덮는 스코프에서 `let` 재할당, 배열 `push`, 조건부 누적으로 값을 쌓지 않습니다.
`if`나 `for` 블록 안에서만 사는 누적은 대상이 아닙니다.
한 번만 쓰면 실제 쓰는 좁은 스코프에서 바로 계산합니다.
조건이 둘 이상이면 삼항을 겹치지 않고 조건부 스프레드나 `filter`로 한 번에 조립합니다.
분기와 보정이 얽혀 좁은 스코프에 담기지 않으면 떼어 낼지를 다시 봅니다.
그 판정은 `functions-extract-helpers-only-when-the-boundary-is-real`이 합니다.
떼어 낸 함수의 이름은 `functions-name-functions-by-what-comes-out`이 정하고,
중간값에 이름을 붙일지는 `functions-name-a-value-only-when-it-is-reused`가 정합니다.

**Incorrect (넓은 스코프에서 명령형으로 누적 조립):**

```ts
let visibleTabs = ["overview"];

if (canManageItems) {
	visibleTabs.push("items");
}
```

**Correct (조건부 스프레드로 한 번에 계산):**

```ts
const visibleTabs = ["overview", ...(canManageItems ? ["items"] : [])];
```

**Correct (조건이 셋 이상이면 표로 두고 걸러 냄):**

```ts
const visibleTabs = [
	{id: "overview", isVisible: true},
	{id: "items", isVisible: canManageItems},
	{id: "members", isVisible: canInviteMembers},
]
	.filter((tab) => tab.isVisible)
	.map((tab) => tab.id);
```

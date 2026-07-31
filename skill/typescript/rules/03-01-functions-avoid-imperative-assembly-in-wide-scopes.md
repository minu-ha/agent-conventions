---
title: Avoid Imperative Assembly in Wide Scopes
titleKo: 넓은 스코프의 명령형 조립 금지
impact: HIGH
impactDescription: 분기로 공유 지역 변수를 변형하지 않고 파일 전역 로직을 선언적으로 유지합니다
appliesWhen:
  - 파일 상단이나 넓은 스코프에서 `let` 재대입, 배열 `push` 또는 조건부 누적으로 값을 조립하거나 리팩터링할 때
tags: imperative, scope, assembly
---

## Avoid Imperative Assembly in Wide Scopes

**Impact: HIGH (분기로 공유 지역 변수를 변형하지 않고 파일 전역 로직을 선언적으로 유지합니다)**

파일 상단이나 넓은 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적 조립을 하지 않습니다.
단회성 사용이면 실제 사용하는 좁은 스코프에서 직접 계산하고, 분기와 보정이 결합된 계산은 `resolve*`, `build*`,
`normalize*` 형태 유틸로 분리합니다.

**Incorrect (넓은 스코프에서 명령형으로 누적 조립):**

```ts
let visibleTabs = ["overview"];

if (canManageItems) {
	visibleTabs.push("items");
}
```

**Correct (좁은 스코프에서 한 번에 계산):**

```ts
const visibleTabs = canManageItems
	? ["overview", "items"]
	: ["overview"];
```

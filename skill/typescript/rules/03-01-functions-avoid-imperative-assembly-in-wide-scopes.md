---
title: Avoid Imperative Assembly in Wide Scopes
titleKo: 넓은 스코프에서 값을 조립하지 않습니다
impact: HIGH
impactDescription: 분기로 공유 지역 변수를 바꾸지 않아 파일 전역 로직이 선언형으로 남습니다
appliesWhen:
  - 파일 위쪽이나 넓은 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적으로 값을 만들거나 정리할 때
tags: imperative, scope, assembly
---

## Avoid Imperative Assembly in Wide Scopes

**Impact: HIGH (분기로 공유 지역 변수를 바꾸지 않아 파일 전역 로직이 선언형으로 남습니다)**

파일 위쪽이나 넓은 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적으로 값을 쌓지 않습니다.
한 번만 쓰면 실제 쓰는 좁은 스코프에서 바로 계산합니다.
분기와 보정이 얽힌 계산은 `resolve*`, `build*`, `normalize*` 같은 함수로 떼어 냅니다.

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

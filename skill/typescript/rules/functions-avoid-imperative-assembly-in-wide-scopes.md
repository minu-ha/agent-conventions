---
title: Avoid Imperative Assembly in Wide Scopes
impact: HIGH
impactDescription: keeps file-wide logic declarative instead of mutating shared locals through branching assembly
tags: imperative, scope, assembly
---

## Avoid Imperative Assembly in Wide Scopes

**Impact: HIGH (keeps file-wide logic declarative instead of mutating shared locals through branching assembly)**

파일 상단이나 넓은 스코프에서 `let` 재대입, 배열 `push`, 조건부 누적 조립을 하지 않습니다. 단회성 사용이면 실제 사용하는 좁은 스코프에서 직접 계산하고, 분기와 보정이 결합된 계산은 `resolve*`, `build*`, `normalize*` 형태 유틸로 분리합니다.

**Incorrect (넓은 스코프에서 명령형으로 누적 조립):**

```ts
let visibleTabs = ["overview"];

if (canManageMembers) {
	visibleTabs.push("members");
}
```

**Correct (좁은 스코프에서 한 번에 계산):**

```ts
const visibleTabs = canManageMembers
	? ["overview", "members"]
	: ["overview"];
```

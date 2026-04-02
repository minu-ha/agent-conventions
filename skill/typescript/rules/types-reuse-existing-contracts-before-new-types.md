---
title: Reuse Existing Contracts Before Declaring New Types
impact: HIGH
impactDescription: reduces duplicate shape declarations by deriving from existing types and schemas when semantics have not changed
tags: type-reuse, pick, omit
---

## Reuse Existing Contracts Before Declaring New Types

**Impact: HIGH (reduces duplicate shape declarations by deriving from existing types and schemas when semantics have not changed)**

기존 타입이나 스키마가 이미 존재하면 동일 구조의 별도 타입 선언을 만들지 않습니다. 의미 차이가 실제로 있을 때만 신규 타입을 만들고, 그 외에는 직접 참조하거나 `Pick`/`Omit`/Indexed Access로 파생합니다.

**Incorrect (기존 계약과 동일한 구조를 다시 선언):**

```ts
interface OrchestrationSnapshot {
	request: string;
	iteration: number;
}
```

**Correct (기존 계약에서 필요한 부분만 파생):**

```ts
type DevelopmentSnapshot = Pick<DevelopmentOrchestrationState, "request" | "iteration">;
```

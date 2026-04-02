---
title: Prefer Function Variable Types Over Parameter Annotations
impact: CRITICAL
impactDescription: keeps callable contracts reusable and prevents local parameter annotations from fragmenting shared function types
tags: function-types, annotations, contracts
---

## Prefer Function Variable Types Over Parameter Annotations

**Impact: CRITICAL (keeps callable contracts reusable and prevents local parameter annotations from fragmenting shared function types)**

재사용 가능한 콜백이나 함수 타입이 있다면 매개변수 타입 선언보다 함수 변수 타입 선언을 우선합니다. 이미 존재하는 interface, object contract, framework alias를 먼저 재사용하고, 정말 필요한 경우에만 별도 callable contract를 선언합니다. 한 번만 쓰는 로컬 함수 때문에 함수 타입 alias를 늘리는 것은 지양합니다.

**Incorrect (공유 가능한 함수 계약이 있는데 매개변수 타입만 사용):**

```ts
const formatState = (state: Record<string, unknown>): string => {
	return JSON.stringify(state);
};
```

**Correct (기존 계약을 재사용해 함수 변수 타입을 고정):**

```ts
interface WorkflowFormatters {
	formatState: (state: Record<string, unknown>) => string;
}

const formatState: WorkflowFormatters["formatState"] = (state) => {
	return JSON.stringify(state);
};
```

```ts
type NormalizeRequest = (request: string) => string;

const normalizeRequest: NormalizeRequest = (request) => {
	return request.trim();
};

const normalizeFallbackRequest: NormalizeRequest = (request) => {
	return request || "default";
};
```

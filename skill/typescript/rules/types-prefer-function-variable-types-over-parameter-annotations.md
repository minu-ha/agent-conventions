---
title: Prefer Function Variable Types Over Parameter Annotations
impact: CRITICAL
impactDescription: keeps callable contracts reusable and prevents local parameter annotations from fragmenting shared function types
tags: function-types, annotations, contracts
---

## Prefer Function Variable Types Over Parameter Annotations

**Impact: CRITICAL (keeps callable contracts reusable and prevents local parameter annotations from fragmenting shared function types)**

재사용 가능한 콜백이나 함수 타입이 있다면 매개변수 타입 선언보다 함수 변수 타입 선언을 우선합니다. 적절한 함수 타입이 없을 때만 매개변수에 직접 타입을 명시하고, 그렇지 않으면 callable contract를 별도로 선언해 재사용합니다.

**Incorrect (공유 가능한 함수 계약이 있는데 매개변수 타입만 사용):**

```ts
const formatState = (state: Record<string, unknown>): string => {
	return JSON.stringify(state);
};
```

**Correct (함수 변수 타입 선언을 우선):**

```ts
type FormatState = (state: Record<string, unknown>) => string;

const formatState: FormatState = (state) => {
	return JSON.stringify(state);
};
```

```ts
type NormalizeRequest = (request: string) => string;

const normalizeRequest: NormalizeRequest = (request) => {
	return request.trim();
};
```

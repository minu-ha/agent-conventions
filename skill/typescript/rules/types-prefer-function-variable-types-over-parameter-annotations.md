---
title: Prefer Function Variable Types Over Parameter Annotations
impact: CRITICAL
impactDescription: >-
  keeps callable contracts reusable and prevents local parameter annotations from fragmenting shared function types
appliesWhen: >-
  기존 callable 계약을 named·shared 함수 구현에 재사용하거나 같은 시그니처를 여러 구현이 공유하도록 바꾼다. annotation
  없는 one-off contextually typed inline callback은 제외한다.
tags: function-types, annotations, contracts
---

## Prefer Function Variable Types Over Parameter Annotations

**Impact: CRITICAL (keeps callable contracts reusable and prevents local parameter annotations from fragmenting shared function types)**

재사용 가능한 콜백이나 함수 타입이 있다면 매개변수 타입 선언보다 함수 변수 타입 선언을 우선합니다.
이미 존재하는 interface, object contract, framework alias를 먼저 재사용하고,
동일 callable contract를 여러 구현이 공유할 때만 별도 함수 타입 alias를 선언합니다.
한 번만 쓰는 로컬 함수 때문에 함수 타입 alias를 늘리는 것은 지양합니다.

객체 literal 안에서 한 번만 쓰이고 매개변수·반환 타입 annotation이 없는 contextually typed inline callback은
named/shared 함수 구현 계약이 아니므로 N/A입니다.
예를 들어 `query.select: (response) => ({...})`를 이 규칙 때문에 밖으로 빼거나 별도 함수 타입으로 고정하지 않습니다.
반대로 named handler나 curried factory의 반환 handler를 기존 framework alias로 고정하는 변경은 Selected입니다.

**Incorrect (공유 가능한 함수 계약이 있는데 매개변수 타입만 사용):**

```ts
const formatState = (state: Record<string, unknown>): string => {
	return JSON.stringify(state);
};
```

**Correct (기존 계약이나 실제 공유되는 callable contract를 재사용해 함수 변수 타입을 고정):**

```ts
/**
 * @summary 사용자 formatter 계약
 */
interface UserFormatters {
	/**
	 * @field 상태 문자열 formatter
	 */
	formatState: (state: Record<string, unknown>) => string;
}

const formatState: UserFormatters["formatState"] = (state) => {
	return JSON.stringify(state);
};
```

```ts
/**
 * @summary request 정규화 계약
 */
type NormalizeRequest = (request: string) => string;

const normalizeRequest: NormalizeRequest = (request) => {
	return request.trim();
};

const normalizeSearchRequest: NormalizeRequest = (request) => {
	return request.replaceAll(/\s+/g, " ").trim();
};
```

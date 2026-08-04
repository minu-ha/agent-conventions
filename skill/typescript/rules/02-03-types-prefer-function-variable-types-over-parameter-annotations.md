---
title: Prefer Function Variable Types Over Parameter Annotations
titleKo: 매개변수마다 타입을 붙이지 않고 함수 변수 타입을 씁니다
impact: CRITICAL
impactDescription: 호출 계약을 재사용할 수 있게 두고 지역 타입 표기가 공용 함수 타입을 조각내지 않게 합니다
appliesWhen:
  - 기존 호출 계약을 이름 붙인 함수나 공용 함수 구현에 다시 쓸 때
  - 같은 시그니처를 여러 구현이 함께 쓰도록 바꿀 때
  - 제외: 타입 표기 없이 문맥으로 추론되는 일회성 인라인 콜백인 경우
tags: types
---

## Prefer Function Variable Types Over Parameter Annotations

**Impact: CRITICAL (호출 계약을 재사용할 수 있게 두고 지역 타입 표기가 공용 함수 타입을 조각내지 않게 합니다)**

재사용 가능한 콜백이나 함수 타입이 있다면 매개변수 타입 선언보다 함수 변수 타입 선언을 우선합니다.
이미 있는 인터페이스, 객체 계약, 프레임워크 별칭을 먼저 씁니다.
함수 타입 별칭을 새로 선언하는 것은 같은 시그니처를 쓰는 구현이 이미 둘 이상일 때만입니다.
한 번만 쓰는 지역 함수 때문에 함수 타입 별칭을 늘리지 않습니다.

객체 안에서 한 번만 쓰이고 타입 표기도 없이 문맥으로 추론되는 인라인 콜백은 대상이 아닙니다.
`query.select: (response) => ({...})`를 이 규칙 때문에 밖으로 빼거나 함수 타입으로 고정하지 않습니다.
반대로 이름 붙인 핸들러나 커링 팩토리가 돌려주는 핸들러를 기존 프레임워크 별칭으로 고정하면 이 규칙을 적용합니다.

**Incorrect (공유 가능한 함수 계약이 있는데 매개변수 타입만 사용):**

```ts
const formatState = (state: Record<string, unknown>): string => {
	return JSON.stringify(state);
};
```

**Correct (이미 있는 계약에서 시그니처를 가져와 함수 변수 타입을 고정):**

```ts
const formatState: UserFormatters["formatState"] = (state) => {
	return JSON.stringify(state);
};
```

```ts
/**
 * request 정규화 계약
 */
type NormalizeRequest = (request: string) => string;

const normalizeRequest: NormalizeRequest = (request) => {
	return request.trim();
};

const normalizeSearchRequest: NormalizeRequest = (request) => {
	return request.replaceAll(/\s+/g, " ").trim();
};
```

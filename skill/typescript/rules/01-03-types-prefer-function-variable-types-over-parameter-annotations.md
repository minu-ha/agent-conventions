---
title: Prefer Function Variable Types Over Parameter Annotations
titleKo: 매개변수마다 표기하지 않고 함수를 담는 변수에 타입을 붙입니다
impact: MEDIUM-HIGH
impactDescription: 호출 계약을 한곳에서 읽고 같은 시그니처를 반복 선언하지 않습니다
appliesWhen:
  - 기존 호출 계약을 이름 붙인 함수나 공용 함수 구현에 다시 쓸 때
  - 같은 시그니처를 여러 구현이 함께 쓰도록 바꿀 때
  - 제외: 타입 표기 없이 문맥으로 추론되는 일회성 인라인 콜백인 경우
reviewWith: types-mark-unused-parameters-with-underscore
tags: types
---

## Prefer Function Variable Types Over Parameter Annotations

**Impact: MEDIUM-HIGH (호출 계약을 한곳에서 읽고 같은 시그니처를 반복 선언하지 않습니다)**

기존 호출 계약이 있으면 매개변수와 반환 타입을 반복하지 않고 함수를 담는 변수에 붙입니다.
예를 들어 `const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => …`로 씁니다.

| 상황 | 타입 표기 |
| --- | --- |
| 인터페이스·객체 계약·프레임워크 별칭이 있음 | 기존 호출 계약을 함수 변수에 붙입니다 |
| 계약에 콜백 필드가 있음 | `Contract["onSelect"]`로 가져옵니다 |
| 같은 시그니처를 쓰는 구현이 둘 이상임 | 함수 타입 별칭을 선언합니다 |
| 맞는 계약도 없고 구현도 하나뿐임 | 매개변수 타입을 직접 적습니다. 별칭을 새로 만들지 않습니다 |

쓰지 않는 계약 매개변수는 `types-mark-unused-parameters-with-underscore`에 따라 남깁니다.
문맥으로 추론되는 일회성 인라인 콜백은 대상이 아닙니다.
`select: (response) => ({...})`를 밖으로 빼거나 새 함수 타입으로 고정하지 않습니다.
커링 팩토리가 반환하는 리액트 핸들러는 프레임워크 컨벤션이 판단합니다.

**Incorrect (계약이 있는데 시그니처를 다시 적습니다):**

```ts
// 이미 있는 계약
/**
 * 사용자 화면 표시 문자열 계약
 */
interface UserFormatters {
	/**
	 * 상태 객체를 화면 문자열로
	 */
	toStateLabel: (state: Record<string, unknown>) => string;
	/**
	 * 권한 코드를 화면 문자열로
	 */
	toRoleLabel: (role: string) => string;
}

/**
 * 상태 객체를 화면 문자열로 바꾼다
 */
const toStateLabel = (state: Record<string, unknown>): string => {
	return JSON.stringify(state);
};
```

**Correct (이미 있는 계약에서 시그니처를 가져와 함수 전체에 타입을 붙입니다):**

```ts
// 이미 있는 계약
/**
 * 사용자 화면 표시 문자열 계약
 */
interface UserFormatters {
	/**
	 * 상태 객체를 화면 문자열로
	 */
	toStateLabel: (state: Record<string, unknown>) => string;
	/**
	 * 권한 코드를 화면 문자열로
	 */
	toRoleLabel: (role: string) => string;
}

/**
 * 상태 객체를 화면 문자열로 바꾼다
 */
const toStateLabel: UserFormatters["toStateLabel"] = (state) => {
	return JSON.stringify(state);
};
```

**Incorrect (같은 시그니처를 쓰는 구현마다 매개변수와 반환 타입을 다시 적습니다):**

```ts
/**
 * 앞뒤 공백을 걷어낸 request 문자열
 */
const toRequest = (request: string): string => {
	return request.trim();
};

/**
 * 검색어로 쓸 수 있게 공백을 한 칸으로 줄인 request 문자열
 */
const toSearchRequest = (request: string): string => {
	return request.replaceAll(/\s+/g, " ").trim();
};
```

**Correct (같은 시그니처를 쓰는 구현이 둘 이상이면 함수 타입 별칭을 선언합니다):**

```ts
/**
 * request 변환 계약
 */
type ToRequest = (request: string) => string;

/**
 * 앞뒤 공백을 걷어낸 request 문자열
 */
const toRequest: ToRequest = (request) => {
	return request.trim();
};

/**
 * 검색어로 쓸 수 있게 공백을 한 칸으로 줄인 request 문자열
 */
const toSearchRequest: ToRequest = (request) => {
	return request.replaceAll(/\s+/g, " ").trim();
};
```

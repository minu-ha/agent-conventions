---
title: Prefer Function Variable Types Over Parameter Annotations
titleKo: 매개변수마다 타입을 붙이지 않고 함수 전체에 타입을 붙입니다
impact: CRITICAL
impactDescription: 계약을 한 자리에서 읽을 수 있고 같은 시그니처를 여러 곳에 베끼지 않습니다
appliesWhen:
  - 기존 호출 계약을 이름 붙인 함수나 공용 함수 구현에 다시 쓸 때
  - 같은 시그니처를 여러 구현이 함께 쓰도록 바꿀 때
  - 제외: 타입 표기 없이 문맥으로 추론되는 일회성 인라인 콜백인 경우
reviewWith: types-mark-unused-parameters-with-underscore
tags: types
---

## Prefer Function Variable Types Over Parameter Annotations

**Impact: CRITICAL (계약을 한 자리에서 읽을 수 있고 같은 시그니처를 여러 곳에 베끼지 않습니다)**

타입을 붙일 자리가 둘 있습니다.

| 붙이는 자리 | 형태 |
| --- | --- |
| 매개변수와 반환값에 하나씩 | `const handleClick = (event: MouseEvent<HTMLButtonElement>): void => …` |
| 함수를 담는 변수에 한 번 | `const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => …` |

쓸 수 있는 계약이 이미 있으면 아래쪽을 씁니다.
이름 하나로 매개변수와 반환값이 함께 정해져서 계약을 한 자리에서 읽습니다.
이미 있는 인터페이스, 객체 계약, 프레임워크 별칭을 먼저 찾고,
매개변수 타입은 쓸 계약이 없을 때만 직접 적습니다.
인터페이스가 콜백을 필드로 갖고 있으면 `Contract["onSelect"]`처럼 인덱스 접근으로 가져다 씁니다.
가져온 계약에 지금 구현이 쓰지 않는 매개변수가 있으면 `types-mark-unused-parameters-with-underscore`를 다시 봅니다.
함수 타입 별칭을 새로 선언하는 것은 같은 시그니처를 쓰는 구현이 이미 둘 이상일 때만입니다.
한 번만 쓰는 지역 함수 때문에 함수 타입 별칭을 늘리지 않습니다.

객체 안에서 한 번만 쓰이고 타입 표기도 없이 문맥으로 추론되는 인라인 콜백은 대상이 아닙니다.
`query.select: (response) => ({...})`를 이 규칙 때문에 밖으로 빼거나 함수 타입으로 고정하지 않습니다.
커링 팩토리가 돌려주는 리액트 핸들러는 `react/typing-take-handler-types-from-existing-contracts`가 판정합니다.

**Incorrect (공유 가능한 함수 계약이 있는데 매개변수 타입만 사용):**

```ts
const formatState = (state: Record<string, unknown>): string => {
	return JSON.stringify(state);
};
```

**Correct (이미 있는 계약에서 시그니처를 가져와 함수 전체에 타입을 붙임):**

```ts
// 이미 있는 계약
interface UserFormatters {
	formatState: (state: Record<string, unknown>) => string;
	formatRole: (role: string) => string;
}

const formatState: UserFormatters["formatState"] = (state) => {
	return JSON.stringify(state);
};
```

```ts
/**
 * request 정규화 계약
 */
type ToRequest = (request: string) => string;

const toRequest: ToRequest = (request) => {
	return request.trim();
};

const toSearchRequest: ToRequest = (request) => {
	return request.replaceAll(/\s+/g, " ").trim();
};
```

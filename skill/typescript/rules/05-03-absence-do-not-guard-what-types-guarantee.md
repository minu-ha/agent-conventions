---
title: Do Not Guard What the Types Already Guarantee
titleKo: 타입이 보장하는 것을 다시 검사하지 않습니다
impact: HIGH
impactDescription: 불필요한 검사를 줄이고 값이 실제로 없을 수 있는 경우만 확인합니다
appliesWhen:
  - `isNil`, `typeof`, 옵셔널 체이닝으로 값을 검사하는 분기를 추가 · 변경할 때
  - 선택 필드에 값을 넣으면서 `undefined`를 피하려고 조건부 스프레드를 쓸 때
  - 제외: `unknown`이나 앱 밖에서 온 값을 좁히는 경우
reviewWith: >-
  types-narrow-unknown-instead-of-asserting, absence-expose-optional-values-instead-of-silent-fallbacks,
  absence-check-once-at-the-boundary
tags: absence
---

## Do Not Guard What the Types Already Guarantee

**Impact: HIGH (불필요한 검사를 줄이고 값이 실제로 없을 수 있는 경우만 확인합니다)**

타입이 이미 보장하는 조건은 다시 검사하지 않습니다.
불필요한 검사를 제거해 실제로 값이 없을 수 있는 경우를 드러냅니다.

| 검사 대상 | 처리 |
| --- | --- |
| `string`의 `?.trim()`, `number`의 `typeof`, 필수 필드의 `isNil` | 타입이 보장하므로 제거합니다 |
| `string \| null`의 `isNil` | 값이 없을 수 있으므로 유지합니다 |
| `unknown` · 외부 입력 | `types-narrow-unknown-instead-of-asserting`에 따라 검증합니다 |
| 유한 수 여부 | `number`는 `NaN`, `Infinity`도 포함하므로 필요한 검사를 남깁니다 |
| 배열 인덱스 · 열린 키 조회 | 컴파일러 옵션과 실제 길이에 따라 값이 없을 수 있으므로 필요한 검사를 남깁니다 |

선택 필드의 생략과 `undefined` 대입은 소비 계약에 맞춥니다.

| 소비 계약 | 객체 구성 |
| --- | --- |
| 두 상태를 구분하지 않고 타입도 허용 | `undefined`를 바로 넣어 불필요한 조건부 스프레드를 줄입니다 |
| `in`, `Object.hasOwn` · 객체 병합 · 패치 등에서 구분 | 조건부 스프레드를 유지하고 생략이 필요한 계약을 이유 주석에 적습니다 |
| `exactOptionalPropertyTypes` 사용 | `value?: T`에 `undefined`를 쓸 수 있는지 확인합니다 |
| `value?: T \| undefined`처럼 명시적으로 허용 | 조건부 스프레드로 바꾸지 않습니다 |

없는 값을 무엇으로 대체할지는 `absence-expose-optional-values-instead-of-silent-fallbacks`가 정합니다.

**Incorrect (타입이 `string`으로 보장한 값을 다시 검사합니다):**

```ts
const toRowLabel = (row: ProductRow): string => {
	if (isNil(row.name)) {
		return row.code;
	}

	return row.name.trim();
};
```

**Correct (타입이 보장하는 조건은 다시 검사하지 않습니다):**

```ts
const toRowLabel = (row: ProductRow): string => {
	return row.name.trim();
};
```

**Incorrect (생략과 `undefined`를 구분하지 않는 내부 계약에서 키를 조건부로 생략합니다):**

```ts
// 이 내부 표시 계약은 stockCount의 undefined 대입을 허용하고 키 존재 여부를 읽지 않는다
return {
	metrics,
	...(stockCount === undefined ? {} : {stockCount}),
};
```

**Correct (생략과 같은 뜻이고 타입도 허용하면 `undefined`를 그대로 넣습니다):**

```ts
// 이 내부 표시 계약은 stockCount의 undefined 대입을 허용하고 키 존재 여부를 읽지 않는다
return {
	metrics,
	stockCount,
};
```

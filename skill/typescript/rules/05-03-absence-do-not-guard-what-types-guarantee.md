---
title: Do Not Guard What the Types Already Guarantee
titleKo: 타입이 보장하는 것을 다시 검사하지 않습니다
impact: MEDIUM
impactDescription: 쓸모없는 방어 분기가 사라져 실제로 없을 수 있는 자리만 코드에 남습니다
appliesWhen:
  - `isNil`, `typeof`, 옵셔널 체이닝으로 값을 검사하는 분기를 추가·변경할 때
  - 선택 필드에 값을 넣으면서 `undefined`를 피하려고 조건부 스프레드를 쓸 때
  - 제외: `unknown`이나 앱 밖에서 온 값을 좁히는 경우
reviewWith: types-narrow-unknown-instead-of-asserting, absence-expose-optional-values-instead-of-silent-fallbacks
tags: absence
---

## Do Not Guard What the Types Already Guarantee

**Impact: MEDIUM (쓸모없는 방어 분기가 사라져 실제로 없을 수 있는 자리만 코드에 남습니다)**

검사는 타입이 못 막는 것에만 씁니다.
`string` 타입에 `isNil`, `number` 타입에 `typeof value === "number"`, 필수 필드에 `?.`는 타입이 이미 답한 질문입니다.
그런 분기는 읽는 사람에게 "여기서 값이 없을 수 있다"는 거짓 신호를 주고, 정말 없을 수 있는 자리를 묻어 버립니다.

| 형태 | 판정 |
| --- | --- |
| `string` 값에 `?.trim()` | 위반 |
| `number` 필드에 `typeof value === "number"` | 위반 |
| 필수 필드에 `isNil(value)` 분기 | 위반 |
| `string \| null` 값에 `isNil(value)` | 통과. 타입이 없을 수 있다고 말합니다 |
| `unknown`이나 앱 밖에서 온 값을 좁힘 | 대상이 아닙니다. `types-narrow-unknown-instead-of-asserting`이 정합니다 |

**선택 필드에는 `undefined`를 그대로 넣습니다.**
`...(isNil(value) ? {} : {value})`로 키를 숨기지 않습니다.
소비처는 선택 필드를 `?.`로 읽으므로 키가 있든 없든 같습니다.
`exactOptionalPropertyTypes`를 켠 프로젝트만 예외입니다.
그때는 `docs-justify-convention-exceptions-with-a-reason-comment`를 따라 이유를 남깁니다.

값이 정말 없을 수 있을 때 무엇을 넣는지는 `absence-expose-optional-values-instead-of-silent-fallbacks`가 정합니다.

**Incorrect (타입이 `string`으로 보장한 값을 다시 검사합니다):**

```ts
const toRowLabel = (row: ProductRow): string => {
	if (isNil(row.name)) {
		return row.code;
	}

	return row.name.trim();
};
```

**Correct (타입이 답한 질문은 다시 묻지 않습니다):**

```ts
const toRowLabel = (row: ProductRow): string => {
	return row.name.trim();
};
```

**Incorrect (선택 필드의 `undefined`를 조건부 스프레드로 숨깁니다):**

```ts
return {
	metrics,
	...(isNil(tamValidity) ? {} : {tamValidity}),
};
```

**Correct (선택 필드에는 `undefined`를 그대로 넣습니다):**

```ts
return {
	metrics,
	tamValidity: isNil(params.tamMetrics) ? undefined : toTamValidity(params.tamMetrics),
};
```

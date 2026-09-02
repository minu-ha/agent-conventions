---
title: Narrow `unknown` Instead of Asserting
titleKo: 단언으로 넘기지 않고 `unknown`을 좁혀서 씁니다
impact: HIGH
impactDescription: 컴파일을 통과시키려고 타입 검사를 끄는 자리가 남지 않습니다
appliesWhen:
  - `as` 단언, `!` `null` 아님 단언, `any`, `@ts-expect-error`를 추가할 때
  - 앱 밖에서 들어온 값을 타입 붙여 쓰기 시작할 때
reviewWith: docs-justify-convention-exceptions-with-a-reason-comment, tooling-configure-biome-to-enforce-these-rules
tags: types, safety
---

## Narrow `unknown` Instead of Asserting

**Impact: HIGH (컴파일을 통과시키려고 타입 검사를 끄는 자리가 남지 않습니다)**

컴파일러를 통과시키려고 `as`, `!`, `any`, `@ts-expect-error`를 쓰지 않습니다.
넷 다 "여기는 검사하지 마라"는 뜻이고, 틀렸을 때 알려 줄 사람이 없습니다.

형태를 모르는 값은 `unknown`으로 받고 좁혀서 씁니다.

| 값의 출처 | 어떻게 |
| --- | --- |
| 앱 밖에서 옴 (`localStorage`, `postMessage`, URL, 검증하지 않은 응답) | 스키마로 검증하고 그 결과에서 타입을 얻습니다 |
| 우리 코드 안에서 옴 | 좁히는 분기를 씁니다. 단언이 필요하면 타입이 잘못 잡힌 것입니다 |
| 외부 패키지 타입이 실제와 다름 | 단언을 쓰되 확인할 수 있는 이유를 바로 위에 남깁니다 |

`as const`와 `satisfies`는 대상이 아닙니다.
값을 넓히지 않게 고정하거나 형태가 맞는지 검사하는 것이라 검사를 끄지 않습니다.

표 셋째 줄의 이유 주석은 `docs-justify-convention-exceptions-with-a-reason-comment` 규칙이 정한 조건을 채워야 합니다.
"타입이 이상해서" 같은 다시 확인할 수 없는 말은 근거가 아닙니다.

`any`와 `!`는 `tooling-configure-biome-to-enforce-these-rules` 규칙이 기계로 막습니다.
`as`와 `@ts-expect-error`는 리뷰가 봅니다.

**Incorrect (앱 밖에서 온 값을 단언으로 통과시킵니다):**

```ts
const storedFilter = JSON.parse(localStorage.getItem("product-filter") as string) as ProductFilter;
```

**Correct (앱 밖에서 온 값은 스키마 결과에서 타입을 얻습니다):**

```ts
const storedValue = localStorage.getItem("product-filter");

// 처음 방문이면 저장된 필터가 없다. 없다는 사실을 그대로 둔다
const storedFilter = storedValue === null ? undefined : productFilterSchema.parse(JSON.parse(storedValue));
```

**Incorrect (`!`로 없을 수 있다는 사실을 지웁니다):**

```ts
const firstProduct = products.find((product) => product.isActive)!;
```

**Correct (없을 수 있으면 그대로 드러냅니다):**

```ts
const firstProduct = products.find((product) => product.isActive);

if (!firstProduct) {
	throw new NoActiveProductError();
}
```

**Incorrect (다시 확인할 수 없는 이유로 검사를 끕니다):**

```ts
// @ts-expect-error 타입이 이상하다
renderTextField(fieldProps);
```

**Correct (외부 패키지 타입이 실제와 달라 확인할 수 있는 이유를 남깁니다):**

```ts
// package.json의 @mui/material 6.1은 TextField 의 slotProps 타입이 htmlInput 을 받지 못한다.
// @mui/material/TextField/TextField.d.ts 선언과 런타임 동작이 다르다.
renderTextField(fieldProps as TextFieldProps);
```

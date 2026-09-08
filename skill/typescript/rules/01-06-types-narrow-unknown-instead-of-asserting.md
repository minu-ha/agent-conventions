---
title: Narrow `unknown` Instead of Asserting
titleKo: 단언으로 넘기지 않고 `unknown`을 좁혀서 씁니다
impact: HIGH
impactDescription: 컴파일을 통과시키려고 타입 검사를 끄는 자리가 남지 않습니다
appliesWhen:
  - `as` 단언, `!` `null` 아님 단언, `any`, `@ts-expect-error`를 추가 · 변경 · 제거할 때
  - 앱 밖에서 들어온 값을 타입 붙여 쓰기 시작할 때
  - 제외: 검증된 내부 값에 `as const`나 `satisfies`만 적용하는 경우
reviewWith: docs-justify-convention-exceptions-with-a-reason-comment, tooling-configure-biome-to-enforce-these-rules
tags: types, safety
---

## Narrow `unknown` Instead of Asserting

**Impact: HIGH (컴파일을 통과시키려고 타입 검사를 끄는 자리가 남지 않습니다)**

형태를 모르는 값은 `unknown`으로 받아 좁힙니다.
컴파일 오류를 없애려고 `as`, `!`, `any`, `@ts-expect-error`로 검사를 우회하지 않습니다.

| 값의 출처 | 처리 |
| --- | --- |
| 앱 밖의 값: 저장소, 메시지, URL, 검증하지 않은 응답 | 스키마로 검증하고 결과에서 타입을 얻습니다 |
| 내부 값 | 분기로 좁히거나 타입 관계가 드러나도록 계약을 고칩니다 |
| 실제 동작과 외부 패키지 타입이 다름 | 단언 바로 위에 확인할 수 있는 이유를 남깁니다 |

| 표기 | 보장하는 것과 한계 |
| --- | --- |
| `as`, `!` | 실행 중 값을 검증하지 않습니다 |
| `any` | 이후 타입 검사를 약화합니다 |
| `@ts-expect-error` | 다음 줄 오류를 억제하며, 해당 오류가 없어지면 오류를 보고합니다 |
| `as const` | 리터럴 추론과 읽기 전용 표기를 유지합니다. 금지 대상이 아닙니다 |
| `satisfies` | 식이 계약에 맞는지 검사합니다. 대상 타입으로 전체를 넓히지는 않지만 문맥 추론에 영향을 줄 수 있습니다 |

`as const`와 `satisfies`는 실행 중 검증이나 객체 동결을 하지 않습니다.
`any` 응답에 `satisfies`를 붙여도 검증되지 않습니다.
`JSON.parse`는 JSON 문법, 스키마는 값의 형태를 검사하며 실패 처리는 기존 호출 경계의 오류 계약을 따릅니다.

예외 주석은 `docs-justify-convention-exceptions-with-a-reason-comment`를 따릅니다.
"타입이 이상해서"는 확인할 수 있는 근거가 아닙니다.
`any`와 `!`는 `tooling-configure-biome-to-enforce-these-rules`로 막고, `as`와 `@ts-expect-error`는 리뷰합니다.

**Incorrect (앱 밖에서 온 값을 단언으로 통과시킵니다):**

```ts
const storedFilter = JSON.parse(localStorage.getItem("product-filter") as string) as ProductFilter;
```

**Correct (앱 밖에서 온 값은 좁히기 함수를 통과한 뒤에 씁니다):**

```ts
const storedValue = localStorage.getItem("product-filter");
const parsedFilter: unknown = storedValue === null ? undefined : JSON.parse(storedValue);

// 처음 방문이면 저장된 필터가 없고 형태가 다르면 쓰지 않는다. 없다는 사실을 그대로 둔다
const storedFilter = isProductFilter(parsedFilter) ? parsedFilter : undefined;
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

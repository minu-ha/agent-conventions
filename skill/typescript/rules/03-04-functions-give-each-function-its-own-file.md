---
title: Give Each Support Function Its Own File
titleKo: 보조 함수는 대표 함수 폴더의 `_` 파일 하나에 하나씩 둡니다
impact: HIGH
impactDescription: 보조 함수를 개별 파일로 관리하고 폴더로 소유 관계를 드러냅니다
appliesWhen:
  - 떼어 낸 보조 함수를 어느 파일이나 폴더에 둘지 정할 때
  - `helper.ts`, `helpers.ts`, `utils.ts` 같은 파일을 만들거나 거기에 함수를 더할 때
  - 대표 함수가 자기만 쓰는 보조를 처음 갖게 될 때
  - 보조를 부르는 대표 함수나 소유자가 늘어날 때
requiresSelected: functions-extract-helpers-only-when-the-boundary-is-real
reviewWith: functions-promote-owner-free-functions-to-root-util, functions-order-declarations-top-down
tags: functions, boundaries
---

## Give Each Support Function Its Own File

**Impact: HIGH (보조 함수를 개별 파일로 관리하고 폴더로 소유 관계를 드러냅니다)**

보조 함수에 이름을 붙일지는 `functions-extract-helpers-only-when-the-boundary-is-real`이 판단합니다.
이름을 붙였다면 함수마다 파일을 하나 두고, 부르는 대표 함수에 따라 배치합니다.

| 호출부 | 위치 |
| --- | --- |
| 대표 함수 하나 | `_function/<대표>/<대표>.ts`와 같은 폴더의 `_<보조>.ts` |
| 같은 소유자의 대표 함수 둘 이상 | `_function/<보조>.ts`. 기존 `_` 접두사를 뗍니다 |
| 다른 소유자 | `functions-promote-owner-free-functions-to-root-util`로 루트 승격 여부를 판단합니다 |

| 배치 대상 | 규범 |
| --- | --- |
| 대표 함수 | 내보낸 함수 하나당 파일 하나이며 파일명은 함수 이름입니다 |
| 대표만 쓰는 보조 | 대표 파일 아래 비공개 `const`로 쌓지 않고 같은 이름 폴더의 `_` 파일로 둡니다 |
| 보조의 보조 | 같은 폴더의 `_` 파일로 둡니다. 하위 폴더를 더 만들지 않습니다 |
| 타입 · 상수 | 이 폴더에 두지 않고 프레임워크 규칙이 정한 소유자의 역할 폴더에 둡니다 |
| `helper.ts`, `helpers.ts`, `utils.ts` | 여러 보조를 모으는 파일로 만들지 않습니다 |

`_` 파일은 같은 폴더에서만 가져옵니다.
대표와 `_` 파일, `_` 파일끼리의 호출은 대표의 내부이며 재노출 사슬이 아닙니다.
루트 `util`끼리의 직접 가져오기도 각 공개 진입점의 출처가 드러나므로 허용합니다.
부르는 대표 함수나 소유자가 늘면 표의 다음 배치를 검토합니다.

**Incorrect (여러 보조를 모은 파일에서 내보낸 함수가 세 단계로 이어집니다):**

```ts
// utils.ts
export const toTrimmedTitle = (title: string) => {
	return title.trim();
};

export const toProductPayload = (values: ProductFormValues) => {
	return {title: toTrimmedTitle(values.title)};
};

export const toProductSaveRequest = (values: ProductFormValues) => {
	return {body: toProductPayload(values)};
};
```

**Correct (소유자 아래 대표 함수 하나에 파일 하나를 둡니다):**

```ts
// page/product-form/_function/to-product-save-request.ts
/**
 * product 저장 요청 조립. 서버가 앞뒤 공백이 붙은 title을 거부한다
 */
export const toProductSaveRequest = (values: ProductFormValues) => {
	return {body: {title: values.title.trim()}};
};
```

**Incorrect (대표 함수 하나만 부르는 보조를 대표 파일 아래 비공개 `const`로 쌓습니다):**

```txt
page/report/_function/
├── to-product-overview.ts
│     toProductOverview      내보낸 함수
│     toTrendChart           toProductOverview 가 차트 둘에서 부름
│     toTrendPoints          toTrendChart 가 두 자리에서 부름
└── to-product-filter-request.ts
```

**Correct (자기만 쓰는 보조가 생긴 대표 함수는 자기 이름 폴더를 갖고 보조는 `_` 파일입니다):**

```txt
page/report/_function/
├── to-product-overview/           자기만 쓰는 보조가 있어 폴더
│   ├── to-product-overview.ts     대표. 폴더와 같은 이름
│   ├── _to-trend-chart.ts         toProductOverview 만 부름
│   └── _to-trend-points.ts        _to-trend-chart 만 부름. 폴더 안은 평평
└── to-product-filter-request.ts   보조가 없어 파일 하나
```

**Incorrect (한 대표만 부르는 보조를 `_function` 바로 아래에 내보내 둡니다):**

```txt
page/report/_function/
├── to-product-overview.ts
├── to-product-digest.ts
└── to-trend-chart.ts            toProductOverview 만 부르는데 소유자의 공개 면에 놓임
```

**Correct (두 대표가 부르게 된 뒤에 `_function` 바로 아래로 올리고 `_`를 뗍니다):**

```txt
page/report/_function/
├── to-product-overview/
│   └── to-product-overview.ts
├── to-product-digest.ts           toTrendChart 를 함께 부르기 시작함
└── to-trend-chart.ts              대표 둘이 불러 공개 면으로 올라옴
```

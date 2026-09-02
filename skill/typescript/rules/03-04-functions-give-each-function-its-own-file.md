---
title: Give Each Support Function Its Own File
titleKo: 보조 함수는 대표 함수 폴더의 `_` 파일 하나에 하나씩 둡니다
impact: MEDIUM-HIGH
impactDescription: 잡동사니 파일이 생기지 않고 보조 함수의 주인이 폴더에서 바로 보입니다
appliesWhen:
  - 떼어 낸 보조 함수를 어느 파일이나 폴더에 둘지 정할 때
  - `helper.ts`, `helpers.ts`, `utils.ts` 같은 파일을 만들거나 거기에 함수를 더할 때
  - 대표 함수가 자기만 쓰는 보조를 처음 갖게 될 때
  - 보조를 부르는 대표 함수나 소유자가 늘어날 때
requiresSelected: functions-extract-helpers-only-when-the-boundary-is-real
reviewWith: functions-promote-shared-functions-to-root-util, functions-order-declarations-top-down
tags: functions, boundaries
---

## Give Each Support Function Its Own File

**Impact: MEDIUM-HIGH (잡동사니 파일이 생기지 않고 보조 함수의 주인이 폴더에서 바로 보입니다)**

이름을 붙일지는 `functions-extract-helpers-only-when-the-boundary-is-real`이 먼저 판정합니다.
이 규칙은 이름 붙인 보조를 어느 파일에 둘지만 봅니다.
루트 `util`로 올릴지는 `functions-promote-shared-functions-to-root-util`이 정합니다.

| 부르는 쪽 | 자리 |
| --- | --- |
| 대표 함수 하나 | 그 대표의 자기 이름 폴더 `_function/<대표>/` 안에 `_<보조>.ts` |
| 같은 소유자의 대표 함수 둘 이상 | `_function` 바로 아래 `<보조>.ts` |
| 다른 소유자 | `functions-promote-shared-functions-to-root-util`이 정합니다 |

- 내보낸 대표 함수 하나당 파일 하나이고, 파일명은 그 함수 이름입니다.
  소유자 아래에 `helper.ts`, `helpers.ts`, `utils.ts` 같은 잡동사니 파일을 만들지 않습니다.
- 자기만 쓰는 보조가 생기면 대표 함수 파일은 자기 이름 폴더로 들어가고 이름은 폴더와 같습니다.
  컴포넌트가 자기만 쓰는 파일을 갖게 되면 자기 이름 폴더가 되는 것과 같은 규칙입니다.
- 대표 함수 파일 아래에 비공개 `const`로 보조를 두지 않습니다.
  이름을 받은 보조는 파일입니다.
- 폴더 안은 평평합니다.
  보조의 보조도 같은 폴더의 `_` 파일이고 그 아래 폴더를 파지 않습니다.
- 타입과 상수는 이 폴더에 두지 않습니다.
  소유자의 역할 폴더로 가고, 그 자리는 프레임워크 컨벤션이 정합니다.

**`_` 파일은 같은 폴더의 파일만 가져옵니다.**
컴포넌트의 `_` 파일과 같은 표식입니다.
대표 함수가 자기 폴더의 `_` 파일을 부르는 것도, `_` 파일끼리 부르는 것도 사슬이 아니라 대표 함수의 내부입니다.

**승격은 부르는 쪽이 늘 때 한 번씩입니다.**
같은 소유자의 다른 대표 함수가 부르게 되면 `_function` 바로 아래로 옮기고 `_`를 뗍니다.
다른 소유자가 부르게 되면 루트 `util` 승격 규칙을 따릅니다.
루트 `util` 함수가 다른 루트 `util` 함수를 가져오는 것은 사슬이 아닙니다.
둘 다 공개 진입점이고, 가져오는 줄에서 어느 종류 폴더의 무엇인지 그대로 읽힙니다.

**Incorrect (잡동사니 파일에서 내보낸 함수가 세 단계로 이어집니다):**

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
├── to-sales-overview.ts
│     toSalesOverview      내보낸 함수
│     toTrendChart         toSalesOverview 가 차트 둘에서 부름
│     toTrendPoints        toTrendChart 가 두 자리에서 부름
└── to-sales-filter-request.ts
```

**Correct (자기만 쓰는 보조가 생긴 대표 함수는 자기 이름 폴더를 갖고 보조는 `_` 파일입니다):**

```txt
page/report/_function/
├── to-sales-overview/           자기만 쓰는 보조가 있어 폴더
│   ├── to-sales-overview.ts     대표. 폴더와 같은 이름
│   ├── _to-trend-chart.ts       toSalesOverview 만 부름
│   └── _to-trend-points.ts      _to-trend-chart 만 부름. 폴더 안은 평평
└── to-sales-filter-request.ts   보조가 없어 파일 하나
```

**Incorrect (한 대표만 부르는 보조를 `_function` 바로 아래에 내보내 둡니다):**

```txt
page/report/_function/
├── to-sales-overview.ts
├── to-sales-digest.ts
└── to-trend-chart.ts            toSalesOverview 만 부르는데 소유자의 공개 면에 놓임
```

**Correct (두 대표가 부르게 된 뒤에 `_function` 바로 아래로 올리고 `_`를 뗍니다):**

```txt
page/report/_function/
├── to-sales-overview/
│   └── to-sales-overview.ts
├── to-sales-digest.ts           toTrendChart 를 함께 부르기 시작함
└── to-trend-chart.ts            대표 둘이 불러 공개 면으로 올라옴
```

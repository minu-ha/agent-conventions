---
title: Give Each Support Function Its Own File
titleKo: 보조 함수는 파일 하나에 하나만 내보냅니다
impact: MEDIUM-HIGH
impactDescription: 잡동사니 파일이 생기지 않고 내보낸 함수끼리 사슬을 이루지 않습니다
appliesWhen:
  - 떼어 낸 보조 함수를 어느 파일이나 폴더에 둘지 정할 때
  - `helper.ts`, `helpers.ts`, `utils.ts` 같은 파일을 만들거나 거기에 함수를 더할 때
  - 내보낸 함수가 다른 내보낸 함수를 부르게 될 때
requiresSelected: functions-extract-helpers-only-when-the-boundary-is-real
reviewWith: functions-promote-shared-functions-to-root-util, functions-order-declarations-top-down
tags: functions, boundaries
---

## Give Each Support Function Its Own File

**Impact: MEDIUM-HIGH (잡동사니 파일이 생기지 않고 내보낸 함수끼리 사슬을 이루지 않습니다)**

떼어 낼지는 `functions-extract-helpers-only-when-the-boundary-is-real`이 먼저 판정합니다.
이 규칙은 그 결과를 어느 파일에 둘지만 봅니다.
루트 `util`로 올릴지는 `functions-promote-shared-functions-to-root-util`이 정합니다.

- 소유자 아래에 `helper.ts`, `helpers.ts`, `utils.ts` 같은 잡동사니 파일을 만들지 않습니다.
  어느 폴더에 둘지는 프레임워크 컨벤션의 역할 폴더 규칙이 정합니다.
- 내보낸 대표 함수 하나당 파일 하나이고, 파일명은 그 함수 이름입니다.
- 내보내는 단계는 파일마다 하나이고, 그 아래 단계는 모두 같은 파일의 비공개 함수로 둡니다.

**전용 보조가 파일로 나가면 대표 함수는 자기 이름 폴더를 갖습니다.**
나간 파일은 그 폴더 안에 둡니다.

**내보낸 함수가 내보낸 함수를 타고 가는 사슬은 자기 폴더 밖에서 만들지 않습니다.**

| 가져오기 | 판정 |
| --- | --- |
| 대표 함수가 자기 폴더 안 파일을 부름 | 사슬이 아니라 그 함수의 내부입니다. 자기 폴더 안 파일을 가져오는 것은 그 대표 함수뿐입니다 |
| 다른 파일도 그 폴더 안 파일을 부르게 됨 | 재사용이 생긴 것이니 `_function` 바로 아래로 꺼냅니다 |
| 루트 `util` 함수가 다른 루트 `util` 함수를 가져옴 | 사슬이 아닙니다. 둘 다 공개 진입점이고, 가져오는 줄에서 어느 종류 폴더의 무엇인지 그대로 읽힙니다 |

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

**Incorrect (보조 모듈 안에서 내보낸 함수가 내보낸 함수를 타고 갑니다):**

```ts
// report-support.ts
export const toTrendChart = (readings: SalesReading[]) => {
	// ...
};

export const toSalesFilterRequest = (filter: SalesFilter) => {
	// ...
};

export const toSalesOverview = (readings: SalesReading[]) => {
	return {chart: toTrendChart(readings)};
};
```

**Correct (전용 보조가 나간 대표 함수는 자기 이름 폴더를 가집니다):**

```txt
page/report/_function/
├── to-sales-overview/
│   ├── to-sales-overview.ts   대표 함수. 자기 폴더 안 파일을 조립
│   └── to-trend-chart.ts      이 폴더 밖에서는 가져오지 않음
└── to-sales-filter-request.ts
```

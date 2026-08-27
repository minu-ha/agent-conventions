---
title: Place and Promote Support Functions Deliberately
titleKo: 보조 함수는 한 파일에 하나만 내보내고 프로젝트 전반이 쓸 때만 루트 `util`로 올립니다
impact: MEDIUM-HIGH
impactDescription: 잡동사니 파일이 생기지 않고 루트 `util`에 한 소유자의 함수가 섞이지 않습니다
appliesWhen:
  - 보조 함수를 어느 파일이나 폴더에 둘지 정할 때
  - 파일 안에서 내보낸 함수와 비공개 보조의 선언 순서를 정할 때
  - 루트 `util` 폴더로 파일을 옮기거나 종류 폴더를 새로 만들 때
requiresSelected: functions-extract-helpers-only-when-the-boundary-is-real
tags: functions, boundaries
---

## Place and Promote Support Functions Deliberately

**Impact: MEDIUM-HIGH (잡동사니 파일이 생기지 않고 루트 `util`에 한 소유자의 함수가 섞이지 않습니다)**

떼어 낼지는 `functions-extract-helpers-only-when-the-boundary-is-real`이 먼저 판정합니다.
이 규칙은 그 결과를 어디 두고 언제 올릴지만 봅니다.

- 소유자 아래에 `helper.ts`, `helpers.ts`, `utils.ts` 같은 잡동사니 파일을 만들지 않습니다.
  어느 폴더에 둘지는 프레임워크 컨벤션의 역할 폴더 규칙이 정합니다.
- 내보낸 대표 함수 하나당 파일 하나이고, 파일명은 그 함수 이름입니다.
  전용 보조가 파일로 나가면 대표 함수는 자기 이름 폴더를 갖고, 나간 파일은 그 안에 둡니다.
  루트 `util`도 같습니다.
- 호출 깊이는 파일마다 내보낸 함수 하나, 그 파일 안 비공개 함수까지 두 단계로 끝냅니다.
  단계가 더 필요하면 먼저 같은 파일의 비공개 함수로 두고,
  파일로 나갈지는 `functions-extract-helpers-only-when-the-boundary-is-real`의 사유가 정합니다.

**파일 안 선언 순서는 위에서 아래로 읽히는 방향입니다.**

1. import
2. 내보낸 계약 타입
3. 내보낸 대표 함수
4. 비공개 보조. 부르는 쪽을 위에, 불리는 쪽을 아래에 둡니다

함수 본문 속 참조는 호출 시점에 해석되므로 불리는 쪽이 아래 있어도 됩니다.
모듈을 불러올 때 값이 계산되는 선언만 순서를 타고, 자기가 부르는 선언 뒤에 둡니다.

**내보낸 함수가 내보낸 함수를 타고 가는 사슬은 자기 폴더 밖에서 만들지 않습니다.**

| 가져오기 | 판정 |
| --- | --- |
| 대표 함수가 자기 폴더 안 파일을 부름 | 사슬이 아니라 그 함수의 내부입니다. 자기 폴더 안 파일을 가져오는 것은 그 대표 함수뿐입니다 |
| 다른 파일도 그 폴더 안 파일을 부르게 됨 | 재사용이 생긴 것이니 `_function` 바로 아래로 꺼냅니다 |
| 루트 `util` 함수가 다른 루트 `util` 함수를 가져옴 | 사슬이 아닙니다. 둘 다 공개 진입점이고, 가져오는 줄에서 어느 종류 폴더의 무엇인지 그대로 읽힙니다 |

**루트 `util`은 프로젝트가 소유자인 함수 폴더입니다.**
파일 하나에 함수 하나, 전용 보조는 자기 이름 폴더라는 규칙은 소유자 아래와 같습니다.
다른 점은 폴더 한 겹입니다.
함수가 많아 종류 폴더로 묶습니다.

- 종류는 함수가 받는 값의 타입입니다.
  `date`, `money`, `string`, `array`, `dom`, `url`이 그 이름입니다.
- 도메인 타입도 값의 타입입니다.
  `Spread`를 받는 함수는 `util/spread/`에 둡니다.
- 화면이나 기능 이름으로는 짓지 않습니다.
  받는 값의 타입으로 종류를 짓지 못하면 그 함수는 `util`이 아니라 소유자 함수입니다.
- 소유자 아래 `_function` 폴더에는 종류 폴더를 두지 않습니다.
  함수가 몇 개라 파일 목록으로 충분합니다.

**루트 승격은 그 함수가 누구 것인지로 판정합니다.**

가르는 법은 소유자를 지워 보는 것입니다.
소유자를 지웠을 때 함수도 사라지면 그 소유자 것입니다.

- 소유자와 함께 사라지면 그 소유자 아래에 둡니다.
  profile 저장 화면이 없어지면 `toProfileSaveRequest`가 조립할 요청도 없습니다.
- 소유자를 지워도 남으면 지금 한 곳만 써도 올립니다.
  `toDisplayDate`는 소유자가 하나든 셋이든 `util/date/`에 둘 함수입니다.

두 소유자가 같은 함수를 써야 하면 셋 중 하나로 해소합니다.

1. 표시까지 같으면 `widget` 컴포넌트가 소유합니다.
2. 계산만 같으면 각 소유자가 각자 갖습니다.
3. 프로젝트 전반의 계산이면 루트 `util`로 올립니다.

1번은 함수를 공유하는 것이 아니라 표시를 공유하는 것입니다.
어느 레이어인지는 프레임워크 컨벤션의 레이어 규칙이 판정합니다.

쓰는 곳이 늘거나 줄어도 자리는 그대로입니다.
개수로 판정하면 쓰임이 변할 때마다 함수가 자리를 옮겨 다닙니다.
나중에 쓸 것 같아서 함수를 미리 만들지도 않습니다.

**Incorrect (잡동사니 파일과 내보낸 함수 세 단계 사슬):**

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

**Incorrect (보조 모듈 안에서 내보낸 함수가 내보낸 함수를 타고 감):**

```ts
// profile-support.ts
export const toProfileValues = (formValues: ProfileFormValues) => {
	// ...
};

export const toAvatarRequests = (files: UploadFile[]) => {
	// ...
};

export const toProfileSaveRequest = (
	formValues: ProfileFormValues,
	files: UploadFile[],
) => {
	return {
		...toProfileValues(formValues),
		avatarRequests: toAvatarRequests(files),
	};
};
```

**Incorrect (소유자와 함께 사라질 함수를 루트 `util`로 올림):**

```ts
// util/profile/to-profile-save-request.ts
// profile은 값의 종류가 아니라 화면 이름이다. 화면이 없어지면 이 요청도 없다
/**
 * 서버가 앞뒤 공백이 붙은 displayName을 거부한다
 */
export const toProfileSaveRequest = (values: ProfileFormValues) => {
	return {body: {displayName: values.displayName.trim()}};
};
```

**Correct (소유자 아래 대표 함수 하나당 파일 하나):**

```ts
// page/product-form/_function/to-product-save-request.ts
/**
 * product 저장 요청 조립. 서버가 앞뒤 공백이 붙은 title을 거부한다
 */
export const toProductSaveRequest = (values: ProductFormValues) => {
	return {body: {title: values.title.trim()}};
};
```

**Correct (내보낸 함수가 맨 위, 불리는 쪽이 호출자 아래로 이어짐):**

```ts
// page/report/_function/to-summary-rows.ts
/**
 * 요약 표가 그리는 행 목록. 이름이 비면 코드로 표시한다
 */
export const toSummaryRows = (response: SalesSummaryResponse): SummaryRow[] => {
	return response.items.map(toSummaryRow);
};

const toSummaryRow = (item: SalesSummaryItem): SummaryRow => {
	return {id: item.id, label: toSummaryLabel(item)};
};

const toSummaryLabel = (item: SalesSummaryItem): string => {
	return item.name.trim() || item.code;
};
```

**Correct (전용 보조가 나간 대표 함수는 자기 이름 폴더를 가짐):**

```txt
page/report/_function/
├── to-sales-overview/
│   ├── to-sales-overview.ts   대표 함수. 자기 폴더 안 파일을 조립
│   └── to-trend-chart.ts      이 폴더 밖에서는 가져오지 않음
└── to-sales-filter-request.ts
```

**Correct (소유자를 지워도 남는 함수는 종류 폴더에 파일 하나로 올림):**

```txt
util/
├── date/
│   ├── to-display-date.ts
│   └── to-display-date.test.ts
└── money/
    └── to-signed-amount.ts
```

```ts
// util/date/to-display-date.ts
/**
 * ko-KR로 고정한다. 사용자 로케일을 따라가면 목록 정렬 기준과 어긋난다
 */
export const toDisplayDate = (value: string): string => {
	return new Date(value).toLocaleDateString("ko-KR");
};
```

```ts
// util/money/to-signed-amount.ts
/**
 * 금액 표시는 화면마다 다르지 않다. 소수 두 자리와 부호를 고정한다
 */
export const toSignedAmount = (amount: Amount): string => {
	const sign = amount.value < 0 ? "-" : "+";
	return `${sign}$${Math.abs(amount.value).toFixed(2)}`;
};
```

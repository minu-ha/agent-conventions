---
title: Order Declarations Top Down
titleKo: 파일 안 선언은 위에서 아래로 읽히게 놓습니다
impact: MEDIUM
impactDescription: 파일을 열면 내보낸 함수가 먼저 보이고 부르는 쪽에서 불리는 쪽으로 이어집니다
appliesWhen:
  - `.ts` 파일에 선언을 추가하거나 선언 자리를 옮길 때
  - 내보낸 계약 타입이나 모듈 상수를 내보낸 함수보다 아래에 두려 할 때
  - 제외: 리액트 컴포넌트 본문 안 선언 자리를 바꾸는 경우
tags: functions, ordering
---

## Order Declarations Top Down

**Impact: MEDIUM (파일을 열면 내보낸 함수가 먼저 보이고 부르는 쪽에서 불리는 쪽으로 이어집니다)**

파일을 여는 사람은 그 파일이 무엇을 내보내는지부터 찾습니다.
그래서 내보낸 것을 맨 위에 둡니다.
그 아래로는 부르는 차례대로 이어 놓습니다.

1. `import`
2. 내보낸 계약 타입
3. 내보낸 대표 함수
4. 모듈을 불러올 때 계산되는 선언. 부르는 쪽을 위에, 불리는 쪽을 아래에 둡니다

함수 본문 속 참조는 호출 시점에 해석되므로 불리는 쪽이 아래 있어도 됩니다.
모듈을 불러올 때 값이 계산되는 선언만 순서를 탑니다.
그런 선언은 자기가 부르는 선언 뒤에 둡니다.

컴포넌트 본문 안에서 훅, 핸들러, 이펙트를 어떤 순서로 둘지는 프레임워크 컨벤션이 정합니다.

**Incorrect (내보낸 계약 타입이 함수 아래에 있어 시그니처를 읽으려면 파일을 끝까지 내려가야 합니다):**

```ts
// page/report/_function/to-summary-rows.ts
export const toSummaryRows = (params: ToSummaryRowsParams): SummaryRow[] => {
	return params.response.items.map((item) => ({id: item.id, label: item.name.trim() || item.code}));
};

/**
 * 요약 표 행을 만들 때 필요한 입력
 */
export interface ToSummaryRowsParams {
	/**
	 * 요약 조회 응답
	 */
	response: SalesSummaryResponse;
}
```

**Correct (내보낸 계약 타입이 먼저, 그 계약을 받는 함수가 바로 아래에 옵니다):**

```ts
// page/report/_function/to-summary-rows.ts
/**
 * 요약 표 행을 만들 때 필요한 입력
 */
export interface ToSummaryRowsParams {
	/**
	 * 요약 조회 응답
	 */
	response: SalesSummaryResponse;
}

/**
 * 요약 표가 그리는 행 목록. 이름이 비면 코드로 표시한다
 */
export const toSummaryRows = (params: ToSummaryRowsParams): SummaryRow[] => {
	return params.response.items.map((item) => ({id: item.id, label: item.name.trim() || item.code}));
};
```

**Incorrect (모듈을 불러올 때 계산되는 선언이 자기가 부르는 선언보다 위에 있습니다):**

```ts
export const toCycleOffsets = (): number[] => {
	return cycle_offsets;
};

const cycle_offsets = toOffsetTable();

const toOffsetTable = (): number[] => {
	return [0, 31, 59];
};
```

**Correct (모듈을 불러올 때 계산되는 선언은 자기가 부르는 선언 뒤에 둡니다):**

```ts
/**
 * 지원하는 로케일인지 판정
 */
export const isSupportedLocale = (locale: string): boolean => {
	return supported_locale_set.has(locale);
};

const toSupportedLocaleSet = (): Set<string> => {
	return new Set(Object.keys(locale_label));
};

const supported_locale_set = toSupportedLocaleSet();
```

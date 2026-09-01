---
title: Order Declarations Top Down
titleKo: 파일 안 선언은 위에서 아래로 읽히게 놓습니다
impact: MEDIUM
impactDescription: 파일을 열면 내보낸 함수가 먼저 보이고 부르는 쪽에서 불리는 쪽으로 이어집니다
appliesWhen:
  - `.ts` 파일에 선언을 추가하거나 선언 자리를 옮길 때
  - 비공개 보조를 내보낸 함수보다 위에 두려 할 때
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
4. 비공개 보조. 부르는 쪽을 위에, 불리는 쪽을 아래에 둡니다

함수 본문 속 참조는 호출 시점에 해석되므로 불리는 쪽이 아래 있어도 됩니다.
모듈을 불러올 때 값이 계산되는 선언만 순서를 탑니다.
그런 선언은 자기가 부르는 선언 뒤에 둡니다.

컴포넌트 본문 안에서 훅, 핸들러, 이펙트를 어떤 순서로 둘지는 프레임워크 컨벤션이 정합니다.

**Incorrect (비공개 보조가 내보낸 함수보다 위에 있어 파일을 끝까지 읽어야 합니다):**

```ts
const toSummaryLabel = (item: SalesSummaryItem): string => {
	return item.name.trim() || item.code;
};

const toSummaryRow = (item: SalesSummaryItem): SummaryRow => {
	return {id: item.id, label: toSummaryLabel(item)};
};

/**
 * 요약 표가 그리는 행 목록. 이름이 비면 코드로 표시한다
 */
export const toSummaryRows = (response: SalesSummaryResponse): SummaryRow[] => {
	return response.items.map(toSummaryRow);
};
```

**Correct (파일을 열었을 때 읽히는 차례입니다):**

```txt
to-summary-rows.ts
├ import
├ export interface SummaryRow     내보낸 계약 타입
├ export const toSummaryRows      내보낸 대표 함수
├ const toSummaryRow              대표 함수가 부르는 쪽
└ const toSummaryLabel            그 아래가 부르는 쪽
```

**Correct (내보낸 함수가 맨 위, 불리는 쪽이 호출자 아래로 이어집니다):**

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

**Correct (모듈을 불러올 때 계산되는 선언은 자기가 부르는 선언 뒤에 둡니다):**

```ts
export const toCycleOffsets = (): number[] => {
	return cycle_offsets;
};

const toOffsetTable = (): number[] => {
	return [0, 31, 59];
};

const cycle_offsets = toOffsetTable();
```

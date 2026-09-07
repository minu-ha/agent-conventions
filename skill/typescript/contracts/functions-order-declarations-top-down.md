# Order Declarations Top Down

**Impact: MEDIUM (파일을 열면 내보낸 함수가 먼저 보이고 부르는 쪽에서 불리는 쪽으로 이어집니다)**

내보낸 계약과 대표 함수를 먼저 보여 주되, 모듈 초기화 시 필요한 선언 순서를 지킵니다.

| 순서 | 선언 |
| --- | --- |
| 1 | `import` |
| 2 | 내보낸 계약 타입 |
| 3 | 내보낸 대표 함수 |
| 4 | 모듈을 불러올 때 계산하는 선언. 필요한 선언이 먼저 초기화되어야 합니다 |

함수 본문 참조는 호출 시점에 읽으므로 모듈 초기화가 끝난 뒤 부르면 참조 대상이 아래에 있어도 됩니다.
즉시 계산하는 선언은 자기가 부르는 선언 뒤에 둡니다.
컴포넌트 본문의 훅·핸들러·이펙트 순서는 프레임워크 컨벤션이 정합니다.

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

> 나머지 예시·예외는 [full rule](../rules/03-05-functions-order-declarations-top-down.md)에 있습니다.

---
title: Extract Support Functions Only When the Boundary Is Real
titleKo: 보조 함수는 재사용되거나 삼항에 담기지 않는 분기일 때만 이름을 붙입니다
impact: MEDIUM
impactDescription: 흐름을 읽으려고 함수와 파일을 왕복하게 만드는 조각내기를 막습니다
appliesWhen:
  - 보조 함수를 빼내거나 옮기거나 내보내거나 공유할 때
  - 범용 보조 파일, 소유자 하나만 쓰는 변환 함수, 자잘한 정리 단계의 경계를 바꿀 때
reviewWith: >-
  functions-give-each-function-its-own-file, values-decide-once-and-carry-the-result,
  docs-require-header-jsdoc-on-key-declarations
tags: functions, boundaries
---

## Extract Support Functions Only When the Boundary Is Real

**Impact: MEDIUM (흐름을 읽으려고 함수와 파일을 왕복하게 만드는 조각내기를 막습니다)**

기본은 빼지 않는 것입니다.
흐름은 함수 하나 안에서 위에서 아래로 읽히는 편이 낫습니다.
보조 함수에 이름을 붙이는 사유는 셋뿐입니다.

| 사유 | 조건 |
| --- | --- |
| 재사용 | **이 변경을 적용한 뒤의 코드**에서 두 자리 이상이 실제로 부릅니다. 같은 파일 안의 두 자리도, 서로 다른 파일 둘도 같습니다 |
| 렌더 파일 밖으로 | `.tsx` 안의 **요청·저장 payload 조립** 함수입니다. 훅·JSX·컴포넌트 상태를 하나도 쓰지 않으면 사용처가 하나여도 `.ts`로 옮깁니다 |
| 함수 형태로만 되는 것 | 이른 반환이 셋 이상인 판정, `value is T` 타입 가드, 재귀입니다. 중첩 삼항과 `let` 재할당은 `functions-avoid-imperative-assembly-in-wide-scopes`가 막고, 타입 가드와 재귀는 이름 없이는 쓸 수 없습니다 |

한 자리에서만 쓰는 단계는 호출부에 그대로 적습니다.
단계가 길면 `docs-keep-body-comments-for-intent-and-steps`가 정한 `// 1.` 단계 주석으로 구간을 나눕니다.
판정이 복잡하다는 이유로 이름을 붙이지 않습니다.
판정의 이유는 주석이 말합니다.
분기가 셋 이상이라 삼항 하나에 담기지 않을 때만 세 번째 사유로 이름을 받습니다.
분기가 둘이면 삼항 하나로 호출부에 씁니다.
`value is T`로 좁히는 함수는 인라인하면 좁힘이 사라지므로 한 줄이어도 이름을 받습니다.

두 번째 사유는 재사용이 아니라 `.tsx`에 렌더가 아닌 코드를 남기지 않으려는 것입니다.
`.ts` 안에서는 해당하지 않습니다.
옮길 자리는 같은 소유자 폴더의 `.ts`입니다.
어느 하위 폴더인지는 프레임워크 컨벤션의 역할 폴더 규칙이 정합니다.
**표시용 가공은 여기에 해당하지 않습니다.**
목록을 화면 모양으로 바꾸거나 문자열을 조립하는 것은 쓰는 자리에 그대로 둡니다.
밖으로 내는 것은 서버로 보낼 값을 만드는 함수뿐입니다.

어느 사유든 그 함수만 따로 읽어도 뜻이 통해야 합니다.
바깥 변수, 훅, 컴포넌트 상태에 기대면 아직 뺄 수 없습니다.

사유가 아닌 것:

- **"나중에 또 쓸 것 같아서".** 그때 가서 뺍니다.
- **함수가 길어서.** 길이는 단계 주석으로 나눕니다.
  이름을 붙여 밖으로 내면 읽는 사람이 그 이름을 따라 자리를 옮겨야 합니다.

같은 판정을 두 자리에서 하고 있어 재사용 사유가 생길 것 같으면 먼저 `values-decide-once-and-carry-the-result`를 봅니다.
판정을 한 번만 하면 부르는 자리가 하나로 줄어 사유가 사라지는 경우가 많습니다.

사유와 무관하게 이름 붙이지 않는 것:

- 본문이 한 줄인 계산. 두 자리 이상에서 써도 그 자리마다 그대로 적습니다
- `.map()` 콜백 하나에만 쓰이는 변환
- 선택 값 보정, 라벨 기본값 같은 자잘한 정리 단계

이름 붙인 보조를 어디에 둘지는 `functions-give-each-function-its-own-file`이 정하고,
루트 `util`로 올릴지는 `functions-promote-shared-functions-to-root-util`이 정합니다.

**Incorrect (한 자리에서만 쓰는 단계를 함수로 떼어 내 흐름이 파일 안에서 흩어집니다):**

```txt
page/report/_function/to-metrics-content.ts
  toMetricsContent       내보낸 함수. 본문은 세 줄이고 나머지는 아래 함수로 갔다
  toComparisonRows       toMetricsContent 만 부름
  toMeaningGroups        toMetricsContent 만 부름
  toValidityCard         toMetricsContent 만 부름
  formatMeaningDecimal   toComparisonRows 와 toMeaningGroups 가 부름
```

**Correct (한 자리 단계는 호출부에 단계 주석으로 남고 두 자리 이상이 부르는 것만 이름을 받습니다):**

```txt
page/report/_function/to-metrics-content/
├── to-metrics-content.ts        본문 안에 // 1. 비교 행  // 2. 의미 그룹  // 3. 유효성 카드
└── _format-meaning-decimal.ts   비교 행과 의미 그룹 두 자리가 부름
```

```ts
// page/report/_function/to-metrics-content/to-metrics-content.ts
/**
 * 상세 수치와 통계 의미 영역의 표시 데이터. 실시간 상세만 TAM 유효성 카드가 온다
 */
export const toMetricsContent = (params: ToMetricsContentParams): MetricsContent => {
	// 1. 선택 window 기준으로 갱신되는 비교 수치 행
	const metrics = [
		{id: "statCorr", label: "상관계수 평균", value: formatMeaningDecimal(params.selectionInfo.avgCorr)},
		{id: "statP", label: "통계적 유의성", value: params.selectionInfo.statP},
	];

	// 2. 통계 의미 그룹. 설명이 비면 그룹 제목만 남긴다
	const statMeaningGroups = [
		{id: "statistical-significance", title: "패턴의 통계적 의미", description: params.selectionInfo.statDesc, rows: metrics},
	];

	// 3. TAM 유효성 카드. 실시간 상세에서만 온다
	return {metrics, statMeaningGroups, tamValidity: params.tamMetrics};
};
```

**Incorrect (한 번만 쓰는 한 줄 계산을 파일로 분리합니다):**

```ts
// page/profile/_function/get-next-iteration.ts
export const getNextIteration = (previous: number, iterationCount: number): number => {
	return (previous + 1) % iterationCount;
};
```

**Correct (작은 계산은 쓰는 자리에 그대로 둡니다):**

```tsx
// page/profile/pg-profile.tsx
const handleNextClick = () => {
	setIteration((previous) => (previous + 1) % iterationCount);
};
```

**Correct (`.map()` 콜백 하나에만 쓰이는 변환은 그 자리에 둡니다):**

```ts
// page/product/_function/to-product-view.ts: 목록과 상세 두 파일이 부른다
/**
 * product 표시 모델 조립. 라벨 이름이 비면 코드를 보여 준다
 */
export const toProductView = (record: RecordItem): ProductView => {
	return {
		id: record.id,
		labels: record.labels.map((label) => label.name.trim() || label.code),
	};
};
```

**Correct (서로 다른 파일 둘이 이미 부르는 순수 함수를 뺍니다):**

```ts
// page/profile/_function/to-profile-save-request.ts
/**
 * profile 저장 payload 조립. 서버가 앞뒤 공백이 붙은 displayName을 거부한다
 */
export const toProfileSaveRequest = (formValues: ProfileFormValues) => {
	return {
		displayName: formValues.displayName.trim(),
	};
};
```

```tsx
// page/profile/_pg-profile-form.tsx와 page/profile/_pg-profile-drawer.tsx가 함께 부른다
import {toProfileSaveRequest} from "@/page/profile/_function/to-profile-save-request";
```

**Correct (`.tsx` 안의 순수 조립 함수는 사용처가 하나여도 형제 `.ts`로 냅니다):**

```ts
// page/products/_function/to-product-save-request.ts
/**
 * product 저장 요청 조립. 업로드가 끝난 첨부만 넘겨야 attachmentIds가 채워진다
 */
export const toProductSaveRequest = (formValues: ProductFormValues) => {
	return {
		title: formValues.title.trim(),
		categoryId: formValues.categoryId,
		attachmentIds: formValues.attachments.map((attachment) => attachment.id),
	};
};
```

```tsx
// page/products/pg-products.tsx 하나만 부르지만 훅도 JSX도 쓰지 않는 계산이다
import {toProductSaveRequest} from "@/page/products/_function/to-product-save-request";
```

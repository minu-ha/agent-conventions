---
title: Extract Support Functions Only When the Boundary Is Real
titleKo: 경계가 실재할 때만 보조 함수를 뺍니다
impact: MEDIUM
impactDescription: 흐름을 읽으려고 파일을 왕복하게 만드는 조각내기를 막습니다
appliesWhen:
  - 보조 함수를 빼내거나 옮기거나 내보내거나 공유할 때
  - 범용 보조 파일, 소유자 하나만 쓰는 변환 함수, 자잘한 정리 단계의 경계를 바꿀 때
reviewWith: functions-give-each-function-its-own-file, docs-require-header-jsdoc-on-key-declarations
tags: functions, boundaries
---

## Extract Support Functions Only When the Boundary Is Real

**Impact: MEDIUM (흐름을 읽으려고 파일을 왕복하게 만드는 조각내기를 막습니다)**

기본은 빼지 않는 것입니다.
흐름은 한 자리에서 위에서 아래로 읽히는 편이 낫습니다.
빼는 사유는 셋뿐입니다.
셋 중 하나에 해당해야 뺍니다.

| 사유 | 조건 |
| --- | --- |
| 재사용 | **이 변경을 적용한 뒤의 트리**에서 서로 다른 파일 둘 이상이 실제로 부릅니다. 사용처를 나중에 추가할 계획만 있으면 세지 않습니다 |
| 렌더 파일 밖으로 | `.tsx` 안의 **요청·저장 payload 조립** 함수입니다. 훅·JSX·컴포넌트 상태를 하나도 쓰지 않으면 사용처가 하나여도 `.ts`로 옮깁니다 |
| 전용 보조 | 같은 파일에서 그 함수만 부르는 보조가 **둘 이상** 딸려 있습니다. 전용 보조는 새 파일 안에 비공개로 따라갑니다 |

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

- **같은 파일 안에서 몇 번 불리는지.** 부르는 횟수는 세지 않습니다.
  같은 계산을 두세 번 적어도 괜찮습니다. 세는 것은 전용 보조가 몇 개 딸렸는지뿐입니다.
  파일을 하나 더 여는 쪽이 더 비쌉니다.
- **"나중에 또 쓸 것 같아서".** 그때 가서 뺍니다.

전용 보조 사유는 반대 방향의 넘침을 막습니다.
단계가 다시 단계를 거느리기 시작하면 한 파일이 계속 자랍니다.
그때부터는 한 파일에 계속 두는 쪽이 더 비쌉니다.

사유와 무관하게 빼지 않는 것:

- 본문이 한 줄인 계산
- `.map()` 콜백 하나에만 쓰이는 변환
- 선택 값 보정, 라벨 기본값 같은 자잘한 정리 단계

뺀 다음 어디 둘지는 `functions-give-each-function-its-own-file`이 정하고,
루트 `util`로 올릴지는 `functions-promote-shared-functions-to-root-util`이 정합니다.

**Incorrect (전용 보조가 딸린 단계를 한 파일에 계속 쌓습니다):**

```txt
page/report/_function/to-sales-overview.ts
  toSalesOverview          내보낸 함수
  toSummaryBand            내보낸 함수만 부름. 전용 보조 없음
  toTrendChart             내보낸 함수만 부름. 전용 보조 셋이 딸림
  toTrendBasePoints        toTrendChart만 부름
  toTrendBaseLabel         toTrendChart만 부름
  toTrendPoints            toTrendChart만 부름
```

**Correct (전용 보조가 딸린 단계만 자기 파일로 나갑니다):**

```txt
page/report/_function/to-sales-overview/
├── to-sales-overview.ts   내보낸 함수와 toSummaryBand가 남음
└── to-trend-chart.ts      전용 보조 셋을 비공개로 품음
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
// page/product/_function/to-product-view.ts
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


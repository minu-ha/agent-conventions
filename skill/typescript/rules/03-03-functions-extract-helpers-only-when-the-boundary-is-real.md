---
title: Extract Support Functions Only When the Boundary Is Real
titleKo: 재사용이 생기거나 렌더 파일 밖으로 낼 때만 보조 함수를 뺍니다
impact: MEDIUM
impactDescription: 흐름을 읽으려고 파일을 왕복하게 만드는 조각내기를 막습니다
appliesWhen:
  - 보조 함수를 빼내거나 옮기거나 내보내거나 공유할 때
  - 범용 보조 파일, 소유자 하나만 쓰는 변환 함수, 자잘한 정리 단계의 경계를 바꿀 때
reviewWith: functions-place-and-promote-support-functions, docs-require-header-jsdoc-on-key-declarations
tags: functions, boundaries
---

## Extract Support Functions Only When the Boundary Is Real

**Impact: MEDIUM (흐름을 읽으려고 파일을 왕복하게 만드는 조각내기를 막습니다)**

기본은 빼지 않는 것입니다.
흐름은 한 자리에서 위에서 아래로 읽히는 편이 낫습니다.
빼는 사유는 둘뿐입니다.
둘 중 하나에 해당해야 뺍니다.

| 사유 | 조건 |
| --- | --- |
| 재사용 | **이 변경을 적용한 뒤의 트리**에서 서로 다른 파일 둘 이상이 실제로 부릅니다. 사용처를 나중에 추가할 계획만 있으면 세지 않습니다 |
| 렌더 파일 밖으로 | `.tsx` 안의 **요청·저장 payload 조립** 함수입니다. 훅·JSX·컴포넌트 상태를 하나도 쓰지 않으면 사용처가 하나여도 `.ts`로 옮깁니다 |

두 번째 사유는 재사용이 아니라 `.tsx`에 렌더가 아닌 코드를 남기지 않으려는 것입니다.
`.ts` 안에서는 해당하지 않습니다.
옮길 자리는 같은 소유자 폴더의 `.ts`입니다.
어느 하위 폴더인지는 프레임워크 컨벤션의 역할 폴더 규칙이 정합니다.
**표시용 가공은 여기에 해당하지 않습니다.** 목록을 화면 모양으로 바꾸거나 문자열을 조립하는 것은
쓰는 자리에 그대로 둡니다.
밖으로 내는 것은 서버로 보낼 값을 만드는 함수뿐입니다.

어느 사유든 그 함수만 따로 읽어도 뜻이 통해야 합니다.
바깥 변수, 훅, 컴포넌트 상태에 기대면 아직 뺄 수 없습니다.

**`.ts` 안에서 같은 파일만 쓰는 함수는 몇 번 반복되든 다른 파일로 빼지 않습니다.**
이 규칙은 파일 경계만 봅니다.
같은 파일 안에서 비공개 함수로 단계를 나누는 것은 대상이 아닙니다.
같은 계산을 두세 번 적어도 괜찮습니다.
파일을 하나 더 여는 쪽이 더 비쌉니다.
"나중에 또 쓸 것 같아서"는 사유가 아닙니다.
그때 가서 뺍니다.

사유와 무관하게 빼지 않는 것:

- 본문이 한 줄인 계산
- `.map()` 콜백 하나에만 쓰이는 변환
- 선택 값 보정, 라벨 기본값 같은 자잘한 정리 단계

뺀 다음 어디 두고 언제 공용으로 올릴지는
`functions-place-and-promote-support-functions`가 정합니다.

**Incorrect (한 번만 쓰는 한 줄 계산을 파일로 분리):**

```ts
// page/profile/function/get-next-iteration.ts
export const getNextIteration = (previous: number, iterationCount: number): number => {
	return (previous + 1) % iterationCount;
};
```

**Incorrect (네임스페이스 멤버 하나 때문에 변환 함수를 쪼갬):**

```ts
const toLabelText = (label: Label) => {
	return label.name.trim() || label.code;
};

const toProductView = (record: RecordItem): ProductView => {
	return {
		id: record.id,
		labels: record.labels.map(toLabelText),
	};
};

export const api = {
	record: {
		toProductView: (record: RecordItem): ProductView => {
			return toProductView(record);
		},
	},
};
```

**Correct (작은 계산은 쓰는 자리에 그대로 둠):**

```tsx
// page/profile/pg-profile.tsx
const handleNextClick = () => {
	setIteration((previous) => (previous + 1) % iterationCount);
};
```

**Correct (단일 소유자 네임스페이스의 단계는 멤버 본문에 둠):**

```ts
export const api = {
	record: {
		toProductView: (record: RecordItem): ProductView => {
			return {
				id: record.id,
				labels: record.labels.map((label) => label.name.trim() || label.code),
			};
		},
	},
};
```

**Correct (서로 다른 파일 둘이 이미 부르는 순수 함수를 뺌):**

```ts
// page/profile/function/to-profile-save-request.ts
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
// page/profile/pg-profile-form.tsx와 page/profile/pg-profile-drawer.tsx가 함께 부른다
import { toProfileSaveRequest } from "./function/to-profile-save-request";
```

**Correct (`.tsx` 안의 순수 조립 함수는 사용처가 하나여도 형제 `.ts`로 냄):**

```ts
// page/products/function/to-product-save-request.ts
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
import { toProductSaveRequest } from "./function/to-product-save-request";
```

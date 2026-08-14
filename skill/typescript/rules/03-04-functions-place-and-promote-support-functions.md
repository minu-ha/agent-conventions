---
title: Place and Promote Support Functions Deliberately
titleKo: 보조 함수는 한 파일에 하나만 내보내고 프로젝트 전반이 쓸 때만 공용으로 올립니다
impact: MEDIUM-HIGH
impactDescription: 잡동사니 파일이 생기지 않고 전역 `util`에 한 소유자의 함수가 섞이지 않습니다
appliesWhen:
  - 보조 함수를 어느 파일이나 폴더에 둘지 정할 때
  - `shared/` 아래로 파일을 옮기거나 `util.*`에 항목을 추가할 때
requiresSelected: functions-extract-helpers-only-when-the-boundary-is-real
tags: functions, boundaries
---

## Place and Promote Support Functions Deliberately

**Impact: MEDIUM-HIGH (잡동사니 파일이 생기지 않고 전역 `util`에 한 소유자의 함수가 섞이지 않습니다)**

떼어 낼지는 `functions-extract-helpers-only-when-the-boundary-is-real`이 먼저 판정합니다.
이 규칙은 그 결과를 어디 두고 언제 올릴지만 봅니다.

- 소유자 아래에 `helper.ts`, `helpers.ts`, `utils.ts` 같은 잡동사니 파일을 만들지 않습니다.
  어느 폴더에 둘지는 프레임워크 컨벤션의 역할 폴더 규칙이 정합니다.
- 소유자 아래에서는 내보낸 대표 함수 하나당 파일 하나입니다.
  전역 `shared/util.ts`는 프로젝트 전반이 쓰는 함수를 한 네임스페이스에 모으는 자리라 예외입니다.
- 호출 깊이는 소유자에서 내보낸 함수, 그 파일 안 비공개 함수까지 두 단계로 끝냅니다.
  내보낸 함수가 또 다른 내보낸 함수를 타고 가는 사슬은 만들지 않습니다.
  단계를 나누고 싶으면 내보내지 말고 한 함수 본문 안에 지역 변수로 둡니다.

**공용 승격은 그 함수가 누구 것인지로 판정합니다.**
`shared/util.ts`의 `util.*`는 프로젝트 전반이 쓰는 함수를 담습니다.

가르는 법은 소유자를 지워 보는 것입니다.
소유자를 지웠을 때 함수도 사라지면 그 소유자 것입니다.

- 소유자와 함께 사라지면 그 소유자 아래에 둡니다.
  profile 저장 화면이 없어지면 `toProfileSaveRequest`가 조립할 요청도 없습니다.
- 소유자를 지워도 남으면 지금 한 곳만 써도 올립니다.
  `toDisplayDate`는 소유자가 하나든 셋이든 `util`에 둘 함수입니다.

두 소유자가 같은 함수를 써야 하면 셋 중 하나로 해소합니다.

1. 표시까지 같으면 `widget` 컴포넌트가 소유합니다.
2. 계산만 같으면 각 소유자가 각자 갖습니다.
3. 프로젝트 전반의 계산이면 `util`로 올립니다.

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

**Incorrect (소유자와 함께 사라질 함수를 전역 `util`로 올림):**

```ts
// shared/util.ts
export const util = {
	profile: {
		/**
		 * 서버가 앞뒤 공백이 붙은 displayName을 거부한다
		 */
		toProfileSaveRequest: (values: ProfileFormValues) => {
			return {body: {displayName: values.displayName.trim()}};
		},
	},
} as const;
```

**Correct (소유자 아래 대표 함수 하나당 파일 하나):**

```ts
// page/product-form/function/to-product-save-request.ts
/**
 * product 저장 요청 조립. 서버가 앞뒤 공백이 붙은 title을 거부한다
 */
export const toProductSaveRequest = (values: ProductFormValues) => {
	return {body: {title: values.title.trim()}};
};
```

**Correct (소유자를 지워도 남는 함수는 도메인 계약을 받아도 올림):**

```ts
// shared/util.ts
export const util = {
	date: {
		/**
		 * ko-KR로 고정한다. 사용자 로케일을 따라가면 목록 정렬 기준과 어긋난다
		 */
		toDisplayDate: (value: string): string => {
			return new Date(value).toLocaleDateString("ko-KR");
		},
	},
	money: {
		/**
		 * 금액 표시는 화면마다 다르지 않다. 소수 두 자리와 부호를 고정한다
		 */
		toSignedAmount: (amount: Amount): string => {
			const sign = amount.value < 0 ? "-" : "+";
			return `${sign}$${Math.abs(amount.value).toFixed(2)}`;
		},
	},
} as const;
```

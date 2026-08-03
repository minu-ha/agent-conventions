---
title: Extract Support Functions Only When the Boundary Is Real
titleKo: 호출 경계가 실제로 있을 때만 보조 함수를 뺍니다
impact: HIGH
impactDescription: 재사용 계약이나 테스트 경계가 없는데 보조 함수를 빼서 흐름이 조각나는 것을 막습니다
appliesWhen:
  - 보조 함수를 빼내거나 옮기거나 내보내거나 공유할 때
  - 범용 보조 파일, 소유자 하나만 쓰는 변환 함수, 잔손질 단계의 경계를 바꿀 때
reviewWith: docs-require-header-jsdoc-on-key-declarations
tags: helpers, extraction, boundaries
---

## Extract Support Functions Only When the Boundary Is Real

**Impact: HIGH (재사용 계약이나 테스트 경계가 없는데 보조 함수를 빼서 흐름이 조각나는 것을 막습니다)**

보조 함수는 "이름"이 아니라 "호출 경계"가 있을 때만 떼어 냅니다.

- 필수: 입력과 출력이 분명하고, 실행 문맥 없이도 따로 검증할 수 있어야 합니다
- 떼어 낼 신호: 여러 소유자가 직접 호출하거나, 여러 내보낸 함수에서 같은 도메인 규칙이 반복됩니다
- 그대로 둘 것: 한 번만 쓰는 짧은 계산, 선택 값 보정, 라벨 기본값, 메서드 하나만 쓰는 변환 함수
- 배치: 범용 `helper.ts`나 `utils.ts`는 만들지 않고, 소유자 아래 `function` 폴더에 대표 함수 하나당 파일 하나
- 깊이: 호출은 소유자에서 내보낸 함수, 그 파일 안 비공개 함수까지 두 단계로 끝냅니다
- 승격: 여러 소유자가 실제로 함께 쓰는 순수 함수만 `shared/util.ts`의 `util.*`로 올립니다

내보낸 함수가 또 다른 내보낸 함수를 타고 가는 사슬은 만들지 않습니다.
흐름을 알려고 파일을 왕복해야 하면 경계가 아니라 그냥 쪼갠 것입니다.

**Incorrect (단회성 계산을 generic util 파일로 분리):**

```ts
// utils.ts
export const util = {
	getNextIteration(iteration: number) {
		return iteration + 1;
	},
};
```

**Incorrect (support module 안에서도 export helper를 단계별로 누적):**

```ts
export const normalizeProfileValues = (formValues: ProfileFormValues) => {
	// ...
};

export const buildAvatarRequests = (files: UploadFile[]) => {
	// ...
};

export const buildProfileUpdatePayload = (
	formValues: ProfileFormValues,
	files: UploadFile[],
) => {
	return {
		...normalizeProfileValues(formValues),
		avatarRequests: buildAvatarRequests(files),
	};
};
```

**Incorrect (네임스페이스 메서드 하나 때문에 변환 함수를 쪼갬):**

```ts
const readLabelText = (label: Label) => label.name.trim() || label.code;

const mapRecordToEntryView = (record: RecordItem): EntryView => {
	const summary = record.description ?? record.memo;

	return {
		id: record.id,
		url: record.url,
		data: {
			type: "record",
			title: record.title,
			summary,
			labels: record.labels.map(readLabelText),
		},
	};
};

export const api = {
	record: {
		mapEntry: (record: RecordItem) => mapRecordToEntryView(record),
	},
};
```

**Correct (작은 계산은 local flow에 둠):**

```ts
const nextIteration = iteration + 1;
```

**Correct (feature-local support module은 domain-sized export 안에서 단계별로 정리):**

```ts
// profile-support.ts
/**
 * profile form 값을 저장 payload로 조립
 */
export const buildProfileUpdatePayload = (formValues: ProfileFormValues) => {
	const normalizedDisplayName = formValues.displayName.trim();

	return {
		displayName: normalizedDisplayName,
	};
};
```

**Correct (단일 owner namespace의 단계는 메서드 본문에 둠):**

```ts
export const api = {
	record: {
		mapEntry: (record: RecordItem): EntryView => {
			const summary = record.description ?? record.memo;

			return {
				id: record.id,
				url: record.url,
				data: {
					type: "record",
					title: record.title,
					summary,
					labels: record.labels.map((label) => label.name.trim() || label.code),
				},
			};
		},
	},
};
```

```ts
// profile-form.ts
import { buildProfileUpdatePayload } from "./profile-support";
```

```ts
// shared/util.ts
export const util = {
	date: {
		/**
		 * date 입력값을 ISO 문자열로 정규화
		 */
		normalize(value: Date | string): string {
			return new Date(value).toISOString();
		},
	},
};
```

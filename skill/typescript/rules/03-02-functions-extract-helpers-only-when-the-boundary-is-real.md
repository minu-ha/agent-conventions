---
title: Extract Support Functions Only When the Boundary Is Real
titleKo: 실재하는 경계 기준의 support 함수 추출
impact: HIGH
impactDescription: 재사용 계약이나 테스트 경계가 실제로 없을 때 헬퍼 추출이 지역 흐름을 조각내는 것을 막습니다
appliesWhen:
  - support function을 추출·이동·export·공유할 때
  - generic helper 파일, 단일 owner 전용 mapper 또는 작은 sub-step 경계를 바꿀 때
reviewWith: docs-use-helper-for-reusable-pure-helper-functions, docs-require-header-jsdoc-on-key-declarations
tags: helpers, extraction, boundaries
---

## Extract Support Functions Only When the Boundary Is Real

**Impact: HIGH (재사용 계약이나 테스트 경계가 실제로 없을 때 헬퍼 추출이 지역 흐름을 조각내는 것을 막습니다)**

support function은 "이름"이 아니라 "호출 경계"가 있을 때만 분리합니다.

- 필수: 명확한 input/output, 런타임 문맥 없는 독립 검증 가능성
- 추출 신호: 여러 owner의 직접 호출, 여러 export에서 반복되는 도메인 규칙
- 유지: 한 번만 쓰는 짧은 계산, optional 보정, label fallback, 단일 namespace method 전용 mapper
- 배치: generic `helper.ts`/`utils.ts` 금지, owner 아래 `function` 폴더에 대표 export 하나당 파일 하나
- 깊이: 호출은 owner → exported function → 파일 내부 private까지 두 단계로 끝냅니다
- 승격: 여러 owner가 실제 공유하는 범용 pure function만 `shared/util.ts`의 `util.*`

export 함수가 다른 export 함수를 따라가는 사슬은 만들지 않습니다.
읽는 사람이 흐름을 알려고 파일을 왕복하게 되면 경계가 아니라 분해입니다.

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

**Incorrect (한 namespace method만 위해 mapper/helper를 쪼갬):**

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
 * @helper profile form 값을 저장 payload로 조립
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
		 * @helper date 입력값을 ISO 문자열로 정규화
		 */
		normalize(value: Date | string): string {
			return new Date(value).toISOString();
		},
	},
};
```

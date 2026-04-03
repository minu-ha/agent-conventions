---
title: Use `@helper` on Reusable Support Functions
impact: MEDIUM-HIGH
impactDescription: distinguishes reusable pure support logic from local implementation details or integration boundaries
tags: helper, pure-functions, reuse
---

## Use `@helper` on Reusable Support Functions

**Impact: MEDIUM-HIGH (distinguishes reusable pure support logic from local implementation details or integration boundaries)**

재사용 가능한 순수 helper, 문자열 조립 함수, 정규화 함수, 포맷 함수, 계약 변환 함수에는 `@helper`를 사용합니다.   
한 함수나 한 support module 안에서만 쓰는 작은 단계 계산은 먼저 함수 안에 두고, 여러 call site가 공유하거나 밖으로 빼야 읽기 흐름이 명확해질 때만 helper로 승격합니다.   
특히 support module 내부의 작은 sub-step마다 `@helper`를 붙여 export helper를 늘리지 않습니다. 반복이 보여도 기본은 local 정리이며, support module 바깥 여러 caller가 같은 helper를 직접 호출하기 전에는 helper 추출을 서두르지 않습니다.   
이런 함수는 `shared/util.ts`의 `util.*`나 owner-named support module 아래에 둘 수 있으며, 외부 I/O 경계는 `@helper`가 아니라 `@api`로 표시합니다.

**Incorrect (외부 연동 함수나 단회성 계산을 helper로 혼동):**

```ts
/**
 * @helper 사용자 설정 파일 로드
 */
const loadUserSettings = async (): Promise<string> => {
	return await Promise.resolve("settings");
};
```

**Incorrect (support module 내부 sub-step을 전부 `@helper`로 export):**

```ts
/**
 * @helper 프로필 입력 trim
 */
export const normalizeProfileValues = (formValues: ProfileFormValues) => {
	return formValues;
};
```

**Correct (여러 caller가 공유하는 순수 정규화 경계에 `@helper`를 사용):**

```ts
/**
 * @helper 목록 화면과 상세 화면이 함께 쓰는 사용자 ID 정규화
 */
export const normalizeUserIds = (userIds: string[]): string[] => {
	return Array.from(new Set(userIds)).sort();
};
```

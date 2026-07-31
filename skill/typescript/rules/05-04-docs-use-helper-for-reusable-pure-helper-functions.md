---
title: Use `@helper` on Reusable Support Functions
titleKo: 재사용 support 함수의 @helper 표기
impact: MEDIUM-HIGH
impactDescription: 재사용 가능한 순수 support 로직을 지역 구현 세부나 통합 경계와 구분합니다
appliesWhen:
  - 여러 caller가 쓰는 pure support function, owner-named exported helper 또는 `shared/util.ts` 함수를 추가·변경할 때
  - `@helper`를 붙이려 할 때
tags: helper, pure-functions, reuse
---

## Use `@helper` on Reusable Support Functions

**Impact: MEDIUM-HIGH (재사용 가능한 순수 support 로직을 지역 구현 세부나 통합 경계와 구분합니다)**

`@helper`는 재사용 가능한 pure support function에만 붙입니다.

사용 대상:

- 여러 caller가 직접 호출하는 문자열 조립, 정규화, 포맷, 계약 변환 함수
- owner-named support module의 domain-sized exported pure function
- 여러 owner가 공유하는 `shared/util.ts`의 `util.*` 함수

사용하지 않을 대상:

- 외부 I/O, 원격 데이터, 파일 접근 같은 `@api` 경계
- 한 함수나 한 support module 안에서만 쓰는 작은 sub-step
- 반복이 보이지만 아직 caller surface가 넓지 않은 local 계산

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

/**
 * @helper 프로필 저장 payload 조립
 */
export const buildProfilePayload = (formValues: ProfileFormValues) => {
	return normalizeProfileValues(formValues);
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

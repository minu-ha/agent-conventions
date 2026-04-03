---
title: Use `@helper` for Reusable Pure Helper Functions
impact: MEDIUM-HIGH
impactDescription: distinguishes reusable pure support logic from local implementation details or integration boundaries
tags: helper, pure-functions, reuse
---

## Use `@helper` for Reusable Pure Helper Functions

**Impact: MEDIUM-HIGH (distinguishes reusable pure support logic from local implementation details or integration boundaries)**

재사용 가능한 순수 helper, 문자열 조립 함수, 정규화 함수, 포맷 함수에는 `@helper`를 사용합니다.   
한 함수나 한 파일 안에서만 쓰는 작은 계산은 직접 두고, 여러 call site가 공유하거나 밖으로 빼야 읽기 흐름이 명확해질 때만 helper로 승격합니다.

**Incorrect (작은 외부 연동 함수나 단회성 계산을 helper로 혼동):**

```ts
/**
 * @helper 사용자 토큰 조회
 */
const loadUserToken = async (): Promise<string> => {
	return await Promise.resolve("token");
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

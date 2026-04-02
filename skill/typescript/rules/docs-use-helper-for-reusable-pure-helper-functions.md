---
title: Use `@helper` for Reusable Pure Helper Functions
impact: MEDIUM-HIGH
impactDescription: distinguishes reusable pure support logic from route, node, or integration boundaries
tags: helper, pure-functions, reuse
---

## Use `@helper` for Reusable Pure Helper Functions

**Impact: MEDIUM-HIGH (distinguishes reusable pure support logic from route, node, or integration boundaries)**

재사용 가능한 순수 helper, 문자열 조립 함수, 정규화 함수, 포맷 함수에는 `@helper`를 사용합니다. 한 node나 router 안에서만 쓰는 작은 계산은 직접 두고, 최소 3~4곳 이상 재사용되거나 밖으로 빼야 읽기 흐름이 명확해질 때만 helper로 승격합니다.

**Incorrect (작은 외부 연동 함수나 단회성 계산을 helper로 혼동):**

```ts
/**
 * @helper 사용자 토큰 조회
 */
const loadUserToken = async (): Promise<string> => {
	return await Promise.resolve("token");
};
```

**Correct (재사용 순수 계산에 `@helper`를 사용):**

```ts
/**
 * @helper 검증 실패 원인 문구 조립
 */
const buildAuditFailureMessage = (count: number): string => {
	return `${count}건의 검증 실패`;
};
```

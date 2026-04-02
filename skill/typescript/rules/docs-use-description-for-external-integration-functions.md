---
title: Use `@description` for External Integration Functions
impact: MEDIUM-HIGH
impactDescription: marks functions that cross filesystem, network, environment, or SDK boundaries as integration points
tags: description, external, integration
---

## Use `@description` for External Integration Functions

**Impact: MEDIUM-HIGH (marks functions that cross filesystem, network, environment, or SDK boundaries as integration points)**

파일 시스템, 네트워크, 환경 변수, 외부 SDK 호출 함수는 `@description`을 사용합니다. 이 annotation은 순수 helper가 아니라 외부 실행 경계를 넘는 함수라는 점을 분명히 드러냅니다.

**Incorrect (외부 연동 함수를 일반 helper처럼 표시):**

```ts
/**
 * @helper 워크플로 원문 파일 로드
 */
export const loadWorkflowSource = async (path: string): Promise<string> => {
	return await Promise.resolve(path);
};
```

**Correct (`@description`으로 외부 연동 경계를 표시):**

```ts
/**
 * @description 워크플로 원문 파일 로드
 */
export const loadWorkflowSource = async (path: string): Promise<string> => {
	return await Promise.resolve(path);
};
```

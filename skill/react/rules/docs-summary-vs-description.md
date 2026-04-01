---
title: Use @description for API Calls and @summary for Everything Else
impact: MEDIUM
impactDescription: standardizes JSDoc intent so generated and handwritten declarations read consistently
tags: docs, jsdoc, api
---

## Use @description for API Calls and @summary for Everything Else

**Impact: MEDIUM (standardizes JSDoc intent so generated and handwritten declarations read consistently)**

API 관련 변수 선언은 `@description`, 그 외 handler, `useEffect`, 일반 함수, 타입 선언은 `@summary`를 사용합니다. 문장은 명사형 종결과 개조식 표현을 기본으로 하고, 하나의 선언에 두 태그를 섞지 않습니다.

**Incorrect (API 주석에 태그를 혼용):**

```ts
/**
 * @description 테이블 목록 조회 API
 * @summary v1 테이블 목록 조회
 */
const responseContentTypeGetListSuspense = useContentTypeGetListSuspense();
```

**Correct (선언 종류에 맞는 태그 하나만 사용):**

```ts
/**
 * @description 테이블 목록 조회 API
 */
const responseContentTypeGetListSuspense = useContentTypeGetListSuspense();

/**
 * @summary 테이블 선택 쿼리스트링 갱신
 */
const handleSelectTable: MouseEventHandler<HTMLButtonElement> = (_event) => {
  // ...
};
```

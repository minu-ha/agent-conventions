---
title: Use @description for API Calls and @summary for Everything Else
impact: MEDIUM
impactDescription: JSDoc 의도를 표준화해 생성 코드와 수기 선언을 일관되게 읽히게 함
tags: docs, jsdoc, api
---

## Use @description for API Calls and @summary for Everything Else

**Impact: MEDIUM (JSDoc 의도를 표준화해 생성 코드와 수기 선언을 일관되게 읽히게 함)**

원격 API 경계를 직접 넘는 helper, custom hook wrapper, query option factory 같은 API boundary 선언은 `@description`, 그 외 handler, `useEffect`, 일반 함수, 타입 선언은 `@summary`를 사용합니다. 이름만으로 충분히 자명한 generated hook 바인딩이나 단순 로컬 변수는 JSDoc을 생략할 수 있습니다. 문장은 명사형 종결과 개조식 표현을 기본으로 하고, 하나의 선언에 두 태그를 섞지 않습니다.

**Incorrect (API boundary 선언에 태그를 혼용):**

```ts
/**
 * @description 테이블 목록 조회 query option 조립
 * @summary v1 테이블 목록 조회
 */
const useContentTypeListQueryOptions = (projectId: number) => {
  return contentTypeListQueryOptions({ projectId });
};
```

**Correct (선언 종류에 맞는 태그 하나만 사용):**

```ts
/**
 * @description 테이블 목록 조회 query option 조립
 */
const useContentTypeListQueryOptions = (projectId: number) => {
  return contentTypeListQueryOptions({ projectId });
};

/**
 * @summary 테이블 선택 쿼리스트링 갱신
 */
const handleSelectTable: MouseEventHandler<HTMLButtonElement> = (_event) => {
  // ...
};
```

---
title: Require JSDoc on Key Declarations
impact: MEDIUM-HIGH
impactDescription: 중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 함
tags: docs, jsdoc, handlers, effects
---

## Require JSDoc on Key Declarations

**Impact: MEDIUM-HIGH (중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 함)**

API 호출 훅과 mutation 선언, 이벤트 핸들러, `useEffect`, 주요 유틸 함수, 커스텀 `type`과 `interface`, 그리고 예외적으로 사용하는 `useMemo`/`useCallback`에는 JSDoc을 작성합니다. 상태 변수나 단순 파생값처럼 문맥상 자명한 선언에는 강제하지 않습니다.

**Incorrect (중요한 선언에 문맥 설명이 없음):**

```ts
const mutationContentTypeRemove = useContentTypeRemove();

useEffect(() => {
  resetForm(userData);
}, [userData, resetForm]);
```

**Correct (선언 의도와 역할을 바로 위에 문서화):**

```ts
/**
 * @description 테이블 삭제 API
 */
const mutationContentTypeRemove = useContentTypeRemove();

/**
 * @summary 사용자 데이터 변경 시 폼 상태 동기화
 */
useEffect(() => {
  resetForm(userData);
}, [userData, resetForm]);
```

---
title: Require JSDoc on React Hooks, Handlers, and Key Declarations
impact: MEDIUM-HIGH
impactDescription: 중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 함
tags: docs, jsdoc, handlers, effects
---

## Require JSDoc on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM-HIGH (중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 함)**

원격 API 경계를 넘는 helper나 custom hook wrapper, 분기나 부수효과가 있는 이벤트 핸들러, 동기화 의도가 중요한 `useEffect`, 주요 유틸 함수, 커스텀 `type`과 `interface`, 그리고 예외적으로 사용하는 `useMemo`/`useCallback`에는 JSDoc을 작성합니다.   
상태 변수, 자명한 generated hook 바인딩, 단순 파생값처럼 문맥상 의미가 분명한 선언에는 강제하지 않습니다.

**Incorrect (비자명한 경계 선언에 문맥 설명이 없음):**

```ts
const handleRemoveTableButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  if (!selectedTable) {
    return;
  }

  await mutationContentTypeRemove.mutateAsync({ params: { projectId } });
};

useEffect(() => {
  resetForm(userData);
}, [userData, resetForm]);
```

**Correct (비자명한 선언 의도와 역할을 바로 위에 문서화):**

```ts
/**
 * @summary 선택된 테이블 삭제와 다음 화면 이동 처리
 */
const handleRemoveTableButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  if (!selectedTable) {
    return;
  }

  await mutationContentTypeRemove.mutateAsync({ params: { projectId } });
};

/**
 * @summary 사용자 데이터 변경 시 폼 상태 동기화
 */
useEffect(() => {
  resetForm(userData);
}, [userData, resetForm]);
```

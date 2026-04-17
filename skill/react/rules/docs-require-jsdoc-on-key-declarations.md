---
title: Require JSDoc on React Hooks, Handlers, and Key Declarations
impact: MEDIUM-HIGH
impactDescription: 중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 함
tags: docs, jsdoc, handlers, effects
---

## Require JSDoc on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM-HIGH (중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 함)**

원격 API 경계를 넘는 helper나 query/mutation wrapper, 분기나 부수효과가 있는 이벤트 핸들러, 동기화 의도가 중요한 `useEffect`, 주요 유틸 함수, 커스텀 `type`과 `interface`, store 선언, compound component의 public part 선언, 그리고 예외적으로 사용하는 `useMemo`/`useCallback`에는 JSDoc을 작성합니다. annotation 태그 선택은 companion skill인 `convention-typescript`의 표준인 `@api`, `@event`, `@watch`, `@helper`, `@summary`, `@part`, `@description`, `@field`를 따릅니다.
특히 route entry, screen entry, layout owner처럼 화면 흐름을 소유하는 경계에서 선언한 named query/mutation binding은 generated hook이라도 `@api`를 생략하지 않습니다. sibling `page.ts`나 route-local `*.ts`로 뺀 exported pure support function은 helper boundary로 보고 `@helper`를 붙입니다.
상태 변수, 단순 prop destructuring, 자명한 local 파생값처럼 문맥상 의미가 분명한 선언에는 강제하지 않습니다.

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
 * @api 테이블 삭제 API
 */
const mutationContentTypeRemove = useContentTypeRemove();

/**
 * @event 선택된 테이블 삭제와 다음 화면 이동 처리
 */
const handleRemoveTableButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  if (!selectedTable) {
    return;
  }

  await mutationContentTypeRemove.mutateAsync({ params: { projectId } });
};

/**
 * @watch 사용자 데이터 변경 시 폼 상태 동기화
 */
useEffect(() => {
  resetForm(userData);
}, [userData, resetForm]);

/**
 * @helper 테이블 저장 요청 payload 생성
 */
export const buildContentTypePayload = (formValues: ContentTypeFormValues) => {
  return {
    tableName: formValues.tableName.trim(),
  };
};
```

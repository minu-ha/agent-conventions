---
title: Require JSDoc on React Hooks, Handlers, and Key Declarations
impact: MEDIUM-HIGH
impactDescription: 중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 함
appliesWhen: query·mutation, 비자명한 handler/effect, exported helper/custom hook/store, public type/interface 또는 예외 memo 선언을 추가·변경한다.
requiresSelected: typescript/docs-require-header-jsdoc-on-key-declarations
tags: docs, jsdoc, handlers, effects
---

## Require JSDoc on React Hooks, Handlers, and Key Declarations

**Impact: MEDIUM-HIGH (중요한 API, handler, effect, 타입 선언을 더 쉽게 리뷰하고 재사용할 수 있게 함)**

JSDoc은 경계를 설명할 때만 붙입니다. 자명한 local 변수에는 강제하지 않습니다.

필수 대상:

- route/screen/layout owner의 named query/mutation binding
- 분기, async, navigation, invalidation을 가진 event handler
- 동기화 의도가 중요한 `useEffect`
- exported pure support function, custom hook, store 선언
- public `type`/`interface`, compound component public part
- 예외적으로 남긴 `useMemo`/`useCallback`

태그는 `convention-typescript`의 `@api`, `@event`, `@watch`, `@helper`, `@summary`, `@part`, `@description`, `@field`를 사용합니다.

**Incorrect (비자명한 경계 선언에 문맥 설명이 없음):**

```ts
const handleRemoveEntryButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  if (!selectedEntry) {
    return;
  }

  await mutationEntryRemove.mutateAsync({ params: { entryId } });
};

useEffect(() => {
  resetForm(userData);
}, [userData, resetForm]);
```

**Correct (비자명한 선언 의도와 역할을 바로 위에 문서화):**

```ts
/**
 * @api entry 삭제 API
 */
const mutationEntryRemove = useEntryRemove();

/**
 * @event 선택된 entry 삭제와 다음 화면 이동 처리
 */
const handleRemoveEntryButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  if (!selectedEntry) {
    return;
  }

  await mutationEntryRemove.mutateAsync({ params: { entryId } });
};

/**
 * @watch 사용자 데이터 변경 시 폼 상태 동기화
 */
useEffect(() => {
  resetForm(userData);
}, [userData, resetForm]);

/**
 * @helper entry 저장 요청 payload 생성
 */
export const buildEntryPayload = (formValues: EntryFormValues) => {
  return {
    title: formValues.title.trim(),
  };
};
```

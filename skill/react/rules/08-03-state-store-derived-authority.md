---
title: Store Shared Derived Decisions Only When They Are Truly Shared
titleKo: 여러 화면이 함께 쓰는 판단만 스토어로 올립니다
impact: HIGH
impactDescription: 같은 도메인 판별 로직이 여러 화면에 퍼지지 않습니다
appliesWhen:
  - 여러 화면·메뉴·라우트 가드가 쓰는 권한·권한 같은 파생 판단을 스토어에 저장·동기화할 때
  - 단일 화면에서만 쓰는 값까지 스토어로 올리려 할 때
reviewWith: docs-require-jsdoc-on-key-declarations
tags: state, zustand, derived-decisions
---

## Store Shared Derived Decisions Only When They Are Truly Shared

**Impact: HIGH (같은 도메인 판별 로직이 여러 화면에 퍼지지 않습니다)**

여러 화면, 메뉴, 라우트 가드에서 반복해서 필요한 파생 판단만 스토어에 승격합니다.
단일 화면에서 한두 번 읽는 질의 필드까지 스토어로 복제하지 않습니다.

스토어에 올리기로 했다면 문자열 비교나 도메인 판별은 초기화나 레이아웃 같은 한 경계에만 모으고,
화면은 `accessStore.canEditRecord` 같은 결과만 참조합니다.
Suspense 질의처럼 `onSuccess`가 없어서 동기화가 필요하다면 소유자가 분명한 경계에서만 `useEffect` 또는
`useLayoutEffect`를 사용하고, selector 최적화는 실제로 필요한 경우에만 근거 주석과 함께 예외적으로 사용합니다.

**Incorrect (화면마다 판별을 반복하면서 단일 화면용 값을 스토어에도 복제):**

```ts
const accessStore = useAccessStore();
const canEditRecord = responseRecordGetItemSuspense.data.ownerId === currentUserId;

useEffect(() => {
  accessStore.setCanEditRecord(canEditRecord);
}, [accessStore, canEditRecord]);
```

**Correct (공용 파생 판단은 소유자가 분명한 경계에서만 적재하고 화면은 결과만 참조):**

```ts
const accessStore = useAccessStore();

if (accessStore.canEditRecord) {
  // ...
}
```

```ts
/**
 * bootstrap capability 응답을 access store에 동기화
 */
useEffect(() => {
  if (!responseAccessBootstrapSuspense.data) {
    return;
  }

  accessStore.setCapabilities(responseAccessBootstrapSuspense.data.capabilities);
}, [accessStore, responseAccessBootstrapSuspense.data]);
```

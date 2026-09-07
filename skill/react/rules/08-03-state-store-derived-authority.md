---
title: Store Shared Derived Decisions Only When They Are Truly Shared
titleKo: 여러 화면이 함께 쓰는 파생 판단만 스토어로 올립니다
impact: HIGH
impactDescription: 같은 도메인 판별 로직이 여러 화면에 퍼지지 않습니다
appliesWhen:
  - 여러 화면·메뉴·라우트 가드가 쓰는 접근 권한 같은 파생 판단을 스토어에 저장·동기화할 때
  - 단일 화면에서만 쓰는 값까지 스토어로 올리려 할 때
reviewWith: docs-require-jsdoc-on-key-declarations, state-calculate-derived-values-during-render
tags: state, zustand
---

## Store Shared Derived Decisions Only When They Are Truly Shared

**Impact: HIGH (같은 도메인 판별 로직이 여러 화면에 퍼지지 않습니다)**

여러 화면·메뉴·라우트 가드가 반복해서 쓰는 파생 판단만 스토어로 올립니다.
단일 화면에서 한두 번 읽는 쿼리 필드는 복제하지 않습니다.

| 작업 | 기준 |
| --- | --- |
| 도메인 판별 | 초기화·레이아웃 등 한 경계에 모으고 화면은 `accessStore.canEditRecord` 같은 결과만 읽습니다 |
| 스토어 채우기 | 쿼리에는 `onSuccess` 같은 성공 콜백이 없으므로 소유자가 분명한 경계의 `useEffect`에서 처리합니다 |
| 이펙트 예외 근거 | `state-calculate-derived-values-during-render`의 예외이므로 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`에 따라 공유 이유를 남깁니다 |
| 이펙트의 스토어 접근 | 선택자로 `set` 함수만 꺼내고 값 의존성은 그대로 적습니다 |

같은 판별을 화면마다 반복하지 않도록 한 곳에서 스토어를 채웁니다.
이펙트가 스토어 객체 전체에 의존하면 `set`으로 참조가 바뀔 때 다시 실행되므로 피합니다.

**Incorrect (개별 화면이 도메인 판별을 수행하고 스토어에 저장합니다):**

```ts
const accessStore = useAccessStore();
const canEditRecord = responseRecordGetItemSuspense.data.ownerId === currentUserId;

useEffect(() => {
	accessStore.setCanEditRecord(canEditRecord);
}, [accessStore, canEditRecord]);
```

**Correct (화면은 스토어에 채워진 결과만 참조합니다):**

```ts
const accessStore = useAccessStore();

if (accessStore.canEditRecord) {
	// ...
}
```

**Incorrect (스토어 전체에 의존하는 이펙트가 `set`마다 다시 실행됩니다):**

```ts
// page/_layout/pg-app-layout.tsx
const accessStore = useAccessStore();

/**
 * 부트스트랩 응답의 권한 목록으로 수정 가능 여부를 채운다
 */
useEffect(() => {
	accessStore.setCanEditRecord(responseAccessBootstrapSuspense.data.capabilities.includes("record:edit"));
}, [accessStore, responseAccessBootstrapSuspense.data]);
```

**Correct (초기화 경계에서 스토어를 채우고 스토어에서는 `set` 함수만 선택합니다):**

```ts
// page/_layout/pg-app-layout.tsx
const setCanEditRecord = useAccessStore((state) => state.setCanEditRecord);

/**
 * 부트스트랩 응답의 권한 목록으로 수정 가능 여부를 채운다. 여러 화면과 라우트 가드가 이 결과를 읽는다
 */
useEffect(() => {
	// state-calculate-derived-values-during-render 예외: 화면 여럿이 같은 판단을 읽어 경계에서 한 번 채운다
	setCanEditRecord(responseAccessBootstrapSuspense.data.capabilities.includes("record:edit"));
}, [setCanEditRecord, responseAccessBootstrapSuspense.data]);
```

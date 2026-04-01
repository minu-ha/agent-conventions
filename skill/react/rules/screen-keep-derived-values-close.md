---
title: Keep Derived Values Close to Where They Are Used
impact: HIGH
impactDescription: preserves origin and stops route files from filling with aliases and imperative setup code
tags: screen, derived-values, origin
---

## Keep Derived Values Close to Where They Are Used

**Impact: HIGH (preserves origin and stops route files from filling with aliases and imperative setup code)**

화면 상단에서 오리진을 잃는 별칭 상수, `let` 재할당, 배열 `push` 기반 명령형 조립을 금지합니다. Hook 파라미터, JSX 표시값, effect 내부 계산은 실제 사용하는 좁은 스코프에서 직접 계산합니다. JSX에서만 쓰는 표시값은 특히 화면 상단 `const`로 빼지 말고 원본 체이닝으로 직접 참조합니다.

**Incorrect (화면 상단에서 파생값과 별칭을 누적):**

```ts
const tableInfoData = responseContentManagerGetTableInfo.data;
const hasSelectedRows = selectedRows.length > 0;
const selectedTableNameForQuery = selectedEntryTableState.selectedTableNode?.tableName;
```

**Correct (사용 지점 가까이에서 계산):**

```ts
const responseContentManagerSearchContents = useContentManagerSearchContentsSuspense({
  tableName: selectedEntryTableState.selectedTableNode?.tableName,
});
```

```tsx
<Activity mode={selectedRows.length > 0 ? "visible" : "hidden"} />
```

```tsx
return <UiInput value={selectedNodeContext?.node?.name} />;
```

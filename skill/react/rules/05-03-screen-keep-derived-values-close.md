---
title: Keep Derived Values Close to Where They Are Used
titleKo: 파생 값은 쓰는 자리 가까이에 둡니다
impact: HIGH
impactDescription: 출처가 남고 화면 진입 파일이 별칭과 준비 코드로 채워지지 않습니다
appliesWhen:
  - 오리진을 끊는 별칭·플래그·표시값을 넓은 화면 범위에 추가·이동·제거할 때
  - `let` 재할당이나 배열 `push` 기반 조립을 바꿀 때
tags: screen, origin
---

## Keep Derived Values Close to Where They Are Used

**Impact: HIGH (출처가 남고 화면 진입 파일이 별칭과 준비 코드로 채워지지 않습니다)**

파생값은 실제 쓰는 자리에서 계산합니다.
화면 상단으로 끌어올리면 값의 출처를 잃습니다.

- 오리진을 잃는 별칭 상수, `let` 재할당, 배열 `push` 기반 명령형 조립을 새로 만들지 않고
  기존 항목은 제거합니다.
- 훅 파라미터, JSX 표시값, 이펙트 내부 계산은 쓰는 자리의 좁은 스코프에서 직접 계산합니다.
- JSX 전용 표시값은 화면 상단 `const`로 빼지 말고 원본 체이닝으로 직접 참조합니다.

**Incorrect (화면 상단에서 파생값과 별칭을 누적):**

```ts
const entrySchemaData = responseEntrySchema.data;
const hasSelectedRows = selectedRows.length > 0;
const selectedCategoryIdForQuery = selectedCategoryState.selectedCategoryNode?.id;
```

**Correct (사용 지점 가까이에서 계산):**

```ts
/**
 * entry 목록 조회 API
 */
const responseEntryListSuspense = useEntryListSuspense({
  categoryId: selectedCategoryState.selectedCategoryNode?.id,
});
```

```tsx
<Activity mode={selectedRows.length > 0 ? "visible" : "hidden"}>
  <PgEntryBulkActionBar selectedRows={selectedRows} />
</Activity>
```

```tsx
return <UiInput value={selectedNodeContext?.node?.name} />;
```

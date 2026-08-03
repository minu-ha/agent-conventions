---
title: Keep Route Entry Files Focused on Screen Flow
titleKo: 화면 진입 파일은 흐름 위주로 둡니다
impact: HIGH
impactDescription: 진입 파일만 봐도 화면 흐름을 따라갈 수 있습니다
appliesWhen:
  - 라우트 진입의 검색·navigate·질의·변경 요청·cross-section 이펙트를 옮기거나 나눌 때
  - page 섹션 조립의 순서나 소유자를 바꿀 때
  - 제외: 같은 소유자 안에서 표현만 바꾸는 경우
reviewWith: >-
  screen-extract-local-section-components-for-runtime-boundaries, ownership-place-owner-files-in-role-folders
tags: screen, routes, flow
---

## Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (진입 파일만 봐도 화면 흐름을 따라갈 수 있습니다)**

Route 진입은 검색, navigate, page 질의·변경 요청, cross-section 이펙트와 렌더 조립을 보여줍니다.
비동기·상태·interaction 경계를 가진 섹션을 분리해도 이 흐름 제어 자체는 라우트 진입에 남깁니다.

소유자가 그대로인 변경은 대상이 아닙니다.

- `query.select` shape, 바인딩·별칭 정리, derived-state 이펙트를 렌더 계산으로 옮기는 것
- 순수 type·payload builder·기본 설정의 형제 `.ts` 이동. support-code 규칙이 담당합니다.

**Incorrect (흐름보다 분해 자체가 목적이 됨):**

```tsx
return (
  <PageShell>
    <PageHeaderSection />
    <PageContentSection />
    <PageFooterSection />
  </PageShell>
);
```

**Correct (라우트 진입에서 흐름이 보이고, 실제 경계가 있는 섹션만 분리):**

```tsx
const navigate = useNavigate();
const search = Route.useSearch();

/**
 * entry 목록 조회 API
 */
const responseEntryListSuspense = useEntryListSuspense({
  page: search.page,
});

/**
 * entry 저장 API
 */
const mutationEntrySave = useEntrySave();

/**
 * entry 저장 후 현재 화면 흐름을 유지한 채 route search를 갱신
 */
const handleSubmitButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  await mutationEntrySave.mutateAsync({ data: request });
  void navigate({
    to: "/entries",
    search: { ...search, page: 1 },
  });
};

return (
  <Fragment>
    <EntryFilterSection />
    <EntryListSection onSubmit={handleSubmitButtonClick} />
  </Fragment>
);
```

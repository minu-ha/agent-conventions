---
title: Keep Route Entry Files Focused on Screen Flow
impact: HIGH
impactDescription: route 파일을 화면의 주 orchestration 지점으로 읽기 쉽게 만듦
appliesWhen: >-
  route entry의 search·navigate·query·mutation·cross-section effect를 component/module 사이에서 이동·분리하거나 page
  section 조립의 순서·owner를 바꾼다. 같은 owner 안 표현 변경은 제외한다.
reviewWith: >-
  screen-extract-local-section-components-for-runtime-boundaries, screen-move-pure-support-code-out-of-entry-files
tags: screen, routes, flow
---

## Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (route 파일을 화면의 주 orchestration 지점으로 읽기 쉽게 만듦)**

Route entry는 search, navigate, page query·mutation, cross-section effect와 render 조립을 보여줍니다.
runtime boundary section은 추출해도 주 orchestration은 route entry에 둡니다.

소유자가 그대로인 변경은 대상이 아닙니다.

- `query.select` shape, binding·alias 정리, derived-state effect를 render 계산으로 옮기는 것
- 순수 type·payload builder·preset의 sibling `.ts` 이동. support-code 규칙이 담당합니다.

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

**Correct (화면 엔트리에서 흐름과 orchestration이 보이고, 필요한 section만 runtime boundary 기준으로 분리):**

```tsx
const navigate = useNavigate();
const search = Route.useSearch();

/**
 * @api entry 목록 조회 API
 */
const responseEntryListSuspense = useEntryListSuspense({
  page: search.page,
});

/**
 * @api entry 저장 API
 */
const mutationEntrySave = useEntrySave();

/**
 * @event entry 저장 후 현재 화면 흐름을 유지한 채 route search를 갱신
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

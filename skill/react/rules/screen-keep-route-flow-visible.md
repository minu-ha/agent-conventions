---
title: Keep Route Entry Files Focused on Screen Flow
titleKo: route entry 파일의 화면 흐름 중심 유지
impact: HIGH
impactDescription: route entry만 봐도 화면 흐름을 따라갈 수 있게 합니다
appliesWhen:
  - route entry의 search·navigate·query·mutation·cross-section effect를 옮기거나 나눌 때
  - page section 조립의 순서나 owner를 바꿀 때
  - 제외: 같은 owner 안에서 표현만 바꾸는 경우
reviewWith: >-
  screen-extract-local-section-components-for-runtime-boundaries, screen-move-pure-support-code-out-of-entry-files
tags: screen, routes, flow
---

## Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (route entry만 봐도 화면 흐름을 따라갈 수 있게 합니다)**

Route entry는 search, navigate, page query·mutation, cross-section effect와 render 조립을 보여줍니다.
async·state·interaction 경계를 가진 section을 분리해도 이 흐름 제어 자체는 route entry에 남깁니다.

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

**Correct (route entry에서 흐름이 보이고, 실제 경계가 있는 section만 분리):**

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

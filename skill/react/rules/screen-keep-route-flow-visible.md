---
title: Keep Route Entry Files Focused on Screen Flow
impact: HIGH
impactDescription: route 파일을 화면의 주 orchestration 지점으로 읽기 쉽게 만듦
appliesWhen: route entry의 search·navigate·query·mutation·effect·section 조립을 이동·분리하거나 재구성한다. 순수 type·payload builder만 sibling `.ts`로 옮기고 이 orchestration을 그대로 두면 제외한다.
reviewWith: screen-extract-local-section-components-for-runtime-boundaries, screen-move-pure-support-code-out-of-entry-files
tags: screen, routes, flow
---

## Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (route 파일을 화면의 주 orchestration 지점으로 읽기 쉽게 만듦)**

라우트 엔트리 파일은 화면 흐름이 드러나게 유지합니다. state, API response/mutation, event handler, `useEffect`, 렌더링 조립이 보이도록 두고, 단순 레이아웃 분리만을 위한 조기 컴포넌트화는 기본값으로 삼지 않습니다. runtime boundary를 소유하는 route-local section component는 추출할 수 있지만, route entry는 여전히 search param, navigate, page-level query/mutation, cross-section effect 같은 orchestration을 보여줘야 합니다. 이 orchestration은 건드리지 않고 순수 type, payload builder, preset만 sibling support `.ts`로 옮기는 작업은 `screen-extract-utilities-selectively`와 `screen-move-pure-support-code-out-of-entry-files`가 소유하며 이 규칙은 N/A입니다.

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

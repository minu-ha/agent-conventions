---
title: Keep Route Entry Files Focused on Screen Flow
impact: HIGH
impactDescription: route 파일을 화면의 주 orchestration 지점으로 읽기 쉽게 만듦
tags: screen, routes, flow
---

## Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (route 파일을 화면의 주 orchestration 지점으로 읽기 쉽게 만듦)**

라우트 엔트리 파일은 화면 흐름이 드러나게 유지합니다. state, API response/mutation, event handler, `useEffect`, 렌더링 조립이 보이도록 두고, 단순 레이아웃 분리만을 위한 조기 컴포넌트화는 기본값으로 삼지 않습니다. runtime boundary를 소유하는 route-local section component는 추출할 수 있지만, route entry는 여전히 search param, navigate, page-level query/mutation, cross-section effect 같은 orchestration을 보여줘야 합니다.

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
 * @api content type 목록 조회 API
 */
const responseContentTypeGetListSuspense = useContentTypeGetListSuspense({
  projectId,
  page: search.page,
});

/**
 * @api content type 저장 API
 */
const mutationContentTypeUpsert = useContentTypeUpsert();

/**
 * @event 선택된 테이블 저장 후 현재 화면 흐름을 유지한 채 route search를 갱신
 */
const handleSubmitButtonClick: MouseEventHandler<HTMLButtonElement> = async (_event) => {
  await mutationContentTypeUpsert.mutateAsync({ data: request });
  void navigate({
    to: "/content-type-builder",
    search: { ...search, page: 1 },
  });
};

return (
  <Fragment>
    <ContentTypeFilterSection />
    <ContentTypeTableSection onSubmit={handleSubmitButtonClick} />
  </Fragment>
);
```

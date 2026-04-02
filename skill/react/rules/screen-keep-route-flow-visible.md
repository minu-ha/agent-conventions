---
title: Keep Route Entry Files Focused on Screen Flow
impact: HIGH
impactDescription: route 파일을 화면의 주 orchestration 지점으로 읽기 쉽게 만듦
tags: screen, routes, flow
---

## Keep Route Entry Files Focused on Screen Flow

**Impact: HIGH (route 파일을 화면의 주 orchestration 지점으로 읽기 쉽게 만듦)**

라우트 엔트리 파일은 화면 흐름이 드러나게 유지합니다. state, API response/mutation, event handler, `useEffect`, 렌더링 조립이 보이도록 두고, 단순 레이아웃 분리만을 위한 조기 컴포넌트화는 기본값으로 삼지 않습니다.

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

**Correct (화면 엔트리에서 흐름과 orchestration이 보임):**

```tsx
const responseContentTypeGetListSuspense = useContentTypeGetListSuspense({ projectId });
const handleSubmitButtonClick = async () => {
  // ...
};

return <ContentTypeBuilderScreen onSubmit={handleSubmitButtonClick} />;
```

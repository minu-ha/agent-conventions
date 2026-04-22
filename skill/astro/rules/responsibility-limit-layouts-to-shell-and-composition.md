---
title: Limit Layouts to Shell and Composition
impact: HIGH
impactDescription: prevents shared layout files from absorbing leaf-page data and interaction logic
tags: layouts, slots, responsibility
---

## Limit Layouts to Shell and Composition

**Impact: HIGH (prevents shared layout files from absorbing leaf-page data and interaction logic)**

feature-owned layout과 pages-local document helper는 공통 frame, metadata wrapper, `<slot />` 기반 composition, shared chrome까지만 담당합니다. 이 프로젝트에서는 `_document.astro`가 `<html>`, `<head>`, `<body>`와 route-shared body shell을 직접 소유하면서 자기 로컬 `Props`로 문서 셸 contract를 가지고, `_head.astro`는 head/meta 전용 contract를 자기 로컬 `Props`로 직접 소유하며, `_document.css`는 route-shared body shell style 전용으로 둡니다. feature-specific layout이 있다면 owning feature 아래에 둡니다. shell 조립에는 `widget`과 `ui`만 사용하고, 특정 page만 쓰는 fetch, mutation, form state, detail query, redirect, auth guard를 layout이나 document helper로 끌어올리지 말고 page boundary나 middleware, 해당 island에 남겨 둡니다.

**Incorrect (layout이 leaf page 전용 데이터와 form 로직까지 흡수함):**

```astro
---
const invoice = await getInvoice(Astro.params.invoiceId);
const formState = buildInvoiceForm(invoice);
---

<DashboardFrame formState={formState}>
	<slot />
</DashboardFrame>
```

**Correct (document helper는 shell과 slot 조립만 담당):**

```astro
---
import UiSurface from "@/components/ui/surface/ui-surface.astro";
import WidgetSiteHeader from "@/components/widget/site-header/widget-site-header.astro";

const { currentPathname } = Astro.props;
---

<UiSurface>
	<WidgetSiteHeader currentPathname={currentPathname} />
	<slot />
</UiSurface>
```

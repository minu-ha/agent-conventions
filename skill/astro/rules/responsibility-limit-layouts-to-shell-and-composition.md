---
title: Limit Layouts to Shell and Composition
impact: HIGH
impactDescription: prevents shared layout files from absorbing leaf-page data and interaction logic
tags: layouts, slots, responsibility
---

## Limit Layouts to Shell and Composition

**Impact: HIGH (prevents shared layout files from absorbing leaf-page data and interaction logic)**

feature-owned layout과 page-adjacent document shell은 공통 frame, metadata wrapper, `<slot />` 기반 composition, shared chrome까지만 담당합니다. Astro 공식 문서 기준으로 layout component는 어디에 둘 수 있지만, 이 프로젝트에서는 feature-owned layout은 owning feature 아래에, `_document.astro`, `_head.astro`, `_page-chrome.astro` 같은 top-level document helper는 `src/pages/_*.astro` 아래에 둡니다. full page shell을 렌더링하는 document shell이면 `<html>`이 최상위 parent가 되게 유지하고, shell 조립에는 `widget`과 `ui`만 사용합니다. 특정 page만 쓰는 fetch, mutation, form state, detail query, redirect, auth guard를 layout이나 document shell로 끌어올리지 말고 page boundary나 middleware, 해당 island에 남겨 둡니다.

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

**Correct (layout은 feature-owned shell과 slot 조립만 담당):**

```astro
---
import UiSurface from "@/components/ui/surface/ui-surface.astro";
import WidgetSiteHeader from "@/components/widget/site-header/widget-site-header.astro";

const { title } = Astro.props;
---

<UiSurface>
	<WidgetSiteHeader title={title} />
	<slot />
</UiSurface>
```

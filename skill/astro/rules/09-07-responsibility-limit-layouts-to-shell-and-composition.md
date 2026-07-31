---
title: Limit Layouts to Shell and Composition
titleKo: 레이아웃 책임의 셸·조립 한정
impact: HIGH
impactDescription: 공용 layout 파일이 말단 페이지의 데이터·상호작용 로직을 흡수하는 것을 막습니다
tags: layouts, slots, responsibility
---

## Limit Layouts to Shell and Composition

**Impact: HIGH (공용 layout 파일이 말단 페이지의 데이터·상호작용 로직을 흡수하는 것을 막습니다)**

route-local shell과 pages-local document helper는 shell composition만 담당합니다.

소유할 수 있는 것:

- common frame
- metadata wrapper
- `<slot />` 기반 composition
- shared chrome 조립
- document/head helper의 local `Props`

소유하지 않는 것:

- 특정 page만 쓰는 fetch/query/mutation
- form state와 submit handler
- detail query, redirect, auth guard
- island 내부 browser state

Data, redirect, auth 판단은 page boundary, middleware, 또는 해당 island에 남깁니다.

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
import WgSiteHeader from "@/components/widget/site-header/wg-site-header.astro";

const { currentPathname } = Astro.props;
---

<UiSurface>
	<WgSiteHeader currentPathname={currentPathname} />
	<slot />
</UiSurface>
```

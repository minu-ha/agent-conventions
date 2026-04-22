---
title: Limit Layouts to Shell and Composition
impact: HIGH
impactDescription: prevents shared layout files from absorbing leaf-page data and interaction logic
tags: layouts, slots, responsibility
---

## Limit Layouts to Shell and Composition

**Impact: HIGH (prevents shared layout files from absorbing leaf-page data and interaction logic)**

layout component는 공통 frame, metadata wrapper, slot composition, shared chrome까지만 담당합니다. 이 component가 `src/layouts`, `src/components`, `src/features/<feature>` 중 어디에 있든 역할은 같습니다. Astro 공식 문서 기준으로 `src/layouts`는 관례일 뿐 필수가 아니므로, 이 프로젝트에서는 shared shell이면 shared owner 아래에, feature 전용 shell이면 feature 아래에 둘 수 있습니다. 특정 page만 쓰는 fetch, mutation, form state, detail query를 layout으로 끌어올리지 말고 해당 page나 island에 남겨 둡니다.

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

**Correct (layout은 shell과 slot 조립만 담당):**

```astro
---
const { title } = Astro.props;
---

<DashboardFrame title={title}>
	<slot />
</DashboardFrame>
```

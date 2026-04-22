---
title: Compose Layouts from Widget and UI Only
impact: HIGH
impactDescription: keeps layout files as feature shells instead of letting them become domain-specific shared blocks
tags: responsibility, layouts, ui, widget, composition
---

## Compose Layouts from Widget and UI Only

**Impact: HIGH (keeps layout files as feature shells instead of letting them become domain-specific shared blocks)**

feature-owned layout이나 `_page-chrome.astro` 같은 page-adjacent shell이 shell composition을 맡는다면, 그 안에서 조립하는 shared piece는 `src/components/widget/**`와 `src/components/ui/**`로 제한합니다. `ui`는 button, input, card, table, box, stack, surface, text, tag-list 같은 primitive이고, `widget`은 search-table, site-header, entry-feed, entry-detail처럼 `ui`를 조립한 reusable block입니다. shell은 이 둘과 `<slot />`을 사용해 조립하고, 그 자체를 `ui-*`나 `widget-*`로 이름 붙여 shared component처럼 승격하지 않습니다. shell 안에서 재사용 가능한 시각 조각이 자라면 먼저 `widget` 또는 `ui`로 추출하고, shell file은 composition owner 역할에 남깁니다.

**Incorrect (layout 역할을 ui/widget로 위장함):**

```text
src/components/ui/page-shell/ui-page-shell.astro
src/components/widget/app-shell/widget-app-shell.astro
```

```astro
---
import UiPageShell from "@/components/ui/page-shell/ui-page-shell.astro";
---

<UiPageShell>
	<slot />
</UiPageShell>
```

`page-shell`은 primitive가 아니고, route shell을 직접 소유하므로 `ui`도 `widget`도 아니라 layout 역할이어야 합니다.

**Correct (layout은 feature shell에 남기고 shared piece만 ui/widget에서 조립):**

```astro
---
import UiBox from "@/components/ui/box/ui-box.astro";
import UiStack from "@/components/ui/stack/ui-stack.astro";
import UiSurface from "@/components/ui/surface/ui-surface.astro";
import WidgetSiteHeader from "@/components/widget/site-header/widget-site-header.astro";
import WidgetSidebarNav from "@/components/widget/sidebar-nav/widget-sidebar-nav.astro";

const { title } = Astro.props;
---

<UiSurface class="account-layout">
	<WidgetSiteHeader title={title} />
	<UiStack class="account-layout__body">
		<WidgetSidebarNav />
		<UiBox class="account-layout__content">
			<slot />
		</UiBox>
	</UiStack>
</UiSurface>
```

이 예시에서 layout은 account feature shell을 소유하고, 재사용 가능한 block은 전부 `widget`과 `ui`로 분리되어 있습니다.

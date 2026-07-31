---
title: Compose Layouts from Widget and UI Only
titleKo: 레이아웃의 widget·ui 한정 조립
impact: HIGH
impactDescription: layout 파일이 도메인 전용 공용 블록이 되지 않고 route 셸로 남게 합니다
tags: responsibility, layouts, ui, widget, composition
---

## Compose Layouts from Widget and UI Only

**Impact: HIGH (layout 파일이 도메인 전용 공용 블록이 되지 않고 route 셸로 남게 합니다)**

`_document.astro`나 route-local shell이 shell composition을 맡는다면,
그 안에서 조립하는 shared piece는 `src/components/widget/**`와 `src/components/ui/**`로 제한합니다.

구분 기준:

- `ui`: button, input, card, table, box, stack, surface, text 같은 primitive
- `widget`: search-table, site-header, entry-feed, entry-detail처럼 `ui`를 조립한 reusable block
- Document shell: `_document.astro` and `_document.css`
- Route shell: owning route의 `_local/`

Shell 자체를 `ui-*`나 `widget-*`로 이름 붙여 shared component처럼 승격하지 않습니다.
Shell class는 `pg_document__*`처럼 owner가 드러나게 유지합니다.

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

**Correct (document shell은 pages-local에 남기고 shared piece만 ui/widget에서 조립):**

```astro
---
import UiBox from "@/components/ui/box/ui-box.astro";
import UiStack from "@/components/ui/stack/ui-stack.astro";
import UiSurface from "@/components/ui/surface/ui-surface.astro";
import WgSiteHeader from "@/components/widget/site-header/wg-site-header.astro";

const { currentPathname } = Astro.props;
---

<UiSurface class="pg_document__surface">
	<UiStack class="pg_document__stack">
		<UiBox class="pg_document__header">
			<WgSiteHeader currentPathname={currentPathname} />
		</UiBox>
		<main class="pg_document__main">
			<UiBox class="pg_document__content">
				<slot />
			</UiBox>
		</main>
	</UiStack>
</UiSurface>
```

이 예시에서 `_document.astro`는 route-shared body shell을 소유하고,
재사용 가능한 block은 전부 `widget`과 `ui`로 분리되어 있습니다.

---
title: Place Layout Shells Under Owning Features
impact: HIGH
impactDescription: prevents layout files from becoming a blurry shared component tier between features and reusable building blocks
tags: responsibility, layouts, features, ownership
---

## Place Layout Shells Under Owning Features

**Impact: HIGH (prevents layout files from becoming a blurry shared component tier between features and reusable building blocks)**

이 프로젝트에서 layout file은 shared component tier가 아니라 feature-owned route shell입니다. 따라서 layout file 자체는 `src/features/<feature>/` 아래에 두고, `src/components/layouts`, `src/layouts`, `src/components/ui/ui-page-shell.astro`, `src/components/widget/widget-page-shell.astro` 같은 형태로 승격하지 않습니다. 여러 화면이 같은 shell을 공유하더라도 "shared layout"이라는 새 공용 레이어를 만들기보다, 그 shell을 소유하는 상위 feature를 만들고 그 아래에 둡니다. shared visual pieces가 필요하면 layout file을 올리는 대신 `ui`와 `widget`을 재사용합니다.

**Incorrect (layout file이 shared component 레이어로 떠다님):**

```text
src/
  components/
    layouts/
      account-layout.astro
    ui/
      page-shell/
        ui-page-shell.astro
    widget/
      page-shell/
        widget-page-shell.astro
  features/
    account/
      account-detail-page.astro
```

이 구조는 layout 역할이 `layouts`, `ui`, `widget` 어디에 속하는지 흐리게 만들고, shell ownership도 feature 밖으로 밀어냅니다.

**Correct (layout은 owning feature 아래에 두고 shared 조각만 ui/widget으로 재사용):**

```text
src/
  components/
    ui/
      box/ui-box.astro
      stack/ui-stack.astro
      surface/ui-surface.astro
    widget/
      site-header/widget-site-header.astro
      sidebar-nav/widget-sidebar-nav.astro
  features/
    account/
      account-layout.astro
      account-detail-page.astro
      account.ts
```

이 구조에서는 `account-layout.astro`가 account feature shell을 소유하고, shared visual block만 `ui`와 `widget`에서 가져와 조립합니다.

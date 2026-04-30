---
title: Place Route-local UI Under `_local/`
impact: HIGH
impactDescription: makes the boundary between route-only implementation and shared public surface obvious
tags: responsibility, local, pages, ownership
---

## Place Route-local UI Under `_local/`

**Impact: HIGH (makes the boundary between route-only implementation and shared public surface obvious)**

Shared로 승격되지 않은 route-only UI, modal, form, table, provider, runtime component, 보조 renderer, component CSS는 owning route folder의 `_local/` 아래에 둡니다. `_local/`은 재사용 가능한 public surface가 아니라 현재 route subtree 전용 구현이라는 소유권을 드러내는 이름입니다. 다른 route에서도 쓰이기 시작하면 `_local/`에 남기지 말고 `ui`, `widget`, 또는 shared domain layer로 승격합니다. 다만 route page의 screen orchestration까지 `_local/`로 옮기지는 말고, 실제 leaf UI나 runtime boundary만 내려 ownership을 분명히 합니다.

**Incorrect (route-local UI가 shared components나 route root에 섞임):**

```text
src/
  components/
    post-editor.tsx
  pages/
    admin/
      posts/
        index.astro
        post-admin-table.tsx
        post-admin-table.css
```

**Correct (route-local implementation detail은 `_local/` 아래에 둠):**

```text
src/
  components/
    ui/
      button/ui-button.tsx
  pages/
    admin/
      posts/
        index.astro
        _post-admin.ts
        _post-admin.css
        _local/
          post-admin-runtime.tsx
          post-admin-table.tsx
          post-admin-table.css
          post-editor.tsx
          post-editor.css
```

같은 page surface를 설명하는 `_local/` markup과 CSS는 `loc_*`로 새 namespace를 만들지 말고 `rt_*` owner를 유지합니다. 예외적으로 dialog나 helper wrapper가 route 안에서도 독립 owner contract를 가져야 할 때만 `loc_postFilterDialog__*` 같은 `loc_*`를 사용합니다.

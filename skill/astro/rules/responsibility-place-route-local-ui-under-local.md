---
title: Place Route-local UI Under `_local/`
impact: HIGH
impactDescription: makes the boundary between route-only implementation and shared public surface obvious
tags: responsibility, local, pages, ownership
---

## Place Route-local UI Under `_local/`

**Impact: HIGH (makes the boundary between route-only implementation and shared public surface obvious)**

Shared로 승격되지 않은 route-only UI는 owning route folder의 `_local/` 아래에 둡니다.

`_local/`에 둘 수 있는 것:

- modal, form, table
- provider, runtime component
- 보조 renderer
- component CSS

`_local/`은 현재 route subtree 전용 구현이라는 소유권을 드러내는 이름입니다.
다른 route에서도 쓰이기 시작하면 `ui`, `widget`, 또는 shared domain layer로 승격합니다.
Route page의 screen orchestration까지 `_local/`로 옮기지는 않습니다.

**Incorrect (route-local UI가 shared components나 route root에 섞임):**

```text
src/
  components/
    entry-editor.tsx
  pages/
    admin/
      entries/
        index.astro
        entry-admin-table.tsx
        entry-admin-table.css
```

**Correct (route-local implementation detail은 `_local/` 아래에 둠):**

```text
src/
  components/
    ui/
      button/ui-button.tsx
  pages/
    admin/
      entries/
        index.astro
        _entry-admin.ts
        _entry-admin.css
        _local/
          entry-admin-runtime.tsx
          entry-admin-table.tsx
          entry-admin-table.css
          entry-editor.tsx
          entry-editor.css
```

같은 page surface를 설명하는 `_local/` markup과 CSS는 `loc_*`로 새 namespace를 만들지 말고 `rt_*` owner를 유지합니다.
예외적으로 dialog나 helper wrapper가 route 안에서도 독립 owner contract를 가져야 할 때만 `loc_entryFilterDialog__*` 같은 `loc_*`를 사용합니다.

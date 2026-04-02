---
title: Place Route-only Modules in `-local/`
impact: HIGH
impactDescription: keeps route-scoped UI and helpers close to the route until their contracts are stable
tags: route-local, local-folder, ownership
---

## Place Route-only Modules in `-local/`

**Impact: HIGH (keeps route-scoped UI and helpers close to the route until their contracts are stable)**

해당 라우트에서만 쓰는 모달, 폼, 상수, helper는 라우트 하위 `-local/`에 둡니다. 다른 라우트와 계약이 아직 안정되지 않았다면 shared UI나 공용 helper로 올리지 말고, 먼저 route-local 소유를 유지합니다.

**Incorrect (route 전용 모듈을 성급하게 공용 레이어로 올림):**

```txt
<component-root>/ui/modal/ui-setting-form-modal.tsx
<component-root>/ui/modal/ui-setting-form-modal.css
```

**Correct (해당 route 아래 `-local/`에 둠):**

```txt
(settings)/
  settings.index.tsx
  -local/
    modal-setting-form.tsx
    modal-setting-form.css
```

---
title: Reuse Prop and API Contracts Before Creating New Types
impact: HIGH
impactDescription: prevents duplicate type shapes from drifting apart over time
tags: typing, api, props
---

## Reuse Prop and API Contracts Before Creating New Types

**Impact: HIGH (prevents duplicate type shapes from drifting apart over time)**

Props 콜백 구현 시에는 Props 시그니처를 재사용하고, API 응답 타입이 이미 있으면 새 인터페이스를 만들지 않습니다. 필요하면 `Pick`, `Omit`, indexed access 같은 파생 타입으로 좁힙니다.

**Incorrect (같은 계약을 새 타입으로 다시 정의):**

```ts
interface PermissionMemberEditValues {
  id: number;
  name: string;
  role: string;
}
```

**Correct (기존 계약을 직접 재사용):**

```ts
type PermissionGroupAdminSummary = Pick<PermissionGroupAdminResponse, "id" | "name">;

const handleLinkClick: LinkProps["onLinkClick"] = (event) => {
  event.preventDefault();
};
```

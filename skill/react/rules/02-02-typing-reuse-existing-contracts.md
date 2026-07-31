---
title: Reuse Prop and API Contracts Before Creating New Types
titleKo: 기존 prop·API 계약 우선 재사용
impact: HIGH
impactDescription: 중복 타입 구조가 시간이 지나며 어긋나는 것을 막습니다
appliesWhen:
  - Props callback 구현을 추가·변경할 때
  - API 응답 기반 view type을 추가·변경하는데 기존 prop·API 계약과 같은 shape가 보일 때
reviewWith: >-
  typescript/types-reuse-callback-signatures-from-existing-contracts,
  typescript/types-reuse-existing-contracts-before-new-types
tags: typing, api, props
---

## Reuse Prop and API Contracts Before Creating New Types

**Impact: HIGH (중복 타입 구조가 시간이 지나며 어긋나는 것을 막습니다)**

Props 콜백 구현 시에는 Props 시그니처를 재사용하고, API 응답 타입이 이미 있으면 새 인터페이스를 만들지 않습니다.
필요하면 `Pick`, `Omit`, indexed access 같은 파생 타입으로 좁힙니다.

**Incorrect (같은 계약을 새 타입으로 다시 정의):**

```ts
interface EntrySummaryValues {
  id: number;
  title: string;
  status: string;
}
```

**Correct (기존 계약을 직접 재사용):**

```ts
type EntrySummary = Pick<EntrySummaryResponse, "id" | "title">;

/**
 * 링크 클릭 기본 이동 차단
 */
const handleLinkClick: LinkProps["onLinkClick"] = (event) => {
  event.preventDefault();
};
```

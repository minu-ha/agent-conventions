---
title: Reuse Prop and API Contracts Before Creating New Types
titleKo: 새 타입을 만들기 전에 기존 프롭과 API 계약을 씁니다
impact: HIGH
impactDescription: 같은 구조를 두 번 선언해 시간이 지나며 어긋나는 것을 막습니다
appliesWhen:
  - 프롭스 콜백 구현을 추가·변경할 때
  - API 응답 기반 화면 타입을 추가·변경하는데 기존 프롭·API 계약과 같은 형태가 보일 때
  - 래퍼 컴포넌트 사용처에서 프롭스 타입을 참조할 때
reviewWith: >-
  typescript/types-reuse-callback-signatures-from-existing-contracts,
  typescript/types-reuse-existing-contracts-before-new-types
tags: typing, api, props
---

## Reuse Prop and API Contracts Before Creating New Types

**Impact: HIGH (같은 구조를 두 번 선언해 시간이 지나며 어긋나는 것을 막습니다)**

프롭스 콜백 구현 시에는 프롭스 시그니처를 재사용하고, API 응답 타입이 이미 있으면 새 인터페이스를 만들지 않습니다.
필요하면 `Pick`, `Omit`, 인덱스 접근 같은 파생 타입으로 좁힙니다.
`Ui*` 래퍼를 쓸 때는 라이브러리 원본 프롭스가 아니라 래퍼가 노출한 `Ui*Props`를 참조합니다.
래퍼가 의도적으로 좁히거나 보강한 계약이 사용처로 새지 않게 하려는 것입니다.

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

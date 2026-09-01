---
title: Avoid Lookup Tables for Simple Value Choices
titleKo: 한 곳에서 쓸 값을 조회표로 고르지 않습니다
impact: HIGH
impactDescription: 값과 선택 조건이 사용처에 함께 남아 선택 기준을 바로 읽을 수 있습니다
appliesWhen:
  - 상태나 `variant`에 따라 쓸 값 하나를 고르는 객체·Map을 추가·변경할 때
  - 조회표의 키로 프롭이나 상태를 읽어 값을 넘기는 코드를 추가·변경할 때
requiresSelected: docs-justify-convention-exceptions-with-a-reason-comment
tags: values, lookup, mapping
---

## Avoid Lookup Tables for Simple Value Choices

**Impact: HIGH (값과 선택 조건이 사용처에 함께 남아 선택 기준을 바로 읽을 수 있습니다)**

한 곳에서 쓸 값을 고르려고 객체나 `Map`으로 조회표를 만들지 않습니다.
같은 값은 그대로 넘기고 값이 달라질 때만 사용처에서 조건으로 고릅니다.

조회표는 여러 키의 대응 관계 자체가 도메인이나 외부 계약일 때만 둡니다.
선언 바로 위에는 어떤 계약의 대응 관계인지 확인할 수 있는 근거를 적습니다.

**Incorrect (한 곳의 프롭 값을 고르려고 조회표를 만듭니다):**

```tsx
const chart_toolbar_variant_by_card_variant = {
	default: "default",
	fill: "default",
	dialog: "dialog",
} satisfies Record<UiChartCardProps["variant"], UiChartToolbarProps["variant"]>;

<UiChart.Toolbar variant={chart_toolbar_variant_by_card_variant[props.variant]} />;
```

**Correct (값이 달라지는 조건을 사용처에 적습니다):**

```tsx
<UiChart.Toolbar variant={props.variant === "fill" ? "default" : props.variant} />;
```

**Correct (외부 코드와 화면 상태의 대응 관계가 계약이면 이유를 남기고 조회표를 둡니다):**

```ts
// GET /orders의 P·C·D 코드를 화면의 주문 상태 어휘로 바꾸는 API 경계 계약이다.
const order_status_by_api_code = {
	P: "pending",
	C: "completed",
	D: "cancelled",
} as const satisfies Record<OrderStatusCode, OrderStatus>;
```

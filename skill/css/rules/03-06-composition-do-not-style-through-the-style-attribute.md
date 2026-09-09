---
title: Do Not Style Through the `style` Attribute
titleKo: 인라인 `style`로 스타일을 주지 않습니다
impact: HIGH
impactDescription: 모든 시각 결정이 스타일시트에 남아 검색과 덮어쓰기가 예측대로 동작합니다
appliesWhen:
  - TSX의 `style` 속성을 추가하거나 그 안의 선언을 바꿀 때
  - 컴포넌트 프롭으로 `style`을 받아 넘길 때
reviewWith: >-
  composition-inject-classes-only-at-the-entry-point, values-tokenize-repeated-visual-values,
  values-fall-back-only-outside-core-tokens
tags: values, inline-style
---

## Do Not Style Through the `style` Attribute

**Impact: HIGH (모든 시각 결정이 스타일시트에 남아 검색과 덮어쓰기가 예측대로 동작합니다)**

시각 속성은 스타일시트에 선언하고 `style={{ … }}`로 직접 지정하지 않습니다.
인라인 선언은 클래스보다 우선순위가 높고 CSS 검색에 나타나지 않으며 `:hover`, `@media`, `@container`도 쓸 수 없습니다.

| 값 | 전달 방법 |
| --- | --- |
| 화면마다 달라지는 값 | 수정자 클래스로 전달합니다. 주입 위치는 `composition-inject-classes-only-at-the-entry-point`를 따릅니다 |
| 실행 중 계산해야 알 수 있는 수치 하나 | CSS 변수 한 개만 `style`로 넘기고 실제 속성 선언은 스타일시트에 둡니다 |

두 번째 행만 예외입니다.
가상 스크롤 위치, 드래그 좌표, 측정한 높이처럼 스타일시트에 미리 적을 수 없는 수치가 해당합니다.
변수가 없을 때의 대체값은 `values-fall-back-only-outside-core-tokens` 규칙을 따릅니다.

래퍼가 `HTMLAttributes`를 `extends`하면 `style`도 열립니다.
`Omit`으로 뺄 수 있지만 DOM 속성을 허용하려고 그대로 두므로 사용 여부는 리뷰에서 확인합니다.
클래스에서 인라인 선언을 덮으려면 `!important`가 필요합니다.

**Incorrect 1 (인라인으로 꾸밉니다):**

```tsx
<section className={clsx("pg_orders__summary")} style={{marginTop: 16, color: isCritical ? "#c00" : undefined}}>
	{summary}
</section>
```

**Correct 1 (스타일시트에 두고 수정자로 가릅니다):**

```tsx
<section className={clsx("pg_orders__summary", isCritical && "pg_orders__summary--critical")}>
	{summary}
</section>
```

**Correct (인라인으로 적던 선언을 스타일시트에 둡니다):**

```css
.pg_orders__summary {
	margin-block-start: 16px;
}

.pg_orders__summary--critical {
	color: var(--app-color-text-danger);
}
```

**Correct (실행 중에만 아는 수치를 CSS 변수 하나로 넘깁니다):**

```tsx
<div
	className={clsx("pg_orders__virtualRow")}
	style={{ "--pg-orders-row-offset": `${rowOffset}px` } as CSSProperties}
/>
```

```css
.pg_orders__virtualRow {
	position: absolute;
	transform: translateY(var(--pg-orders-row-offset, 0));
}
```

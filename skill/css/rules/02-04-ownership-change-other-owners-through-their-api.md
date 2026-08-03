---
title: Expose Only a Root Class From Other Owners
titleKo: 남의 컴포넌트에는 root 클래스 하나만 노출
impact: HIGH
impactDescription: 내부 노드로 가는 클래스 prop을 막고 배치, variant, 강등 중 무엇이 맞는지 먼저 보게 합니다
appliesWhen:
  - 다른 컴포넌트의 배치나 내부 표현을 바꿔야 할 때
  - 컴포넌트에 클래스 관련 prop을 추가할 때
reviewWith: >-
  ownership-use-foreign-classes-only-under-your-own-root, composition-inject-classes-only-at-the-entry-point
tags: ownership, api, promotion
---

## Expose Only a Root Class From Other Owners

**Impact: HIGH (내부 노드로 가는 클래스 prop을 막고 배치, variant, 강등 중 무엇이 맞는지 먼저 보게 합니다)**

바꿀 것이 남의 표현이면 세 갈래를 순서대로 봅니다.

| 상황 | 방법 | 비용 |
| --- | --- | --- |
| root의 배치만 다름 | 사용처가 `className`을 넘기고 자기 클래스로 스타일 | 사용처 1곳 |
| 여러 화면이 쓰고 하나만 내부가 다름 | 그 소유자가 modifier를 노출 | 소유자 파일 2줄 + 사용처 1줄 |
| 이 화면만 씀 | 화면 폴더 안으로 내림 | 파일 이동과 접두사 rename |

세 행에 안 맞으면 `ownership-use-foreign-classes-only-under-your-own-root`에 따라
내 root 블록 아래에서 겨냥합니다. **막다른 길이 아니라 마지막 선택지입니다.**

셋째 행이 흔히 놓치는 답입니다. 한 화면만 쓰는 컴포넌트는 widget이 아닙니다.
승격 기준은 맥락 독립성입니다. 내릴 때 props를 열지 않습니다. 파일만 옮깁니다.

`className`이 root까지만 닿는 것은 제약이 아니라 경계입니다.
컴포넌트가 무엇을 노출하는지는 `composition-inject-classes-only-at-the-entry-point`가 정합니다.

**Incorrect (내부 노드마다 클래스 prop을 열어 남이 스타일을 넣게 함):**

```tsx
<WgChartCard
	className={styles.card}
	captionClassName={styles.caption}
	titleClassName={styles.title}
/>
```

**Correct (root 배치는 사용처가 자기 클래스로 잡음):**

```tsx
<WgChartCard className="pg_detail__chartCard" />
```

```css
/* page/detail/pg-detail.css */
.pg_detail__chartCard {
	grid-area: chart;
	margin-block-end: 16px;
}
```

**Correct (여러 화면이 쓰는 변형은 소유자가 modifier로 노출함):**

```tsx
<WgChartCard tone="muted" />
```

```css
/* widget/chart-card/wg-chart-card.css */
.wg_chartCard__caption--muted {
	color: #8c8c8c;
}
```

**Correct (이 화면만 다르면 화면 안으로 내려 소유자를 하나로 만듦):**

```txt
before
  widget/chart-card/wg-chart-card.tsx      여러 화면이 쓰지 않음
  widget/chart-card/wg-chart-card.css      pg_detail 만 내부를 override 하고 있었음

after
  page/detail/component/pg-chart-card.tsx
  page/detail/component/pg-chart-card.css  pg_chartCard__* 로 owner 하나
```

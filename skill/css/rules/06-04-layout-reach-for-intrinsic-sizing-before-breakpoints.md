---
title: Reach for Intrinsic Sizing Before Breakpoints
titleKo: 브레이크포인트를 적기 전에 내재적 크기로 되는지 봅니다
impact: MEDIUM-HIGH
impactDescription: 슬롯 폭이 얼마든 맞는 배치라 같은 컴포넌트를 옮겨도 CSS를 다시 고치지 않습니다
appliesWhen:
  - `@media` 브레이크포인트를 새로 넣으려 할 때
  - 폭에 따라 줄바꿈, 열 개수, 크기가 달라져야 할 때
reviewWith: layout-keep-layout-intent-explicit, layout-group-breakpoints-at-the-file-bottom
tags: values, layout, responsive
---

## Reach for Intrinsic Sizing Before Breakpoints

**Impact: MEDIUM-HIGH (슬롯 폭이 얼마든 맞는 배치라 같은 컴포넌트를 옮겨도 CSS를 다시 고치지 않습니다)**

브레이크포인트를 적기 전에 그것 없이 되는지 봅니다.
아래 넷 중 하나에 해당하면 `@media`를 쓰지 않습니다.

| 폭에 따라 바꾸려는 것 | 브레이크포인트 없이 쓰는 것 |
| --- | --- |
| 한 줄에 안 들어가서 줄을 바꿈 | `flex-wrap: wrap` + `flex: 1 1 <기준폭>` |
| 폭에 따라 열 개수가 달라짐 | `grid-template-columns: repeat(auto-fit, minmax(<최소>, 1fr))` |
| 슬롯을 채우되 어느 선에서 멈춤 | `flex: 1 1 <기준폭>` + `max-width` |
| 여백이나 글자 크기가 조금씩 달라짐 | `clamp(<최소>, <선호>, <최대>)` |

**`@media`는 뷰포트만 알고 그 요소가 실제로 받은 폭은 모릅니다.**
같은 컴포넌트를 넓은 본문에서 좁은 사이드바로 옮기면 뷰포트는 그대로인데 자리는 좁아집니다.
브레이크포인트로 짠 배치는 이때 깨지고, 내재적 크기로 짠 배치는 그대로 맞습니다.

브레이크포인트가 남는 경우가 있습니다.
배치가 통째로 달라질 때는 위 넷으로 안 됩니다.
사이드바가 사라지거나, 가로 두 칸이 세로 스택이 되거나, 표가 카드 목록으로 바뀌는 것이 그 경우입니다.
그때는 `layout-group-breakpoints-at-the-file-bottom` 규칙이 정한 자리에 적습니다.

**버튼과 입력처럼 낱개로 쓰는 컴포넌트는 자기 폭을 정하지 않습니다.**
버튼과 입력은 `padding`, `min-height`, 글자 크기까지만 자기 것입니다.
폭은 그 컴포넌트를 놓은 쪽이 정합니다.
놓는 쪽에서 그 폭을 왜 고정하는지가 클래스명과 선언에서 읽혀야 합니다.
`layout-keep-layout-intent-explicit` 규칙이 그 판정을 합니다.

**Incorrect (버튼이 자기 폭을 뷰포트로 정합니다):**

```css
.ui_button__root {
	display: inline-flex;
	min-height: 40px;
	padding: 0 var(--app-space-4);
	width: 300px;
}

@media (width < 1024px) {
	.ui_button__root {
		width: 200px;
	}
}

@media (width < 640px) {
	.ui_button__root {
		width: 100%;
	}
}
```

**Incorrect (열 개수를 브레이크포인트로 셉니다):**

```css
.pg_products__grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
}

@media (width < 1440px) {
	.pg_products__grid {
		grid-template-columns: repeat(3, 1fr);
	}
}

@media (width < 1024px) {
	.pg_products__grid {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (width < 640px) {
	.pg_products__grid {
		grid-template-columns: 1fr;
	}
}
```

**Correct (버튼은 자기 모양만, 폭은 놓는 쪽이 정합니다):**

```css
/* ui-button.css — 폭 얘기가 없다 */
.ui_button__root {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 40px;
	padding: 0 var(--app-space-4);
}
```

```css
/* ui-form-footer.css — 한 번 쓰고 여러 화면에서 그대로 쓴다 */
.ui_formFooter__root {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	gap: var(--app-space-3);
}

.ui_formFooter__action {
	flex: 1 1 200px;
	max-width: 300px;
}
```

**Correct (열 개수는 자리가 정합니다):**

```css
.pg_products__grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	gap: 16px;
}
```

**Correct (값이 매끄럽게 변하면 `clamp`를 씁니다):**

```css
.pg_products__hero {
	padding-block: clamp(24px, 4vw, 64px);
	font-size: clamp(1.5rem, 1rem + 2vw, 2.5rem);
}
```

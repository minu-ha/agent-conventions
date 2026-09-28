---
title: Treat Frame Sizes and Sample Text as Samples
titleKo: 프레임 폭, 고정 크기, 샘플 문구는 표본으로 읽습니다
impact: HIGH
impactDescription: 한 기기 폭과 샘플 데이터로 그린 치수가 다른 폭과 실제 데이터에서 넘치거나 비어 보이지 않습니다
appliesWhen:
  - Figma 노드의 `width`, `height`, 좌표를 CSS 값으로 옮길 때
  - 샘플 문구 길이에 맞춰 칸 폭이나 줄 수를 정할 때
reviewWith: css/layout-reach-for-intrinsic-sizing-before-breakpoints, css/layout-keep-layout-intent-explicit
tags: intent, layout, responsive, overflow
---

## Treat Frame Sizes and Sample Text as Samples

**Impact: HIGH (한 기기 폭과 샘플 데이터로 그린 치수가 다른 폭과 실제 데이터에서 넘치거나 비어 보이지 않습니다)**

Figma 프레임은 한 기기 폭에서 샘플 데이터로 그린 한 장입니다.
치수를 그대로 옮기면 다른 폭에서는 넘치거나 비고, 실제 데이터가 샘플보다 길면 글자가 겹칩니다.
그래서 Figma 치수에서는 의도만 읽고, 크기는 내용과 부모 폭이 정하게 둡니다.

| Figma 값 | 코드에서 읽는 뜻 |
| --- | --- |
| 화면 프레임 폭. 1920, 1440 | 기준 폭 하나입니다. 레이아웃은 부모 폭을 따라갑니다 |
| auto layout 없는 고정 `width` | 최소 폭이나 비율의 후보입니다. 내용이 정하는 크기를 먼저 씁니다 |
| 고정 `height` | 대개 샘플 줄 수의 결과입니다. 내용이 높이를 정하게 둡니다 |
| 절대 좌표 `x`, `y` | 배치 순서를 읽는 단서입니다. `position: absolute`로 옮기지 않습니다 |
| 샘플 문구, 숫자 | 실제 값은 이보다 길 수 있습니다. 긴 값의 말줄임과 줄바꿈을 정합니다 |

긴 값의 처리가 Figma에 없으면 한 줄 말줄임과 전체 값 툴팁을 기본으로 하고 보고에 적습니다.
화면 폭에 따라 배치가 바뀌어야 하면 브레이크포인트보다 고유 크기와 `grid`, `flex`를 먼저 씁니다.

**Incorrect 1 (샘플 문구에 맞춘 칸 폭과 높이를 그대로 옮깁니다):**

```css
.pg_products__nameCell {
	width: 270px;
	height: 54px;
}
```

**Correct 1 (최소 폭만 두고 긴 이름은 한 줄로 줄입니다):**

```css
.pg_products__nameCell {
	min-width: 12rem;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
```

---
title: Namespace Keyframes and Respect Reduced Motion
titleKo: `@keyframes` 이름에 소유자를 붙이고 `prefers-reduced-motion`을 따릅니다
impact: CRITICAL
impactDescription: 전역 이름이 겹쳐 남의 애니메이션이 바뀌지 않고 움직임에 민감한 사용자를 막지 않습니다
appliesWhen:
  - `@keyframes` 이름이나 애니메이션 지속 시간, 이징을 선언하거나 바꿀 때
  - `animation`이나 `transition`으로 움직임을 새로 넣을 때
reviewWith: values-tokenize-repeated-visual-values, tooling-configure-stylelint-to-enforce-these-rules
tags: values, motion
---

## Namespace Keyframes and Respect Reduced Motion

**Impact: CRITICAL (전역 이름이 겹쳐 남의 애니메이션이 바뀌지 않고 움직임에 민감한 사용자를 막지 않습니다)**

**`@keyframes` 이름은 전역입니다.**
클래스와 달리 파일이나 블록에 갇히지 않아서, 같은 이름을 두 파일에서 선언하면 나중에 읽힌 것이 이깁니다.
그래서 이름 앞에 소유자를 붙입니다.

| 대상 | 이름 |
| --- | --- |
| `@keyframes` | `<범위><식별자>__<동작>` — `pgProducts__fadeIn` |
| `animation` 지속 시간, 이징 | 토큰 — `var(--app-motion-duration-fast)` |

지속 시간과 이징은 값을 직접 적지 않고 토큰만 씁니다.
한 파일에서 한 번만 써도 토큰입니다. `values-tokenize-repeated-visual-values` 규칙이 그 예외를 정합니다.

`@keyframes` 이름은 클래스 이름과 표기가 다릅니다.
`-`는 `@keyframes` 이름에도 쓸 수 있지만, 클래스의 `--수정자` 표기와 섞이면
어디까지가 이름인지 흐려지므로 범위와 식별자를 붙여 씁니다.
`stylelint-config-standard`의 기본 패턴이 이 형태를 거부하므로
`tooling-configure-stylelint-to-enforce-these-rules` 규칙이 `keyframes-name-pattern`을 다시 정합니다.

**움직임을 줄여 달라고 한 사용자에게는 움직이지 않습니다.**
파일마다 따로 처리하지 않고 전역 스타일시트에 한 번 선언합니다.
어지럼증이나 전정 장애가 있는 사용자에게 움직임은 접근성 문제입니다.

- 전역 블록에서 `animation`과 `transition`을 함께 멈춥니다.
  위치가 바뀌는 것만 골라 끄지 않습니다. 전역 차단이 접근성 기본값입니다.
  색이나 투명도 전환을 살려야 하면 그 클래스를 전역 블록에 예외로 적습니다.
  컴포넌트 파일에서는 되살릴 수 없습니다. `!important`를 쓸 수 있는 자리가 전역 스타일시트뿐입니다.
- 지속 시간을 `0`으로 만들지 않고 `0.01ms`로 둡니다.
  `0`이면 `transitionend`가 오지 않아 그 이벤트를 기다리는 코드가 멈춥니다.
- 애니메이션으로 바꾸는 속성은 `transform`과 `opacity`로 둡니다.
  `width`나 `top`을 애니메이션하면 매 프레임 레이아웃을 다시 계산합니다.

**Incorrect (전역 이름을 겹치게 쓰고 시간을 직접 적음):**

```css
@keyframes fadeIn {
	from {
		opacity: 0;
	}
}

.pg_products__panel {
	animation: fadeIn 200ms ease-out;
}
```

**Correct (소유자를 붙인 이름과 토큰):**

```css
@keyframes pgProducts__fadeIn {
	from {
		opacity: 0;
		transform: translateY(4px);
	}
}

.pg_products__panel {
	animation: pgProducts__fadeIn var(--app-motion-duration-fast) var(--app-motion-easing-out);
}
```

**Correct (전역 스타일시트에서 한 번 처리):**

```css
/* style/motion.css */
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
		scroll-behavior: auto !important;
	}
}
```

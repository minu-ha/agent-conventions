---
title: Namespace Keyframes and Respect Reduced Motion
titleKo: `@keyframes` 이름에 소유자를 붙이고 움직임 줄이기를 존중합니다
impact: MEDIUM-HIGH
impactDescription: 전역 이름이 겹쳐 남의 애니메이션이 바뀌지 않고 움직임에 민감한 사용자를 막지 않습니다
appliesWhen:
  - `@keyframes`를 선언하거나 `animation`·`transition`을 추가할 때
  - 애니메이션 이름이나 지속 시간을 바꿀 때
reviewWith: values-tokenize-repeated-visual-values, tooling-configure-stylelint-to-enforce-these-rules
tags: values, motion
---

## Namespace Keyframes and Respect Reduced Motion

**Impact: MEDIUM-HIGH (전역 이름이 겹쳐 남의 애니메이션이 바뀌지 않고 움직임에 민감한 사용자를 막지 않습니다)**

**`@keyframes` 이름은 전역입니다.**
클래스와 달리 파일이나 블록에 갇히지 않아서, 같은 이름을 두 파일에서 선언하면 나중에 읽힌 것이 이깁니다.
그래서 이름 앞에 소유자를 붙입니다.

| 대상 | 이름 |
| --- | --- |
| `@keyframes` | `<범위><식별자>__<동작>` — `pgProducts__fadeIn` |
| `animation` 지속 시간·감속 곡선 | 토큰 — `var(--app-motion-duration-fast)` |

클래스 이름과 표기가 다릅니다.
`@keyframes` 이름에는 `-`를 쓸 수 없어서 범위와 식별자를 붙여 씁니다.
`stylelint-config-standard`의 기본 패턴이 이 형태를 거부하므로
`tooling-configure-stylelint-to-enforce-these-rules`가 `keyframes-name-pattern`을 다시 정합니다.

**움직임을 줄여 달라고 한 사용자에게는 움직이지 않습니다.**
파일마다 따로 처리하지 않고 전역 스타일시트에 한 번 선언합니다.
어지럼증이나 전정 장애가 있는 사용자에게 움직임은 접근성 문제입니다.

- 지속 시간을 `0`으로 만들지 않고 `0.01ms`로 둡니다.
  `0`이면 완료 이벤트가 안 올라와 그 이벤트를 기다리는 코드가 멈춥니다.
- 위치가 크게 바뀌는 움직임만 없앱니다.
  색이나 투명도가 바뀌는 것은 남겨도 됩니다.
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

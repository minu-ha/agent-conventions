---
title: Namespace Keyframes and Respect Reduced Motion
titleKo: `@keyframes` 이름에 소유자를 붙이고 `prefers-reduced-motion`을 따릅니다
impact: CRITICAL
impactDescription: 전역 애니메이션 이름의 충돌을 막고 움직임에 민감한 사용자의 설정을 따릅니다
appliesWhen:
  - `@keyframes` 이름이나 애니메이션 지속 시간, 지연 시간, 이징을 선언하거나 바꿀 때
  - `animation`, `transition`, `prefers-reduced-motion` 동작을 추가, 변경할 때
reviewWith: values-tokenize-repeated-visual-values, tooling-configure-stylelint-to-enforce-these-rules
tags: values, motion
---

## Namespace Keyframes and Respect Reduced Motion

**Impact: CRITICAL (전역 애니메이션 이름의 충돌을 막고 움직임에 민감한 사용자의 설정을 따릅니다)**

`@keyframes`에는 소유자 이름을 붙이고 움직임 감소 설정은 전역 스타일시트 한 곳에서 처리합니다.

### 이름과 토큰

일반 CSS의 클래스와 `@keyframes`는 파일로 격리되지 않으며,
같은 캐스케이드 계층의 동일한 키프레임 이름은 문서 순서상 뒤의 정의가 적용됩니다.

| 이름과 토큰 | 작성 기준 |
| --- | --- |
| `@keyframes` 이름 | `<범위>_<식별자>__<동작>`으로 씁니다. 예: `pg_products__fadeIn` |
| 지속 시간과 이징 | 한 파일에서 한 번만 써도 토큰으로 둡니다. 예: `var(--app-motion-duration-fast)` |

소유자 접두사는 `naming-use-scope-slug-element-modifier-syntax`와 같습니다.
지속 시간과 이징 토큰은 `values-tokenize-repeated-visual-values`의 예외입니다.

### 도구 설정과 속성

| 도구 설정과 속성 선택 | 기준 |
| --- | --- |
| 이름 검사 | `stylelint-config-standard`의 kebab-case 기본값을 `keyframes-name-pattern`으로 바꿉니다 |
| 애니메이션 속성 | `transform`과 `opacity`를 씁니다. `width`나 `top`은 매 프레임 레이아웃을 다시 계산합니다 |

`keyframes-name-pattern` 값은 `tooling-configure-stylelint-to-enforce-these-rules`가 정합니다.

### 움직임 감소 처리

움직임은 어지럼증이나 전정 장애가 있는 사용자에게 접근성 문제입니다.
**움직임 감소 요청에는 전역에서 `animation`과 `transition`을 함께 차단하는 것을 기본으로 합니다.**

| 전역 처리 | 기준과 예외 |
| --- | --- |
| 차단 범위 | 위치 이동만 골라 끄지 않습니다. 색이나 투명도 전환이 필요하면 전역 블록에서 해당 클래스를 예외로 적습니다 |
| 컴포넌트 파일 | 움직임을 되살리지 않습니다. `!important`는 전역 스타일시트에서만 허용합니다 |
| 지속 시간과 지연 | 지속 시간은 `0.01ms`, 지연은 `0s`로 줄여 이전 상태에서 기다리지 않게 합니다 |
| 완료 처리 | 전환 지속 시간과 지연이 모두 `0s`이면 `transitionend`가 발생하지 않습니다 |

`0.01ms`도 발생을 보장하지 않으므로 취소되거나 제거된 요소의 완료를 이벤트에만 맡기지 않습니다.

**Incorrect 1 (전역 이름을 겹치게 쓰고 시간을 직접 적습니다):**

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

**Correct 1 (소유자를 붙인 이름과 토큰을 씁니다):**

```css
@keyframes pg_products__fadeIn {
	from {
		opacity: 0;
	}
}

.pg_products__panel {
	animation: pg_products__fadeIn var(--app-motion-duration-fast) var(--app-motion-easing-out);
}
```

**Incorrect 2 (컴포넌트 파일마다 따로 끄고 지속 시간을 `0`으로 둡니다):**

```css
/* src/page/products/pg-products.css */
@media (prefers-reduced-motion: reduce) {
	.pg_products__panel {
		animation-duration: 0s;
	}
}
```

**Correct 2 (전역 스타일시트에서 한 번 처리합니다):**

```css
/* src/style/motion.css */
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		animation-delay: 0s !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
		transition-delay: 0s !important;
		scroll-behavior: auto !important;
	}
}
```

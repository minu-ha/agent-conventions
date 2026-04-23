---
title: Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules
impact: HIGH
impactDescription: keeps the global `scope_slug` naming system meaningful instead of hiding ownership behind local module indirection
tags: naming, css-modules, ownership
---

## Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules

**Impact: HIGH (keeps the global `scope_slug` naming system meaningful instead of hiding ownership behind local module indirection)**

이 CSS skill은 기본적으로 plain `*.css`와 전역 고유 클래스명을 전제로 합니다. `ft_*`, `rt_*`, `ui_*`, `wg_*`, `loc_*` 네임스페이스는 global class space에서 owner를 추적하려고 존재하므로, 프로젝트에 별도 합의가 없다면 `.module.css`와 `styles.foo`를 기본 선택으로 삼지 않습니다. 프로젝트가 이미 CSS Modules를 공식 표준으로 채택했고 그에 맞는 naming/runtime 규칙이 따로 있다면, 그 프로젝트 로컬 규칙이 이 기본값보다 우선합니다.

**Incorrect (프로젝트 표준이 없는데도 CSS Modules를 기본처럼 사용):**

```tsx
import styles from "./mission-control.module.css";

<div className={styles.rt_star_wars_mission_control__hero}>
	<span className={styles.rt_star_wars_mission_control__eyebrow}>
		GraphQL operations deck
	</span>
</div>
```

```css
.rt_star_wars_mission_control__hero {
	display: grid;
}

.rt_star_wars_mission_control__eyebrow {
	letter-spacing: 0.08em;
}
```

**Correct (기본은 plain CSS와 전역 고유 클래스명을 사용):**

```tsx
import { clsx } from "clsx";
import "./mission-control.css";

<div className={clsx("rt_mc__hero")}>
	<span className={clsx("rt_mc__eyebrow")}>GraphQL operations deck</span>
</div>
```

```css
.rt_mc__hero {
	display: grid;
}

.rt_mc__eyebrow {
	letter-spacing: 0.08em;
}
```

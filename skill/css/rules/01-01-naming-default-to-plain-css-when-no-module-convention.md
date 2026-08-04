---
title: Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules
titleKo: 프로젝트 표준이 없으면 일반 CSS를 씁니다
impact: HIGH
impactDescription: 클래스명이 전역에서 고유해야 범위_식별자로 소유자를 되짚을 수 있습니다
appliesWhen:
  - 표준이 정해지지 않은 상태에서 스타일시트 방식(일반 CSS, CSS Modules)을 고르거나 `.module.css`·`styles.*`로 옮길 때
  - 제외: 기존 일반 CSS 클래스 이름만 바꾸는 경우
tags: naming, css-modules, ownership
---

## Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules

**Impact: HIGH (클래스명이 전역에서 고유해야 범위_식별자로 소유자를 되짚을 수 있습니다)**

이 CSS 스킬은 일반 `*.css`와 전역에서 고유한 클래스명을 전제로 씁니다.
`pg_*`, `wg_*`, `ui_*` 네임스페이스가 있는 이유는 전역 클래스 공간에서 소유자를 되짚기 위해서입니다.
그래서 프로젝트에 별도 합의가 없으면 `.module.css`나 `styles.foo`로 시작하지 않습니다.
프로젝트가 이미 CSS Modules를 공식 표준으로 정했고 그에 맞는 이름·실행 규칙이 따로 있다면,
그 프로젝트 규칙이 이 기본값보다 앞섭니다.

**Incorrect (프로젝트 표준이 없는데도 CSS Modules를 기본처럼 사용):**

```tsx
import styles from "./catalog-index.module.css";

<section className={styles.hero}>
	<span className={styles.eyebrow}>Catalog</span>
</section>
```

```css
.hero {
	display: grid;
}

.eyebrow {
	letter-spacing: 0.08em;
}
```

**Correct (기본은 일반 CSS와 전역에서 고유한 클래스 이름을 사용):**

```tsx
import { clsx } from "clsx";
import "./_index.css";

<section className={clsx("pg_catalogIndex__hero")}>
	<span className={clsx("pg_catalogIndex__eyebrow")}>Catalog</span>
</section>
```

```css
.pg_catalogIndex__hero {
	display: grid;
}

.pg_catalogIndex__eyebrow {
	letter-spacing: 0.08em;
}
```

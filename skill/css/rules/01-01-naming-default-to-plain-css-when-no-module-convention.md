---
title: Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules
titleKo: 프로젝트 표준이 없으면 plain CSS 기본 사용
impact: HIGH
impactDescription: 소유를 local module 간접층에 숨기지 않고 전역 scope_slug 이름 체계가 의미를 유지하게 합니다
appliesWhen:
  - 프로젝트 표준 미확정 상태에서 새 스타일시트 접근 형식(plain CSS, CSS Modules)을 선택하거나 `.module.css`·`styles.*`로 전환할 때
  - 제외: 기존 plain CSS 클래스 rename만 하는 경우
tags: naming, css-modules, ownership
---

## Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules

**Impact: HIGH (소유를 local module 간접층에 숨기지 않고 전역 scope_slug 이름 체계가 의미를 유지하게 합니다)**

이 CSS skill은 plain `*.css`와 전역에서 고유한 클래스명을 전제로 씁니다.
`pg_*`, `wg_*`, `ui_*` 네임스페이스가 있는 이유는 전역 클래스 공간에서 소유자를 되짚기 위해서입니다.
그래서 프로젝트에 별도 합의가 없으면 `.module.css`나 `styles.foo`로 시작하지 않습니다.
프로젝트가 이미 CSS Modules를 공식 표준으로 채택했고 그에 맞는 naming/runtime 규칙이 따로 있다면,
그 프로젝트 로컬 규칙이 이 기본값보다 우선합니다.

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

**Correct (기본은 plain CSS와 전역 고유 클래스명을 사용):**

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

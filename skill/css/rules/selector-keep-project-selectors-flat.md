---
title: Keep Project-owned Selectors Flat
impact: CRITICAL
impactDescription: reduces cascade coupling by keeping project-owned selectors independent instead of descendant-driven
tags: selectors, nesting, flat-structure
---

## Keep Project-owned Selectors Flat

**Impact: CRITICAL (reduces cascade coupling by keeping project-owned selectors independent instead of descendant-driven)**

프로젝트가 직접 소유한 선택자는 플랫 구조를 기본으로 작성합니다. 전처리기 중첩 문법은 project-owned 클래스끼리 부모-자식 관계를 표현하는 데 쓰지 말고, 각 element 클래스가 독립적으로 읽히도록 유지합니다. 이 규칙은 project-owned 클래스 선언 자체의 구조를 다루며, 서드파티 DOM anchor 규칙은 별도로 `selector-target-third-party-dom-from-owned-roots`에서 다룹니다.

**Incorrect (project-owned 클래스 구조를 중첩 selector로 표현):**

```css
.rt_pctbi__layout {
	& .rt_pctbi__panel {
		& .rt_pctbi__item {
			padding: 8px;
		}
	}
}
```

**Correct (플랫한 클래스 단위로 선언):**

```css
.rt_pctbi__layout {
	display: grid;
}

.rt_pctbi__panel {
	border: 1px solid var(--cms-color-border, #d9d9d9);
}

.rt_pctbi__item {
	padding: 8px;
}
```

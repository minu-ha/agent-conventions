---
title: Keep Project-owned Selectors Flat
impact: CRITICAL
impactDescription: reduces cascade coupling by keeping project-owned selectors independent instead of descendant-driven
tags: selectors, nesting, flat-structure
---

## Keep Project-owned Selectors Flat

**Impact: CRITICAL (reduces cascade coupling by keeping project-owned selectors independent instead of descendant-driven)**

프로젝트가 직접 소유한 선택자는 플랫 구조를 기본으로 작성합니다. 전처리기 중첩 문법은 project-owned 클래스끼리 부모-자식 관계를 표현하는 데 쓰지 말고, 각 element 클래스가 독립적으로 읽히도록 유지합니다. 이 규칙은 project-owned 클래스 선언 자체의 구조를 다루며, 서드파티 DOM anchor 규칙은 별도로 `selector-target-third-party-dom-from-owned-roots`에서 다룹니다.

예외는 owner가 rich text나 uncontrolled markup wrapper를 직접 소유하는 경우입니다. `__prose`, `__copy`, `__content`처럼 wrapper 자체가 raw element styling의 경계라면, 그 owner block 안에서만 `& h2`, `& p`, `& > :first-child` 같은 nested element selector를 사용할 수 있습니다. 이 예외는 raw HTML element나 structural pseudo에만 적용되며, 다른 project-owned 클래스를 `.owner__prose .owner__child`처럼 다시 체이닝하는 근거가 되지는 않습니다.

**Incorrect (project-owned 클래스 관계를 descendant selector로 표현하거나, owner wrapper element styling을 block 밖으로 흩뿌림):**

```css
.rt_pctbi__layout {
	& .rt_pctbi__panel {
		padding: 8px;
	}
}

.wg_entryDetail__prose h2 {
	margin: 24px 0 12px;
}

.wg_entryDetail__prose > :first-child {
	margin-top: 0;
}
```

**Correct (project-owned 클래스는 플랫하게 두고, rich text wrapper 예외는 같은 block 안에 국한함):**

```css
.rt_pctbi__layout {
	display: grid;
}

.rt_pctbi__panel {
	padding: 8px;
}

.wg_entryDetail__prose {
	& h2 {
		margin: 24px 0 12px;
	}

	& > :first-child {
		margin-top: 0;
	}
}
```

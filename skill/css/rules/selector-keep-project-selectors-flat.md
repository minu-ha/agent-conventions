---
title: Keep Project-owned Selectors Flat
titleKo: 프로젝트 소유 셀렉터는 평평하게
impact: CRITICAL
impactDescription: 프로젝트 소유 셀렉터를 descendant 의존 대신 독립적으로 두어 cascade 결합을 줄임
appliesWhen: >-
  project-owned class를 중첩·descendant selector로 연결하거나 raw HTML prose·copy·content wrapper 안 element selector를
  추가·수정한다.
tags: selectors, nesting, flat-structure
---

## Keep Project-owned Selectors Flat

**Impact: CRITICAL (프로젝트 소유 셀렉터를 descendant 의존 대신 독립적으로 두어 cascade 결합을 줄임)**

프로젝트가 직접 소유한 선택자는 플랫 구조를 기본으로 작성합니다.

판단 기준:

- 기본값: project-owned class는 각각 top-level block으로 선언합니다.
- 금지: project-owned class끼리 부모-자식 관계를 descendant selector로 표현하지 않습니다.
- 예외: `__prose`, `__copy`, `__content`처럼 raw HTML wrapper가 owner boundary라면 같은 block 안에서 `& h2`, `& p`,
  `& > :first-child`를 허용합니다.
- 별도 규칙: third-party DOM anchor는 `selector-target-third-party-dom-from-owned-roots`를 따릅니다.

rich text 예외는 raw element styling에만 적용됩니다.
`.owner__prose .owner__child`처럼 다른 project-owned class를 다시 체이닝하는 근거로 쓰지 않습니다.

**Incorrect (project-owned 클래스 관계를 descendant selector로 쓰고, wrapper styling을 block 밖으로 흩뿌림):**

```css
.rt_catalogIndex__layout {
	& .rt_catalogIndex__panel {
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
.rt_catalogIndex__layout {
	display: grid;
}

.rt_catalogIndex__panel {
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

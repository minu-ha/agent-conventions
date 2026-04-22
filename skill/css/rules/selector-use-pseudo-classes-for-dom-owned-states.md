---
title: Use Pseudo-classes for DOM-owned States
impact: HIGH
impactDescription: keeps browser-owned interaction states separate from app-owned state modifiers
tags: pseudo-classes, state, interaction
---

## Use Pseudo-classes for DOM-owned States

**Impact: HIGH (keeps browser-owned interaction states separate from app-owned state modifiers)**

`:hover`, `:visited`, `:focus`, `:focus-visible`, `:disabled`, `:checked`처럼 브라우저와 DOM이 직접 부여하는 상태는 반드시 같은 클래스 블록 내부 nested `&:` 형태로 표현합니다. top-level `.foo:hover {}`처럼 selector를 다시 열지 말고, `.foo { &:hover {} }`로 owner block 안에 접어 넣습니다. 반대로 `selected`, `active`, `error`처럼 화면이나 도메인이 결정하는 상태는 modifier 클래스로 유지합니다.

DOM state가 자식 element의 시각적 결과에 영향을 주더라도 pseudo는 부모 owner block에 붙인 채로 유지합니다. 이런 경우 `.foo:hover .foo__icon`처럼 project-owned descendant coupling을 만들기보다, 부모 block에서 CSS 변수나 명시적 상태 contract를 바꾸고 자식 block이 그 값을 읽게 하는 쪽을 기본으로 삼습니다.

**Incorrect (pseudo-class를 top-level selector로 다시 열거나, parent state를 child selector coupling으로 표현함):**

```css
.wg_siteHeader__brandLink:hover {
	color: var(--mk-color-link-hover);
}

.wg_siteHeader__brandLink:hover .wg_siteHeader__brandMark {
	transform: rotate(-2deg);
}

.rt_pmli__assetCard {
	&:selected {
		border-color: var(--cms-color-primary, #1677ff);
	}
}
```

**Correct (DOM 상태는 같은 block 안 nested `&:`로 두고, 화면 상태는 modifier로 분리):**

```css
.wg_siteHeader__brandLink {
	--wg-site-header-brand-mark-transform: translateY(1px);
	color: var(--mk-color-link);

	&:hover {
		--wg-site-header-brand-mark-transform: translateY(1px) rotate(-2deg);
		color: var(--mk-color-link-hover);
	}
}

.wg_siteHeader__brandMark {
	transform: var(--wg-site-header-brand-mark-transform);
}

.rt_pmli__assetCardButton {
	cursor: default;

	&:disabled {
		opacity: 1;
	}

	&:hover:not(:disabled) {
		cursor: pointer;
	}
}

.rt_pmli__assetCard--selected {
	border-color: var(--cms-color-primary, #1677ff);
}
```

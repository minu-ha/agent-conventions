---
title: Use Pseudo-classes for DOM-owned States
titleKo: DOM이 소유한 상태에는 pseudo-class
impact: HIGH
impactDescription: keeps browser-owned interaction states separate from app-owned state modifiers
impactDescriptionKo: 브라우저가 소유한 상호작용 상태를 앱이 소유한 상태 modifier와 분리함
appliesWhen: >-
  `:hover`, `:visited`, `:focus*`, `:disabled`, `:checked`를 추가·수정하거나 parent DOM state가 child styling에 영향을
  준다.
requiresSelected: values-separate-domain-state-modifiers-from-dom-interaction-states
tags: pseudo-classes, state, interaction
---

## Use Pseudo-classes for DOM-owned States

**Impact: HIGH (keeps browser-owned interaction states separate from app-owned state modifiers)**

브라우저와 DOM이 직접 부여하는 상태는 같은 클래스 block 안의 nested `&:`로 표현합니다.
화면이나 도메인이 결정하는 상태는 modifier class로 분리합니다.

base/modifier 분리에서는 domain state와 무관한 hover, focus,
disabled interaction을 unconditional base element block에 둡니다.
interaction selector를 modifier 아래로 옮겨 적용 대상을 좁히지 않습니다.
modifier가 켜진 경우에만 interaction이 달라져야 한다는 별도 제품 요구가 있을 때만 그 예외를 명시합니다.

구분 기준:

- DOM-owned: `:hover`, `:visited`, `:focus`, `:focus-visible`, `:disabled`, `:checked`
- App-owned: `selected`, `active`, `error`, `expanded`, `current`
- DOM state가 child element를 바꿔야 하면 parent block에서 CSS 변수를 바꾸고 child block이 그 값을 읽게 합니다.
- `.foo:hover .foo__icon`처럼 project-owned descendant coupling으로 상태를 전달하지 않습니다.

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
		border-color: var(--app-color-accent, #1677ff);
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
	border-color: var(--app-color-accent, #1677ff);
}
```

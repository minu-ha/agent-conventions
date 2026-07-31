---
title: Use Pseudo-classes for DOM-owned States
titleKo: DOM 소유 상태에 pseudo-class 사용
impact: HIGH
impactDescription: 브라우저가 소유한 상호작용 상태를 앱이 소유한 상태 modifier와 분리합니다
appliesWhen:
  - `:hover`, `:visited`, `:focus*`, `:disabled`, `:checked`를 추가·수정할 때
  - parent DOM state가 child styling에 영향을 줄 때
requiresSelected: values-separate-domain-state-modifiers-from-dom-interaction-states
tags: pseudo-classes, state, interaction
---

## Use Pseudo-classes for DOM-owned States

**Impact: HIGH (브라우저가 소유한 상호작용 상태를 앱이 소유한 상태 modifier와 분리합니다)**

브라우저와 DOM이 직접 부여하는 상태는 같은 클래스 block 안의 nested `&:`로 표현합니다.
화면이나 도메인이 결정하는 상태는 modifier class로 분리합니다.

| 소유 | 상태 | 표현 |
| --- | --- | --- |
| DOM | `:hover`, `:visited`, `:focus-visible`, `:disabled`, `:checked` | 같은 block 안 nested `&:` |
| 앱 | `selected`, `active`, `error`, `expanded`, `current` | `--modifier` class |

- pseudo-class를 top-level selector로 다시 열지 않습니다.
- 도메인 상태를 `:not(.--modifier)`로 뒤집지 않습니다.
  읽는 사람이 부정 조건을 뒤집어야 하고 combinator 예산도 함께 먹습니다. 예외는 자손 modifier로 옮깁니다.
- DOM state가 자손을 바꿔야 하면 조상 block에서 custom property를 바꾸고 자손이 그 값을 읽습니다.
- `.foo:hover .foo__icon`처럼 project-owned descendant coupling으로 상태를 전달하지 않습니다.

base/modifier 배치와 focus 접근성은 `values-separate-domain-state-modifiers-from-dom-interaction-states`가 담당합니다.

**Incorrect (pseudo-class를 top-level selector로 다시 열거나, parent state를 child selector coupling으로 표현함):**

```css
.wg_siteHeader__brandLink:hover {
	color: var(--mk-color-link-hover, #0958d9);
}

.wg_siteHeader__brandLink:hover .wg_siteHeader__brandMark {
	transform: rotate(-2deg);
}

.pg_assetIndex__card {
	&[aria-selected="true"] {
		border-color: var(--app-color-accent);
	}
}

.pg_assetIndex__card:not(.pg_assetIndex__card--checked) .pg_assetIndex__cardBox {
	border-color: var(--app-color-border);
}
```

**Correct (DOM 상태는 같은 block 안 nested `&:`로 두고, 화면 상태는 modifier로 분리):**

```css
.wg_siteHeader__brandLink {
	--wg-site-header-brand-mark-transform: translateY(1px);
	color: var(--mk-color-link, #1677ff);

	&:hover {
		--wg-site-header-brand-mark-transform: translateY(1px) rotate(-2deg);
		color: var(--mk-color-link-hover, #0958d9);
	}
}

.wg_siteHeader__brandMark {
	transform: var(--wg-site-header-brand-mark-transform);
}

.pg_assetIndex__cardButton {
	cursor: default;

	&:disabled {
		opacity: 1;
	}

	&:hover:not(:disabled) {
		cursor: pointer;
	}
}

.pg_assetIndex__card--selected {
	border-color: var(--app-color-accent);
}
```

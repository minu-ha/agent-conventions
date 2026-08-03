---
title: Nest DOM State Pseudo-classes in the Owning Block
titleKo: DOM 상태 pseudo-class의 소유 block 내 중첩
impact: HIGH
impactDescription: 한 요소의 상태 스타일을 그 요소 block 안에 모아 base와 상태를 한 자리에서 읽게 합니다
appliesWhen:
  - `:hover`, `:focus-visible`, `:disabled`, `:checked` 스타일을 추가·수정할 때
  - 조상의 DOM 상태가 자손 스타일을 바꿔야 할 때
reviewWith: >-
  selector-limit-nesting-block-depth, selector-use-pseudo-classes-for-dom-owned-states,
  selector-do-not-group-classes-with-commas
tags: selectors, pseudo-classes, nesting
---

## Nest DOM State Pseudo-classes in the Owning Block

**Impact: HIGH (한 요소의 상태 스타일을 그 요소 block 안에 모아 base와 상태를 한 자리에서 읽게 합니다)**

DOM 상태 pseudo-class는 그 요소의 class block 안에서 `&:`로 씁니다.
같은 pseudo-class를 top-level selector로 다시 열지 않습니다.

- base와 상태가 한 block에 있어서 무엇이 어떻게 바뀌는지 한 자리에서 읽힙니다.
- 파일 어디에 상태 스타일이 더 있는지 찾지 않습니다.
- 여러 상태가 같은 선언을 쓰면 `:is()`로 묶습니다. `,` 목록은 쓰지 않습니다.

조상의 DOM 상태가 자손을 바꿔야 하면 slug가 같은 자손을 결합자 하나로 겨냥합니다.
자손의 `:hover`는 포인터가 자손 위에 있을 때만 걸려서 조상 상태를 알 방법이 없고,
CSS에 부모 선택자가 없어서 대체 수단이 없습니다.

지역 custom property로 상태를 전달하지 않습니다. `values-tokenize-repeated-visual-values`가 막습니다.

기계 검증은 `max-nesting-depth: 1`과 `no-duplicate-selectors`입니다.

**Incorrect (pseudo-class를 top-level selector로 다시 엶):**

```css
.wg_siteHeader__brandLink {
	color: #1677ff;
}

.wg_siteHeader__brandLink:hover {
	color: #0958d9;
}

.wg_siteHeader__brandLink:focus-visible {
	outline: 2px solid #1677ff;
}
```

**Incorrect (조상 상태를 지역 변수로 자손에 전달함):**

```css
.wg_siteHeader__brandLink {
	--wg-header-mark-tilt: 0deg;

	&:hover {
		--wg-header-mark-tilt: -2deg;
	}
}

.wg_siteHeader__brandMark {
	transform: rotate(var(--wg-header-mark-tilt));
}
```

**Correct (상태를 같은 block 안 `&:`로 접고 여러 상태는 `:is()`로 묶음):**

```css
.wg_siteHeader__brandLink {
	color: #1677ff;

	&:is(:hover, :focus-visible) {
		color: #0958d9;
	}

	&:focus-visible {
		outline: 2px solid #1677ff;
		outline-offset: 2px;
	}
}
```

**Correct (조상 상태가 자손을 바꾸면 같은 owner 안에서 결합자 하나):**

```css
.wg_siteHeader__brandLink {
	color: #1677ff;

	&:hover .wg_siteHeader__brandMark {
		transform: rotate(-2deg);
	}
}

.wg_siteHeader__brandMark {
	transform: rotate(0deg);
}
```

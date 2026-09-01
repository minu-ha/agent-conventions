---
title: Nest DOM State Pseudo-classes in the Owning Block
titleKo: 상태 가상 클래스는 그 요소 블록 안에 넣습니다
impact: MEDIUM
impactDescription: 한 요소의 기본 모습과 상태 변화를 한 블록에서 나란히 읽습니다
appliesWhen:
  - `:hover`, `:focus-visible`, `:disabled`, `:checked` 스타일을 추가·수정할 때
  - 조상의 DOM 상태가 자손 스타일을 바꿔야 할 때
reviewWith: >-
  selector-limit-nesting-block-depth, selector-use-pseudo-classes-for-dom-owned-states,
  selector-do-not-group-classes-with-commas
tags: selector, pseudo-classes, nesting
---

## Nest DOM State Pseudo-classes in the Owning Block

**Impact: MEDIUM (한 요소의 기본 모습과 상태 변화를 한 블록에서 나란히 읽습니다)**

DOM 상태 가상 클래스는 그 요소의 클래스 블록 안에서 `&:`로 씁니다.
같은 가상 클래스를 블록 바깥에서 다시 열지 않습니다.

- 기본 모습과 상태 변화가 한 블록에 있어서 무엇이 어떻게 바뀌는지 바로 읽힙니다.
- 파일 어디에 상태 스타일이 더 있는지 찾지 않습니다.
- 여러 상태가 같은 선언을 쓰면 상태마다 블록을 따로 엽니다.
  묶어서 공유하지 않는 이유는 `selector-do-not-group-classes-with-commas` 규칙이 정합니다.

조상의 DOM 상태가 자손을 바꿔야 하면 식별자가 같은 자손을 결합자 하나로 겨냥합니다.
자손의 `:hover`는 포인터가 자손 위에 있을 때만 걸려서 조상 상태를 알 방법이 없습니다.
`:has()`로 조상을 겨냥할 수는 있지만 쓰지 않습니다.
자손 블록에서 조상 조건을 읽으면 그 자손이 어디에 놓였는지에 얽매여, 조상을 옮길 때 조용히 깨집니다.

자손의 기본 블록은 조상 규칙보다 **앞에** 둡니다.
뒤에 두면 명시도가 낮은 규칙이 높은 규칙 뒤에 오고, `no-descending-specificity` 규칙이 이를 잡습니다.

지역 변수로 상태를 전달하지 않습니다.
`values-tokenize-repeated-visual-values` 규칙이 막습니다.

| 기계 검증 | 잡는 것 |
| --- | --- |
| `selector-disallowed-list` | 최상위에 다시 연 상태 가상 클래스 |
| `property-disallowed-list` | 지역 변수 선언 |

**Incorrect (가상 클래스를 최상위 선택자로 다시 엽니다):**

```css
.wg_siteHeader__brandLink {
	color: #1677ff;
}

.wg_siteHeader__brandLink:hover {
	color: #0958d9;
}

.wg_siteHeader__brandLink:focus-visible {
	color: #0958d9;
	outline: 2px solid #1677ff;
}
```

**Correct (상태를 같은 블록 안 `&:`로 접고 상태마다 블록을 따로 엽니다):**

```css
.wg_siteHeader__brandLink {
	color: #1677ff;

	&:hover {
		color: #0958d9;
	}

	&:focus-visible {
		color: #0958d9;
		outline: 2px solid #1677ff;
	}
}
```

**Incorrect (조상이 hover일 때 바뀌는 모습을 자손 블록의 `&:hover`로 씁니다):**

```css
.wg_siteHeader__brandMark {
	transform: rotate(0deg);

	&:hover {
		transform: rotate(-2deg);
	}
}

.wg_siteHeader__brandLink {
	color: #1677ff;
}
```

**Correct (조상 상태가 자손을 바꾸면 같은 소유자 안에서 결합자 하나만 씁니다):**

```css
.wg_siteHeader__brandMark {
	transform: rotate(0deg);
}

.wg_siteHeader__brandLink {
	color: #1677ff;

	&:hover .wg_siteHeader__brandMark {
		transform: rotate(-2deg);
	}
}
```

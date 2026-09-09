---
title: Always Provide a Visible Focus Indicator
titleKo: 포커스 표시는 항상 눈에 보이게 남깁니다
impact: HIGH
impactDescription: 포커스 위치를 형태로 구분해 키보드 사용자가 현재 위치를 알 수 있습니다
appliesWhen:
  - `outline`, `:focus`, `:focus-visible` 스타일을 추가, 수정할 때
  - 상호작용 요소의 기본 포커스 링을 덮어쓸 때
  - 강제 색상 모드에서 포커스 표시가 사라져 스타일을 보완할 때
reviewWith: selector-nest-dom-state-in-the-owning-block
tags: accessibility, focus, interaction
---

## Always Provide a Visible Focus Indicator

**Impact: HIGH (포커스 위치를 형태로 구분해 키보드 사용자가 현재 위치를 알 수 있습니다)**

포커스 표시를 유지하고 `outline: none`을 쓸 때는 대체 스타일을 함께 제공합니다.
표시는 수정자 안에만 두지 않고 **기본 블록의 `:focus-visible`**로 선언합니다.

| 확인 항목 | 기준 |
| --- | --- |
| 표시 시점 | `:focus`보다 `:focus-visible`을 씁니다 |
| 표시 형태 | 색만 바꾸지 않고 `outline`, `box-shadow` 링, `border` 두께처럼 형태도 바꿉니다. 색각 이상에서도 구분할 수 있어야 합니다 |
| 컨벤션 기본값 | 인접 배경과 대비가 3:1 이상인 2 CSS px 이상의 외곽선을 씁니다 |
| 앱 상태 | `--focused` 같은 수정자로 대체하지 않습니다. 앱의 입력 방식 추적이 브라우저 판단이나 사용자 설정과 어긋날 수 있습니다 |
| 강제 색상 모드 | `forced-colors: active`에서는 `box-shadow`가 없어집니다. 투명한 `outline`을 함께 두거나 조건 안에서 시스템 색 외곽선을 제공합니다 |
| 사용자 색상 설정 | `forced-color-adjust: none`으로 끄지 않습니다 |

`:focus-visible`의 적용은 브라우저가 입력 방식과 사용자 설정으로 판단합니다.
버튼 클릭에서 숨고 키보드 이동이나 텍스트 입력에서 보이는 경향을 고정 규칙으로 가정하지 않습니다.

WCAG 2.2 SC 1.4.11(AA)은 인접 색 대비를 다룹니다.
SC 2.4.13(AAA)은 2 CSS px 둘레에 해당하는 최소 면적과 포커스 전후 같은 픽셀의 3:1 대비를 요구합니다.
AAA 기준을 모든 표시의 두께가 반드시 2px이어야 한다는 뜻으로 읽지 않습니다.

**Incorrect 1 (포커스 링을 제거하고 대체를 두지 않습니다):**

```css
.ui_button__root {
	border: 1px solid #d9d9d9;

	&:focus {
		outline: none;
	}
}
```

**Correct 1 (`:focus-visible`에 형태가 바뀌는 표시를 기본 블록에 둡니다):**

```css
.ui_button__root {
	border: 1px solid #d9d9d9;

	&:focus-visible {
		outline: 2px solid #1677ff;
		outline-offset: 2px;
	}
}
```

**Incorrect 2 (색만 바꾸고 수정자 안에만 둡니다):**

```css
.ui_input__field--invalid {
	&:focus-visible {
		outline: none;
		color: #1677ff;
	}
}
```

**Correct 2 (그림자 링에 투명한 외곽선을 함께 두어 강제 색상 모드에서도 표시를 남깁니다):**

```css
.ui_input__field {
	border: 1px solid #d9d9d9;

	&:focus-visible {
		outline: 2px solid transparent;
		outline-offset: 2px;
		border-color: #1677ff;
		box-shadow: 0 0 0 3px #1677ff;
	}
}
```

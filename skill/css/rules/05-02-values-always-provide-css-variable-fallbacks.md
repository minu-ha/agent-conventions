---
title: Declare Core Tokens Once and Fall Back Everywhere Else
titleKo: core token 선언과 그 밖 var()의 fallback 지정
impact: HIGH
impactDescription: 토큰 누락이 스타일을 조용히 망가뜨리는 것을 막고 fallback이 매직 넘버로 번지는 것도 막습니다
appliesWhen:
  - `var(--*)` 사용을 추가하거나 변수 이름·fallback을 바꿀 때
  - core token 목록에 항목을 추가·제거할 때
reviewWith: values-tokenize-repeated-visual-values
tags: variables, fallbacks, tokens
---

## Declare Core Tokens Once and Fall Back Everywhere Else

**Impact: HIGH (토큰 누락이 스타일을 조용히 망가뜨리는 것을 막고 fallback이 매직 넘버로 번지는 것도 막습니다)**

프로젝트는 전역에서 항상 주입되는 **core token 목록**을 한 곳에 선언합니다.
`:root` 또는 전역 theme stylesheet가 그 목록의 단일 출처입니다.

판정은 목록 대조로 끝냅니다.

| 대상 | fallback |
| --- | --- |
| core token 목록에 있는 변수 | **쓰지 않습니다.** 누락을 fail-loud로 드러냅니다 |
| 그 밖의 모든 `var()` | **씁니다.** 값이 없을 때 안전한 기본값을 둡니다 |

core token에 fallback을 붙이지 않는 이유는 `values-tokenize-repeated-visual-values`와 충돌하기 때문입니다.
`var(--app-space-3, 12px)`가 100곳에 있으면 `12px`을 100곳에 하드코딩한 것과 같아서 토큰화의 목적이 사라집니다.
값을 한 곳에서 바꾸려면 그 한 곳이 유일해야 합니다.

fallback이 필요한 쪽은 주입 주체가 프로젝트가 아닌 경계입니다.
서드파티 wrapper 내부, 선택적 theme, 임시 overlay, 조건부로만 주입되는 변수가 여기 해당합니다.

요청에 없는 CSS variable을 이 규칙 때문에 새로 발명하지 않습니다.

**Incorrect (core token에 fallback을 붙여 값을 두 곳으로 흩음):**

```css
.pg_postFilterDialog__panel {
	gap: var(--app-space-3, 12px);
	color: var(--app-color-text-primary, #212529);
}
```

**Incorrect (서드파티 내부에 주입 보장 없는 변수를 fallback 없이 사용):**

```css
.pg_postFilterDialog__collapse {
	& .ant-collapse-item {
		border-radius: var(--mk-size-radius-card);
	}
}
```

**Correct (core token은 fallback 없이, 그 밖은 fallback과 함께):**

```css
/* core token 목록: src/style/token.css */
:root {
	--app-space-3: 12px;
	--app-color-text-primary: #212529;
}

.pg_postFilterDialog__panel {
	gap: var(--app-space-3);
	color: var(--app-color-text-primary);
}

.pg_postFilterDialog__collapse {
	& .ant-collapse-item {
		border-radius: var(--mk-size-radius-card, 10px);
	}
}
```

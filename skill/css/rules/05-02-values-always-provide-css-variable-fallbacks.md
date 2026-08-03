---
title: Declare Core Tokens Once and Fall Back Everywhere Else
titleKo: 공통 토큰은 한 곳에 선언하고 그 밖 var()에는 대체값을 둡니다
impact: HIGH
impactDescription: 토큰이 빠지면 조용히 깨지지 않고 드러나며, 대체값이 매직 넘버로 번지지도 않습니다
appliesWhen:
  - `var(--*)`를 새로 쓰거나 변수 이름이나 대체값을 바꿀 때
  - 공통 토큰 목록에 항목을 넣거나 뺄 때
reviewWith: values-tokenize-repeated-visual-values
tags: variables, fallbacks, tokens
---

## Declare Core Tokens Once and Fall Back Everywhere Else

**Impact: HIGH (토큰이 빠지면 조용히 깨지지 않고 드러나며, 대체값이 매직 넘버로 번지지도 않습니다)**

프로젝트는 전역에서 항상 주입되는 **공통 토큰 목록**을 한 곳에 선언합니다.
`:root`나 전역 테마 스타일시트가 그 목록의 단일 출처입니다.

판정은 목록 대조로 끝냅니다.

| 대상 | 대체값 |
| --- | --- |
| 공통 토큰 목록에 있는 변수 | **쓰지 않습니다.** 빠진 것을 곧바로 드러냅니다 |
| 그 밖의 모든 `var()` | **씁니다.** 값이 없을 때 안전한 기본값을 둡니다 |

공통 토큰에 대체값을 붙이지 않는 이유는 `values-tokenize-repeated-visual-values`와 충돌하기 때문입니다.
`var(--app-space-3, 12px)`가 100곳에 있으면 `12px`을 100곳에 하드코딩한 것과 같아서 토큰화의 목적이 사라집니다.
값을 한 곳에서 바꾸려면 그 한 곳이 유일해야 합니다.

대체값이 필요한 곳은 프로젝트가 직접 주입하지 않는 경계입니다.
외부 라이브러리 래퍼 내부, 켜고 끄는 테마, 임시 오버레이, 조건부로만 주입되는 변수가 여기 해당합니다.

요청에 없는 CSS 변수를 이 규칙 때문에 새로 만들지 않습니다.

**Incorrect (공통 토큰에 대체값을 붙여 값을 두 곳으로 흩음):**

```css
.pg_postFilterDialog__panel {
	gap: var(--app-space-3, 12px);
	color: var(--app-color-text-primary, #212529);
}
```

**Incorrect (주입이 보장되지 않는 변수를 대체값 없이 씀):**

```css
.pg_postFilterDialog__collapse {
	& .ant-collapse-item {
		border-radius: var(--mk-size-radius-card);
	}
}
```

**Correct (공통 토큰은 대체값 없이, 그 밖은 대체값과 함께):**

```css
/* src/style/token.css — core token 목록의 단일 출처 */
:root {
	--app-space-3: 12px;
	--app-color-text-primary: #212529;
}
```

```css
/* src/page/post-index/컴포넌트/pg-post-filter-dialog.css */
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

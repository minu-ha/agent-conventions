---
title: Declare Core Tokens Once and Fall Back Everywhere Else
titleKo: 공통 토큰은 한 곳에 선언하고 그 밖의 `var()`에는 대체값을 둡니다
impact: HIGH
impactDescription: 토큰 값을 한 곳에서 바꿀 수 있고 대체값이 매직 넘버로 번지지 않습니다
appliesWhen:
  - `var(--*)`를 새로 쓰거나 변수 이름이나 대체값을 바꿀 때
  - 공통 토큰 목록에 항목을 넣거나 뺄 때
reviewWith: values-tokenize-repeated-visual-values
tags: variables, fallbacks, tokens
---

## Declare Core Tokens Once and Fall Back Everywhere Else

**Impact: HIGH (토큰 값을 한 곳에서 바꿀 수 있고 대체값이 매직 넘버로 번지지 않습니다)**

프로젝트는 전역에서 항상 주입되는 **공통 토큰 목록**을 한 곳에 선언합니다.
`:root`나 전역 테마 스타일시트가 그 목록의 단일 출처입니다.

판정은 목록 대조로 끝냅니다.

| 대상 | 대체값 |
| --- | --- |
| 공통 토큰 목록에 있는 변수 | **쓰지 않습니다.** 값을 바꿀 자리를 한 곳으로 남깁니다 |
| 그 밖의 모든 `var()` | **씁니다.** 조건부로만 주입되는 값이라 없을 때를 대비합니다 |

변수가 없을 때 무슨 일이 일어나는지 알아 둡니다.
그 선언은 아래 규칙에 자리를 넘기지 않고, 그 속성이 **상속 속성이면 상속값, 아니면 초기값**이 됩니다.
`color`는 부모 색을 그대로 물려받고 `z-index`는 `auto`가 되어 **조용히 깨집니다.**
그래서 공통 토큰은 이름이 목록에 있는지 눈으로 확인해야 합니다.

대체값은 **변수가 선언되지 않았을 때만** 쓰입니다.
선언은 있는데 그 속성에 맞지 않는 값이면 대체값이 아니라 위와 같은 결과가 됩니다.

`var(--app-space-3, 12px)`가 100곳에 있으면 `12px`을 100곳에 하드코딩한 것과 같아서 토큰화의 목적이 사라집니다.
값을 한 곳에서 바꾸려면 그 한 곳이 유일해야 합니다.

대체값이 필요한 곳은 프로젝트가 직접 주입하지 않는 경계입니다.
외부 라이브러리 래퍼 내부, 켜고 끄는 테마, 임시 오버레이, 조건부로만 주입되는 변수가 여기 해당합니다.
그 변수를 두 곳 이상에서 쓰면 대체값을 우리 토큰에 한 번만 적고 사용처는 그 토큰을 가리킵니다.

요청에 없는 CSS 변수를 이 규칙 때문에 새로 만들지 않습니다.

**Incorrect (공통 토큰에 대체값을 붙여 값을 두 곳에 둡니다):**

```css
/* src/page/post-index/_pg-post-filter-dialog.css */
.pg_postFilterDialog__panel {
	gap: var(--app-space-3, 12px);
	color: var(--app-color-text-primary, #212529);
}
```

**Correct (공통 토큰 목록에 있는 변수는 대체값 없이 씁니다):**

```css
/* src/style/token.css — 공통 토큰 목록의 단일 출처 */
:root {
	--app-space-3: 12px;
	--app-color-text-primary: #212529;
}

/* src/page/post-index/_pg-post-filter-dialog.css */
.pg_postFilterDialog__panel {
	gap: var(--app-space-3);
	color: var(--app-color-text-primary);
}
```

**Incorrect (주입이 보장되지 않는 변수를 대체값 없이 씁니다):**

```css
.pg_postFilterDialog__collapse {
	& .ant-collapse-item {
		border-radius: var(--ant-border-radius-lg);
	}
}
```

**Correct (목록에 없는 변수에는 대체값을 붙입니다):**

```css
.pg_postFilterDialog__collapse {
	& .ant-collapse-item {
		border-radius: var(--ant-border-radius-lg, 10px);
	}
}
```

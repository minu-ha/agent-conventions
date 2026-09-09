---
title: Declare Core Tokens Once and Fall Back Everywhere Else
titleKo: 대체값은 공통 토큰 밖의 `var()`에만 둡니다
impact: HIGH
impactDescription: 공통 토큰의 수정 위치를 하나로 유지하고 대체값의 중복을 막습니다
appliesWhen:
  - `var(--*)`를 새로 쓰거나 변수 이름이나 대체값을 바꿀 때
  - 공통 토큰 목록에 항목을 넣거나 뺄 때
reviewWith: values-tokenize-repeated-visual-values
tags: variables, fallbacks, tokens
---

## Declare Core Tokens Once and Fall Back Everywhere Else

**Impact: HIGH (공통 토큰의 수정 위치를 하나로 유지하고 대체값의 중복을 막습니다)**

항상 주입되는 **공통 토큰 목록**을 `:root`나 전역 테마 스타일시트 한 곳에 선언합니다.
`var()`의 대체값 여부는 그 목록과 대조해 정합니다.

| 변수 | 대체값 |
| --- | --- |
| 공통 토큰 목록에 있음 | 쓰지 않습니다. 모든 테마에서 선언을 보장하고 이름을 목록과 확인합니다 |
| 그 밖의 변수 | 씁니다. 외부 라이브러리 변수나 실행 중 주입되는 수치처럼 값이 없을 수 있습니다 |
| 목록 밖의 같은 변수를 두 곳 이상에서 씀 | 대체값을 우리 토큰에 한 번만 적고 사용처는 그 토큰을 가리킵니다 |

대체값은 변수의 **계산값을 사용할 수 없을 때** 적용됩니다.

| 상황 | 결과 |
| --- | --- |
| 미등록 변수가 없거나 `initial`로 초기화됨, 순환 참조로 무효가 됨 | 대체값을 사용합니다 |
| `--color: 12px`처럼 값은 있지만 소비 속성 문법에 맞지 않음 | 대체값을 사용하지 않습니다 |
| `@property`로 등록한 변수 | 등록 문법과 초기값이 먼저 적용되므로 그 계약을 확인합니다 |
| 대체값 없이 변수가 무효이거나 소비 속성 문법에 맞지 않음 | 앞선 선언으로 돌아가지 않습니다. 상속 속성은 상속값, 나머지는 초기값이 됩니다. `color`는 부모 색, `z-index`는 `auto`가 됩니다 |

공통 토큰에 대체값을 반복하면 누락을 놓치기 쉽고 누락 시 동작과 예전 값을 여러 곳에서 관리하게 됩니다.
정상 주입된 토큰 값은 대체값보다 우선합니다.
이 규칙을 적용하려고 요청에 없는 CSS 변수를 만들지는 않습니다.

**Incorrect 1 (공통 토큰에 대체값을 붙여 값을 두 곳에 둡니다):**

```css
/* src/page/orders/_pg-order-filter-dialog.css */
.pg_orderFilterDialog__panel {
	gap: var(--app-space-inline, 12px);
	color: var(--app-color-text-primary, #212529);
}
```

**Correct 1 (공통 토큰 목록에 있는 변수는 대체값 없이 씁니다):**

```css
/* src/style/token.css — 공통 토큰 목록의 단일 출처 */
:root {
	--app-space-inline: 12px;
	--app-color-text-primary: #212529;
}

/* src/page/orders/_pg-order-filter-dialog.css */
.pg_orderFilterDialog__panel {
	gap: var(--app-space-inline);
	color: var(--app-color-text-primary);
}
```

**Incorrect 2 (주입이 보장되지 않는 변수를 대체값 없이 씁니다):**

```css
.pg_orderFilterDialog__collapse {
	& .MuiAccordion-root {
		border-radius: var(--mui-shape-borderRadius);
	}
}
```

**Correct 2 (목록에 없는 변수에는 대체값을 붙입니다):**

```css
.pg_orderFilterDialog__collapse {
	& .MuiAccordion-root {
		border-radius: var(--mui-shape-borderRadius, 10px);
	}
}
```

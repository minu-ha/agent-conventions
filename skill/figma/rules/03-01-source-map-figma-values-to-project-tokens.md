---
title: Map Figma Values and Variables to Project Tokens
titleKo: Figma 수치와 변수는 프로젝트 토큰으로 옮깁니다
impact: HIGH
impactDescription: 디자인 파일의 변수 이름이 코드에 새지 않고 테마와 토큰 변경이 화면에 그대로 반영됩니다
appliesWhen:
  - Figma에서 읽은 간격, 모서리 반경, 색, 글꼴 값을 스타일에 넣을 때
  - `get_variable_defs`나 `get_design_context`가 준 변수 이름을 코드에 옮길 때
reviewWith: css/values-fall-back-only-outside-core-tokens, css/values-tokenize-repeated-visual-values
tags: source, tokens, variables
---

## Map Figma Values and Variables to Project Tokens

**Impact: HIGH (디자인 파일의 변수 이름이 코드에 새지 않고 테마와 토큰 변경이 화면에 그대로 반영됩니다)**

Figma 변수 이름은 디자인 파일의 이름이지 프로젝트의 토큰이 아닙니다.
`--content\/text\/black` 같은 이름을 옮기면 선언되지 않은 변수라 대체값만 화면에 남고, 테마를 바꿔도 따라가지 않습니다.
그래서 Figma가 준 값은 값과 용도가 같은 프로젝트 토큰으로 옮깁니다.

| Figma에서 받은 것 | 처리 |
| --- | --- |
| 변수 이름과 값 | 값과 용도가 같은 프로젝트 토큰을 씁니다 |
| 변수 없이 온 수치 | 가장 가까운 프로젝트 토큰으로 맞춥니다. 13px 간격은 12px 토큰으로 읽습니다 |
| 맞는 토큰이 없는 값 | 값을 그대로 쓰고 보고의 차이 목록에 적습니다 |
| 토큰은 있지만 값이 조금 다름 | 토큰을 쓰고, 값 차이는 검증에서 `DRIFT`로 적습니다 |
| 글꼴 이름. `font-['Pretendard:SemiBold']` | 프로젝트 전역 글꼴을 따르고 굵기와 크기만 토큰으로 옮깁니다 |
| 줄 높이, 자간 | 글꼴 크기와 짝을 이루는 타이포그래피 토큰으로 옮깁니다. 픽셀 값만 따로 옮기지 않습니다 |
| 라이트, 다크 값이 갈린 변수 | `get_variable_defs`는 현재 모드 값 하나만 줍니다. 모드별 값은 프로젝트 토큰 정의를 따릅니다 |

새 토큰을 만들지는 `css/values-tokenize-repeated-visual-values`가 정합니다.
대체값을 붙일지는 `css/values-fall-back-only-outside-core-tokens`가 정합니다.
대응표는 `get_variable_defs` 응답 하나로 만들고, 같은 값을 얻으려고 `get_design_context`를 부르지 않습니다.

**Incorrect 1 (Figma 변수 이름과 대체값을 그대로 옮깁니다):**

```css
.pg_products__row {
	padding: 16px var(--spacing-12, 12px);
	border-radius: var(--borderradius-10, 10px);
	color: var(--content\/text\/black, #212529);
}
```

**Correct 1 (값과 용도가 같은 프로젝트 토큰으로 옮깁니다):**

```css
.pg_products__row {
	padding: var(--app-space-section) var(--app-space-inline);
	border-radius: var(--app-radius-panel);
	color: var(--app-color-text-primary);
}
```

**Correct (대응표를 만들어 차이를 함께 적습니다):**

```text
Figma 변수               값        프로젝트 토큰              차이
Spacing 16               16        --app-space-section        -
Spacing 12               12        --app-space-inline         -
BorderRadius 10          10        --app-radius-panel         -
Content/Text/Black       #212529   --app-color-text-primary   -
Content/Border/Normal    #dee2e6   --app-color-border         토큰 값 #d9d9d9
```

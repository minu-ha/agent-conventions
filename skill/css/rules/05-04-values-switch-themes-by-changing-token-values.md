---
title: Switch Themes by Changing Token Values
titleKo: 테마는 토큰 값만 바꿔서 전환합니다
impact: MEDIUM-HIGH
impactDescription: 테마 분기가 한 파일에만 있어 색을 하나 더할 때 파일 여러 개를 열지 않습니다
appliesWhen:
  - 다크 모드나 테마 전환을 넣을 때
  - 컴포넌트 CSS에 `prefers-color-scheme`이나 `[data-theme]`를 쓰려 할 때
  - 색이나 그림자 토큰을 새로 만들거나 이름을 바꿀 때
reviewWith: values-always-provide-css-variable-fallbacks, values-tokenize-repeated-visual-values
tags: values, theme
---

## Switch Themes by Changing Token Values

**Impact: MEDIUM-HIGH (테마 분기가 한 파일에만 있어 색을 하나 더할 때 파일 여러 개를 열지 않습니다)**

테마는 **토큰 값만** 바꿉니다.
`prefers-color-scheme`과 `[data-theme]`는 토큰 파일 안에만 둡니다.
컴포넌트 CSS 파일에서 이 둘이 보이면 위반입니다.

`layout-group-breakpoints-at-the-file-bottom` 규칙이 정하는 것은 폭 조건입니다.
여기서 바꾸는 것은 클래스가 아니라 `:root`의 변수 값입니다.
두 블록을 섞지 않습니다.

컴포넌트에 분기가 있으면 색을 하나 더할 때마다 그 색을 쓰는 파일을 모두 찾아 두 번씩 적어야 합니다.
빠뜨린 한 곳은 테마를 바꿔 보기 전까지 드러나지 않습니다.

**토큰 이름은 값이 아니라 쓰임으로 짓습니다.**
`--app-color-white`는 다크 모드에서 이름이 거짓말이 됩니다.
`--app-color-surface`는 값이 바뀌어도 이름이 그대로 맞습니다.

| 짓는 법 | 예 |
| --- | --- |
| 쓰임 | `--app-color-surface`, `--app-color-text-primary`, `--app-color-border` |
| 값 — 쓰지 않음 | `--app-color-white`, `--app-color-gray-100` |

**`color-scheme`을 선언합니다.**
스크롤바, 폼 컨트롤, 기본 배경은 우리 토큰이 닿지 않는 브라우저 UI라 이 속성으로만 따라옵니다.
선언하지 않으면 어두운 화면에 밝은 스크롤바가 남습니다.

**그림자도 테마 토큰입니다.**
어두운 배경에서 검은 그림자는 보이지 않습니다.
`box-shadow` 값을 직접 적지 말고 토큰으로 두어 테마마다 다르게 잡습니다.

**다크 모드를 지원하지 않기로 했으면 `prefers-color-scheme`을 아예 쓰지 않습니다.**
일부 화면만 대응하면 같은 앱 안에서 화면마다 배경이 달라져 지원하지 않는 것보다 나쁩니다.

**Incorrect (컴포넌트 파일에서 테마를 분기합니다):**

```css
/* src/page/products/pg-products.css */
.pg_products__panel {
	background-color: var(--app-color-surface);

	@media (prefers-color-scheme: dark) {
		background-color: #1f2225;
	}
}
```

**Correct (컴포넌트는 토큰만 씁니다):**

```css
/* src/page/products/pg-products.css */
.pg_products__panel {
	background-color: var(--app-color-surface);
	color: var(--app-color-text-primary);
	border: 1px solid var(--app-color-border);
	box-shadow: var(--app-shadow-panel);
}
```

**Incorrect (값으로 이름을 짓고 그림자를 직접 적습니다):**

```css
:root {
	--app-color-white: #fff;
	--app-color-gray-100: #f1f3f5;
}

.pg_products__panel {
	background-color: var(--app-color-white);
	box-shadow: 0 1px 3px rgb(0 0 0 / 12%);
}
```

**Correct (토큰 파일 한 곳에서만 값을 바꾸고 사용자가 고른 테마가 시스템 설정을 이깁니다):**

```css
/* src/style/token.css */
:root {
	color-scheme: light;

	--app-color-surface: #fff;
	--app-color-text-primary: #212529;
	--app-color-border: #dee2e6;
	--app-shadow-panel: 0 1px 3px rgb(0 0 0 / 12%);
}

@media (prefers-color-scheme: dark) {
	:root {
		color-scheme: dark;

		--app-color-surface: #1f2225;
		--app-color-text-primary: #e9ecef;
		--app-color-border: #3a3f44;
		--app-shadow-panel: 0 1px 3px rgb(0 0 0 / 60%);
	}
}

/* [data-theme] 는 명시도로 위 @media 블록을 이긴다 */
:root[data-theme="light"] {
	color-scheme: light;

	--app-color-surface: #fff;
	--app-color-text-primary: #212529;
	--app-color-border: #dee2e6;
	--app-shadow-panel: 0 1px 3px rgb(0 0 0 / 12%);
}

:root[data-theme="dark"] {
	color-scheme: dark;

	--app-color-surface: #1f2225;
	--app-color-text-primary: #e9ecef;
	--app-color-border: #3a3f44;
	--app-shadow-panel: 0 1px 3px rgb(0 0 0 / 60%);
}
```

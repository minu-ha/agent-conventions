---
title: Use Global Tokens and Do Not Invent Local Ones
titleKo: 전역 토큰 사용과 지역 토큰 발명 금지
impact: MEDIUM-HIGH
impactDescription: 공용 시각 값은 전역 토큰으로 모으고 값 재사용 목적의 지역 변수는 늘리지 않습니다
appliesWhen:
  - 여러 파일이 같은 색·간격·radius·타이포·그림자 값을 쓸 때
  - 새 CSS custom property를 선언할 때
reviewWith: values-always-provide-css-variable-fallbacks
tags: tokens, variables, reuse
---

## Use Global Tokens and Do Not Invent Local Ones

**Impact: MEDIUM-HIGH (공용 시각 값은 전역 토큰으로 모으고 값 재사용 목적의 지역 변수는 늘리지 않습니다)**

판정 기준은 **파일 경계**입니다.

| 반복 범위 | 처리 |
| --- | --- |
| 여러 파일 | 전역 core token을 쓰거나, 없으면 core token 목록에 추가를 검토합니다 |
| 한 파일 안 | 값을 그대로 둡니다. 지역 변수를 만들지 않습니다 |

같은 파일 안에서 `8px`이 세 번 나온다고 지역 custom property를 만들지 않습니다.
core token 목록에 없는 변수는 `values-always-provide-css-variable-fallbacks`에 따라 fallback이 필요해서
`var(--pg-detail-gap, 8px)`처럼 값이 결국 사용처에 남습니다.
읽는 사람은 변수 선언을 한 번 더 찾아가야 하고, 값을 바꿀 지점은 여전히 여러 곳입니다.

지역 custom property는 값 재사용이 아니라 **조상에서 자손으로 상태를 전달할 때만** 씁니다.
그 용도는 `selector-avoid-deep-descendant-dependencies`가 결합자를 줄이는 수단으로 인정합니다.

**Incorrect (한 파일 안 반복을 지역 변수로 감쌈):**

```css
.pg_catalogIndex__toolbar {
	--pg-catalog-gap: 12px;
	gap: var(--pg-catalog-gap, 12px);
}

.pg_catalogIndex__footer {
	gap: var(--pg-catalog-gap, 12px);
}
```

**Incorrect (여러 파일이 쓰는 값을 각 파일에 하드코딩):**

```css
/* pg-catalog-index.css */
.pg_catalogIndex__row {
	background: #f5f5f5;
}
```

```css
/* pg-catalog-detail.css */
.pg_catalogDetail__row {
	background: #f5f5f5;
}
```

**Correct (여러 파일이 쓰는 값은 전역 core token으로):**

```css
/* app/style/token.css */
:root {
	--app-color-fill-muted: #f5f5f5;
	--app-space-3: 12px;
}
```

```css
.pg_catalogIndex__row {
	background: var(--app-color-fill-muted);
}
```

**Correct (한 파일 안 반복은 값을 그대로 두고, 지역 변수는 상태 전달에만):**

```css
.pg_catalogIndex__toolbar {
	gap: 12px;
}

.pg_catalogIndex__footer {
	gap: 12px;
}

.pg_catalogIndex__row {
	--pg-catalog-row-accent: transparent;

	&:hover {
		--pg-catalog-row-accent: var(--app-color-accent);
	}
}

.pg_catalogIndex__rowBadge {
	border-color: var(--pg-catalog-row-accent);
}
```

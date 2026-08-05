---
title: Keep Breakpoints Inside the Class Block
titleKo: 분기점은 그 클래스 블록 안에 둡니다
impact: HIGH
impactDescription: 한 클래스의 모든 크기 규칙이 한 블록에 모여 덮어쓰기를 찾아다니지 않습니다
appliesWhen:
  - `@media` 분기점을 추가하거나 옮길 때
  - 화면 폭에 따라 값이 달라지는 선언을 넣을 때
reviewWith: selector-declare-each-class-in-one-block, selector-limit-nesting-block-depth, values-switch-themes-by-changing-token-values
tags: selector, responsive
---

## Keep Breakpoints Inside the Class Block

**Impact: HIGH (한 클래스의 모든 크기 규칙이 한 블록에 모여 덮어쓰기를 찾아다니지 않습니다)**

폭 조건 `@media`는 그 클래스 블록 안에 중첩합니다.
파일 아래쪽에 최상위 `@media`를 따로 열어 같은 클래스를 다시 선언하지 않습니다.
`selector-declare-each-class-in-one-block`이 요구하는 "클래스당 한 블록"이 그대로 유지됩니다.

테마 조건은 여기에 걸리지 않습니다.
`prefers-color-scheme`은 토큰 파일에서 최상위 `@media`로 씁니다.
`values-switch-themes-by-changing-token-values`가 그 자리를 정합니다.

**분기점은 좁은 쪽부터 씁니다.**
기본 선언이 가장 좁은 화면 기준이고, 넓어질 때만 덮습니다.
좁아질 때만 덮는 조건과 섞으면 두 방향이 만나는 구간에서 어느 쪽이 이기는지 매번 따져야 합니다.

조건은 범위 표기로 씁니다.
`(width >= 1024px)` 이고 `(min-width: 1024px)`이 아닙니다.
`tooling-configure-stylelint-to-enforce-these-rules`가 그 표기를 강제합니다.

분기점 숫자는 아래 셋만 씁니다.

| 이름 | 값 | 기준 |
| --- | --- | --- |
| `sm` | `640px` | 세로 태블릿 |
| `md` | `1024px` | 가로 태블릿, 좁은 노트북 |
| `lg` | `1440px` | 데스크톱 |

숫자를 토큰으로 빼지 않습니다.
`@media`의 조건에는 `var()`를 쓸 수 없어서 토큰으로 만들어도 그 자리에서 못 씁니다.
그래서 세 값을 규칙에 못 박고 그대로 적습니다.

블록 안에 `@media`를 넣어도 중첩 깊이에 세지 않습니다.
`tooling-configure-stylelint-to-enforce-these-rules`의 설정이 `@media`를 깊이 계산에서 뺍니다.
그 안에서 `&:hover` 같은 상태를 한 겹 더 쓸 수 있습니다.

**대가가 있습니다.**
한 분기점에서 레이아웃 전체가 바뀌면 그 한 번의 결정이 클래스 블록 여럿에 흩어집니다.
"1024px에서 무엇이 달라지는가"를 한자리에서 읽을 수 없습니다.
그래도 이쪽을 고릅니다.
읽는 일보다 고치는 일이 잦고, 고칠 때 필요한 것은 "이 클래스의 모든 값"이지 "이 폭의 모든 클래스"가 아닙니다.
분기점 값이 셋뿐이라 흩어진 자리도 `@media (width >= 1024px)`로 한 번에 찾습니다.

**Incorrect (파일 아래쪽에 최상위 `@media`로 같은 클래스를 다시 엶):**

```css
.pg_products__toolbar {
	display: flex;
	gap: 8px;
}

.pg_products__panel {
	padding: 12px;
}

@media (width >= 1024px) {
	.pg_products__toolbar {
		gap: 16px;
	}
}
```

**Incorrect (`max-width`와 `min-width`를 섞어 겹치는 구간을 만듦):**

```css
.pg_products__toolbar {
	& {
		gap: 16px;
	}

	@media (width < 1024px) {
		gap: 8px;
	}

	@media (width >= 1440px) {
		gap: 24px;
	}
}
```

**Correct (좁은 쪽을 기본으로 두고 클래스 블록 안에서 넓힘):**

```css
.pg_products__toolbar {
	display: flex;
	gap: 8px;

	@media (width >= 1024px) {
		gap: 16px;
	}

	@media (width >= 1440px) {
		gap: 24px;
	}
}
```

**Correct (분기점 안에서 상태를 한 겹 더 씀):**

```css
.pg_products__panel {
	padding: 12px;

	@media (width >= 1024px) {
		padding: 20px;

		&:hover {
			background-color: var(--app-color-surface-hover);
		}
	}
}
```

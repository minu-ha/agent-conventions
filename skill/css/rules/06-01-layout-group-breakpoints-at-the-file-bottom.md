---
title: Group Breakpoints at the Bottom of the File
titleKo: `@media` 브레이크포인트는 파일 아래 한 곳에 모읍니다
impact: MEDIUM-HIGH
impactDescription: 한 브레이크포인트에서 무엇이 달라지는지 한 블록에서 읽히고 두 방향이 겹치지 않습니다
appliesWhen:
  - `@media` 브레이크포인트를 추가하거나 옮길 때
  - 화면 폭에 따라 값이 달라지는 선언을 넣을 때
reviewWith: >-
  layout-write-breakpoints-desktop-first, layout-reach-for-intrinsic-sizing-before-breakpoints,
  selector-declare-each-class-in-one-block, values-switch-themes-by-changing-token-values
tags: selector, responsive
---

## Group Breakpoints at the Bottom of the File

**Impact: MEDIUM-HIGH (한 브레이크포인트에서 무엇이 달라지는지 한 블록에서 읽히고 두 방향이 겹치지 않습니다)**

브레이크포인트 재선언은 파일 맨 아래 `@media` 블록에 모읍니다.
클래스 블록 안에 `@media`를 중첩하지 않습니다.

브레이크포인트 하나는 보통 클래스 하나가 아니라 여러 클래스를 같이 건드립니다.
툴바 간격만 줄이는 것이 아니라 패널 여백과 사이드바 폭이 함께 바뀝니다.
그 결정이 클래스 블록마다 흩어지면 "1024px 아래에서 무엇이 달라지는가"에 답하려고 파일 전체를 훑어야 합니다.

**대가가 있습니다.**
한 클래스의 선언이 기본 블록과 브레이크포인트 블록 두 곳에 있습니다.
`selector-declare-each-class-in-one-block` 규칙이 `@media` 안의 재선언을 예외로 두는 이유가 그 대가입니다.
그 예외를 어디에 두는지는 이 규칙이 못 박습니다.
대가를 치르고도 모아 두는 쪽을 고릅니다.
브레이크포인트를 고치는 일은 클래스 하나가 아니라 그 폭에서 화면이 어떻게 보이는지를 고치는 일이기 때문입니다.

브레이크포인트를 어느 방향으로 쓰고 어떤 숫자를 고를지는
`layout-write-breakpoints-desktop-first`가 정합니다.

**같은 `@media` 블록이 파일 여러 개에 반복되면 그것을 소유할 자리를 하나 만듭니다.**
파일마다 같은 블록을 복사하고 있다면 브레이크포인트 자리가 아니라 소유자가 없는 문제입니다.

| 파일마다 바뀌는 것 | 소유할 자리 |
| --- | --- |
| 값 | 토큰 파일에서 나눕니다 |
| 배치 | 그 배치를 컴포넌트 하나로 만들고 브레이크포인트는 그 파일에만 둡니다 |

브레이크포인트를 적기 전에 그것 없이 되는지 봅니다.
`layout-reach-for-intrinsic-sizing-before-breakpoints` 규칙이 그 판정을 합니다.

테마 조건은 여기에 걸리지 않습니다.
`prefers-color-scheme`은 토큰 파일에서 최상위 `@media`로 씁니다.
`values-switch-themes-by-changing-token-values` 규칙이 그 자리를 정합니다.

**Incorrect (클래스 블록 안에 중첩해서 브레이크포인트가 흩어집니다):**

```css
.pg_products__toolbar {
	display: flex;
	gap: 24px;

	@media (width < 1024px) {
		flex-direction: column;
	}
}

.pg_products__layout {
	display: grid;
	grid-template-columns: 280px 1fr;

	@media (width < 1024px) {
		grid-template-columns: 1fr;
	}
}
```

**Correct (선언은 위, 브레이크포인트는 파일 아래 한 곳에 모으고 그 안에서 상태를 한 겹 더 씁니다):**

```css
.pg_products__toolbar {
	display: flex;
	gap: 24px;
}

.pg_products__layout {
	display: grid;
	grid-template-columns: 280px 1fr;
}

@media (width < 1024px) {
	.pg_products__toolbar {
		flex-direction: column;
	}

	.pg_products__layout {
		grid-template-columns: 1fr;

		&:hover {
			background-color: var(--app-color-surface-hover);
		}
	}
}
```

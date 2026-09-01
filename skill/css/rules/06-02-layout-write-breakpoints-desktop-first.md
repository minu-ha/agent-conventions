---
title: Write Breakpoints Desktop First
titleKo: 브레이크포인트는 데스크톱 퍼스트로 세 값만 씁니다
impact: MEDIUM-HIGH
impactDescription: 두 방향이 겹치는 구간이 없고 프로젝트 전체가 같은 세 폭에서 꺾입니다
appliesWhen:
  - `@media` 조건을 쓰거나 브레이크포인트 숫자를 고를 때
  - `min-width`나 `max-width` 표기를 쓸 때
  - 제외: `prefers-color-scheme` 같은 폭이 아닌 조건을 쓰는 경우
reviewWith: layout-group-breakpoints-at-the-file-bottom, tooling-configure-stylelint-to-enforce-these-rules
tags: selector, responsive
---

## Write Breakpoints Desktop First

**Impact: MEDIUM-HIGH (두 방향이 겹치는 구간이 없고 프로젝트 전체가 같은 세 폭에서 꺾입니다)**

기본 선언은 가장 넓은 화면 기준입니다.
좁아질 때만 그 위를 덮습니다.
`(width >= ...)` 조건과 섞지 않습니다.
두 방향을 섞으면 둘 다 맞는 구간에서 어느 쪽이 이기는지 매번 따져야 합니다.

블록 순서는 넓은 쪽부터 좁은 쪽입니다.
좁은 화면에서는 조건이 여러 개 동시에 맞고 마지막에 쓴 것이 이깁니다.

**조건은 범위 표기로 씁니다.**
`(width < 1024px)`로 쓰고 `(max-width: 1023.98px)`로 쓰지 않습니다.
`max-width: 1024px`은 1024를 포함해서 `min-width: 1024px`과 겹치므로 소수 보정이 필요했습니다.
범위 표기는 겹치지 않습니다.
`tooling-configure-stylelint-to-enforce-these-rules` 규칙이 그 표기를 강제합니다.

**숫자는 아래 셋만 씁니다.**
이름은 경계가 아니라 그 아래 구간을 가리킵니다.
기본 선언은 `1440px` 이상 기준입니다.

| 조건 | 구간 이름 | 여기부터 좁아짐 |
| --- | --- | --- |
| `(width < 1440px)` | `~lg` | 좁은 데스크톱 |
| `(width < 1024px)` | `~md` | 가로 태블릿, 좁은 노트북 |
| `(width < 640px)` | `~sm` | 세로 태블릿 아래 |

숫자를 토큰으로 빼지 않습니다.
`@media`의 조건에는 `var()`를 쓸 수 없어서 토큰으로 만들어도 그 자리에서 못 씁니다.
그래서 세 값을 규칙에 못 박고 그대로 적습니다.

어디에 적을지는 `layout-group-breakpoints-at-the-file-bottom`이 정합니다.

**Incorrect (두 방향을 섞어 겹치는 구간을 만듭니다):**

```css
.pg_products__toolbar {
	display: flex;
	gap: 16px;
}

@media (width >= 1440px) {
	.pg_products__toolbar {
		gap: 24px;
	}
}

@media (width < 1024px) {
	.pg_products__toolbar {
		gap: 8px;
	}
}
```

**Incorrect (`max-width`를 소수로 보정하고 좁은 쪽부터 씁니다):**

```css
@media (max-width: 639.98px) {
	.pg_products__toolbar {
		gap: 4px;
	}
}

@media (max-width: 1023.98px) {
	.pg_products__toolbar {
		gap: 8px;
	}
}
```

**Correct (구간을 이렇게 읽습니다):**

```txt
        640px      1024px     1440px            넓어짐 →
 ──~sm───│───~md────│───~lg────│─── 기본 선언 ───▶
   세로     가로       좁은        가장 넓은 화면
   태블릿   태블릿     데스크톱     기준으로 먼저 적는다
   아래     좁은 노트북
```

**Correct (기본 선언이 가장 넓고 넓은 쪽부터 좁혀 갑니다):**

```css
.pg_products__layout {
	display: grid;
	grid-template-columns: 280px 1fr;
}

@media (width < 1440px) {
	.pg_products__layout {
		grid-template-columns: 220px 1fr;
	}
}

@media (width < 1024px) {
	.pg_products__layout {
		grid-template-columns: 1fr;
	}
}
```

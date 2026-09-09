# Write Breakpoints Desktop First

**Impact: MEDIUM (넓은 화면부터 좁은 화면 순서로 덮어쓰고 프로젝트 전체에서 세 기준 폭을 공유합니다)**

### 기준 폭 세 값

기본 선언은 `1440px` 이상인 가장 넓은 화면을 기준으로 하고, 좁아질 때만 덮어씁니다.
브레이크포인트는 아래 순서로 쓰며 `(width >= ...)` 방향과 섞지 않습니다.

| 조건 | 구간 이름 | 대상 |
| --- | --- | --- |
| `(width < 1440px)` | `~lg` | 좁은 데스크톱 |
| `(width < 1024px)` | `~md` | 가로 태블릿, 좁은 노트북 |
| `(width < 640px)` | `~sm` | 세로 태블릿 아래 |

숫자는 이 셋만 쓰며 이름은 경계 아래의 구간을 가리킵니다.
좁은 화면에서 여러 조건이 함께 맞는 것은 의도한 동작입니다.
선택자와 속성이 같으면 뒤의 좁은 조건이 앞의 넓은 조건을 덮습니다.

`@media` 조건에는 `var()`를 쓸 수 없으므로 이 숫자를 토큰으로 만들지 않습니다.

### 범위 표기

**조건은 범위 표기**로 씁니다. `(max-width: 1023.98px)` 대신 `(width < 1024px)`로 적습니다.
`max-width: 1024px`과 `min-width: 1024px`은 경계를 함께 포함하지만 `<`와 `>=`는 같은 경계를 소수 보정 없이 나눕니다.
표기 검사는 `tooling-configure-stylelint-to-enforce-these-rules` 규칙이 담당합니다.

블록 위치는 `layout-group-breakpoints-at-the-file-bottom` 규칙을 따릅니다.

**Incorrect 1 (기본 선언을 중간 폭에 맞추고 넓고 좁은 방향을 함께 씁니다):**

```css
.pg_products__layout {
	display: grid;
	grid-template-columns: 220px 1fr;
}

@media (width >= 1440px) {
	.pg_products__layout {
		grid-template-columns: 280px 1fr;
	}
}

@media (width < 1024px) {
	.pg_products__layout {
		grid-template-columns: 1fr;
	}
}
```

**Correct 1 (기본 선언은 가장 넓은 화면에 맞추고 좁아질 때만 덮어씁니다):**

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

> 나머지 예시와 예외는 [full rule](../rules/06-02-layout-write-breakpoints-desktop-first.md)에 있습니다.

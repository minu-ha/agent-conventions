---
title: Use Global Tokens and Do Not Create Local Ones
titleKo: 여러 파일이 쓰는 값은 전역 토큰으로 씁니다
impact: MEDIUM-HIGH
impactDescription: 여러 파일이 쓰는 값은 전역 토큰으로 모으고 나머지는 선언 자리에 그대로 둡니다
appliesWhen:
  - 여러 파일이 같은 색, 간격, 모서리 반경, 타이포그래피, 그림자 값을 쓸 때
  - 새 변수를 선언할 때
reviewWith: values-fall-back-only-outside-core-tokens, composition-do-not-style-through-the-style-attribute
tags: tokens, variables, reuse
---

## Use Global Tokens and Do Not Create Local Ones

**Impact: MEDIUM-HIGH (여러 파일이 쓰는 값은 전역 토큰으로 모으고 나머지는 선언 자리에 그대로 둡니다)**

판정 기준은 **파일 경계**입니다.

| 반복 범위 | 처리 |
| --- | --- |
| 여러 파일 | 전역 공통 토큰을 씁니다. 이름이 없으면 토큰 파일에 만들고 그 이름을 씁니다 |
| 한 파일 안 | 값을 그대로 둡니다. 테마를 켠 프로젝트의 색과 그림자는 예외로 `values-switch-themes-by-changing-token-values`가 정합니다 |

`z-index` 층과 움직임 지속 시간, 이징은 예외입니다.
한 파일에서 한 번만 써도 토큰입니다.
쌓임 순서와 움직임 리듬이 앱 전체에서 하나여야 하기 때문입니다.
층 목록은 `values-declare-stacking-layers-as-tokens` 규칙이 정합니다.
새 토큰의 이름은 `values-name-tokens-by-purpose`가 정합니다.

**지역 변수는 만들지 않습니다.**
공통 토큰 목록에 없는 변수는 대체값이 필요해서 값이 결국 사용처에 남습니다.
읽는 사람은 선언을 한 번 더 찾아가야 하는데 바꿀 지점은 여전히 여러 곳이라 얻는 것이 없습니다.

예외는 실행 중에 계산해야만 아는 수치 하나입니다.
그때만 지역 변수를 하나 만들어 TSX에서 넘깁니다.
그 자리는 `composition-do-not-style-through-the-style-attribute` 규칙이 정합니다.

조상 상태를 자손에 전달할 때도 변수를 쓰지 않고 결합자 하나로 자손을 잡습니다.
결합자를 쓸 범위는 `ownership-use-foreign-classes-only-under-your-own-root` 규칙이 정합니다.

선택자 쪽에서 같은 판단을 하는 규칙이 `selector-do-not-group-classes-with-commas`입니다.
여러 클래스를 `,`로 묶어 공통 선언을 빼지 않고 각 클래스에 중복으로 씁니다.

**Incorrect (한 파일 안 반복을 조상에 선언한 지역 변수로 감쌉니다):**

```css
.pg_catalogIndex__root {
	--pg-catalog-gap: 12px;
}

.pg_catalogIndex__toolbar {
	gap: var(--pg-catalog-gap, 12px);
}

.pg_catalogIndex__footer {
	gap: var(--pg-catalog-gap, 12px);
}
```

**Correct (한 파일 안 반복은 값을 그대로 둡니다):**

```css
.pg_catalogIndex__toolbar {
	gap: 12px;
}

.pg_catalogIndex__footer {
	gap: 12px;
}
```

**Incorrect (상태를 전달하려고 지역 변수를 만듭니다):**

```css
.pg_catalogIndex__rowBadge {
	border-color: var(--pg-catalog-row-accent);
}

.pg_catalogIndex__row {
	--pg-catalog-row-accent: transparent;

	&:hover {
		--pg-catalog-row-accent: #1677ff;
	}
}
```

**Correct (상태 전달은 지역 변수 없이 결합자 하나로 풉니다):**

```css
.pg_catalogIndex__rowBadge {
	border: 1px solid transparent;
}

.pg_catalogIndex__row {
	&:hover .pg_catalogIndex__rowBadge {
		border-color: #1677ff;
	}
}
```

**Incorrect (여러 파일이 쓰는 값을 각 파일에 하드코딩합니다):**

```css
/* pg-catalog-index.css */
.pg_catalogIndex__row {
	background: #f5f5f5;
}

/* pg-catalog-detail.css */
.pg_catalogDetail__row {
	background: #f5f5f5;
}
```

**Correct (여러 파일이 쓰는 값은 전역 공통 토큰으로 둡니다):**

```css
/* src/style/token.css */
:root {
	--app-color-fill-muted: #f5f5f5;
}

/* pg-catalog-index.css */
.pg_catalogIndex__row {
	background: var(--app-color-fill-muted);
}

/* pg-catalog-detail.css */
.pg_catalogDetail__row {
	background: var(--app-color-fill-muted);
}
```

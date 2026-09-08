---
title: Use Foreign Classes Only Under Your Own Root
titleKo: 다른 소유자의 클래스는 내 최상위 블록 안에서만 씁니다
impact: CRITICAL
impactDescription: 다른 소유자의 스타일을 덮어써도 해당 인스턴스에만 적용되도록 제한합니다
appliesWhen:
  - `.ant-*`, `.rc-*`, `.Mui-*` 같은 외부 라이브러리 클래스를 쓸 때
  - 다른 `scope_slug`의 클래스를 선택자로 잡을 때
reviewWith: >-
  ownership-change-other-owners-through-their-api, ownership-give-each-file-one-scope-slug,
  selector-limit-nesting-block-depth
tags: ownership, scope, third-party
---

## Use Foreign Classes Only Under Your Own Root

**Impact: CRITICAL (다른 소유자의 스타일을 덮어써도 해당 인스턴스에만 적용되도록 제한합니다)**

다른 소유자의 클래스는 **내 최상위 클래스 블록 안에서 `&`로 시작하는 선택자**로만 씁니다.
내 `scope_slug`와 다르면 외부 라이브러리, 다른 화면, `widget` 모두 같은 기준을 적용합니다.

| 선택자 | 판정 |
| --- | --- |
| `.MuiTreeItem-label { }` | 금지. 그 라이브러리를 쓰는 앱 전체에 적용됩니다 |
| `.wg_chartCard__caption { }` | 금지. 그 `widget`을 쓰는 모든 화면에 적용됩니다 |
| `.pg_products__sidebar { & .MuiTreeItem-label { } }` | 허용. 해당 인스턴스에만 적용됩니다 |
| `.pg_detail__root { & .wg_chartCard__caption { } }` | 허용 |
| `.pg_products__sidebar .MuiTreeItem-label { }` | 금지. 최상위 블록 안에서 `&`로 시작해야 합니다 |
| `.pg_products__sidebarToolbar .pg_products__sidebarTitle { }` | 같은 소유자의 클래스끼리라 이 규칙의 대상이 아닙니다 |

판정할 때 별도의 소유 관계를 조사하지 않고 `scope_slug`와 블록 위치를 대조합니다.
이렇게 덮어쓰기를 한 블록에 모으면 라이브러리 버전을 올릴 때 확인할 곳도 한 군데로 정해집니다.

다른 소유자의 DOM 경로는 우리가 정하지 않으므로 결합자 개수를 제한하지 않습니다.
블록 중첩 깊이는 `selector-limit-nesting-block-depth` 규칙을 따릅니다.
직접 수정할 수 있는 클래스라면 `ownership-change-other-owners-through-their-api`의 세 방법을 먼저 확인하고,
모두 맞지 않을 때 이 규칙을 적용합니다.

`selector-disallowed-list`는 등록된 외부 접두사와 다른 레이어의 최상위 클래스를 검사합니다.
같은 레이어의 다른 식별자와 미등록 라이브러리 클래스는 파일별 소유자를 대조해야 합니다.
전체 설정은 `tooling-configure-stylelint-to-enforce-these-rules` 규칙에 있습니다.

**Incorrect (최상위 블록 없이 라이브러리 클래스를 바로 씁니다):**

```css
.MuiTreeItem-content {
	border-radius: 4px;
}

.MuiTreeItem-label {
	color: #8c8c8c;
}
```

**Correct (내 최상위 블록 안에서 외부 라이브러리 DOM을 선택자로 잡습니다):**

```css
.pg_products__sidebar {
	& .MuiTreeItem-content {
		border-radius: 4px;
	}

	& .MuiTreeItem-label {
		color: #8c8c8c;
	}
}
```

**Incorrect (최상위 블록 없이 다른 `scope_slug`의 클래스를 바로 씁니다):**

```css
/* page/detail/pg-detail.css */
.wg_chartCard__caption {
	letter-spacing: 0.02em;
}

.ui_card__title {
	font-size: 13px;
}
```

**Correct (다른 `scope_slug`의 클래스도 내 최상위 블록 안에서 선택자로 잡습니다):**

```css
/* page/detail/pg-detail.css */
.pg_detail__chartSlot {
	min-height: 240px;

	& .wg_chartCard__caption {
		letter-spacing: 0.02em;
	}

	& .ui_card__title {
		font-size: 13px;
	}
}
```

**Incorrect (최상위 블록을 열지 않고 바깥에서 이어 씁니다):**

```css
.pg_products__sidebarToolbar > .MuiButton-root > .MuiButton-startIcon {
	color: #8c8c8c;
}
```

**Correct (소유자 API로 해결할 수 없으면 내 최상위 블록 안에서 선택합니다):**

```css
.pg_products__sidebarToolbar {
	& > .MuiButton-root > .MuiButton-startIcon {
		color: #8c8c8c;
	}
}
```

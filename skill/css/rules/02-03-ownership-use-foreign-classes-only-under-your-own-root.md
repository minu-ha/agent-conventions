---
title: Use Foreign Classes Only Under Your Own Root
titleKo: 남의 클래스는 내 최상위 블록 안에서만 씁니다
impact: CRITICAL
impactDescription: 남의 클래스를 홀로 쓰면 그 라이브러리나 위젯을 쓰는 화면이 전부 함께 바뀝니다
appliesWhen:
  - `.ant-*`, `.rc-*`, `.Mui-*` 같은 외부 라이브러리 클래스를 쓸 때
  - 다른 `scope_slug`의 클래스를 겨냥할 때
reviewWith: >-
  ownership-change-other-owners-through-their-api, ownership-give-each-file-one-scope-slug,
  selector-limit-nesting-block-depth
tags: ownership, scope, third-party
---

## Use Foreign Classes Only Under Your Own Root

**Impact: CRITICAL (남의 클래스를 홀로 쓰면 그 라이브러리나 위젯을 쓰는 화면이 전부 함께 바뀝니다)**

내 파일이 소유하지 않은 클래스는 **내 최상위 클래스 블록 안에서만** 씁니다.
블록 바깥에 홀로 두지 않습니다.

`scope_slug`가 내 것이면 내 클래스입니다.
그 밖은 전부 남의 것입니다.
외부 라이브러리든 다른 화면의 `pg_`든 위젯의 `wg_`든 똑같이 다룹니다.

| 선택자 | 판정 |
| --- | --- |
| `.ant-tree-title { }` | 안 씁니다. 그 라이브러리를 쓰는 앱 전체에 적용됩니다 |
| `.wg_chartCard__caption { }` | 안 씁니다. 그 위젯을 쓰는 화면 전체에 적용됩니다 |
| `.pg_treePanel__root { & .ant-tree-title { } }` | 씁니다. 그 인스턴스에만 적용됩니다 |
| `.pg_detail__root { & .wg_chartCard__caption { } }` | 씁니다 |
| `.pg_treePanel__toolbar:hover .pg_treePanel__title { }` | 내 클래스끼리라 대상이 아닙니다 |

판정은 **선택자가 내 식별자로 시작하는지**입니다.
소유 관계를 따로 조사하지 않습니다.
`.pg_treePanel__root .ant-tree-title`처럼 바깥에서 이어 쓰지도 않습니다.
최상위 블록을 열고 그 안에서 `&`로 씁니다.
한 소유자의 덮어쓰기가 한 블록에 모이면 라이브러리 버전을 올릴 때 볼 곳이 한 군데뿐입니다.

남의 DOM은 우리가 이름을 정하지 않아 경로가 길어질 수 있으므로 결합자 개수는 제한하지 않습니다.
대신 중첩을 몇 겹까지 열지는 `selector-limit-nesting-block-depth` 규칙이 정합니다.

우리가 소유한 클래스라면 그 클래스를 선언한 파일에서 고치는 편이 낫습니다.
`ownership-change-other-owners-through-their-api` 규칙의 세 갈래를 먼저 보고
그 세 갈래에 안 맞을 때 이 규칙으로 옵니다.

기계 검증은 `selector-disallowed-list`가 최상위에 홀로 둔 남의 클래스를 잡습니다.
설정 전문은 `tooling-configure-stylelint-to-enforce-these-rules` 규칙이 정합니다.

**Incorrect (최상위 블록 없이 라이브러리 클래스를 바로 씀):**

```css
.ant-tree-node-content-wrapper {
	border-radius: 4px;
}

.ant-btn-icon {
	color: #8c8c8c;
}
```

**Incorrect (최상위 블록 없이 다른 `scope_slug`의 클래스를 바로 씀):**

```css
/* page/detail/pg-detail.css */
.wg_chartCard__caption {
	color: #8c8c8c;
}

.ui_card__title {
	font-size: 13px;
}
```

**Incorrect (최상위 블록을 열지 않고 바깥에서 이어 씀):**

```css
.pg_treePanel__root .ant-tree-title {
	color: #8c8c8c;
}
```

**Correct (내 최상위 블록 안에서 외부 라이브러리 DOM을 겨냥):**

```css
.pg_treePanel__root {
	& .ant-tree-node-content-wrapper {
		display: inline-flex;
		border-radius: 4px;
	}

	& .ant-tree-title {
		color: #8c8c8c;
	}
}
```

**Correct (다른 `scope_slug`의 클래스도 내 최상위 블록 안에서 겨냥):**

```css
/* page/detail/pg-detail.css */
.pg_detail__chartSlot {
	min-height: 240px;

	& .wg_chartCard__caption {
		letter-spacing: 0.02em;
	}
}
```

**Correct (중첩된 자손까지 적용되면 안 될 때 직계로 좁힘):**

```css
.pg_treePanel__toolbar {
	& > .ant-btn > .ant-btn-icon {
		color: #8c8c8c;
	}
}
```

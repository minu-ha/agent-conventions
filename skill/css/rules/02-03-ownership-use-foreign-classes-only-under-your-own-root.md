---
title: Use Foreign Classes Only Under Your Own Root
titleKo: 남의 class는 자기 root block 아래에서만 사용
impact: CRITICAL
impactDescription: 남의 class를 단독 selector로 쓰지 못하게 해서 그 라이브러리·widget을 쓰는 화면 전체가 함께 바뀌는 것을 막습니다
appliesWhen:
  - `.ant-*`·`.rc-*`·`.Mui-*` 같은 third-party class를 쓸 때
  - 다른 `scope_slug`의 class를 겨냥할 때
reviewWith: >-
  ownership-change-other-owners-through-their-api, ownership-give-each-file-one-scope-slug,
  selector-limit-nesting-block-depth
tags: ownership, scope, third-party
---

## Use Foreign Classes Only Under Your Own Root

**Impact: CRITICAL (남의 class를 단독 selector로 쓰지 못하게 해서 그 라이브러리·widget을 쓰는 화면 전체가 함께 바뀌는 것을 막습니다)**

내 파일이 소유하지 않은 class는 **내 root class block 안에서만** 씁니다.
단독 top-level selector로 쓰지 않습니다.

내가 소유한 class는 `scope_slug`가 내 것인 class뿐입니다.
third-party든 다른 화면의 `pg_`든 widget의 `wg_`든 그 밖은 전부 남의 것이고 같은 취급입니다.

| selector | 판정 |
| --- | --- |
| `.ant-tree-title { }` | 안 씁니다. 그 라이브러리를 쓰는 앱 전체에 걸립니다 |
| `.wg_chartCard__caption { }` | 안 씁니다. 그 widget을 쓰는 화면 전체에 걸립니다 |
| `.pg_x__root { & .ant-tree-title { } }` | 씁니다. 그 instance에만 걸립니다 |
| `.pg_x__root { & .wg_chartCard__caption { } }` | 씁니다 |
| `.pg_x__button:hover .pg_x__box { }` | 내 class끼리라 대상이 아닙니다 |

판정은 **selector가 내 slug로 시작하는지**입니다. 소유 관계를 따로 조사하지 않습니다.
top-level `.pg_x__root .ant-tree-title`도 쓰지 않습니다. root block을 열고 그 안에서 `&`로 씁니다.
한 owner의 override가 한 block에 모여서 라이브러리를 올릴 때 볼 곳이 하나가 됩니다.

결합자 개수는 제한하지 않습니다. 남의 DOM 깊이는 우리가 정할 수 없습니다.
`.ant-table-thead > tr > th`가 라이브러리의 구조라면 그것이 경로입니다.
경로가 길면 `selector-limit-nesting-block-depth`에 따라 한 줄로 씁니다.

우리 코드는 그 파일에서 고치는 편이 낫습니다.
`ownership-change-other-owners-through-their-api`를 먼저 보고, 거기 안 맞으면 여기로 옵니다.

기계 검증은 디렉터리별 `selector-disallowed-list`입니다.
`page/` 아래는 `/^\.(wg|ui)_/`와 `/^\.(ant|rc|tippy|Mui)-/`를 막습니다.
중첩이 한 겹이라 block 안 selector는 `&`로 시작해서 걸리지 않습니다.

**Incorrect (root 없이 라이브러리 class를 직접 씀):**

```css
.ant-tree-node-content-wrapper {
	border-radius: 4px;
}

.ant-btn-icon {
	color: #8c8c8c;
}
```

**Incorrect (root 없이 다른 `scope_slug`의 class를 직접 씀):**

```css
/* page/detail/pg-detail.css */
.wg_chartCard__caption {
	color: #8c8c8c;
}

.ui_card__title {
	font-size: 13px;
}
```

**Incorrect (root block을 열지 않고 top-level에서 체이닝):**

```css
.pg_treePanel__root .ant-tree-title {
	color: #8c8c8c;
}
```

**Correct (내 root block 안에서 third-party DOM을 겨냥):**

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

**Correct (겨냥할 노드가 많으면 같은 block 안에 selector를 늘림):**

```css
.pg_orderTable__root {
	& .ant-table-thead .ant-table-cell {
		font-weight: 600;
		background: #fafafa;
	}

	& .ant-table-tbody .ant-table-cell {
		padding: 8px 12px;
	}

	& .ant-table-thead > tr > th {
		border-bottom: 2px solid #d9d9d9;
	}
}
```

**Correct (다른 `scope_slug`의 class도 같은 방식으로 내 root 아래에서 겨냥):**

```css
/* page/detail/pg-detail.css */
.pg_detail__chartSlot {
	min-height: 240px;

	& .wg_chartCard__caption {
		letter-spacing: 0.02em;
	}
}
```

**Correct (중첩된 자손까지 걸리면 안 될 때 직계로 좁힘):**

```css
.pg_treePanel__toolbar {
	& > .ant-btn > .ant-btn-icon {
		color: #8c8c8c;
	}
}
```

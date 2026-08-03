---
title: Target Third-party DOM Only From Owned Roots
titleKo: 소유한 root 아래로 third-party DOM 타겟팅 제한
impact: CRITICAL
impactDescription: third-party 스타일이 앱 전체로 새지 않게 owner root 안으로 범위를 격리합니다
appliesWhen:
  - `.ant-*`, `.rc-*`, `.tippy-*` 등 third-party 내부 DOM selector를 추가·수정할 때
  - owner root 아래로 범위를 제한할 때
reviewWith: >-
  selector-limit-nesting-block-depth, selector-avoid-deep-descendant-dependencies
tags: third-party, wrappers, scope
---

## Target Third-party DOM Only From Owned Roots

**Impact: CRITICAL (third-party 스타일이 앱 전체로 새지 않게 owner root 안으로 범위를 격리합니다)**

이 규칙은 범위만 다룹니다. third-party 내부 DOM 클래스는 owner root class block 안에서만 씁니다.

- root 없는 `.ant-*` 단독 selector는 금지합니다. 그 라이브러리를 쓰는 앱 전체에 적용됩니다.
- top-level `.pg_* .ant-*`도 쓰지 않습니다. owner block을 열고 그 안에서 `& .ant-*`로 씁니다.
- 한 owner block 안의 third-party selector는 그 owner의 instance에만 적용됩니다.

결합자 개수는 이 규칙이 제한하지 않습니다. 남의 DOM 깊이는 우리가 줄일 수 없습니다.
개수는 `selector-avoid-deep-descendant-dependencies`, 한 줄 표기는 `selector-limit-nesting-block-depth`가 정합니다.

짧게 쓸 수 있으면 짧게 쓰는 편이 좋습니다.
owner root가 이미 instance를 한정하므로 `.ant-tree` 같은 중간 library root는 대개 필요하지 않습니다.
다만 이것은 권고이고 위반이 아닙니다.

기계 검증은 `selector-disallowed-list`로 owner root 없는 `.ant-*` 패턴을 막는 것입니다.

**Incorrect (root 없이 라이브러리 클래스를 직접 씀):**

```css
.ant-tree-node-content-wrapper {
	border-radius: 4px;
}

.ant-btn-icon {
	color: #8c8c8c;
}
```

**Incorrect (owner block을 열지 않고 top-level에서 체이닝):**

```css
.pg_treePanel__root .ant-tree-title {
	color: #8c8c8c;
}
```

**Correct (owner root block 안에서만 씀):**

```css
.pg_treePanel__root {
	& .ant-tree-node-content-wrapper {
		display: inline-flex;
		border-radius: 4px;
	}

	& .ant-tree-title {
		color: #8c8c8c;
	}

	& .ant-tree-switcher {
		width: 20px;
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

**Correct (중첩된 자손까지 걸리면 안 될 때 직계로 좁힘):**

```css
.pg_treePanel__toolbar {
	& > .ant-btn > .ant-btn-icon {
		color: #8c8c8c;
	}
}
```

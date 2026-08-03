---
title: Target Third-party DOM Only From Owned Roots
titleKo: 소유한 root 아래로 third-party DOM 타겟팅 제한
impact: CRITICAL
impactDescription: third-party 스타일링을 앱 전체로 새게 하지 않고 명시적 wrapper 소유로 제한합니다
appliesWhen:
  - `.ant-*`, `.rc-*`, `.tippy-*` 등 third-party 내부 DOM selector를 추가·수정할 때
  - owned wrapper 아래로 범위를 제한할 때
requiresSelected: selector-avoid-deep-descendant-dependencies
tags: third-party, wrappers, nesting
---

## Target Third-party DOM Only From Owned Roots

**Impact: CRITICAL (third-party 스타일링을 앱 전체로 새게 하지 않고 명시적 wrapper 소유로 제한합니다)**

서드파티 라이브러리 내부 DOM 클래스(`.ant-*`, `.rc-*`,
`.tippy-*`)는 프로젝트가 소유한 root block 아래에서만 타겟팅합니다.

판단 기준:

- 항상 owned root class block을 먼저 엽니다.
- root 없는 `.ant-*` 단독 selector는 금지합니다.
- `.pg_* .ant-*` 같은 one-line chaining보다 root block 안의 `& .ant-*`를 사용합니다.
- owned root가 이미 instance를 한정하므로 `.ant-tree` 같은 중간 library root를 반복하지 않습니다.

결합자 상한은 `selector-avoid-deep-descendant-dependencies`가 정하고 third-party DOM은 2까지입니다.
상한은 selector 하나당이라 겨냥할 노드가 다섯 개면 같은 root block 안에 selector를 다섯 개 씁니다.

2를 쓰려면 왜 1로 안 되는지를 선언 바로 위 주석 한 줄로 남깁니다.
같은 라이브러리 클래스가 여러 계층에 나타나 겨냥이 모호할 때가 대표적인 근거입니다.
라이브러리가 클래스 없이 `> tr > th`처럼 element만 노출해 2로 줄일 수 없으면 그 사실을 주석으로 남기고 예외로 씁니다.

이 예외는 third-party DOM path에만 적용됩니다. project-owned class끼리의 깊은 descendant coupling은 여전히 금지입니다.

**Incorrect (루트 없이 타겟팅하거나 중간 root를 반복하거나 nested 안에서 다시 nested를 엶):**

```css
.ant-tree-node-content-wrapper {
	border-radius: 4px;
}

.pg_treePanel__root .ant-tree-title {
	color: #8c8c8c;
}

.pg_treePanel__root {
	& .ant-tree .ant-tree-node-content-wrapper {
		display: inline-flex;
	}

	& .ant-tree-node-content-wrapper {
		& .ant-tree-iconEle {
			display: inline-flex;
		}
	}
}
```

**Correct (owned root가 instance를 한정하므로 중간 root 없이 target을 직접 겨냥):**

```css
.pg_treePanel__root {
	& .ant-tree-node-content-wrapper {
		display: inline-flex;
		border-radius: 4px;
	}

	& .ant-tree-title {
		color: #8c8c8c;
	}

	& .ant-tree-iconEle {
		display: inline-flex;
	}
}
```

**Correct (같은 클래스가 header와 body 양쪽에 있어 겨냥이 모호할 때만 상한 2를 쓰고 근거를 남김):**

```css
.pg_orderTable__root {
	/* .ant-table-cell은 thead와 tbody 양쪽에 붙어서 header만 겨냥하려면 1단계로 안 된다 */
	& .ant-table-thead .ant-table-cell {
		font-weight: 600;
		background: #fafafa;
	}

	& .ant-table-cell {
		padding: 8px 12px;
	}
}
```

**Correct (겨냥할 노드가 많으면 selector를 늘린다. 결합자는 각각 1개):**

```css
.pg_treePanel__root {
	& .ant-tree-node-content-wrapper {
		display: inline-flex;
	}

	& .ant-tree-title {
		color: #8c8c8c;
	}

	& .ant-tree-switcher {
		width: 20px;
	}

	& .ant-tree-iconEle {
		display: inline-flex;
	}

	& .ant-tree-indent-unit {
		width: 12px;
	}
}
```

**Correct (라이브러리가 element만 노출해 2로 줄일 수 없을 때만 근거를 남기고 초과):**

```css
.pg_orderTable__root {
	/* antd가 이 행에 클래스를 주지 않아 tr·th element로만 겨냥할 수 있다 */
	& .ant-table-thead > tr > th {
		border-bottom: 2px solid #d9d9d9;
	}
}
```

**Correct (중첩된 자손까지 걸리면 안 될 때 direct child로 좁힘):**

```css
.pg_treePanel__toolbar {
	/* 툴바 직계 버튼만 대상이다. 트리 노드 안의 버튼 아이콘은 제외한다 */
	& > .ant-btn > .ant-btn-icon {
		color: #8c8c8c;
	}
}
```

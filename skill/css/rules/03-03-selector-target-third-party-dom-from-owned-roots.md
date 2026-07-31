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
- owned root가 이미 instance scope를 제공하고 target class가 직접 식별 가능하면
  `.ant-tree` 같은 중간 library root를 반복하지 않습니다.

combinator 상한은 `selector-avoid-deep-descendant-dependencies`가 정합니다.
third-party DOM은 그 표에서 2까지 허용되고, 2를 넘겨야 하면 라이브러리가 그 구조를 강제한다는 근거를
해당 선언 바로 위 주석 한 줄로 남깁니다.

이 예외는 third-party DOM path에만 적용됩니다. project-owned class끼리의 깊은 descendant coupling은 여전히 금지입니다.

**Incorrect (루트 없이 타겟팅하거나 nested 안에서 다시 nested를 열어 의미를 흐림):**

```css
.ant-tree-node-content-wrapper {
	border-radius: 4px;
}

.pg_treePanel__root .ant-tree-title {
	color: #999;
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

**Correct (항상 owned root block을 열고, 그 안에서 third-party DOM path를 nested로 적음):**

```css
.pg_treePanel__root {
	& .ant-tree-node-content-wrapper {
		display: inline-flex;
	}

	& .ant-tree-title {
		color: #999;
	}

	& .ant-tree-switcher {
		color: var(--app-color-text-muted);
	}
}

.pg_treePanel__toolbar {
	& > .ant-btn-icon {
		color: var(--app-color-text-muted));
	}
}
```

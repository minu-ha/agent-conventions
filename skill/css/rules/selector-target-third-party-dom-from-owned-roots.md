---
title: Target Third-party DOM Only From Owned Roots
impact: CRITICAL
impactDescription: limits third-party styling to explicit wrapper ownership instead of leaking across the app
appliesWhen: >-
  `.ant-*`, `.rc-*`, `.tippy-*` 등 third-party 내부 DOM selector를 추가·수정하거나 owned wrapper 아래로 범위를 제한한다.
requiresSelected: selector-avoid-deep-descendant-dependencies
tags: third-party, wrappers, nesting
---

## Target Third-party DOM Only From Owned Roots

**Impact: CRITICAL (limits third-party styling to explicit wrapper ownership instead of leaking across the app)**

서드파티 라이브러리 내부 DOM 클래스(`.ant-*`,
`.rc-*`,
`.tippy-*`)는 프로젝트가 소유한 root block 아래에서만 타겟팅합니다.

판단 기준:

- 항상 owned root class block을 먼저 엽니다.
- root 없는 `.ant-*` 단독 selector는 금지합니다.
- `.rt_* .ant-*` 같은 one-line chaining보다 root block 안의 `& .ant-*`를 사용합니다.
- third-party DOM 경로는 shortest viable chain만 허용합니다.
- owned root가 이미 instance scope를 제공하고
  target class가 직접 식별 가능하면
  `.ant-tree` 같은 중간 library root를 반복하지 않습니다.
- 추가 third-party ancestor는 target ambiguity나 direct-child contract처럼 실제로 필요한 evidence가 있을 때만 허용하고
  그 근거를 기록합니다.
- nested block 안에서 다시 nested block을 열지 않습니다.

이 예외는 third-party DOM path에만 적용됩니다.
project-owned class끼리의 깊은 descendant coupling은 여전히 금지입니다.

**Incorrect (루트 없이 타겟팅하거나 nested 안에서 다시 nested를 열어 의미를 흐림):**

```css
.ant-tree-node-content-wrapper {
	border-radius: 4px;
}

.rt_treePanel__root .ant-tree-title {
	color: #999;
}

.rt_treePanel__root {
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
.rt_treePanel__root {
	& .ant-tree-node-content-wrapper {
		display: inline-flex;
	}

	& .ant-tree-title {
		color: #999;
	}

	& .ant-tree-switcher {
		color: var(--app-color-text-muted, #777);
	}
}

.rt_treePanel__toolbar {
	& > .ant-btn-icon {
		color: var(--app-color-text-muted, rgba(0, 0, 0, 0.45));
	}
}
```

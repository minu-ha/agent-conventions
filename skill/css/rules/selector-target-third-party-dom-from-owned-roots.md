---
title: Target Third-party DOM Only From Owned Roots
impact: CRITICAL
impactDescription: limits third-party styling to explicit wrapper ownership instead of leaking across the app
tags: third-party, wrappers, nesting
---

## Target Third-party DOM Only From Owned Roots

**Impact: CRITICAL (limits third-party styling to explicit wrapper ownership instead of leaking across the app)**

서드파티 라이브러리 내부 DOM 클래스(`.ant-*`, `.rc-*`, `.tippy-*`)는 반드시 프로젝트가 소유한 루트 클래스 블록 아래에서만 타겟팅합니다. 핵심은 selector가 항상 owned root block에서 시작되어야 한다는 점입니다.

루트 없는 단독 타겟팅과 project-owned 클래스끼리의 깊은 descendant coupling은 피합니다. third-party DOM을 잡을 때도 `.rt_* .ant-*` 같은 one-line selector로 owned root를 체이닝하지 말고, 항상 owned root block을 연 뒤 그 안에서 `& .ant-*`처럼 nested로 표현합니다. 더 깊은 third-party DOM 경로가 꼭 필요하면 owned root block 아래에서 shortest viable chain만 한 번에 적고, 이 예외는 third-party DOM 경로에만 적용합니다. nested 안에서 다시 nested block을 열어 의미를 흐리는 방식은 여전히 금지합니다.

**Incorrect (루트 없이 타겟팅하거나 nested 안에서 다시 nested를 열어 의미를 흐림):**

```css
.ant-tree-node-content-wrapper {
	border-radius: 4px;
}

.rt_pcmei__treeBox .ant-tree-title {
	color: #999;
}

.rt_pcmei__treeBox {
	& .ant-tree-node-content-wrapper {
		& .ant-tree-iconEle {
			display: inline-flex;
		}
	}
}
```

**Correct (항상 owned root block을 열고, 그 안에서 third-party DOM path를 nested로 적음):**

```css
.rt_pcmei__treeBox {
	& .ant-tree-node-content-wrapper {
		display: inline-flex;
	}
}

.rt_pctb__lnbTop {
	& > .ant-btn-icon {
		color: var(--cms-color-text-tertiary, rgba(0, 0, 0, 0.45));
	}
}

.rt_pcmei__treeBox {
	& .ant-tree-title {
		color: #999;
	}

	& .ant-tree-node-content-wrapper .ant-tree-iconEle .ant-tree-title {
		color: #999;
	}
}
```

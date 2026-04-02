---
title: Target Third-party DOM Only From Owned Roots
impact: CRITICAL
impactDescription: limits third-party styling to explicit wrapper ownership instead of leaking across the app
tags: third-party, wrappers, nesting
---

## Target Third-party DOM Only From Owned Roots

**Impact: CRITICAL (limits third-party styling to explicit wrapper ownership instead of leaking across the app)**

서드파티 라이브러리 내부 DOM 클래스(`.ant-*`, `.rc-*`, `.tippy-*`)는 반드시 프로젝트가 소유한 루트 클래스 블록 내부에서만 nested로 타겟팅합니다. 루트 없는 단독 타겟팅, 플랫 체이닝, nested 안의 nested는 피하고, 같은 줄 체이닝으로만 확장합니다.

**Incorrect (루트 없이 또는 플랫 체이닝으로 타겟팅):**

```css
.ant-tree-node-content-wrapper {
	border-radius: 4px;
}

.rt_pcmei__treeBox .ant-tree-node-content-wrapper {
	border-radius: 4px;
}

.rt_pcmei__treeBox {
	& .ant-tree-node-content-wrapper {
		& .ant-tree-iconEle {
			display: inline-flex;
		}
	}
}
```

**Correct (소유 루트 블록 아래에서만 nested 체이닝):**

```css
.rt_pcmei__treeBox {
	& .ant-tree-node-content-wrapper {
		display: inline-flex;
	}
}

.rt_pcmei__treeBox {
	& .ant-tree-node-content-wrapper .ant-tree-iconEle .ant-tree-title {
		color: #999;
	}
}

.rt_pctb__lnbTop {
	& > .ant-btn-icon {
		color: var(--cms-color-text-tertiary, rgba(0, 0, 0, 0.45));
	}
}
```

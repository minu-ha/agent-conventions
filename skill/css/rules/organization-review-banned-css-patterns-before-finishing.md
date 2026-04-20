---
title: Review Banned CSS Patterns Before Finishing
impact: MEDIUM
impactDescription: catches unsafe selector, modifier, and library-targeting shortcuts before they become part of the shared style system
tags: review, banned-patterns, guardrails
---

## Review Banned CSS Patterns Before Finishing

**Impact: MEDIUM (catches unsafe selector, modifier, and library-targeting shortcuts before they become part of the shared style system)**

작업을 마치기 전에 금지 패턴을 다시 확인합니다. 요소 선택자 중심 스타일링, 깊은 project-owned 후손 체인, 재사용 근거 없는 구조 modifier, 루트 없는 라이브러리 클래스 타겟팅, `!important` 남용 같은 지름길은 빠르게 작성되더라도 장기적으로 구조를 깨뜨립니다. 반복되는 명시적 variant modifier나 owned root 아래의 최소한의 third-party selector chain은 별도 규칙이 허용하는 범위에서 예외가 될 수 있습니다.

**Incorrect (금지 패턴을 그대로 남김):**

```css
div {
	padding: 8px !important;
}

.scope_slug__section--leftPanel {
	width: 280px;
}

.ant-tree-node-content-wrapper {
	border-radius: 4px;
}
```

**Correct (소유 클래스와 허용된 구조/상태 표현으로 정리):**

```css
.rt_pctbi__item {
	padding: 8px;
}

.rt_pctbi__sidePanel {
	width: 280px;
}

.rt_pctbi__treeBox {
	& .ant-tree-node-content-wrapper {
		border-radius: var(--cms-border-radius, 4px);
	}
}
```
